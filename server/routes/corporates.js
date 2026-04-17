const express = require('express');
const Corporate = require('../models/Corporate');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { industry, size, search, page = 1, limit = 12, sort = '-createdAt', country } = req.query;
    const query = { isPublic: true };
    if (industry) query.industry = industry;
    if (size) query.size = size;
    if (country) query['location.country'] = country;
    if (search) query.$text = { $search: search };
    const total = await Corporate.countDocuments(query);
    const corporates = await Corporate.find(query).populate('user', 'name avatar email isVerified')
      .sort(sort).skip((page - 1) * limit).limit(Number(limit));
    res.json({ corporates, total, pages: Math.ceil(total / limit), page: Number(page) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const corporate = await Corporate.findById(req.params.id).populate('user', 'name avatar email');
    if (!corporate) return res.status(404).json({ message: 'Not found' });
    corporate.views += 1; await corporate.save();
    res.json(corporate);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/my/profile', protect, async (req, res) => {
  try {
    const corporate = await Corporate.findOne({ user: req.user._id }).populate('user', 'name avatar email');
    res.json(corporate);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/my/profile', protect, async (req, res) => {
  try {
    const corporate = await Corporate.findOneAndUpdate({ user: req.user._id }, req.body, { new: true, upsert: true });
    const fields = ['companyName', 'description', 'logo', 'industry', 'size', 'location', 'website', 'innovationFocus', 'partnershipTypes'];
    const filled = fields.filter(f => corporate[f] && (typeof corporate[f] !== 'object' || Object.keys(corporate[f]).length > 0));
    corporate.profileCompletion = Math.round((filled.length / fields.length) * 100);
    await corporate.save();
    res.json(corporate);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/featured/list', async (req, res) => {
  try {
    const corporates = await Corporate.find({ isFeatured: true, isPublic: true })
      .populate('user', 'name avatar').limit(6);
    res.json(corporates);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
