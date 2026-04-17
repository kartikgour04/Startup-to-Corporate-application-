const express = require('express');
const router = express.Router();
const { Event } = require('../models/index');
const { protect } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { type, page = 1, limit = 9, status = 'upcoming', search } = req.query;
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (search) query.$or = [{ title: { $regex: search, $options: 'i' } }];
    const total = await Event.countDocuments(query);
    const events = await Event.find(query).populate('organizer', 'name avatar')
      .sort('date').skip((page - 1) * limit).limit(Number(limit));
    res.json({ events, total, pages: Math.ceil(total / limit) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name avatar');
    if (!event) return res.status(404).json({ message: 'Not found' });
    event.views += 1; await event.save();
    res.json(event);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, organizer: req.user._id });
    res.status(201).json(event);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findOneAndUpdate({ _id: req.params.id, organizer: req.user._id }, req.body, { new: true });
    res.json(event);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/:id/register', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    const alreadyReg = event.registrations.some(r => r.user.toString() === req.user._id.toString());
    if (alreadyReg) return res.status(400).json({ message: 'Already registered' });
    if (event.capacity && event.registrations.length >= event.capacity) {
      event.registrations.push({ user: req.user._id, status: 'waitlist' });
    } else {
      event.registrations.push({ user: req.user._id, status: 'confirmed' });
    }
    await event.save();
    res.json({ message: 'Registered successfully!' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/:id/register', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    event.registrations = event.registrations.filter(r => r.user.toString() !== req.user._id.toString());
    await event.save();
    res.json({ message: 'Registration cancelled' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/my/registered', protect, async (req, res) => {
  try {
    const events = await Event.find({ 'registrations.user': req.user._id }).sort('date');
    res.json(events);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
