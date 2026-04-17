require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Startup = require('../models/Startup');
const Corporate = require('../models/Corporate');
const Opportunity = require('../models/Opportunity');
const { Event } = require('../models/index');
const { FundingRound } = require('../models/pitch');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nexus');
  console.log('Connected to DB');

  // Only delete demo accounts — never wipe real user data
  const demoEmails = ['admin@nexus.com','arjun@aifusion.in','neha@greenloop.co','david@payswift.io','fatima@medai.health','anjali@techcorp.in','vikram@innovateinc.in','priya@globalventures.com'];
  const existingDemo = await User.find({ email: { $in: demoEmails } });
  const demoIds = existingDemo.map(u => u._id);

  // Remove only demo data
  await User.deleteMany({ email: { $in: demoEmails } });
  if (demoIds.length) {
    await Startup.deleteMany({ user: { $in: demoIds } });
    await Corporate.deleteMany({ user: { $in: demoIds } });
    await Opportunity.deleteMany({ postedBy: { $in: demoIds } });
    await Event.deleteMany({ organizer: { $in: demoIds } });
    await FundingRound.deleteMany({ postedBy: { $in: demoIds } });
  }
  console.log('Cleared demo data (real user data preserved)');

  // Admin
  await User.create({ name: 'Admin', email: 'admin@nexus.com', password: 'Admin@123', role: 'admin', isVerified: true });

  // Corporate users & profiles
  const corpUsers = await User.insertMany([
    { name: 'Anjali Sharma', email: 'anjali@techcorp.in', password: 'Test@123', role: 'corporate', isVerified: true, isPremium: true, premiumPlan: 'professional' },
    { name: 'Vikram Mehta', email: 'vikram@innovateinc.in', password: 'Test@123', role: 'corporate', isVerified: true, isPremium: true, premiumPlan: 'professional' },
    { name: 'Priya Sharma', email: 'priya@globalventures.com', password: 'Test@123', role: 'corporate', isVerified: true },
  ]);

  await Corporate.insertMany([
    {
      user: corpUsers[0]._id, companyName: 'TechCorp Global',
      tagline: 'Innovating the future of enterprise technology',
      description: 'TechCorp is a Fortune 500 technology company seeking innovative startup partners for pilots, co-development, and investment.',
      logo: 'https://ui-avatars.com/api/?name=TechCorp&background=6366f1&color=fff&size=128',
      industry: 'Technology', size: '5000+', founded: 1998, revenue: '1B+',
      location: { city: 'Bangalore', state: 'Karnataka', country: 'India' },
      website: 'https://techcorp.example.com',
      innovationFocus: ['AI/ML', 'Cloud Computing', 'Cybersecurity', 'IoT'],
      partnershipTypes: ['pilot', 'investment', 'acquisition'],
      investmentBudget: { min: 500000, max: 5000000, currency: 'USD' },
      isVerified: true, isFeatured: true, profileCompletion: 95,
    },
    {
      user: corpUsers[1]._id, companyName: 'Innovate Inc',
      tagline: 'Empowering startups to scale globally',
      description: 'A leading corporate accelerator bridging startups and enterprise markets across fintech, blockchain, and regtech.',
      logo: 'https://ui-avatars.com/api/?name=Innovate&background=10b981&color=fff&size=128',
      industry: 'Finance', size: '1001-5000', founded: 2005,
      location: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
      innovationFocus: ['Fintech', 'Blockchain', 'RegTech'],
      partnershipTypes: ['pilot', 'partnership'],
      isVerified: true, isFeatured: true, profileCompletion: 90,
    },
    {
      user: corpUsers[2]._id, companyName: 'Global Ventures',
      tagline: 'Your global health innovation partner',
      description: 'Global Ventures connects cutting-edge HealthTech startups with NHS, hospital groups, and pharma companies.',
      logo: 'https://ui-avatars.com/api/?name=Global&background=f59e0b&color=fff&size=128',
      industry: 'Healthcare', size: '501-1000', founded: 2010,
      location: { city: 'Delhi', state: 'Delhi', country: 'India' },
      innovationFocus: ['HealthTech', 'MedTech', 'Biotech'],
      partnershipTypes: ['pilot', 'accelerator'],
      isVerified: true, profileCompletion: 80,
    },
  ]);

  // Startup users & profiles
  const startupUsers = await User.insertMany([
    { name: 'Arjun Kapoor', email: 'arjun@aifusion.in', password: 'Test@123', role: 'startup', isVerified: true, isPremium: true, premiumPlan: 'professional' },
    { name: 'Neha Patel', email: 'neha@greenloop.co', password: 'Test@123', role: 'startup', isVerified: true },
    { name: 'David Kim', email: 'david@payswift.io', password: 'Test@123', role: 'startup', isVerified: true },
    { name: 'Fatima Al-Hassan', email: 'fatima@medai.health', password: 'Test@123', role: 'startup', isVerified: true },
  ]);

  await Startup.insertMany([
    {
      user: startupUsers[0]._id, companyName: 'AI Fusion',
      tagline: 'AI-powered enterprise intelligence platform',
      description: 'AI Fusion builds enterprise-grade AI tools that transform how Fortune 500 companies process and act on data.',
      logo: 'https://ui-avatars.com/api/?name=AI+Fusion&background=8b5cf6&color=fff&size=128',
      industry: 'Technology', stage: 'growth', foundedYear: 2021, teamSize: '11-25',
      location: { city: 'Hyderabad', state: 'Telangana', country: 'India' },
      website: 'https://aifusion.example.io',
      problemStatement: 'Enterprise data is siloed, making AI adoption slow and expensive.',
      solution: 'Unified AI orchestration layer that integrates with existing systems in days.',
      targetMarket: 'Fortune 1000 companies',
      businessModel: 'SaaS — $50K–$500K ARR per enterprise client',
      traction: { revenue: '$2.4M ARR', users: '47 enterprise clients', growth: '280% YoY', milestones: ['Series A closed', 'SOC2 certified', 'AWS partnership'] },
      funding: { raised: 8500000, seeking: 20000000, currency: 'USD', stage: 'Series A' },
      technologies: ['Python', 'TensorFlow', 'Kubernetes', 'React'],
      tags: ['AI', 'Enterprise', 'SaaS'],
      isVerified: true, isFeatured: true, profileCompletion: 95, views: 240,
    },
    {
      user: startupUsers[1]._id, companyName: 'GreenLoop',
      tagline: 'Circular economy software for manufacturers',
      description: 'GreenLoop helps manufacturers achieve zero waste via AI-driven analytics and circular economy partnerships.',
      logo: 'https://ui-avatars.com/api/?name=GreenLoop&background=059669&color=fff&size=128',
      industry: 'CleanTech', stage: 'early-stage', foundedYear: 2022, teamSize: '6-10',
      location: { city: 'Pune', state: 'Maharashtra', country: 'India' },
      traction: { revenue: '$320K ARR', users: '12 manufacturing clients', growth: '180% YoY', milestones: ['€500K grant', 'EU Innovation Award'] },
      funding: { raised: 1200000, seeking: 5000000, currency: 'EUR', stage: 'Seed' },
      technologies: ['React', 'Node.js', 'MongoDB'],
      tags: ['CleanTech', 'Sustainability', 'B2B'],
      isVerified: true, isFeatured: true, profileCompletion: 85, views: 87,
    },
    {
      user: startupUsers[2]._id, companyName: 'PaySwift',
      tagline: 'Cross-border payments in seconds',
      description: 'PaySwift uses blockchain rails for instant, low-cost cross-border payments for SMEs and enterprises.',
      logo: 'https://ui-avatars.com/api/?name=PaySwift&background=0ea5e9&color=fff&size=128',
      industry: 'Fintech', stage: 'scaling', foundedYear: 2020, teamSize: '26-50',
      location: { city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      traction: { revenue: '$8.2M ARR', users: '2,300 businesses', growth: '340% YoY', milestones: ['MAS licensed', '$15M Series B'] },
      funding: { raised: 22000000, seeking: 50000000, currency: 'USD', stage: 'Series B' },
      technologies: ['Blockchain', 'Solidity', 'React', 'Go'],
      tags: ['Fintech', 'Blockchain', 'Payments'],
      isVerified: true, isFeatured: false, profileCompletion: 92, views: 210,
    },
    {
      user: startupUsers[3]._id, companyName: 'MedAI Health',
      tagline: 'AI diagnostics that save lives',
      description: 'MedAI uses computer vision to assist radiologists in early detection of cancer and cardiac diseases.',
      logo: 'https://ui-avatars.com/api/?name=MedAI&background=ef4444&color=fff&size=128',
      industry: 'HealthTech', stage: 'growth', foundedYear: 2021, teamSize: '11-25',
      location: { city: 'Kolkata', state: 'West Bengal', country: 'India' },
      traction: { revenue: '$1.8M ARR', users: '28 hospitals', growth: '210% YoY', milestones: ['FDA clearance', 'Johns Hopkins partnership'] },
      funding: { raised: 12000000, seeking: 30000000, currency: 'USD', stage: 'Series A' },
      technologies: ['Python', 'TensorFlow', 'DICOM'],
      tags: ['HealthTech', 'AI', 'Diagnostics'],
      isVerified: true, isFeatured: true, profileCompletion: 88, views: 158,
    },
  ]);

  const corps = await Corporate.find({ user: { $in: corpUsers.map(u => u._id) } });

  await Opportunity.insertMany([
    {
      postedBy: corpUsers[0]._id, corporate: corps[0]._id,
      title: 'AI/ML Pilot Program — Enterprise Automation',
      description: 'TechCorp is seeking innovative AI startups for a 6-month pilot to automate internal enterprise processes. Selected startup gets $250K budget + access to our enterprise dataset.',
      type: 'pilot', industry: ['Technology', 'AI/ML'], requiredStage: ['growth', 'scaling'],
      budget: { min: 200000, max: 500000, currency: 'USD', isNegotiable: true },
      timeline: { duration: '6 months' }, location: { remote: true },
      requirements: ['Working MVP with enterprise clients', 'Team of 5+', 'SOC2 awareness'],
      benefits: ['$250K pilot budget', 'Enterprise dataset access', 'Potential Series A co-investment'],
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), slots: 3,
      status: 'active', isFeatured: true, views: 89,
    },
    {
      postedBy: corpUsers[1]._id, corporate: corps[1]._id,
      title: 'FinTech Innovation Partnership',
      description: 'Innovate Inc is looking for fintech startups to co-develop next-gen payment and lending solutions for our 2M+ SME customer base.',
      type: 'partnership', industry: ['Fintech', 'Finance'], requiredStage: ['early-stage', 'growth'],
      budget: { min: 100000, max: 300000, currency: 'USD', isNegotiable: true },
      timeline: { duration: '12 months' }, location: { remote: true },
      requirements: ['Fintech focus', 'API-first architecture', 'Regulatory awareness'],
      benefits: ['Co-development budget', 'Revenue sharing', 'Access to 2M+ SME network'],
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), slots: 2,
      status: 'active', isFeatured: true, views: 65,
    },
    {
      postedBy: corpUsers[2]._id, corporate: corps[2]._id,
      title: 'HealthTech Accelerator 2025 Cohort',
      description: 'Global Ventures 12-week accelerator for early-stage HealthTech startups. £75K equity-free grant + NHS pilot access.',
      type: 'accelerator', industry: ['HealthTech', 'Healthcare'], requiredStage: ['mvp', 'early-stage'],
      budget: { min: 75000, max: 75000, currency: 'GBP', isNegotiable: false },
      timeline: { duration: '12 weeks' }, location: { city: 'Delhi', state: 'Delhi', country: 'India', remote: false },
      requirements: ['Working prototype', 'Clinical evidence or partnerships'],
      benefits: ['£75K equity-free grant', 'NHS pilot access', 'Demo Day with 50+ investors'],
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), slots: 10,
      status: 'active', views: 120,
    },
  ]);

  await Event.insertMany([
    {
      organizer: corpUsers[0]._id,
      title: 'Nexus Innovation Summit', type: 'summit',
      description: 'The premier event connecting startups with Fortune 500 corporations. Pitches, workshops, and networking.',
      date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      isOnline: false, location: 'HICC, Hyderabad',
      capacity: 200, price: 99, currency: 'USD',
      tags: ['summit', 'networking', 'pitching'],
      status: 'upcoming', isFeatured: true, views: 240,
    },
    {
      organizer: corpUsers[1]._id,
      title: 'FinTech Demo Day', type: 'demo-day',
      description: 'Watch fintech startups pitch live to leading investors and corporate partners.',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isOnline: true, meetingLink: 'https://zoom.us/demo',
      capacity: 200, price: 0,
      tags: ['fintech', 'demo-day'],
      status: 'upcoming', views: 89,
    },
    {
      organizer: corpUsers[2]._id,
      title: 'HealthTech Innovation Webinar', type: 'webinar',
      description: 'Expert panel on AI diagnostics, regulatory landscape, and NHS partnerships.',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      isOnline: true, meetingLink: 'https://zoom.us/healthtech',
      capacity: 300, price: 0,
      tags: ['healthtech', 'webinar'],
      status: 'upcoming', views: 56,
    },
  ]);

  const startups = await Startup.find({ user: { $in: startupUsers.map(u => u._id) } });

  await FundingRound.insertMany([
    {
      startup: startups[0]._id, postedBy: startupUsers[0]._id,
      title: 'AI Fusion Series A',
      roundType: 'series-a', targetAmount: 20000000, raisedAmount: 8500000,
      currency: 'USD', minInvestment: 250000, equity: 18, valuation: 111000000,
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      useOfFunds: '50% Product, 30% Sales & Marketing, 20% Operations',
      highlights: ['$2.4M ARR', '280% YoY growth', '47 enterprise clients'],
      status: 'open', isPublic: true, isFeatured: true, views: 43,
    },
    {
      startup: startups[3]._id, postedBy: startupUsers[3]._id,
      title: 'MedAI Health Series A',
      roundType: 'series-a', targetAmount: 30000000, raisedAmount: 12000000,
      currency: 'USD', minInvestment: 500000, equity: 20, valuation: 150000000,
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      useOfFunds: '60% R&D, 25% Hospital partnerships, 15% Team',
      highlights: ['FDA cleared', 'Johns Hopkins partner', '28 hospitals', '210% growth'],
      status: 'open', isPublic: true, isFeatured: true, views: 28,
    },
  ]);

  console.log('\n✅ Demo data seeded successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Demo accounts:');
  console.log('  Admin:     admin@nexus.com     / Admin@123');
  console.log('  Startup:   arjun@aifusion.in    / Test@123');
  console.log('  Startup:   neha@greenloop.co   / Test@123');
  console.log('  Corporate: anjali@techcorp.in  / Test@123');
  console.log('  Corporate: vikram@innovateinc.in / Test@123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('NOTE: Real user accounts were NOT deleted.');
  process.exit(0);
};

seed().catch(e => { console.error('Seed error:', e); process.exit(1); });
