// pitches.js
const express = require('express');
const router = express.Router();
const { Pitch } = require('../models/pitch');
const { protect } = require('../middleware/auth');
const { checkPitchLimit } = require('../middleware/planLimits');

router.get('/my', protect, async (req, res) => {
  try {
    const pitches = await Pitch.find({ submittedBy: req.user._id }).populate('targetCorporate', 'companyName logo').sort('-createdAt');
    res.json(pitches);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/received', protect, async (req, res) => {
  try {
    const Corporate = require('../models/Corporate');
    const corp = await Corporate.findOne({ user: req.user._id });
    if (!corp) return res.json([]);
    const pitches = await Pitch.find({ targetCorporate: corp._id })
      .populate('startup', 'companyName logo stage industry').populate('submittedBy', 'name avatar').sort('-createdAt');
    res.json(pitches);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', protect, checkPitchLimit, async (req, res) => {
  try {
    const Startup = require('../models/Startup');
    const startup = await Startup.findOne({ user: req.user._id });
    if (!startup) return res.status(400).json({ message: 'Create a startup profile first' });
    const pitch = await Pitch.create({ ...req.body, startup: startup._id, submittedBy: req.user._id });
    res.status(201).json(pitch);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const pitch = await Pitch.findById(req.params.id)
      .populate('startup').populate('targetCorporate').populate('submittedBy', 'name avatar');
    if (!pitch) return res.status(404).json({ message: 'Not found' });
    pitch.views += 1; await pitch.save();
    res.json(pitch);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const pitch = await Pitch.findOneAndUpdate(
      { _id: req.params.id, submittedBy: req.user._id }, req.body, { new: true }
    );
    res.json(pitch);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/:id/feedback', protect, async (req, res) => {
  try {
    const pitch = await Pitch.findById(req.params.id);
    pitch.feedback.push({ from: req.user._id, ...req.body });
    await pitch.save();
    res.json({ message: 'Feedback added' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
