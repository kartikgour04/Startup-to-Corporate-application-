const mongoose = require('mongoose');

const startupSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: { type: String, required: true, trim: true },
  tagline: { type: String, maxlength: 150 },
  description: { type: String, maxlength: 2000 },
  logo: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  industry: { type: String, required: true },
  subIndustry: String,
  stage: {
    type: String,
    enum: ['idea', 'mvp', 'early-stage', 'growth', 'scaling', 'established'],
    required: true
  },
  foundedYear: Number,
  teamSize: { type: String, enum: ['1-5', '6-10', '11-25', '26-50', '50+'] },
  location: {
    city: String,
    state: String,
    country: String,
    remote: { type: Boolean, default: false }
  },
  website: String,
  pitchDeck: String,
  demoVideo: String,
  problemStatement: String,
  solution: String,
  targetMarket: String,
  businessModel: String,
  traction: {
    revenue: String,
    users: String,
    growth: String,
    milestones: [String]
  },
  funding: {
    raised: { type: Number, default: 0 },
    seeking: Number,
    currency: { type: String, default: 'USD' },
    stage: String,
    previousRounds: [{
      round: String,
      amount: Number,
      date: Date,
      investors: [String]
    }]
  },
  team: [{
    name: String,
    role: String,
    linkedin: String,
    avatar: String,
    bio: String
  }],
  technologies: [String],
  tags: [String],
  awards: [{ title: String, year: Number, organization: String }],
  patents: [{ title: String, status: String, year: Number }],
  mediaLinks: [{ title: String, url: String, publication: String }],
  partnerships: [{ company: String, type: String, description: String }],
  isPublic: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  profileCompletion: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  rating: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } }
}, { timestamps: true });

startupSchema.index({ companyName: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Startup', startupSchema);
