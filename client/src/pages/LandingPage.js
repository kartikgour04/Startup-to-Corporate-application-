import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const features = [
  { icon: '🎯', title: 'Smart Matching', desc: 'AI-powered matching connects startups with the right corporate partners based on industry, stage, and goals.' },
  { icon: '💬', title: 'Real-Time Messaging', desc: 'Built-in messaging system with file sharing for seamless communication between parties.' },
  { icon: '📊', title: 'Analytics Dashboard', desc: 'Track profile views, pitch performance, application status, and partnership metrics.' },
  { icon: '🔒', title: 'Role-Based Access', desc: 'Separate, tailored experiences for startups, corporates, and investors with relevant features for each.' },
  { icon: '💡', title: 'Opportunity Board', desc: 'Corporates post pilots, partnerships, and accelerator programs. Startups apply with one click.' },
  { icon: '🌐', title: 'Global Network', desc: 'Connect with innovators and decision-makers across 60+ countries on one platform.' },
];


const industries = ['Technology', 'FinTech', 'HealthTech', 'CleanTech', 'EdTech', 'AgriTech', 'Retail', 'Logistics'];

export default function LandingPage() {
  const [platformStats, setPlatformStats] = useState(null);

  useEffect(() => {
    api.get('/analytics/platform').then(r => setPlatformStats(r.data)).catch(() => {});
  }, []);

  const displayStats = [
    { label: 'Startups', value: platformStats ? `${platformStats.startups}+` : '...', icon: '🚀' },
    { label: 'Corporates', value: platformStats ? `${platformStats.corporates}+` : '...', icon: '🏢' },
    { label: 'Connections', value: platformStats ? `${platformStats.connections}+` : '...', icon: '🤝' },
    { label: 'Active Opportunities', value: platformStats ? `${platformStats.opportunities}+` : '...', icon: '💡' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center overflow-hidden pt-16">
        {/* Background orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-600/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-indigo-300 text-sm font-medium">The platform connecting startups with corporates</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
            Where Startups Meet<br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">Corporates</span>
          </h1>

          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            The premier platform for startup-corporate collaboration. Discover partnerships, secure funding, and build the future — together.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/register?role=startup" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-indigo-600/30">
              🚀 I'm a Startup
            </Link>
            <Link to="/register?role=corporate" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors backdrop-blur">
              🏢 I'm a Corporate
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {displayStats.map(s => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="text-slate-400 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom curve */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L1440 80L1440 40C1200 80 720 0 0 40L0 80Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      {/* Featured Startups Strip - only show if seeded data exists */}
      <section className="py-10 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm font-medium mb-6 uppercase tracking-wider">Built for innovators across every industry</p>
          <div className="flex flex-wrap justify-center gap-3 opacity-70">
            {['Technology','FinTech','HealthTech','CleanTech','EdTech','AgriTech','Cybersecurity','Logistics','AI/ML','Retail'].map(name => (
              <span key={name} className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-600 font-medium text-sm shadow-sm">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Everything you need to <span className="gradient-text">grow together</span></h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">A complete ecosystem for startup-corporate collaboration, from discovery to partnership.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.title} className="card p-6 hover:border-indigo-200 hover:-translate-y-1 transition-all duration-200">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-900 to-indigo-950 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black mb-4">How Nexus Works</h2>
            <p className="text-slate-400 text-xl max-w-xl mx-auto">From registration to partnership in 4 simple steps</p>
          </div>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-2xl font-bold text-indigo-400 mb-8">For Startups 🚀</h3>
              {[
                { step: '01', title: 'Create your startup profile', desc: 'Add your pitch deck, traction metrics, team, and what you\'re looking for.' },
                { step: '02', title: 'Browse opportunities', desc: 'Filter pilot programs, accelerators, and investment opportunities by industry and stage.' },
                { step: '03', title: 'Submit pitches', desc: 'Apply directly or craft a targeted pitch with our structured pitch builder.' },
                { step: '04', title: 'Close partnerships', desc: 'Manage applications, schedule meetings, and track progress from your dashboard.' },
              ].map(item => (
                <div key={item.step} className="flex gap-4 mb-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black text-sm">{item.step}</div>
                  <div>
                    <h4 className="font-bold text-white mb-1">{item.title}</h4>
                    <p className="text-slate-400 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-emerald-400 mb-8">For Corporates 🏢</h3>
              {[
                { step: '01', title: 'Set up your company profile', desc: 'Define your innovation focus, partnership types, and budget ranges.' },
                { step: '02', title: 'Post opportunities', desc: 'Create pilot programs, accelerator cohorts, or vendor RFPs in minutes.' },
                { step: '03', title: 'Review applications', desc: 'Manage a structured pipeline of startup applications with built-in evaluation tools.' },
                { step: '04', title: 'Build partnerships', desc: 'Connect, negotiate, and track active partnerships with your innovation partners.' },
              ].map(item => (
                <div key={item.step} className="flex gap-4 mb-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-sm">{item.step}</div>
                  <div>
                    <h4 className="font-bold text-white mb-1">{item.title}</h4>
                    <p className="text-slate-400 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-black text-slate-900 mb-4">Industries We Serve</h2>
          <p className="text-slate-500 mb-10">From deep tech to consumer, Nexus covers the full innovation spectrum</p>
          <div className="flex flex-wrap justify-center gap-3">
            {industries.map(ind => (
              <Link key={ind} to={`/startups?industry=${ind}`} className="bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 px-5 py-2.5 rounded-full font-medium transition-all text-sm shadow-sm">
                {ind}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Why Nexus Works</h2>
            <p className="text-xl text-slate-500">Designed for real partnerships, not just connections</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { avatar: '🏢', role: 'Head of Innovation', company: 'Fortune 500 Tech Company', text: 'We needed a structured way to evaluate startup partnerships at scale. Nexus\'s application pipeline and startup profiles gave us everything we needed to make fast, informed decisions.', highlight: 'Structured evaluation process' },
              { avatar: '🚀', role: 'Startup Founder', company: 'Series A SaaS Company', text: 'Before Nexus, getting in front of enterprise decision-makers took months of cold outreach. Here we pitched directly to 3 corporates in our first week and got a pilot response within days.', highlight: 'Direct access to decision-makers' },
              { avatar: '💡', role: 'Innovation Manager', company: 'Global Manufacturing Corp', text: 'The quality of applicants on Nexus is genuinely different — they\'re pre-vetted, have complete profiles, and their traction data is right there. It\'s cut our sourcing time by more than half.', highlight: 'Higher quality applicants' },
            ].map((t, i) => (
              <div key={i} className="card p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <span key={j} className="text-amber-400">★</span>)}
                </div>
                <p className="text-slate-700 mb-4 text-sm leading-relaxed italic">"{t.text}"</p>
                <div className="bg-indigo-50 rounded-lg px-3 py-1.5 text-xs text-indigo-700 font-medium mb-4 inline-block">{t.highlight}</div>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg">{t.avatar}</div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{t.role}</p>
                    <p className="text-slate-500 text-xs">{t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-indigo-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-4">Ready to build the future?</h2>
          <p className="text-indigo-200 text-xl mb-10">Be among the first to build meaningful partnerships on Nexus</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-colors shadow-lg">
              Start for Free — No Credit Card Required
            </Link>
            <Link to="/about" className="border border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-colors">
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
