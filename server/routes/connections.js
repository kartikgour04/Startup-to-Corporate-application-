const express = require('express');
const router = express.Router();
const { Connection } = require('../models/pitch');
const { Notification } = require('../models/index');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [{ requester: req.user._id }, { recipient: req.user._id }],
      status: 'accepted'
    }).populate('requester', 'name avatar role').populate('recipient', 'name avatar role');
    res.json(connections);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/requests', protect, async (req, res) => {
  try {
    const requests = await Connection.find({ recipient: req.user._id, status: 'pending' })
      .populate('requester', 'name avatar role').sort('-createdAt');
    res.json(requests);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/request/:userId', protect, async (req, res) => {
  try {
    if (req.params.userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot connect with yourself' });
    }
    const existing = await Connection.findOne({
      $or: [
        { requester: req.user._id, recipient: req.params.userId },
        { requester: req.params.userId, recipient: req.user._id }
      ]
    });
    if (existing) return res.status(400).json({ message: 'Connection already exists', status: existing.status });
    const conn = await Connection.create({
      requester: req.user._id,
      recipient: req.params.userId,
      message: req.body.message,
      type: req.body.type || 'network'
    });
    await Notification.create({
      user: req.params.userId,
      type: 'connection_request',
      title: 'New Connection Request',
      message: `${req.user.name} sent you a connection request`,
      data: { connectionId: conn._id, userId: req.user._id },
      link: '/connections'
    });
    const io = req.app.get('io');
    io.to(req.params.userId).emit('connection_request', { from: req.user._id });
    res.status(201).json(conn);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/:id/accept', protect, async (req, res) => {
  try {
    const conn = await Connection.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id, status: 'pending' },
      { status: 'accepted', connectedAt: new Date() },
      { new: true }
    ).populate('requester', 'name avatar');
    if (!conn) return res.status(404).json({ message: 'Request not found' });
    await Notification.create({
      user: conn.requester._id,
      type: 'connection_accepted',
      title: 'Connection Accepted',
      message: `${req.user.name} accepted your connection request`,
      link: `/profile/${req.user._id}`
    });
    res.json(conn);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/:id/reject', protect, async (req, res) => {
  try {
    await Connection.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { status: 'rejected' }
    );
    res.json({ message: 'Request rejected' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/:userId', protect, async (req, res) => {
  try {
    await Connection.findOneAndDelete({
      $or: [
        { requester: req.user._id, recipient: req.params.userId },
        { requester: req.params.userId, recipient: req.user._id }
      ]
    });
    res.json({ message: 'Connection removed' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/status/:userId', protect, async (req, res) => {
  try {
    const conn = await Connection.findOne({
      $or: [
        { requester: req.user._id, recipient: req.params.userId },
        { requester: req.params.userId, recipient: req.user._id }
      ]
    });
    res.json({ status: conn ? conn.status : 'none', isRequester: conn?.requester?.toString() === req.user._id.toString() });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
