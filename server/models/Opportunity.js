const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  corporate: { type: mongoose.Schema.Types.ObjectId, ref: 'Corporate' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: {
    type: String,
    enum: ['pilot', 'investment', 'partnership', 'acquisition', 'accelerator', 'poc', 'vendor', 'licensing'],
    required: true
  },
  industry: [String],
  requiredStage: [String],
  requiredTechnologies: [String],
  budget: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'USD' },
    isNegotiable: { type: Boolean, default: true }
  },
  equity: {
    offered: Boolean,
    percentage: { min: Number, max: Number }
  },
  timeline: { start: Date, end: Date, duration: String },
  location: { city: String, country: String, remote: { type: Boolean, default: true } },
  requirements: [String],
  benefits: [String],
  deliverables: [String],
  applicationProcess: String,
  deadline: Date,
  slots: { type: Number, default: 1 },
  applications: [{
    startup: { type: mongoose.Schema.Types.ObjectId, ref: 'Startup' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'reviewing', 'shortlisted', 'accepted', 'rejected'], default: 'pending' },
    coverLetter: String,
    pitch: String,
    phone: String,
    linkedinUrl: String,
    portfolioUrl: String,
    availableFrom: Date,
    teamSize: String,
    revenueStage: String,
    attachments: [String],
    appliedAt: { type: Date, default: Date.now },
    reviewedAt: Date,
    notes: String
  }],
  status: { type: String, enum: ['draft', 'active', 'paused', 'closed', 'expired'], default: 'active' },
  isFeatured: { type: Boolean, default: false },
  isPremium: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  saves: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tags: [String],
  attachments: [String]
}, { timestamps: true });

opportunitySchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Opportunity', opportunitySchema);
