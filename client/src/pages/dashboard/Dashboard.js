import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

function StatCard({ icon, label, value, sub, color = 'indigo' }) {
  const colors = { indigo: 'bg-indigo-50 text-indigo-600', emerald: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600', purple: 'bg-purple-50 text-purple-600' };
  return (
    <div className="card p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${colors[color]}`}>{icon}</div>
      <p className="text-2xl font-black text-slate-900">{value ?? 0}</p>
      <p className="text-sm text-slate-500">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function EmptyState({ icon, title, desc, cta, to }) {
  return (
    <div className="text-center py-10 px-4">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="font-semibold text-slate-700 mb-1">{title}</p>
      <p className="text-slate-500 text-sm mb-4">{desc}</p>
      {cta && to && <Link to={to} className="btn-primary text-sm">{cta}</Link>}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const location = useLocation();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Show payment success toast
    const params = new URLSearchParams(location.search);
    if (params.get('payment') === 'success') {
      toast.success(`🎉 Payment successful! Your ${params.get('plan')} plan is now active.`);
      window.history.replaceState({}, '', '/dashboard');
    }
  }, []);

  useEffect(() => {
    api.get('/analytics/dashboard')
      .then(r => setAnalytics(r.data))
      .catch(() => setAnalytics({}))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="card h-28 animate-pulse bg-slate-100" />)}
      </div>
    </div>
  );

  const isStartup = user?.role === 'startup';
  const isCorporate = user?.role === 'corporate';
  const hasActivity = analytics && (isStartup ? analytics.totalPitches > 0 || analytics.totalApplications > 0 : analytics.totalOpportunities > 0);
  const monthly = analytics?.monthly || [];
  const hasMonthlyData = monthly.some(m => m.actions > 0 || m.views > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {hasActivity ? 'Here\'s your activity overview' : 'Your dashboard is ready — let\'s get started!'}
          </p>
        </div>
        <div className="flex gap-2">
          {isStartup && <Link to="/dashboard/pitches/new" className="btn-primary text-sm">✨ New Pitch</Link>}
          {isCorporate && <Link to="/dashboard/opportunities/new" className="btn-primary text-sm">✨ Post Opportunity</Link>}
        </div>
      </div>

      {/* Profile Completion */}
      {(analytics?.profileCompletion || 0) < 80 && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="font-semibold text-slate-900 text-sm">
                {(analytics?.profileCompletion || 0) === 0 ? '🚀 Set up your profile to get discovered' : '📈 Complete your profile to get 3x more visibility'}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${analytics?.profileCompletion || 0}%` }} />
                </div>
                <span className="text-sm font-semibold text-indigo-600 whitespace-nowrap">{analytics?.profileCompletion || 0}%</span>
              </div>
            </div>
            <Link to={isStartup ? '/dashboard/startup-profile' : '/dashboard/corporate-profile'} className="btn-primary text-sm whitespace-nowrap">
              {(analytics?.profileCompletion || 0) === 0 ? 'Set Up Profile' : 'Complete Profile'}
            </Link>
          </div>
        </div>
      )}

      {/* Getting Started (for brand new users) */}
      {!hasActivity && (
        <div className="card p-6">
          <h2 className="font-bold text-slate-900 mb-4">🎯 Getting Started</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {isStartup && [
              { step: '1', icon: '🚀', title: 'Build your profile', desc: 'Add traction, team & your story', to: '/dashboard/startup-profile', cta: 'Set Up Profile' },
              { step: '2', icon: '💡', title: 'Browse opportunities', desc: 'Find pilots, accelerators & investments', to: '/opportunities', cta: 'Browse Opportunities' },
              { step: '3', icon: '🎯', title: 'Send your first pitch', desc: 'Pitch directly to corporate partners', to: '/dashboard/pitches/new', cta: 'Create Pitch' },
            ].map(s => (
              <div key={s.step} className="bg-slate-50 rounded-xl p-4 relative">
                <span className="absolute top-3 right-3 w-6 h-6 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center font-bold">{s.step}</span>
                <div className="text-3xl mb-2">{s.icon}</div>
                <p className="font-semibold text-slate-900 mb-1">{s.title}</p>
                <p className="text-slate-500 text-xs mb-3">{s.desc}</p>
                <Link to={s.to} className="text-indigo-600 text-xs font-semibold hover:underline">{s.cta} →</Link>
              </div>
            ))}
            {isCorporate && [
              { step: '1', icon: '🏢', title: 'Set up company profile', desc: 'Tell startups who you are', to: '/dashboard/corporate-profile', cta: 'Complete Profile' },
              { step: '2', icon: '💡', title: 'Post an opportunity', desc: 'Pilots, partnerships, accelerators', to: '/dashboard/opportunities/new', cta: 'Post Opportunity' },
              { step: '3', icon: '🚀', title: 'Browse startups', desc: 'Find your next innovation partner', to: '/startups', cta: 'Browse Startups' },
            ].map(s => (
              <div key={s.step} className="bg-slate-50 rounded-xl p-4 relative">
                <span className="absolute top-3 right-3 w-6 h-6 bg-emerald-600 text-white text-xs rounded-full flex items-center justify-center font-bold">{s.step}</span>
                <div className="text-3xl mb-2">{s.icon}</div>
                <p className="font-semibold text-slate-900 mb-1">{s.title}</p>
                <p className="text-slate-500 text-xs mb-3">{s.desc}</p>
                <Link to={s.to} className="text-emerald-600 text-xs font-semibold hover:underline">{s.cta} →</Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid (only show when there's real data) */}
      {hasActivity && (
        <>
          {isStartup && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon="👁" label="Profile Views" value={analytics.profileViews} color="indigo" />
              <StatCard icon="🎯" label="Pitches Sent" value={analytics.totalPitches} sub={`${analytics.pitchesAccepted || 0} accepted`} color="purple" />
              <StatCard icon="📋" label="Applications" value={analytics.totalApplications} sub={`${analytics.applicationsAccepted || 0} accepted`} color="emerald" />
              <StatCard icon="🤝" label="Connections" value={analytics.connections} color="amber" />
            </div>
          )}
          {isCorporate && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon="👁" label="Profile Views" value={analytics.profileViews} color="indigo" />
              <StatCard icon="💡" label="Opportunities" value={analytics.totalOpportunities} sub={`${analytics.activeOpportunities || 0} active`} color="purple" />
              <StatCard icon="📋" label="Applications" value={analytics.totalApplications} sub={`${analytics.acceptedApplications || 0} accepted`} color="emerald" />
              <StatCard icon="🤝" label="Connections" value={analytics.connections} color="amber" />
            </div>
          )}

          {/* Charts — only when real data exists */}
          {hasMonthlyData && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card p-5">
                <h3 className="font-bold text-slate-900 mb-4">Profile Views (6 months)</h3>
                {monthly.some(m => m.views > 0) ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={monthly}>
                      <defs>
                        <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#f1f5f9', fontSize: '12px' }} />
                      <Area type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={2} fill="url(#vGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState icon="👁" title="No view data yet" desc="Views will appear here as people visit your profile" />
                )}
              </div>
              <div className="card p-5">
                <h3 className="font-bold text-slate-900 mb-4">{isStartup ? 'Pitches' : 'Applications'} per Month</h3>
                {monthly.some(m => m.actions > 0) ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={monthly}>
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis hide allowDecimals={false} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#f1f5f9', fontSize: '12px' }} />
                      <Bar dataKey="actions" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState icon="📊" title="No activity yet" desc={isStartup ? 'Create pitches to see activity here' : 'Post opportunities to track applications'} />
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Quick Actions */}
      <div className="card p-5">
        <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(isStartup ? [
            { icon: '🎯', label: 'Create Pitch', to: '/dashboard/pitches/new', color: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700' },
            { icon: '💡', label: 'Browse Opportunities', to: '/opportunities', color: 'bg-purple-50 hover:bg-purple-100 text-purple-700' },
            { icon: '💰', label: 'Funding Rounds', to: '/funding', color: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700' },
            { icon: '🤝', label: 'Connections', to: '/dashboard/connections', color: 'bg-amber-50 hover:bg-amber-100 text-amber-700' },
          ] : [
            { icon: '💡', label: 'Post Opportunity', to: '/dashboard/opportunities/new', color: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700' },
            { icon: '🚀', label: 'Browse Startups', to: '/startups', color: 'bg-purple-50 hover:bg-purple-100 text-purple-700' },
            { icon: '📋', label: 'My Opportunities', to: '/dashboard/opportunities', color: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700' },
            { icon: '🤝', label: 'Connections', to: '/dashboard/connections', color: 'bg-amber-50 hover:bg-amber-100 text-amber-700' },
          ]).map(a => (
            <Link key={a.label} to={a.to} className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors ${a.color}`}>
              <span className="text-2xl">{a.icon}</span>
              <span className="text-sm font-medium text-center">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {hasActivity && isStartup && analytics.recentPitches?.length > 0 && (
        <div className="card p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-900">Recent Pitches</h3>
            <Link to="/dashboard/pitches" className="text-sm text-indigo-600 hover:underline">View all →</Link>
          </div>
          <div className="space-y-2">
            {analytics.recentPitches.map(p => (
              <div key={p._id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div>
                  <p className="font-medium text-slate-900 text-sm">{p.title}</p>
                  <p className="text-slate-400 text-xs">{new Date(p.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`badge capitalize text-xs ${
                  p.status === 'accepted' ? 'badge-green' : p.status === 'rejected' ? 'badge-red' :
                  p.status === 'shortlisted' ? 'badge-yellow' : 'badge-blue'}`}>{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasActivity && isCorporate && analytics.recentOpportunities?.length > 0 && (
        <div className="card p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-900">Recent Opportunities</h3>
            <Link to="/dashboard/opportunities" className="text-sm text-indigo-600 hover:underline">View all →</Link>
          </div>
          <div className="space-y-2">
            {analytics.recentOpportunities.map(o => (
              <div key={o._id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div>
                  <p className="font-medium text-slate-900 text-sm">{o.title}</p>
                  <p className="text-slate-400 text-xs">{o.applications?.length || 0} applications</p>
                </div>
                <span className={`badge capitalize text-xs ${o.status === 'active' ? 'badge-green' : 'badge-yellow'}`}>{o.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Premium upsell if free */}
      {!user?.isPremium && hasActivity && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl p-5 text-white flex items-center justify-between gap-4">
          <div>
            <p className="font-bold text-lg">Upgrade to unlock more</p>
            <p className="text-indigo-200 text-sm mt-1">Unlimited pitches, featured listing, priority support & more</p>
          </div>
          <Link to="/pricing" className="bg-white text-indigo-600 font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors whitespace-nowrap text-sm">
            View Plans →
          </Link>
        </div>
      )}
    </div>
  );
}
