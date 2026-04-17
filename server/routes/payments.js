const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const { Notification } = require('../models/index');

// INR pricing - India-first
const PLANS = {
  free: {
    name: 'Free', priceINR: 0, priceUSD: 0,
    limits: { pitchesPerMonth: 3, opportunitiesPosted: 2, canFeatureProfile: false, canAccessAnalytics: false }
  },
  starter: {
    name: 'Starter', priceINR: 999, priceUSD: 12,
    razorpayPlanId: process.env.RAZORPAY_PLAN_STARTER,
    limits: { pitchesPerMonth: 20, opportunitiesPosted: 10, canFeatureProfile: false, canAccessAnalytics: true }
  },
  professional: {
    name: 'Professional', priceINR: 2999, priceUSD: 36,
    razorpayPlanId: process.env.RAZORPAY_PLAN_PROFESSIONAL,
    limits: { pitchesPerMonth: -1, opportunitiesPosted: -1, canFeatureProfile: true, canAccessAnalytics: true, priorityListing: true }
  },
  enterprise: {
    name: 'Enterprise', priceINR: 7999, priceUSD: 96,
    razorpayPlanId: process.env.RAZORPAY_PLAN_ENTERPRISE,
    limits: { pitchesPerMonth: -1, opportunitiesPosted: -1, canFeatureProfile: true, canAccessAnalytics: true, priorityListing: true, dedicatedSupport: true }
  }
};

const getPlanFeatures = (key) => ({
  free:         ['3 pitches/month', '2 opportunities', 'Basic messaging', 'Community access'],
  starter:      ['20 pitches/month', '10 opportunities', 'Analytics dashboard', 'Email support', '₹999/month'],
  professional: ['Unlimited pitches', 'Unlimited opportunities', 'Featured profile', 'Priority listing', 'Full analytics', 'Priority support', '₹2,999/month'],
  enterprise:   ['Everything in Professional', 'Dedicated account manager', 'Custom onboarding', 'Phone support', '₹7,999/month'],
})[key] || [];

router.get('/plans', (req, res) => {
  res.json(Object.entries(PLANS).map(([key, p]) => ({ key, ...p, features: getPlanFeatures(key) })));
});

router.get('/my-plan', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const planKey = user.isPremium ? (user.premiumPlan || 'professional') : 'free';
    const plan = PLANS[planKey] || PLANS.free;
    res.json({ plan: planKey, name: plan.name, isPremium: user.isPremium, premiumExpiry: user.premiumExpiry, limits: plan.limits, features: getPlanFeatures(planKey) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Create Razorpay order (one-time payment per month, simple approach)
router.post('/create-order', protect, async (req, res) => {
  try {
    const { plan } = req.body;
    const planData = PLANS[plan];
    if (!planData || plan === 'free') return res.status(400).json({ message: 'Invalid plan' });

    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('rzp_test_your')) {
      return res.status(400).json({ message: 'Razorpay not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to server/.env', notConfigured: true });
    }

    const Razorpay = require('razorpay');
    const rzp = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });

    const order = await rzp.orders.create({
      amount: planData.priceINR * 100, // paise
      currency: 'INR',
      receipt: `nx_${req.user._id.toString().slice(-8)}_${Date.now().toString().slice(-8)}`,
      notes: { userId: req.user._id.toString(), plan, userEmail: req.user.email }
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      plan,
      planName: planData.name,
      userName: req.user.name,
      userEmail: req.user.email,
    });
  } catch (e) {
  // Razorpay throws non-standard error objects
  const errMsg = e?.error?.description || e?.message || JSON.stringify(e);
  console.error('Razorpay error full:', JSON.stringify(e, null, 2));
  res.status(500).json({ message: errMsg || 'Razorpay order creation failed' });
 }
});

// Verify Razorpay payment and activate plan
router.post('/verify-payment', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

    if (!process.env.RAZORPAY_KEY_SECRET) return res.status(400).json({ message: 'Razorpay not configured' });

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed. Contact support.' });
    }

    // Activate premium
    const planData = PLANS[plan] || PLANS.professional;
    await User.findByIdAndUpdate(req.user._id, {
      isPremium: true,
      premiumPlan: plan,
      premiumExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      razorpayCustomerId: razorpay_payment_id,
    });

    // Notify user
    await Notification.create({
      user: req.user._id,
      type: 'system',
      title: `⭐ ${planData.name} Plan Activated!`,
      message: `Your ${planData.name} plan is now active. Enjoy unlimited access!`,
      link: '/dashboard'
    });

    res.json({ success: true, message: `${planData.name} plan activated!`, plan });
  } catch (e) {
    console.error('Payment verify error:', e.message);
    res.status(500).json({ message: e.message });
  }
});

// Razorpay webhook (backup activation)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    if (process.env.RAZORPAY_WEBHOOK_SECRET) {
      const expected = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET).update(req.body).digest('hex');
      if (expected !== signature) return res.status(400).json({ message: 'Invalid signature' });
    }
    const event = JSON.parse(req.body);
    if (event.event === 'payment.captured') {
      const notes = event.payload.payment.entity.notes;
      if (notes?.userId && notes?.plan) {
        await User.findByIdAndUpdate(notes.userId, {
          isPremium: true, premiumPlan: notes.plan,
          premiumExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });
      }
    }
    res.json({ received: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Cancel plan (downgrade to free)
router.post('/cancel', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      isPremium: false, premiumPlan: 'free', premiumExpiry: null,
      razorpaySubscriptionId: null
    });
    res.json({ message: 'Plan downgraded to Free. Your data is safe.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
