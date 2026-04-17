import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

function StatCard({ icon, label, value, color = 'indigo' }) {
  const colors = { indigo: 'text-indigo-400', emerald: 'text-emerald-400', amber: 'text-amber-400', red: 'text-red-400', purple: 'text-purple-400' };
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <div className="text-2xl mb-2">{icon}</div>
      <p className={`text-2xl font-black ${colors[color]}`}>{value?.toLocaleString() ?? 0}</p>
      <p className="text-slate-400 text-sm mt-0.5">{label}</p>
    </div>
  );
}

function BanModal({ user, onClose, onBan }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const handleBan = async () => {
    if (!reason.trim()) return toast.error('Please enter a ban reason');
    setLoading(true);
    try {
      await api.put(`/admin/users/${user._id}/ban`, { reason });
      toast.success(`${user.name} has been restricted`);
      onBan(user._id, reason);
      onClose();
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
        <h3 className="font-black text-white text-lg mb-2">Restrict Account</h3>
        <p className="text-slate-400 text-sm mb-4">Restricting <strong className="text-white">{user.name}</strong> ({user.email}). They will see this reason and cannot use any features.</p>
        <textarea rows={3} value={reason} onChange={e => setReason(e.target.value)}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
          placeholder="Reason for restriction (user will see this)... e.g. Spam, Fake profile, Violation of terms" />
        <div className="flex gap-3">
          <button onClick={handleBan} disabled={loading || !reason.trim()} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-bold text-sm disabled:opacity-50">
            {loading ? 'Restricting...' : 'Restrict Account'}
          </button>
          <button onClick={onClose} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg font-bold text-sm">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user: adminUser } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [tab, setTab] = useState('overview');
  const [filters, setFilters] = useState({ search: '', role: '', status: '', premium: '', page: 1 });
  const [banTarget, setBanTarget] = useState(null);

  useEffect(() => {
    api.get('/admin/stats').then(r => { setStats(r.data); setUsers(r.data.recentUsers || []); }).finally(() => setLoading(false));
  }, []);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const params = new URLSearchParams({ limit: 20, ...filters });
      Object.keys(filters).forEach(k => { if (!filters[k]) params.delete(k); });
      const r = await api.get(`/admin/users?${params}`);
      setUsers(r.data.users); setTotal(r.data.total); setPages(r.data.pages);
    } catch (e) { toast.error('Failed to load users'); }
    finally { setUsersLoading(false); }
  }, [filters]);

  useEffect(() => { if (tab === 'users') loadUsers(); }, [tab, filters, loadUsers]);

  const handleBan = (userId, reason) => {
    setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: false, banReason: reason } : u));
  };

  const handleUnban = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/unban`);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: true, banReason: '' } : u));
      toast.success('Account restored');
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Permanently delete ${name} and ALL their data? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      toast.success(`${name} permanently deleted`);
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
  };

  const handleGrantPremium = async (userId, grant) => {
    const plan = grant ? prompt('Plan: starter / professional / enterprise', 'professional') : null;
    if (grant && !plan) return;
    try {
      await api.put(`/admin/users/${userId}/premium`, { grant, plan });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isPremium: !!grant, premiumPlan: grant ? plan : 'free' } : u));
      toast.success(grant ? `Premium granted` : 'Premium revoked');
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
  };

  const handleVerify = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/verify-profile`);
      toast.success('Profile verified with blue tick');
    } catch (e) { toast.error('Error'); }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700/50 px-6 py-4 flex items-center justify-between bg-slate-900/80 backdrop-blur sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center">
            <span className="text-white font-black text-sm">N</span>
          </div>
          <span className="font-black text-xl">Nexus Admin</span>
          <span className="bg-red-500/20 border border-red-500/30 text-red-300 text-xs px-2 py-0.5 rounded-full ml-1">Admin</span>
        </div>
        <Link to="/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors">← Back to App</Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-slate-700 pb-4 overflow-x-auto">
          {['overview', 'users', 'premium'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors ${tab === t ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>{t}</button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === 'overview' && stats && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon="👥" label="Total Users" value={stats.totalUsers} color="indigo" />
              <StatCard icon="🚀" label="Startups" value={stats.startups} color="purple" />
              <StatCard icon="🏢" label="Corporates" value={stats.corporates} color="emerald" />
              <StatCard icon="⭐" label="Premium Users" value={stats.premiumUsers} color="amber" />
              <StatCard icon="💡" label="Opportunities" value={stats.opportunities} color="indigo" />
              <StatCard icon="🤝" label="Connections" value={stats.connections} color="emerald" />
              <StatCard icon="📅" label="Events" value={stats.events} color="purple" />
              <StatCard icon="🆕" label="Joined Today" value={stats.newToday} color="amber" />
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-700 flex justify-between items-center">
                <h2 className="font-bold text-white">Recent Registrations</h2>
                <button onClick={() => setTab('users')} className="text-indigo-400 hover:text-indigo-300 text-sm">View all →</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-700">
                    {['User','Role','Status','Verified','Joined'].map(h => <th key={h} className="text-left py-3 px-4">{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {stats.recentUsers?.map(u => (
                      <tr key={u._id} className="border-b border-slate-700/40 hover:bg-slate-700/20 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-medium text-white">{u.name}</p>
                          <p className="text-slate-500 text-xs">{u.email}</p>
                          {u.city && <p className="text-slate-600 text-xs">📍 {u.city}</p>}
                        </td>
                        <td className="py-3 px-4"><span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${u.role === 'startup' ? 'bg-indigo-900/60 text-indigo-300' : 'bg-emerald-900/60 text-emerald-300'}`}>{u.role}</span></td>
                        <td className="py-3 px-4">
                          {u.isActive ? <span className="text-xs text-emerald-400">● Active</span> : <span className="text-xs text-red-400">● Restricted</span>}
                          {u.isPremium && <span className="ml-2 text-xs text-amber-400">⭐ {u.premiumPlan}</span>}
                        </td>
                        <td className="py-3 px-4">{u.isVerified ? <span className="text-emerald-400 text-sm">✓</span> : <span className="text-slate-600 text-sm">✗</span>}</td>
                        <td className="py-3 px-4 text-slate-400 text-xs">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <input value={filters.search} onChange={e => setFilters(p => ({...p, search: e.target.value, page: 1}))}
                placeholder="Search name or email..."
                className="md:col-span-2 px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <select value={filters.role} onChange={e => setFilters(p => ({...p, role: e.target.value, page: 1}))}
                className="px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">All Roles</option>
                <option value="startup">Startup</option>
                <option value="corporate">Corporate</option>
              </select>
              <select value={filters.status} onChange={e => setFilters(p => ({...p, status: e.target.value, page: 1}))}
                className="px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="banned">Restricted</option>
              </select>
              <select value={filters.premium} onChange={e => setFilters(p => ({...p, premium: e.target.value, page: 1}))}
                className="px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">All Plans</option>
                <option value="true">Premium Only</option>
              </select>
            </div>

            <p className="text-slate-500 text-sm">{total} users found</p>

            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-700 bg-slate-900/50">
                    {['User','Role','Plan','Status','Verified','Joined','Actions'].map(h => <th key={h} className="text-left py-3 px-4">{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {usersLoading ? (
                      <tr><td colSpan={7} className="py-8 text-center text-slate-500">Loading...</td></tr>
                    ) : users.length === 0 ? (
                      <tr><td colSpan={7} className="py-8 text-center text-slate-500">No users found</td></tr>
                    ) : users.map(u => (
                      <tr key={u._id} className={`border-b border-slate-700/30 transition-colors ${!u.isActive ? 'bg-red-950/20' : 'hover:bg-slate-700/20'}`}>
                        <td className="py-3 px-4">
                          <p className="font-medium text-white">{u.name}</p>
                          <p className="text-slate-500 text-xs">{u.email}</p>
                          {u.city && <p className="text-slate-600 text-xs">📍 {u.city}</p>}
                          {!u.isActive && u.banReason && <p className="text-red-400 text-xs mt-0.5">⚠️ {u.banReason}</p>}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${u.role === 'startup' ? 'bg-indigo-900/60 text-indigo-300' : 'bg-emerald-900/60 text-emerald-300'}`}>{u.role}</span>
                        </td>
                        <td className="py-3 px-4">
                          {u.isPremium ? <span className="text-amber-400 text-xs">⭐ {u.premiumPlan}</span> : <span className="text-slate-600 text-xs">Free</span>}
                        </td>
                        <td className="py-3 px-4">
                          {u.isActive ? <span className="text-emerald-400 text-xs">● Active</span> : <span className="text-red-400 text-xs">● Restricted</span>}
                        </td>
                        <td className="py-3 px-4">
                          {u.isVerified ? <span className="text-emerald-400">✓</span> : <span className="text-slate-600">✗</span>}
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-xs whitespace-nowrap">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1">
                            {u.isActive ? (
                              <button onClick={() => setBanTarget(u)} className="text-xs px-2 py-1 rounded bg-red-900/40 text-red-400 hover:bg-red-900/60 transition-colors whitespace-nowrap">🚫 Restrict</button>
                            ) : (
                              <button onClick={() => handleUnban(u._id)} className="text-xs px-2 py-1 rounded bg-emerald-900/40 text-emerald-400 hover:bg-emerald-900/60 transition-colors whitespace-nowrap">✅ Restore</button>
                            )}
                            <button onClick={() => handleVerify(u._id)} className="text-xs px-2 py-1 rounded bg-blue-900/40 text-blue-400 hover:bg-blue-900/60 transition-colors whitespace-nowrap">✓ Verify</button>
                            {u.isPremium ? (
                              <button onClick={() => handleGrantPremium(u._id, false)} className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-400 hover:bg-slate-600 transition-colors whitespace-nowrap">⬇ Revoke</button>
                            ) : (
                              <button onClick={() => handleGrantPremium(u._id, true)} className="text-xs px-2 py-1 rounded bg-amber-900/40 text-amber-400 hover:bg-amber-900/60 transition-colors whitespace-nowrap">⭐ Premium</button>
                            )}
                            <button onClick={() => handleDelete(u._id, u.name)} className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-500 hover:bg-red-900/40 hover:text-red-400 transition-colors whitespace-nowrap">🗑 Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex gap-2 justify-center">
                {[...Array(Math.min(pages, 10))].map((_, i) => (
                  <button key={i} onClick={() => setFilters(p => ({...p, page: i + 1}))}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${filters.page === i + 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{i + 1}</button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PREMIUM USERS */}
        {tab === 'premium' && (
          <div className="space-y-4">
            <h2 className="font-bold text-white text-xl">Premium Subscribers ⭐</h2>
            <PremiumUsers onRevoke={handleGrantPremium} />
          </div>
        )}
      </div>

      {banTarget && <BanModal user={banTarget} onClose={() => setBanTarget(null)} onBan={handleBan} />}
    </div>
  );
}

function PremiumUsers({ onRevoke }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get('/admin/users?premium=true&limit=50').then(r => setUsers(r.data.users)).finally(() => setLoading(false));
  }, []);
  if (loading) return <div className="text-slate-500 text-center py-8">Loading...</div>;
  if (!users.length) return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center text-slate-500">
      <p className="text-4xl mb-3">⭐</p>
      <p>No premium subscribers yet</p>
    </div>
  );
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead><tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-700 bg-slate-900/50">
          {['User','Plan','Role','Premium Since','Actions'].map(h => <th key={h} className="text-left py-3 px-4">{h}</th>)}
        </tr></thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id} className="border-b border-slate-700/30 hover:bg-slate-700/20">
              <td className="py-3 px-4"><p className="font-medium text-white">{u.name}</p><p className="text-slate-500 text-xs">{u.email}</p></td>
              <td className="py-3 px-4"><span className="bg-amber-900/40 text-amber-300 text-xs px-2 py-0.5 rounded-full capitalize">⭐ {u.premiumPlan}</span></td>
              <td className="py-3 px-4"><span className="text-slate-400 text-xs capitalize">{u.role}</span></td>
              <td className="py-3 px-4 text-slate-400 text-xs">{u.premiumExpiry ? new Date(u.premiumExpiry).toLocaleDateString('en-IN') : '—'}</td>
              <td className="py-3 px-4">
                <button onClick={() => onRevoke(u._id, false)} className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-400 hover:bg-red-900/40 hover:text-red-400 transition-colors">Revoke</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
