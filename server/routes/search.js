// search.js
const express = require('express');
const router = express.Router();
const Startup = require('../models/Startup');
const Corporate = require('../models/Corporate');
const Opportunity = require('../models/Opportunity');
const { Event } = require('../models/index');

router.get('/', async (req, res) => {
  try {
    const { q, type = 'all', page = 1, limit = 10 } = req.query;
    if (!q) return res.json({ results: [], total: 0 });
    const regex = { $regex: q, $options: 'i' };
    const results = {};
    if (type === 'all' || type === 'startups') {
      results.startups = await Startup.find({ $or: [{ companyName: regex }, { description: regex }], isPublic: true })
        .populate('user', 'name avatar').limit(5).select('companyName logo industry stage location tagline');
    }
    if (type === 'all' || type === 'corporates') {
      results.corporates = await Corporate.find({ $or: [{ companyName: regex }, { description: regex }], isPublic: true })
        .populate('user', 'name avatar').limit(5).select('companyName logo industry size location tagline');
    }
    if (type === 'all' || type === 'opportunities') {
      results.opportunities = await Opportunity.find({ $or: [{ title: regex }, { description: regex }], status: 'active' })
        .populate('corporate', 'companyName logo').limit(5).select('title type industry budget deadline');
    }
    if (type === 'all' || type === 'events') {
      results.events = await Event.find({ title: regex }).limit(5).select('title type date isOnline');
    }
    res.json(results);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
