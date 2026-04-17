import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import useAuthStore from '../../store/authStore';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/dashboard').then(r => setAnalytics(r.data)).catch(() => setAnalytics({})).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>;

  const monthly = analytics?.monthly || [];
  const hasData = monthly.some(m => m.actions > 0 || m.views > 0);
  const isStartup = user?.role === 'startup';

  const numStats = analytics
    ? Object.entries(analytics)
        .filter(([k, v]) => typeof v === 'number' && !['__v'].includes(k))
        .map(([k, v]) => ({ key: k, value: v }))
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-black text-slate-900">Analytics 📈</h1>

      {numStats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {numStats.map(({ key, value }) => (
            <div key={key} className="card p-5">
              <p className="text-2xl font-black text-slate-900">{value.toLocaleString()}</p>
              <p className="text-sm text-slate-500 capitalize mt-1">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</p>
            </div>
          ))}
        </div>
      )}

      <div className="card p-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-slate-900">Profile Completion</h2>
          <Link to={isStartup ? '/dashboard/startup-profile' : '/dashboard/corporate-profile'} className="text-sm text-indigo-600 hover:underline">
            {(analytics?.profileCompletion || 0) < 100 ? 'Improve →' : '✅ Complete'}
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all" style={{ width: `${analytics?.profileCompletion || 0}%` }} />
          </div>
          <span className="font-black text-indigo-600 text-2xl">{analytics?.profileCompletion || 0}%</span>
        </div>
        {(analytics?.profileCompletion || 0) < 100 && (
          <p className="text-sm text-slate-500 mt-2">Complete profiles get 3× more views and 2× more inbound requests.</p>
        )}
      </div>

      {!hasData ? (
        <div className="card p-8 text-center text-slate-400">
          <p className="text-5xl mb-4">📊</p>
          <p className="text-xl font-semibold text-slate-600 mb-2">No activity data yet</p>
          <p className="text-sm mb-6">Charts will appear once you start {isStartup ? 'creating pitches and applying to opportunities' : 'posting opportunities and receiving applications'}.</p>
          <Link to={isStartup ? '/dashboard/pitches/new' : '/dashboard/opportunities/new'} className="btn-primary">
            {isStartup ? 'Create Your First Pitch →' : 'Post First Opportunity →'}
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-5">
            <h3 className="font-bold text-slate-900 mb-4">Profile Views (6 months)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="vG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis hide allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#f1f5f9', fontSize: '12px' }} />
                <Area type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={2} fill="url(#vG)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-5">
            <h3 className="font-bold text-slate-900 mb-4">{isStartup ? 'Pitches Created' : 'Applications Received'} (6 months)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthly}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis hide allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#f1f5f9', fontSize: '12px' }} />
                <Bar dataKey="actions" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="card p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <h3 className="font-bold text-slate-900 mb-3">💡 Tips to grow faster</h3>
        <ul className="space-y-2 text-sm text-slate-600">
          {isStartup ? [
            'Add a pitch deck URL to get 40% more profile views',
            'Fill in your traction section — investors and corporates focus on it most',
            'Apply to at least 3 opportunities per week for best results',
            'Keep your profile description concise but specific',
          ] : [
            'Post opportunities with clear budgets to attract better applications',
            'Respond to applications within 5 days to improve acceptance rate',
            'Feature your best opportunities to appear at the top of listings',
            'Add your innovation focus areas to match with relevant startups',
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-2"><span className="text-indigo-500 mt-0.5">→</span>{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
