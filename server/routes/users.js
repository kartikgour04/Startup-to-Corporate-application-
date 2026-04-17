// users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.profileViews += 1;
    await user.save({ validateBeforeSave: false });
    res.json(user);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/update', protect, async (req, res) => {
  try {
    const { name, avatar, socialLinks, notifications, emailNotifications } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, avatar, socialLinks, notifications, emailNotifications }, { new: true });
    res.json(user);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/save-opportunity/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const idx = user.savedOpportunities.indexOf(req.params.id);
    if (idx > -1) user.savedOpportunities.splice(idx, 1);
    else user.savedOpportunities.push(req.params.id);
    await user.save();
    res.json({ saved: idx === -1 });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/saved-opportunities', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('savedOpportunities');
    res.json(user.savedOpportunities);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
