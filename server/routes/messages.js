const express = require('express');
const router = express.Router();
const { Message, Conversation } = require('../models/index');
const { protect } = require('../middleware/auth');

// Get all conversations
router.get('/conversations', protect, async (req, res) => {
  try {
    const convs = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'name avatar role isActive')
      .populate('lastMessage')
      .sort('-lastMessageAt');
    res.json(convs);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Get or create conversation
router.post('/conversations', protect, async (req, res) => {
  try {
    const { userId } = req.body;
    let conv = await Conversation.findOne({ participants: { $all: [req.user._id, userId], $size: 2 } });
    if (!conv) {
      conv = await Conversation.create({ participants: [req.user._id, userId] });
    }
    await conv.populate('participants', 'name avatar role');
    res.json(conv);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Get messages in conversation
router.get('/conversations/:convId', protect, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const messages = await Message.find({ conversation: req.params.convId, isDeleted: false })
      .populate('sender', 'name avatar')
      .sort('-createdAt').skip((page - 1) * limit).limit(Number(limit));
    // Mark as read
    await Message.updateMany(
      { conversation: req.params.convId, sender: { $ne: req.user._id }, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    res.json(messages.reverse());
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Send message
router.post('/conversations/:convId/send', protect, async (req, res) => {
  try {
    const msg = await Message.create({
      conversation: req.params.convId,
      sender: req.user._id,
      content: req.body.content,
      type: req.body.type || 'text',
      fileUrl: req.body.fileUrl,
      fileName: req.body.fileName
    });
    await Conversation.findByIdAndUpdate(req.params.convId, {
      lastMessage: msg._id,
      lastMessageAt: new Date()
    });
    await msg.populate('sender', 'name avatar');
    const io = req.app.get('io');
    io.to(req.params.convId).emit('new_message', msg);
    res.status(201).json(msg);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Delete message
router.delete('/:msgId', protect, async (req, res) => {
  try {
    await Message.findOneAndUpdate(
      { _id: req.params.msgId, sender: req.user._id },
      { isDeleted: true, content: 'This message was deleted' }
    );
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
