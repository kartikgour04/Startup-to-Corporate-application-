const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Startup = require('../models/Startup');
const Corporate = require('../models/Corporate');
const { Notification } = require('../models/index');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });

const DEMO_EMAILS = [
  'admin@nexus.com','arjun@aifusion.in','neha@greenloop.co','david@payswift.io',
  'fatima@medai.health','anjali@techcorp.in','vikram@innovateinc.in','priya@globalventures.com'
];

const verifyEmailTemplate = (name, link) => `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Verify your Nexus account</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
<tr><td align="center"><table width="100%" style="max-width:520px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08)">
<tr><td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:28px 32px;text-align:center">
  <h1 style="color:#fff;margin:0;font-size:24px;font-weight:900;letter-spacing:-0.5px">Nexus</h1>
  <p style="color:rgba(255,255,255,0.75);margin:6px 0 0;font-size:13px">Where Startups Meet Corporates</p>
</td></tr>
<tr><td style="padding:36px 32px">
  <h2 style="color:#0f172a;font-size:20px;margin:0 0 12px">Welcome, ${name}!</h2>
  <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 8px">Your account is ready. Click the button below to verify your email and start using Nexus.</p>
  <p style="color:#94a3b8;font-size:13px;margin:0 0 28px">This link expires in 24 hours.</p>
  <div style="text-align:center">
    <a href="${link}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:13px 32px;border-radius:8px;font-weight:700;font-size:15px">Verify My Email</a>
  </div>
  <p style="color:#94a3b8;font-size:12px;margin:28px 0 0;text-align:center">Didn't create this account? Ignore this email.</p>
</td></tr>
<tr><td style="background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0">
  <p style="color:#94a3b8;font-size:11px;margin:0">Nexus Platform · Made in India 🇮🇳 · <a href="${process.env.CLIENT_URL}" style="color:#6366f1">nexus.in</a></p>
</td></tr>
</table></td></tr></table></body></html>`;

const passwordResetTemplate = (name, link) => `<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;background:#f1f5f9;padding:40px 16px">
<div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;padding:36px;box-shadow:0 2px 16px rgba(0,0,0,0.08)">
  <h2 style="color:#0f172a;margin:0 0 12px">Reset Your Password</h2>
  <p style="color:#475569">Hi ${name}, we got a request to reset your Nexus password.</p>
  <div style="text-align:center;margin:28px 0">
    <a href="${link}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:13px 32px;border-radius:8px;font-weight:700;font-size:15px">Reset Password</a>
  </div>
  <p style="color:#94a3b8;font-size:13px">This link expires in 10 minutes. If you didn't request this, ignore this email — your account is safe.</p>
</div></body></html>`;

