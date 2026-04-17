const express = require('express');
const router = express.Router();
const Startup = require('../models/Startup');
const { protect, authorize } = require('../middleware/auth');

// Get all startups with filters
router.get('/', async (req, res) => {
  try {
    const { industry, stage, search, page = 1, limit = 12, sort = '-createdAt', country, isFeatured } = req.query;
    const query = { isPublic: true };
    if (industry) query.industry = industry;
    if (stage) query.stage = stage;
    if (country) query['location.country'] = country;
    if (isFeatured) query.isFeatured = true;
    if (search) query.$text = { $search: search };
    const total = await Startup.countDocuments(query);
    const startups = await Startup.find(query)
      .populate('user', 'name avatar email isVerified')
      .sort(sort).skip((page - 1) * limit).limit(Number(limit));
    res.json({ startups, total, pages: Math.ceil(total / limit), page: Number(page) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Get single startup
router.get('/:id', async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id).populate('user', 'name avatar email');
    if (!startup) return res.status(404).json({ message: 'Startup not found' });
    startup.views += 1;
    await startup.save();
    res.json(startup);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Get my startup
router.get('/my/profile', protect, async (req, res) => {
  try {
    const startup = await Startup.findOne({ user: req.user._id }).populate('user', 'name avatar email');
    res.json(startup);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Update startup profile
router.put('/my/profile', protect, async (req, res) => {
  try {
    const startup = await Startup.findOneAndUpdate({ user: req.user._id }, req.body, { new: true, upsert: true });
    // Calculate profile completion
    const fields = ['companyName', 'description', 'logo', 'industry', 'stage', 'location', 'website', 'pitchDeck', 'problemStatement', 'solution', 'traction'];
    const filled = fields.filter(f => startup[f] && (typeof startup[f] !== 'object' || Object.keys(startup[f]).length > 0));
    startup.profileCompletion = Math.round((filled.length / fields.length) * 100);
    await startup.save();
    res.json(startup);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Like / unlike
router.post('/:id/like', protect, async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id);
    const idx = startup.likes.indexOf(req.user._id);
    if (idx > -1) startup.likes.splice(idx, 1);
    else startup.likes.push(req.user._id);
    await startup.save();
    res.json({ liked: idx === -1, count: startup.likes.length });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Follow / unfollow
router.post('/:id/follow', protect, async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id);
    const idx = startup.followers.indexOf(req.user._id);
    if (idx > -1) startup.followers.splice(idx, 1);
    else startup.followers.push(req.user._id);
    await startup.save();
    res.json({ following: idx === -1, count: startup.followers.length });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Featured startups
router.get('/featured/list', async (req, res) => {
  try {
    const startups = await Startup.find({ isFeatured: true, isPublic: true })
      .populate('user', 'name avatar').limit(6);
    res.json(startups);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
