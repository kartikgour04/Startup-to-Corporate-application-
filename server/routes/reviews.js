const express = require('express');
const router = express.Router();
const { Review } = require('../models/index');
const { protect } = require('../middleware/auth');

router.get('/user/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId, isPublic: true })
      .populate('reviewer', 'name avatar role').sort('-createdAt');
    const avg = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;
    res.json({ reviews, average: avg.toFixed(1), count: reviews.length });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const existing = await Review.findOne({ reviewer: req.user._id, reviewee: req.body.reviewee });
    if (existing) return res.status(400).json({ message: 'Already reviewed this user' });
    const review = await Review.create({ ...req.body, reviewer: req.user._id });
    res.status(201).json(review);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/:id/respond', protect, async (req, res) => {
  try {
    const review = await Review.findOneAndUpdate(
      { _id: req.params.id, reviewee: req.user._id },
      { response: { text: req.body.text, respondedAt: new Date() } },
      { new: true }
    );
    res.json(review);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
