const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8 },
  role: { type: String, enum: ['startup', 'corporate', 'investor', 'admin'], required: true },
  avatar: { type: String, default: '' },
  phone: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  banReason: { type: String, default: '' },
  bannedAt: { type: Date },
  bannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isPremium: { type: Boolean, default: false },
  premiumPlan: { type: String, enum: ['free', 'starter', 'professional', 'enterprise'], default: 'free' },
  premiumExpiry: { type: Date },
  razorpayCustomerId: { type: String },
  verificationToken: String,
  verificationExpiry: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: { type: Date },
  loginCount: { type: Number, default: 0 },
  savedOpportunities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity' }],
  notifications: { type: Boolean, default: true },
  emailNotifications: { type: Boolean, default: true },
  profileViews: { type: Number, default: 0 },
  socialLinks: { linkedin: String, twitter: String, website: String }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function(entered) {
  return await bcrypt.compare(entered, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.verificationToken;
  delete obj.verificationExpiry;
  delete obj.resetPasswordToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
