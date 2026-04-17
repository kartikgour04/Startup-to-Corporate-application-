const express = require('express');
const router = express.Router();
const Opportunity = require('../models/Opportunity');
const { Notification } = require('../models/index');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { checkOpportunityLimit } = require('../middleware/planLimits');
const sendEmail = require('../utils/sendEmail');
const { applicationStatusTemplate } = require('../controllers/authController');

router.get('/', async (req, res) => {
  try {
    const { type, industry, search, page = 1, limit = 10, sort = '-createdAt', remote, status = 'active' } = req.query;
    const query = { status };
    if (type) query.type = type;
    if (industry) query.industry = { $in: [industry] };
    if (remote === 'true') query['location.remote'] = true;
    if (search) query.$text = { $search: search };
    const total = await Opportunity.countDocuments(query);
    const opportunities = await Opportunity.find(query)
      .populate('postedBy', 'name avatar').populate('corporate', 'companyName logo isVerified')
      .sort(sort).skip((page - 1) * limit).limit(Number(limit));
    res.json({ opportunities, total, pages: Math.ceil(total / limit), page: Number(page) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const opp = await Opportunity.findById(req.params.id)
      .populate('postedBy', 'name avatar email').populate('corporate');
    if (!opp) return res.status(404).json({ message: 'Not found' });
    opp.views += 1; await opp.save();
    res.json(opp);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', protect, checkOpportunityLimit, async (req, res) => {
  try {
    const opp = await Opportunity.create({ ...req.body, postedBy: req.user._id });
    res.status(201).json(opp);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const opp = await Opportunity.findOneAndUpdate(
      { _id: req.params.id, postedBy: req.user._id }, req.body, { new: true }
    );
    res.json(opp);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Opportunity.findOneAndDelete({ _id: req.params.id, postedBy: req.user._id });
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Apply to opportunity
router.post('/:id/apply', protect, async (req, res) => {
  try {
    const opp = await Opportunity.findById(req.params.id);
    if (!opp) return res.status(404).json({ message: 'Opportunity not found' });
    const alreadyApplied = opp.applications.some(a => a.user.toString() === req.user._id.toString());
    if (alreadyApplied) return res.status(400).json({ message: 'You have already applied to this opportunity' });
    if (opp.status !== 'active') return res.status(400).json({ message: 'This opportunity is no longer accepting applications' });

    const Startup = require('../models/Startup');
    const startup = await Startup.findOne({ user: req.user._id });
    opp.applications.push({
      user: req.user._id, startup: startup?._id,
      coverLetter: req.body.coverLetter, pitch: req.body.pitch,
      phone: req.body.phone, linkedinUrl: req.body.linkedinUrl,
      portfolioUrl: req.body.portfolioUrl, availableFrom: req.body.availableFrom,
      teamSize: req.body.teamSize, revenueStage: req.body.revenueStage,
    });
    await opp.save();

    // Notify the corporate poster
    await Notification.create({
      user: opp.postedBy,
      type: 'application',
      title: 'New Application Received',
      message: `${req.user.name} applied to "${opp.title}"`,
      data: { opportunityId: opp._id, applicantId: req.user._id },
      link: '/dashboard/opportunities'
    });
    const io = req.app.get('io');
    io.to(opp.postedBy.toString()).emit('new_application', { opportunityId: opp._id, title: opp.title, applicant: req.user.name });
    res.json({ message: 'Application submitted successfully!' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Update application status — sends notification + email to startup
router.put('/:id/applications/:appId', protect, async (req, res) => {
  try {
    const opp = await Opportunity.findById(req.params.id);
    if (!opp) return res.status(404).json({ message: 'Opportunity not found' });
    const app = opp.applications.id(req.params.appId);
    if (!app) return res.status(404).json({ message: 'Application not found' });

    const oldStatus = app.status;
    app.status = req.body.status;
    app.notes = req.body.notes || app.notes;
    app.reviewedAt = new Date();
    await opp.save();

    // Only notify if status actually changed
    if (oldStatus !== req.body.status) {
      const applicantUser = await User.findById(app.user);
      if (applicantUser) {
        const statusMessages = {
          reviewing: 'Your application is being reviewed',
          shortlisted: '⭐ You have been shortlisted!',
          accepted: '🎊 Your application was accepted!',
          rejected: 'Application update regarding your application',
        };

        // In-app notification
        await Notification.create({
          user: app.user,
          type: 'application',
          title: statusMessages[req.body.status] || 'Application Status Update',
          message: `Your application for "${opp.title}" has been updated to: ${req.body.status}${req.body.notes ? `. Note: ${req.body.notes}` : ''}`,
          data: { opportunityId: opp._id, status: req.body.status },
          link: '/dashboard/applications'
        });

        // Real-time socket push to startup
        const io = req.app.get('io');
        io.to(app.user.toString()).emit('application_status_update', {
          opportunityId: opp._id,
          opportunityTitle: opp.title,
          status: req.body.status,
          notes: req.body.notes,
          appId: app._id
        });

        // Email notification to startup
        if (applicantUser.emailNotifications !== false) {
          try {
            await sendEmail({
              to: applicantUser.email,
              subject: `Application Update: ${opp.title}`,
              html: applicationStatusTemplate(
                applicantUser.name,
                opp.title,
                req.body.status,
                req.body.notes,
                `${process.env.CLIENT_URL}/dashboard/applications`
              )
            });
          } catch (emailErr) {
            console.error('Status email failed:', emailErr.message);
          }
        }
      }
    }
    res.json({ message: 'Status updated', application: app });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Edit own application
router.put('/:id/my-application', protect, async (req, res) => {
  try {
    const opp = await Opportunity.findById(req.params.id);
    if (!opp) return res.status(404).json({ message: 'Not found' });
    const app = opp.applications.find(a => a.user.toString() === req.user._id.toString());
    if (!app) return res.status(404).json({ message: 'Application not found' });
    if (!['pending', 'reviewing'].includes(app.status)) return res.status(400).json({ message: 'Cannot edit after being shortlisted or accepted' });
    const editable = ['coverLetter','pitch','phone','linkedinUrl','portfolioUrl','availableFrom','teamSize','revenueStage'];
    editable.forEach(field => { if (req.body[field] !== undefined) app[field] = req.body[field]; });
    await opp.save();
    res.json({ message: 'Application updated', application: app });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Withdraw application
router.delete('/:id/apply', protect, async (req, res) => {
  try {
    const opp = await Opportunity.findById(req.params.id);
    if (!opp) return res.status(404).json({ message: 'Not found' });
    const app = opp.applications.find(a => a.user.toString() === req.user._id.toString());
    if (!app) return res.status(404).json({ message: 'Application not found' });
    if (['accepted', 'shortlisted'].includes(app.status)) return res.status(400).json({ message: 'Cannot withdraw — you have been shortlisted or accepted. Contact the corporate.' });
    opp.applications = opp.applications.filter(a => a.user.toString() !== req.user._id.toString());
    await opp.save();
    res.json({ message: 'Application withdrawn' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/my/posted', protect, async (req, res) => {
  try {
    const opps = await Opportunity.find({ postedBy: req.user._id })
      .populate('applications.startup', 'companyName logo industry stage').sort('-createdAt');
    res.json(opps);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/my/applications', protect, async (req, res) => {
  try {
    const opps = await Opportunity.find({ 'applications.user': req.user._id })
      .populate('corporate', 'companyName logo industry _id')
      .populate('postedBy', 'name _id')
      .populate('applications.startup', 'companyName logo industry stage')
      .select('title type applications corporate status postedBy budget timeline slots deadline');
    const applications = opps.map(o => ({
      opportunity: { _id: o._id, title: o.title, type: o.type, corporate: o.corporate, status: o.status, postedBy: o.postedBy, budget: o.budget, timeline: o.timeline, slots: o.slots, deadline: o.deadline },
      application: o.applications.find(a => a.user.toString() === req.user._id.toString())
    })).filter(a => a.application);
    res.json(applications);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/featured/list', async (req, res) => {
  try {
    const opps = await Opportunity.find({ isFeatured: true, status: 'active' }).populate('corporate', 'companyName logo').limit(6);
    res.json(opps);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