const applicationStatusTemplate = (startupName, oppTitle, status, notes, link) => {
  const cfg = {
    reviewing: { emoji: '🔍', color: '#f59e0b', label: 'Under Review', msg: 'A corporate partner is actively reviewing your application.' },
    shortlisted: { emoji: '⭐', color: '#8b5cf6', label: 'Shortlisted!', msg: 'Congratulations — you have been shortlisted for this opportunity.' },
    accepted: { emoji: '🎊', color: '#10b981', label: 'Accepted!', msg: 'Outstanding! Your application has been accepted. Check your messages for next steps.' },
    rejected: { emoji: '📋', color: '#64748b', label: 'Not Selected', msg: 'Thank you for applying. Unfortunately this opportunity wasn\'t the right fit. Keep applying!' },
  };
  const s = cfg[status] || cfg.reviewing;
  return `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f1f5f9;padding:40px 16px">
<div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08)">
  <div style="background:${s.color};padding:24px;text-align:center">
    <div style="font-size:40px">${s.emoji}</div>
    <h2 style="color:#fff;margin:8px 0 0;font-size:18px">Application ${s.label}</h2>
  </div>
  <div style="padding:28px 32px">
    <p style="color:#0f172a;font-size:15px">Hi <strong>${startupName}</strong>,</p>
    <p style="color:#475569;line-height:1.6">${s.msg}</p>
    <div style="background:#f8fafc;border-left:3px solid ${s.color};border-radius:6px;padding:14px;margin:20px 0">
      <p style="color:#0f172a;font-weight:700;margin:0 0 6px;font-size:14px">${oppTitle}</p>
      <p style="color:#475569;margin:0;font-size:13px">Status: <strong style="color:${s.color}">${s.label}</strong></p>
      ${notes ? `<p style="color:#475569;margin:8px 0 0;font-size:13px;font-style:italic">Note from corporate: "${notes}"</p>` : ''}
    </div>
    <div style="text-align:center;margin:20px 0">
      <a href="${link}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:11px 24px;border-radius:8px;font-weight:700;font-size:14px">View My Applications</a>
    </div>
  </div>
  <div style="background:#f8fafc;padding:14px;text-align:center;border-top:1px solid #e2e8f0">
    <p style="color:#94a3b8;font-size:11px;margin:0">Nexus Platform 🇮🇳</p>
  </div>
</div></body></html>`;
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, city } = req.body;
    if (!name?.trim() || !email?.trim() || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password and role are required' });
    }
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Please enter a valid email address' });

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });

    // If user exists but is NOT verified → resend verification, don't error
    if (existing && !existing.isVerified) {
      const verificationToken = crypto.randomBytes(32).toString('hex');
      existing.verificationToken = verificationToken;
      existing.verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await existing.save({ validateBeforeSave: false });

      const verifyLink = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
      let emailSent = false;
      try {
        await sendEmail({ to: normalizedEmail, subject: 'Verify your Nexus account', html: verifyEmailTemplate(existing.name, verifyLink) });
        emailSent = true;
        console.log(`✅ Verification email resent to ${normalizedEmail}`);
      } catch (emailErr) {
        console.error(`❌ Email failed for ${normalizedEmail}:`, emailErr.message);
      }
      return res.status(200).json({
        requiresVerification: true,
        email: normalizedEmail,
        message: emailSent
          ? `Account already exists but is not verified. We've resent the verification email to ${normalizedEmail}.`
          : `Account exists but email delivery failed. Please check your email settings or contact support.`,
        emailSent,
      });
    }

    // If user exists AND is verified → tell them to login
    if (existing && existing.isVerified) {
      return res.status(400).json({ message: 'This email is already registered. Please login instead.' });
    }

    // New user
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({
      name: name.trim(), email: normalizedEmail, password, role,
      phone: phone?.trim() || '', city: city?.trim() || '',
      verificationToken,
      verificationExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isVerified: false
    });

    // Create profile
    if (role === 'startup') {
      await Startup.create({ user: user._id, companyName: name.trim(), industry: 'Technology', stage: 'idea' });
    } else if (role === 'corporate') {
      await Corporate.create({ user: user._id, companyName: name.trim(), industry: 'Technology', size: '50-200' });
    }

    const verifyLink = `http://localhost:5001/api/auth/verify/${verificationToken}`;
    let emailSent = false;
    try {
      await sendEmail({ to: normalizedEmail, subject: 'Verify your Nexus account', html: verifyEmailTemplate(name.trim(), verifyLink) });
      emailSent = true;
      console.log(`✅ Verification email sent to ${normalizedEmail}`);
    } catch (emailErr) {
      console.error(`❌ Email failed for ${normalizedEmail}:`, emailErr.message);
      console.log(`   Verify link (copy for testing): ${verifyLink}`);
    }

    res.status(201).json({
      requiresVerification: true,
      email: normalizedEmail,
      emailSent,
      // In dev mode, include link in response so dev can test without email
      ...(process.env.NODE_ENV !== 'production' && !emailSent && { devVerifyLink: verifyLink }),
      message: emailSent
        ? `Account created! Verification email sent to ${normalizedEmail}. Please check your inbox (and spam folder).`
        : `Account created! Email delivery failed — please configure EMAIL_USER and EMAIL_PASS in server/.env, or use the dev link.`,
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error.code === 11000) return res.status(400).json({ message: 'This email is already registered. Please login.' });
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }
    if (!user.isActive) {
      return res.status(403).json({
        message: user.banReason ? `Account restricted: ${user.banReason}` : 'Your account has been suspended. Contact support.',
        isBanned: true, banReason: user.banReason
      });
    }
    if (!user.isVerified && !DEMO_EMAILS.includes(normalizedEmail)) {
      return res.status(403).json({
        message: 'Please verify your email before logging in.',
        requiresVerification: true, email: normalizedEmail
      });
    }

    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    res.json({ token, user, message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    let profile = null;
    if (user.role === 'startup') profile = await Startup.findOne({ user: user._id });
    if (user.role === 'corporate') profile = await Corporate.findOne({ user: user._id });
    res.json({ user, profile });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token,
      verificationExpiry: { $gt: new Date() }
    });
    if (!user) return res.status(400).json({ message: 'Verification link is invalid or has expired. Please request a new one.' });
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpiry = undefined;
    await user.save();
    await Notification.create({ user: user._id, type: 'system', title: '✅ Email verified!', message: 'Your account is now active. Complete your profile to get discovered.', link: '/dashboard' });
    res.json({ message: 'Email verified! You can now log in.', verified: true });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: 'No account found with this email' });
    if (user.isVerified) return res.status(400).json({ message: 'This account is already verified. Please login.' });
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });
    const verifyLink = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    try {
      await sendEmail({ to: user.email, subject: 'Verify your Nexus account', html: verifyEmailTemplate(user.name, verifyLink) });
      console.log(`✅ Resent verification to ${user.email}`);
    } catch (err) {
      console.error('Resend failed:', err.message);
      if (process.env.NODE_ENV !== 'production') return res.json({ message: 'Email failed, dev link below', devVerifyLink: verifyLink });
      return res.status(500).json({ message: 'Email delivery failed. Check EMAIL_USER and EMAIL_PASS in server/.env' });
    }
    res.json({ message: 'Verification email sent! Check your inbox and spam folder.' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email?.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: 'No account with that email address' });
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    try {
      await sendEmail({ to: user.email, subject: 'Reset your Nexus password', html: passwordResetTemplate(user.name, resetLink) });
      res.json({ message: 'Password reset email sent!' });
    } catch {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      res.status(500).json({ message: 'Email could not be sent. Please try again.' });
    }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.resetPassword = async (req, res) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ resetPasswordToken: hashed, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Reset link invalid or expired' });
    if (!req.body.password || req.body.password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.json({ message: 'Password reset successfully! You can now login.' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(req.body.currentPassword))) return res.status(401).json({ message: 'Current password is incorrect' });
    if (!req.body.newPassword || req.body.newPassword.length < 8) return res.status(400).json({ message: 'New password must be at least 8 characters' });
    user.password = req.body.newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const { password } = req.body;
    const user = await User.findById(userId).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (password && !(await user.matchPassword(password))) return res.status(401).json({ message: 'Password is incorrect' });

    // Delete all associated data
    const { Pitch, Connection, FundingRound } = require('../models/pitch');
    const { Message, Conversation, Notification, Event } = require('../models/index');
    const Opportunity = require('../models/Opportunity');

    await Startup.findOneAndDelete({ user: userId });
    await Corporate.findOneAndDelete({ user: userId });
    await Pitch.deleteMany({ submittedBy: userId });
    await FundingRound.deleteMany({ postedBy: userId });
    await Connection.deleteMany({ $or: [{ requester: userId }, { recipient: userId }] });
    await Notification.deleteMany({ user: userId });
    await Opportunity.deleteMany({ postedBy: userId });
    // Remove from conversations
    await Conversation.updateMany({ participants: userId }, { $pull: { participants: userId } });
    await Message.deleteMany({ sender: userId });
    await User.findByIdAndDelete(userId);

    res.json({ message: 'Account permanently deleted. Sorry to see you go.' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.applicationStatusTemplate = applicationStatusTemplate;
