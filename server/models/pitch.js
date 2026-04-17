const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'blocked'], default: 'pending' },
  message: String,
  connectedAt: Date,
  type: { type: String, enum: ['network', 'partnership', 'investment', 'mentorship'], default: 'network' }
}, { timestamps: true });

const pitchSchema = new mongoose.Schema({
  startup: { type: mongoose.Schema.Types.ObjectId, ref: 'Startup', required: true },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetCorporate: { type: mongoose.Schema.Types.ObjectId, ref: 'Corporate' },
  opportunity: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity' },
  title: { type: String, required: true },
  summary: { type: String, required: true },
  problem: String,
  solution: String,
  uniqueValue: String,
  marketSize: String,
  traction: String,
  team: String,
  financials: String,
  ask: String,
  pitchDeck: String,
  video: String,
  attachments: [String],
  status: {
    type: String,
    enum: ['draft', 'submitted', 'viewed', 'shortlisted', 'meeting_scheduled', 'accepted', 'rejected', 'on_hold'],
    default: 'draft'
  },
  feedback: [{
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment: String,
    rating: Number,
    date: { type: Date, default: Date.now }
  }],
  meetings: [{
    scheduledAt: Date,
    duration: Number,
    link: String,
    notes: String,
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' }
  }],
  views: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: false }
}, { timestamps: true });

const fundingRoundSchema = new mongoose.Schema({
  startup: { type: mongoose.Schema.Types.ObjectId, ref: 'Startup', required: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  roundType: { type: String, enum: ['pre-seed', 'seed', 'series-a', 'series-b', 'series-c', 'growth', 'bridge'], required: true },
  targetAmount: { type: Number, required: true },
  raisedAmount: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  minInvestment: Number,
  maxInvestment: Number,
  equity: Number,
  valuation: Number,
  deadline: Date,
  useOfFunds: String,
  highlights: [String],
  documents: [{ title: String, url: String, isPublic: Boolean }],
  investors: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: Number,
    status: { type: String, enum: ['interested', 'committed', 'invested'], default: 'interested' },
    date: { type: Date, default: Date.now }
  }],
  status: { type: String, enum: ['open', 'closed', 'funded', 'cancelled'], default: 'open' },
  isPublic: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  views: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = {
  Connection: mongoose.model('Connection', connectionSchema),
  Pitch: mongoose.model('Pitch', pitchSchema),
  FundingRound: mongoose.model('FundingRound', fundingRoundSchema)
};
