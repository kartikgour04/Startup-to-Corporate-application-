const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Startup = require('../models/Startup');
const Corporate = require('../models/Corporate');
const Opportunity = require('../models/Opportunity');
const { Pitch, FundingRound, Connection } = require('../models/pitch');
const { Event, Notification } = require('../models/index');
const User = require('../models/User');

// Build real monthly activity for the last 6 months
async function buildMonthlyActivity(userId, role) {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: d.toLocaleString('default', { month: 'short' }),
      year: d.getFullYear(),
      month: d.getMonth(),
      start: new Date(d.getFullYear(), d.getMonth(), 1),
      end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
    });
  }
  const result = [];
  for (const m of months) {
    let views = 0, actions = 0;
    if (role === 'startup') {
      const pitchCount = await Pitch.countDocuments({ submittedBy: userId, createdAt: { $gte: m.start, $lte: m.end } });
      actions = pitchCount;
    } else {
      const appCount = await Opportunity.aggregate([
        { $match: { postedBy: userId } },
        { $unwind: '$applications' },
        { $match: { 'applications.appliedAt': { $gte: m.start, $lte: m.end } } },
        { $count: 'total' }
      ]);
      actions = appCount[0]?.total || 0;
    }
    result.push({ month: m.label, views, actions });
  }
  return result;
}

router.get('/dashboard', protect, async (req, res) => {
  try {
    let data = {};
    const monthly = await buildMonthlyActivity(req.user._id, req.user.role);

    if (req.user.role === 'startup') {
      const startup = await Startup.findOne({ user: req.user._id });
      const pitches = await Pitch.find({ submittedBy: req.user._id })
        .populate('targetCorporate', 'companyName logo').sort('-createdAt');
      const connections = await Connection.countDocuments({
        $or: [{ requester: req.user._id }, { recipient: req.user._id }], status: 'accepted'
      });
      const applications = await Opportunity.find({ 'applications.user': req.user._id })
        .select('title type applications corporate').populate('corporate', 'companyName logo');
      const fundingRounds = await FundingRound.find({ postedBy: req.user._id });

      data = {
        profileViews: startup?.views || 0,
        totalPitches: pitches.length,
        pitchesAccepted: pitches.filter(p => p.status === 'accepted').length,
        pitchesShortlisted: pitches.filter(p => p.status === 'shortlisted').length,
        totalApplications: applications.length,
        applicationsAccepted: applications.filter(o => o.applications.find(a => a.user?.toString() === req.user._id.toString() && a.status === 'accepted')).length,
        connections,
        totalFunding: fundingRounds.reduce((a, r) => a + (r.raisedAmount || 0), 0),
        profileCompletion: startup?.profileCompletion || 0,
        recentPitches: pitches.slice(0, 5),
        recentApplications: applications.slice(0, 5),
        monthly,
      };
    } else if (req.user.role === 'corporate') {
      const corporate = await Corporate.findOne({ user: req.user._id });
      const opportunities = await Opportunity.find({ postedBy: req.user._id }).sort('-createdAt');
      const totalApps = opportunities.reduce((a, o) => a + o.applications.length, 0);
      const acceptedApps = opportunities.reduce((a, o) => a + o.applications.filter(ap => ap.status === 'accepted').length, 0);
      const connections = await Connection.countDocuments({
        $or: [{ requester: req.user._id }, { recipient: req.user._id }], status: 'accepted'
      });
      data = {
        profileViews: corporate?.views || 0,
        totalOpportunities: opportunities.length,
        activeOpportunities: opportunities.filter(o => o.status === 'active').length,
        totalApplications: totalApps,
        acceptedApplications: acceptedApps,
        connections,
        profileCompletion: corporate?.profileCompletion || 0,
        recentOpportunities: opportunities.slice(0, 5),
        monthly,
      };
    }
    res.json(data);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Real platform stats from DB only
router.get('/platform', async (req, res) => {
  try {
    const [startups, corporates, opportunities, events, users] = await Promise.all([
      Startup.countDocuments({ isPublic: true }),
      Corporate.countDocuments({ isPublic: true }),
      Opportunity.countDocuments({ status: 'active' }),
      Event.countDocuments({ status: 'upcoming' }),
      User.countDocuments({ isActive: true }),
    ]);
    const connections = await Connection.countDocuments({ status: 'accepted' });
    res.json({ startups, corporates, opportunities, events, users, connections });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
