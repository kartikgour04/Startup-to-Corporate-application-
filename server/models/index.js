const mongoose = require('mongoose');

// Message Model
const messageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'file', 'image', 'system'], default: 'text' },
  fileUrl: String,
  fileName: String,
  isRead: { type: Boolean, default: false },
  readAt: Date,
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  lastMessageAt: { type: Date, default: Date.now },
  unreadCount: { type: Map, of: Number, default: {} },
  isBlocked: { type: Boolean, default: false },
  blockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Notification Model
const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['connection_request', 'connection_accepted', 'message', 'opportunity', 'application', 'review', 'event', 'funding', 'system', 'pitch'],
    required: true
  },
  title: String,
  message: String,
  data: { type: mongoose.Schema.Types.Mixed },
  isRead: { type: Boolean, default: false },
  link: String
}, { timestamps: true });

// Event Model
const eventSchema = new mongoose.Schema({
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['webinar', 'demo-day', 'networking', 'workshop', 'summit', 'hackathon', 'pitch-contest'], required: true },
  banner: String,
  date: { type: Date, required: true },
  endDate: Date,
  timezone: { type: String, default: 'UTC' },
  location: { type: String },
  isOnline: { type: Boolean, default: true },
  meetingLink: String,
  capacity: Number,
  price: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  registrations: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    registeredAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['confirmed', 'waitlist', 'cancelled'], default: 'confirmed' },
    paymentId: String
  }],
  speakers: [{ name: String, role: String, company: String, avatar: String, bio: String }],
  agenda: [{ time: String, title: String, description: String, speaker: String }],
  tags: [String],
  status: { type: String, enum: ['upcoming', 'live', 'completed', 'cancelled'], default: 'upcoming' },
  isFeatured: { type: Boolean, default: false },
  views: { type: Number, default: 0 }
}, { timestamps: true });

// Review Model
const reviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['startup', 'corporate'], required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  title: String,
  comment: { type: String, required: true },
  tags: [String],
  isPublic: { type: Boolean, default: true },
  response: { text: String, respondedAt: Date }
}, { timestamps: true });

module.exports = {
  Message: mongoose.model('Message', messageSchema),
  Conversation: mongoose.model('Conversation', conversationSchema),
  Notification: mongoose.model('Notification', notificationSchema),
  Event: mongoose.model('Event', eventSchema),
  Review: mongoose.model('Review', reviewSchema)
};
