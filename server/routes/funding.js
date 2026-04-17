const express = require('express');
const router = express.Router();
const { FundingRound } = require('../models/pitch');
const { protect } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { roundType, page = 1, limit = 10, search, status = 'open' } = req.query;
    const query = { isPublic: true, status };
    if (roundType) query.roundType = roundType;
    if (search) query.$text = { $search: search };
    const total = await FundingRound.countDocuments(query);
    const rounds = await FundingRound.find(query)
      .populate('startup', 'companyName logo industry stage location').populate('postedBy', 'name avatar')
      .sort('-createdAt').skip((page - 1) * limit).limit(Number(limit));
    res.json({ rounds, total, pages: Math.ceil(total / limit) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const round = await FundingRound.findById(req.params.id)
      .populate('startup').populate('postedBy', 'name avatar');
    if (!round) return res.status(404).json({ message: 'Not found' });
    round.views += 1; await round.save();
    res.json(round);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const Startup = require('../models/Startup');
    const startup = await Startup.findOne({ user: req.user._id });
    if (!startup) return res.status(400).json({ message: 'Startup profile required' });
    const round = await FundingRound.create({ ...req.body, startup: startup._id, postedBy: req.user._id });
    res.status(201).json(round);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const round = await FundingRound.findOneAndUpdate({ _id: req.params.id, postedBy: req.user._id }, req.body, { new: true });
    res.json(round);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/:id/express-interest', protect, async (req, res) => {
  try {
    const round = await FundingRound.findById(req.params.id);
    const exists = round.investors.some(i => i.user.toString() === req.user._id.toString());
    if (exists) return res.status(400).json({ message: 'Already expressed interest' });
    round.investors.push({ user: req.user._id, amount: req.body.amount, status: 'interested' });
    await round.save();
    res.json({ message: 'Interest registered!' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/my/rounds', protect, async (req, res) => {
  try {
    const rounds = await FundingRound.find({ postedBy: req.user._id }).populate('startup', 'companyName logo').sort('-createdAt');
    res.json(rounds);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
