const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Startup = require('../models/Startup');
const Corporate = require('../models/Corporate');
const Opportunity = require('../models/Opportunity');
const { Event, Notification } = require('../models/index');
const { Connection, Pitch, FundingRound } = require('../models/pitch');

router.use(protect, authorize('admin'));

// Platform stats
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, startups, corporates, opportunities, events, connections, premiumUsers] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      Startup.countDocuments(),
      Corporate.countDocuments(),
      Opportunity.countDocuments(),
      Event.countDocuments(),
      Connection.countDocuments({ status: 'accepted' }),
      User.countDocuments({ isPremium: true }),
    ]);
    const recentUsers = await User.find({ role: { $ne: 'admin' } })
      .sort('-createdAt').limit(10)
      .select('name email role createdAt isVerified isActive isPremium premiumPlan banReason city');
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const newToday = await User.countDocuments({ createdAt: { $gte: todayStart } });
    res.json({ totalUsers, startups, corporates, opportunities, events, connections, premiumUsers, recentUsers, newToday });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// All users with search/filter/pagination
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search, status, premium } = req.query;
    const query = { role: { $ne: 'admin' } };
    if (role) query.role = role;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
    if (status === 'active') query.isActive = true;
    if (status === 'banned') query.isActive = false;
    if (premium === 'true') query.isPremium = true;
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit).limit(Number(limit))
      .select('name email role createdAt isVerified isActive isPremium premiumPlan banReason bannedAt city phone loginCount lastLogin');
    res.json({ users, total, pages: Math.ceil(total / limit), page: Number(page) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Get single user detail
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    let profile = null;
    if (user.role === 'startup') profile = await Startup.findOne({ user: user._id });
    if (user.role === 'corporate') profile = await Corporate.findOne({ user: user._id });
    const pitchCount = await Pitch.countDocuments({ submittedBy: user._id });
    const appCount = await Opportunity.countDocuments({ 'applications.user': user._id });
    const connCount = await Connection.countDocuments({ $or: [{ requester: user._id }, { recipient: user._id }], status: 'accepted' });
    res.json({ user, profile, stats: { pitches: pitchCount, applications: appCount, connections: connCount } });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Ban user with reason
router.put('/users/:id/ban', async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason?.trim()) return res.status(400).json({ message: 'Ban reason is required' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot ban admin users' });
    user.isActive = false;
    user.banReason = reason.trim();
    user.bannedAt = new Date();
    user.bannedBy = req.user._id;
    await user.save();
    // Notify user
    await Notification.create({
      user: user._id, type: 'system',
      title: '⚠️ Account Restricted',
      message: `Your account has been restricted. Reason: ${reason.trim()}. Contact support@nexus.in to appeal.`,
    });
    res.json({ message: `User ${user.name} banned`, user });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Unban user
router.put('/users/:id/unban', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id,
      { isActive: true, banReason: '', bannedAt: null, bannedBy: null },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    await Notification.create({
      user: user._id, type: 'system',
      title: '✅ Account Restored',
      message: 'Your account restriction has been lifted. You can now use Nexus normally.',
    });
    res.json({ message: `User ${user.name} unbanned`, user });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Verify startup / corporate
router.put('/users/:id/verify-profile', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Not found' });
    if (user.role === 'startup') {
      await Startup.findOneAndUpdate({ user: user._id }, { isVerified: true });
    } else if (user.role === 'corporate') {
      await Corporate.findOneAndUpdate({ user: user._id }, { isVerified: true });
    }
    res.json({ message: 'Profile verified' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Grant / revoke premium
router.put('/users/:id/premium', async (req, res) => {
  try {
    const { grant, plan } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, {
      isPremium: !!grant,
      premiumPlan: grant ? (plan || 'professional') : 'free',
      premiumExpiry: grant ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
    }, { new: true });
    if (!user) return res.status(404).json({ message: 'Not found' });
    await Notification.create({
      user: user._id, type: 'system',
      title: grant ? `⭐ Premium ${plan || 'Professional'} Activated!` : 'Plan Updated',
      message: grant ? `Admin has granted you the ${plan || 'Professional'} plan.` : 'Your plan has been updated to Free.',
    });
    res.json({ message: `Premium ${grant ? 'granted' : 'revoked'}`, user });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Hard delete user + all data
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot delete admin users' });

    const { Message, Conversation, Notification } = require('../models/index');
    await Startup.findOneAndDelete({ user: userId });
    await Corporate.findOneAndDelete({ user: userId });
    await Pitch.deleteMany({ submittedBy: userId });
    await FundingRound.deleteMany({ postedBy: userId });
    await Connection.deleteMany({ $or: [{ requester: userId }, { recipient: userId }] });
    await Notification.deleteMany({ user: userId });
    await Opportunity.deleteMany({ postedBy: userId });
    await Message.deleteMany({ sender: userId });
    await User.findByIdAndDelete(userId);
    res.json({ message: `User ${user.name} and all data permanently deleted` });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Feature / unfeature startup or corporate
router.put('/feature/:type/:id', async (req, res) => {
  try {
    const Model = req.params.type === 'startup' ? Startup : Corporate;
    const doc = await Model.findByIdAndUpdate(req.params.id, { isFeatured: req.body.featured }, { new: true });
    res.json({ message: `${req.body.featured ? 'Featured' : 'Unfeatured'} successfully`, doc });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
