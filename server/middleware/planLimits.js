const User = require('../models/User');

const LIMITS = {
  free:         { pitchesPerMonth: 3,  opportunitiesPosted: 2  },
  starter:      { pitchesPerMonth: 20, opportunitiesPosted: 10 },
  professional: { pitchesPerMonth: -1, opportunitiesPosted: -1 },
  enterprise:   { pitchesPerMonth: -1, opportunitiesPosted: -1 },
};

exports.checkPitchLimit = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return next();
    const plan = user.isPremium ? (user.premiumPlan || 'professional') : 'free';
    const limit = LIMITS[plan]?.pitchesPerMonth ?? 3;
    if (limit === -1) return next(); // unlimited

    const { Pitch } = require('../models/pitch');
    const startOfMonth = new Date();
    startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
    const count = await Pitch.countDocuments({
      submittedBy: req.user._id,
      createdAt: { $gte: startOfMonth }
    });

    if (count >= limit) {
      return res.status(403).json({
        message: `You've used all ${limit} pitches for this month on the ${plan} plan. Upgrade at /pricing to send more.`,
        requiresUpgrade: true,
        currentPlan: plan,
        limit,
        used: count
      });
    }
    next();
  } catch (e) {
    console.error('PitchLimit check error:', e.message);
    next(); // fail open — don't block on middleware errors
  }
};

exports.checkOpportunityLimit = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return next();
    const plan = user.isPremium ? (user.premiumPlan || 'professional') : 'free';
    const limit = LIMITS[plan]?.opportunitiesPosted ?? 2;
    if (limit === -1) return next();

    const Opportunity = require('../models/Opportunity');
    const count = await Opportunity.countDocuments({
      postedBy: req.user._id,
      status: { $ne: 'deleted' }
    });

    if (count >= limit) {
      return res.status(403).json({
        message: `You've reached the ${limit} opportunity limit on the ${plan} plan. Upgrade at /pricing to post more.`,
        requiresUpgrade: true,
        currentPlan: plan,
        limit,
        used: count
      });
    }
    next();
  } catch (e) {
    console.error('OpportunityLimit check error:', e.message);
    next();
  }
};
