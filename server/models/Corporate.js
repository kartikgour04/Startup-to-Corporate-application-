const mongoose = require('mongoose');

const corporateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: { type: String, required: true, trim: true },
  tagline: { type: String, maxlength: 150 },
  description: { type: String, maxlength: 2000 },
  logo: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  industry: { type: String, required: true },
  subIndustry: String,
  size: {
    type: String,
    enum: ['50-200', '201-500', '501-1000', '1001-5000', '5000+'],
    required: true
  },
  founded: Number,
  revenue: { type: String, enum: ['<1M', '1M-10M', '10M-100M', '100M-1B', '1B+'] },
  location: {
    city: String,
    state: String,
    country: String,
    headquarters: String,
    offices: [String]
  },
  website: String,
  linkedinUrl: String,
  innovationFocus: [String],
  partnershipTypes: [String],
  investmentBudget: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'USD' }
  },
  openOpportunities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity' }],
  acceleratorPrograms: [{
    name: String,
    description: String,
    deadline: Date,
    benefits: [String],
    isActive: { type: Boolean, default: true }
  }],
  successStories: [{
    startup: String,
    description: String,
    year: Number,
    impact: String
  }],
  contacts: [{
    name: String,
    role: String,
    email: String,
    linkedin: String,
    isPublic: { type: Boolean, default: false }
  }],
  certifications: [String],
  awards: [{ title: String, year: Number }],
  isVerified: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  isPublic: { type: Boolean, default: true },
  profileCompletion: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  rating: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } }
}, { timestamps: true });

corporateSchema.index({ companyName: 'text', description: 'text', innovationFocus: 'text' });

module.exports = mongoose.model('Corporate', corporateSchema);
