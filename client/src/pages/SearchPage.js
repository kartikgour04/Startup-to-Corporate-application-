import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('all');
  const q = searchParams.get('q') || '';

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    api.get(`/search?q=${encodeURIComponent(q)}&type=${tab}`).then(r => setResults(r.data)).finally(() => setLoading(false));
  }, [q, tab]);

  const total = Object.values(results).reduce((a, v) => a + (Array.isArray(v) ? v.length : 0), 0);

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-black text-slate-900 mb-2">Search Results for "{q}"</h1>
          <p className="text-slate-500">{total} results found</p>
          <div className="flex gap-2 mt-4">
            {['all', 'startups', 'corporates', 'opportunities', 'events'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{t}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {loading ? <div className="text-center py-20"><div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" /></div> : (
          <>
            {results.startups?.length > 0 && (
              <div><h2 className="font-bold text-slate-900 text-lg mb-3">🚀 Startups</h2>
                <div className="grid sm:grid-cols-2 gap-3">{results.startups.map(s => (
                  <Link key={s._id} to={`/startups/${s._id}`} className="card p-4 flex items-center gap-3 hover:border-indigo-300 transition-colors">
                    <img src={s.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.companyName)}&background=6366f1&color=fff`} className="w-10 h-10 rounded-lg" alt="" />
                    <div><p className="font-semibold text-slate-900">{s.companyName}</p><p className="text-slate-500 text-sm">{s.industry} · {s.stage}</p></div>
                  </Link>
                ))}</div>
              </div>
            )}
            {results.corporates?.length > 0 && (
              <div><h2 className="font-bold text-slate-900 text-lg mb-3">🏢 Corporates</h2>
                <div className="grid sm:grid-cols-2 gap-3">{results.corporates.map(c => (
                  <Link key={c._id} to={`/corporates/${c._id}`} className="card p-4 flex items-center gap-3 hover:border-emerald-300 transition-colors">
                    <img src={c.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.companyName)}&background=10b981&color=fff`} className="w-10 h-10 rounded-lg" alt="" />
                    <div><p className="font-semibold text-slate-900">{c.companyName}</p><p className="text-slate-500 text-sm">{c.industry} · {c.size}</p></div>
                  </Link>
                ))}</div>
              </div>
            )}
            {results.opportunities?.length > 0 && (
              <div><h2 className="font-bold text-slate-900 text-lg mb-3">💡 Opportunities</h2>
                <div className="space-y-3">{results.opportunities.map(o => (
                  <Link key={o._id} to={`/opportunities/${o._id}`} className="card p-4 block hover:border-purple-300 transition-colors">
                    <p className="font-semibold text-slate-900">{o.title}</p>
                    <p className="text-slate-500 text-sm capitalize">{o.type}</p>
                  </Link>
                ))}</div>
              </div>
            )}
            {total === 0 && q && (
              <div className="text-center py-20 text-slate-400">
                <p className="text-5xl mb-4">🔍</p>
                <p className="text-xl font-semibold">No results for "{q}"</p>
                <p className="mt-2">Try different keywords or browse by category</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function PricingPage() {
  const plans = [
    { name: 'Free', price: 0, color: 'slate', features: ['3 pitches/month', 'Basic profile', 'Browse opportunities', 'Community access', 'Email support'], cta: 'Get Started Free', popular: false },
    { name: 'Professional', price: 79, color: 'indigo', features: ['Unlimited pitches', 'Advanced analytics', 'Priority profile listing', 'Featured badge', 'Direct messaging', 'Application tracking', 'Priority support'], cta: 'Start Professional', popular: true },
    { name: 'Enterprise', price: 199, color: 'purple', features: ['Everything in Pro', 'Dedicated account manager', 'Custom branding', 'API access', 'Team accounts', 'White-label options', 'SLA guarantee', 'Phone support'], cta: 'Contact Sales', popular: false },
  ];

  const handleUpgrade = async (plan) => {
    if (plan === 'Free') return;
    try {
      const r = await api.post('/payments/create-checkout', { plan: plan.toLowerCase() });
      if (r.data.demoUrl) window.location.href = r.data.demoUrl;
    } catch { toast.error('Error'); }
  };

  const api = require('../utils/api').default;
  const toast = require('react-hot-toast').default;

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-black mb-4">Simple, Transparent Pricing</h1>
        <p className="text-slate-400 text-xl max-w-xl mx-auto">Start free, scale as you grow. No hidden fees.</p>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan.name} className={`card p-6 relative ${plan.popular ? 'ring-2 ring-indigo-600 shadow-xl' : ''}`}>
              {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full">Most Popular</div>}
              <div className={`w-12 h-12 rounded-xl bg-${plan.color}-100 flex items-center justify-center mb-4`}>
                <span className="text-2xl">{plan.name === 'Free' ? '🆓' : plan.name === 'Professional' ? '⭐' : '🚀'}</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-black text-slate-900">${plan.price}</span>
                {plan.price > 0 && <span className="text-slate-500">/month</span>}
              </div>
              <ul className="space-y-2 mb-8">
                {plan.features.map(f => <li key={f} className="flex items-center gap-2 text-sm text-slate-600"><span className="text-emerald-500">✓</span>{f}</li>)}
              </ul>
              <button onClick={() => handleUpgrade(plan.name)} className={`w-full py-3 rounded-xl font-bold transition-colors ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'}`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-black text-slate-900 mb-4">Frequently Asked Questions</h2>
          <div className="max-w-2xl mx-auto space-y-4 text-left">
            {[
              ['Can I switch plans?', 'Yes, you can upgrade or downgrade at any time. Changes take effect immediately.'],
              ['Is there a free trial?', 'The Free plan is available forever with no credit card required.'],
              ['What payment methods do you accept?', 'We accept all major credit cards, PayPal, and bank transfers for Enterprise.'],
              ['Do you offer discounts for startups?', 'Yes! Startups from accelerator programs get 30% off. Contact us to apply.'],
            ].map(([q, a]) => (
              <div key={q} className="card p-5"><p className="font-semibold text-slate-900 mb-2">{q}</p><p className="text-slate-600 text-sm">{a}</p></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AboutPage() {
  return (
    <div className="pt-16 min-h-screen">
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white py-20 px-4 text-center">
        <h1 className="text-5xl font-black mb-6">About Nexus</h1>
        <p className="text-slate-400 text-xl max-w-2xl mx-auto">We're on a mission to democratize access to corporate partnerships and funding for innovative startups worldwide.</p>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-16 space-y-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-4">Our Story</h2>
            <p className="text-slate-600 leading-relaxed mb-4">Nexus was founded in 2024 after our founders experienced firsthand how difficult it was for great startups to get in front of corporate decision-makers — and how hard it was for innovative companies to find the right startup partners.</p>
            <p className="text-slate-600 leading-relaxed">We built Nexus to be the bridge — a platform where ambition meets opportunity, where disruptive ideas find institutional support, and where partnerships that change industries are born.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[['2024', 'Founded'], ['60+', 'Countries'], ['2,400+', 'Startups'], ['$450M+', 'Funding Connected']].map(([val, label]) => (
              <div key={label} className="card p-6 text-center"><p className="text-3xl font-black text-indigo-600 mb-1">{val}</p><p className="text-slate-500 text-sm">{label}</p></div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-900 text-center mb-10">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🤝', title: 'Partnership First', desc: 'Every feature we build serves to create more meaningful connections between innovators and enterprises.' },
              { icon: '🔓', title: 'Open Access', desc: 'We believe every great startup deserves a chance to pitch their idea to the right corporate partner.' },
              { icon: '🌍', title: 'Global by Default', desc: 'Innovation happens everywhere. Our platform works for startups and corporates across every continent.' },
            ].map(v => (
              <div key={v.title} className="card p-6 text-center">
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{v.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchPage;
