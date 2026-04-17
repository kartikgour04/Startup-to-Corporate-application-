import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../utils/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function PricingPage() {
  const { user, updateUser } = useAuthStore();
  const location = useLocation();
  const [loading, setLoading] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('payment') === 'success') toast.success('🎉 Payment successful! Your plan is now active.');
    if (params.get('cancelled')) toast.error('Payment cancelled — no charge was made.');
    if (user) api.get('/payments/my-plan').then(r => setCurrentPlan(r.data)).catch(() => {});
  }, [user]);

  const plans = [
    {
      key: 'free', name: 'Free', priceINR: 0, priceUSD: 0, desc: 'Get started for free',
      features: [
        { text: '3 pitches per month', ok: true },
        { text: '2 opportunities posted', ok: true },
        { text: 'Messaging (10/day)', ok: true },
        { text: 'Basic profile', ok: true },
        { text: 'Analytics dashboard', ok: false },
        { text: 'Featured profile badge', ok: false },
        { text: 'Priority listing', ok: false },
        { text: 'Priority support', ok: false },
      ],
      popular: false, color: 'slate',
    },
    {
      key: 'starter', name: 'Starter', priceINR: 999, priceUSD: 12, desc: 'For growing startups',
      features: [
        { text: '20 pitches per month', ok: true },
        { text: '10 opportunities posted', ok: true },
        { text: 'Unlimited messaging', ok: true },
        { text: 'Analytics dashboard', ok: true },
        { text: 'Community access', ok: true },
        { text: 'Featured profile badge', ok: false },
        { text: 'Priority listing', ok: false },
        { text: 'Email support', ok: true },
      ],
      popular: false, color: 'indigo',
    },
    {
      key: 'professional', name: 'Professional', priceINR: 2999, priceUSD: 36, desc: 'For serious players',
      features: [
        { text: 'Unlimited pitches', ok: true },
        { text: 'Unlimited opportunities', ok: true },
        { text: 'Unlimited messaging', ok: true },
        { text: 'Full analytics', ok: true },
        { text: 'Featured profile badge', ok: true },
        { text: 'Priority listing', ok: true },
        { text: 'Verified badge', ok: true },
        { text: 'Priority support', ok: true },
      ],
      popular: true, color: 'indigo',
    },
    {
      key: 'enterprise', name: 'Enterprise', priceINR: 7999, priceUSD: 96, desc: 'For large organizations',
      features: [
        { text: 'Everything in Professional', ok: true },
        { text: 'Dedicated account manager', ok: true },
        { text: 'Custom onboarding', ok: true },
        { text: 'Phone support', ok: true },
        { text: 'Team accounts', ok: true },
        { text: 'SLA support', ok: true },
        { text: 'Invoice billing (GST)', ok: true },
        { text: 'Custom contracts', ok: true },
      ],
      popular: false, color: 'purple',
    },
  ];

  const isCurrentPlan = (key) => {
    if (key === 'free' && !user?.isPremium) return true;
    return currentPlan?.plan === key && user?.isPremium;
  };

  const handleSubscribe = async (planKey) => {
    if (!user) { window.location.href = '/register'; return; }
    if (planKey === 'free' || isCurrentPlan(planKey)) return;
    setLoading(planKey);
    try {
      const r = await api.post('/payments/create-order', { plan: planKey });
      if (r.data.notConfigured) {
        toast.error('⚠️ Razorpay not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to server/.env');
        setLoading(null); return;
      }
      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
      script.onload = () => {
        const options = {
          key: r.data.keyId,
          amount: r.data.amount,
          currency: r.data.currency,
          name: 'Nexus Platform',
          description: `${r.data.planName} Plan — Monthly Subscription`,
          image: 'https://ui-avatars.com/api/?name=Nexus&background=6366f1&color=fff&size=128',
          order_id: r.data.orderId,
          handler: async (response) => {
            try {
              const verifyRes = await api.post('/payments/verify-payment', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: planKey,
              });
              toast.success(`🎉 ${verifyRes.data.message}`);
              // Refresh user data
              const meRes = await api.get('/auth/me');
              updateUser(meRes.data.user);
              setCurrentPlan({ plan: planKey, isPremium: true });
            } catch (e) {
              toast.error(e.response?.data?.message || 'Payment verification failed. Contact support.');
            }
          },
          prefill: { name: r.data.userName, email: r.data.userEmail },
          notes: { plan: planKey },
          theme: { color: '#6366f1' },
          modal: { ondismiss: () => setLoading(null) }
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (response) => {
          toast.error(`Payment failed: ${response.error.description}`);
          setLoading(null);
        });
        rzp.open();
      };
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error initiating payment');
    } finally { setLoading(null); }
  };

  const handleDowngrade = async () => {
    if (!window.confirm('Downgrade to Free plan? Your premium features will be deactivated.')) return;
    try {
      await api.post('/payments/cancel');
      toast.success('Downgraded to Free plan.');
      const meRes = await api.get('/auth/me');
      updateUser(meRes.data.user);
      setCurrentPlan({ plan: 'free', isPremium: false });
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
  };

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white py-16 px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 rounded-full px-4 py-1.5 mb-6">
          <span className="text-indigo-300 text-sm">🇮🇳 Made in India · Prices in INR · Pay with UPI, Cards, NetBanking</span>
        </div>
        <h1 className="text-4xl font-black mb-4">Simple, Transparent Pricing</h1>
        <p className="text-slate-400 text-xl max-w-xl mx-auto">Start free. Scale as you grow. Pay with UPI, Cards, or NetBanking.</p>
        {user?.isPremium && (
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 rounded-full px-4 py-2 mt-4">
            <span className="text-amber-300 text-sm font-medium">⭐ You're on the {currentPlan?.name || 'Premium'} plan</span>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-5 mb-16">
          {plans.map(plan => (
            <div key={plan.key} className={`card p-6 flex flex-col relative ${plan.popular ? 'ring-2 ring-indigo-600 shadow-xl' : ''} ${isCurrentPlan(plan.key) ? 'border-emerald-300 bg-emerald-50/30' : ''}`}>
              {plan.popular && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">⭐ Most Popular</div>}
              {isCurrentPlan(plan.key) && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">✓ Your Plan</div>}
              <div className="mb-3">
                <h3 className="text-xl font-black text-slate-900">{plan.name}</h3>
                <p className="text-slate-500 text-sm">{plan.desc}</p>
              </div>
              <div className="mb-5">
                {plan.priceINR === 0 ? (
                  <span className="text-4xl font-black text-slate-900">Free</span>
                ) : (
                  <>
                    <span className="text-3xl font-black text-slate-900">₹{plan.priceINR.toLocaleString('en-IN')}</span>
                    <span className="text-slate-500 text-sm">/month</span>
                    <p className="text-slate-400 text-xs mt-0.5">≈ ${plan.priceUSD} USD</p>
                  </>
                )}
              </div>
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className={`flex items-start gap-2 text-sm ${f.ok ? 'text-slate-700' : 'text-slate-400 line-through decoration-slate-300'}`}>
                    <span className={`mt-0.5 flex-shrink-0 text-base ${f.ok ? 'text-emerald-500' : 'text-slate-300'}`}>{f.ok ? '✓' : '✗'}</span>
                    {f.text}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan.key)}
                disabled={loading === plan.key || isCurrentPlan(plan.key) || (plan.key === 'free' && !!user)}
                className={`w-full py-3 rounded-xl font-bold transition-colors text-sm ${
                  isCurrentPlan(plan.key) ? 'bg-emerald-100 text-emerald-700 cursor-default' :
                  plan.key === 'free' && user ? 'bg-slate-100 text-slate-400 cursor-default' :
                  plan.popular ? 'bg-indigo-600 hover:bg-indigo-700 text-white' :
                  'bg-slate-900 hover:bg-slate-800 text-white'} disabled:opacity-60`}>
                {loading === plan.key ? '⏳ Opening payment...' :
                 isCurrentPlan(plan.key) ? '✓ Current Plan' :
                 plan.key === 'free' && user ? 'Free Plan' :
                 !user ? 'Get Started' :
                 `Upgrade — ₹${plan.priceINR.toLocaleString('en-IN')}/mo`}
              </button>
            </div>
          ))}
        </div>

        {/* Payment methods banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-12 text-center">
          <p className="font-semibold text-slate-900 mb-3">💳 Accepted Payment Methods</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['UPI (PhonePe, GPay, Paytm)', 'Debit Cards', 'Credit Cards', 'Net Banking', 'EMI', 'Wallets'].map(m => (
              <span key={m} className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-600 text-sm font-medium">{m}</span>
            ))}
          </div>
          <p className="text-slate-400 text-xs mt-3">Powered by Razorpay · PCI DSS Compliant · 256-bit SSL Encryption</p>
        </div>

        {/* Razorpay setup guide */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-12">
          <h3 className="font-bold text-blue-900 mb-2">🚀 Setting Up Razorpay (5 minutes)</h3>
          <ol className="text-blue-800 text-sm space-y-2 list-decimal list-inside">
            <li>Create account at <a href="https://razorpay.com" target="_blank" rel="noreferrer" className="underline font-medium">razorpay.com</a> (instant activation for Indian businesses)</li>
            <li>Go to Dashboard → Settings → API Keys → Generate Test Key</li>
            <li>Add to <code className="bg-blue-100 px-1 rounded">server/.env</code>: <code className="bg-blue-100 px-1 rounded">RAZORPAY_KEY_ID=rzp_test_xxx</code> and <code className="bg-blue-100 px-1 rounded">RAZORPAY_KEY_SECRET=xxx</code></li>
            <li>Restart server: <code className="bg-blue-100 px-1 rounded">npm run dev</code></li>
            <li>Test payment with card: <code className="bg-blue-100 px-1 rounded">4111 1111 1111 1111</code>, any future date, any CVV</li>
          </ol>
          <p className="text-blue-600 text-xs mt-3">For production: Complete KYC on Razorpay Dashboard → switch to live keys. Payouts within 2-3 business days to Indian bank account.</p>
        </div>

        {/* Downgrade option */}
        {user?.isPremium && (
          <div className="card p-6 mb-12 text-center">
            <p className="text-slate-600 text-sm mb-3">Want to downgrade? Your data is always safe.</p>
            <button onClick={handleDowngrade} className="text-red-500 hover:text-red-700 text-sm font-medium underline">Downgrade to Free Plan</button>
          </div>
        )}

        {/* FAQ */}
        <h2 className="text-2xl font-black text-slate-900 text-center mb-8">Frequently Asked Questions</h2>
        <div className="max-w-2xl mx-auto space-y-4">
          {[
            ['Can I pay with UPI?', 'Yes! We accept all UPI apps — PhonePe, Google Pay, Paytm, BHIM, and more via Razorpay.'],
            ['Is there a free trial?', 'The Free plan is available forever. No credit card needed to start.'],
            ['Is GST included?', 'All prices shown are exclusive of GST. 18% GST will be added at checkout. We provide GST invoices.'],
            ['Can I get a refund?', 'We offer a 7-day refund policy if you\'re not satisfied. Contact support@nexus.com'],
            ['Can my startup get a discount?', 'Yes! Startups from NASSCOM, T-Hub, or other incubators get 30% off. Email us with proof.'],
            ['Do you have annual plans?', 'Annual plans with 20% discount are coming soon. Email us to get notified.'],
            ['Is my data safe?', 'All data stored on MongoDB Atlas with encryption. We comply with Indian IT Act and never sell data.'],
          ].map(([q, a]) => (
            <div key={q} className="card p-5">
              <p className="font-semibold text-slate-900 mb-2">{q}</p>
              <p className="text-slate-600 text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
