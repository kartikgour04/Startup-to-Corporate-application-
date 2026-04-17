import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export function StartupDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [startup, setStartup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    api.get(`/startups/${id}`).then(r => { setStartup(r.data); }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleLike = async () => {
    if (!user) return toast.error('Please login first');
    const r = await api.post(`/startups/${id}/like`);
    setLiked(r.data.liked);
    setStartup(prev => ({ ...prev, likes: { length: r.data.count } }));
  };

  const handleConnect = async () => {
    if (!user) return toast.error('Please login first');
    try {
      await api.post(`/connections/request/${startup.user._id}`, { type: 'partnership' });
      toast.success('Connection request sent!');
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
  };

  const handleMessage = async () => {
    if (!user) return toast.error('Please login first');
    try {
      const r = await api.post('/messages/conversations', { userId: startup.user._id });
      window.location.href = `/dashboard/messages?conv=${r.data._id}`;
    } catch { toast.error('Error starting conversation'); }
  };

  if (loading) return <div className="pt-16 flex items-center justify-center min-h-screen"><div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>;
  if (!startup) return <div className="pt-16 text-center py-20 text-slate-500">Startup not found</div>;

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <img src={startup.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(startup.companyName)}&background=6366f1&color=fff&size=128`}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-white/20" alt={startup.companyName} />
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-3xl font-black">{startup.companyName}</h1>
                {startup.isVerified && <span className="bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs px-2 py-1 rounded-full">✓ Verified</span>}
                {startup.isFeatured && <span className="bg-amber-500/30 border border-amber-400/30 text-amber-200 text-xs px-2 py-1 rounded-full">⭐ Featured</span>}
              </div>
              {startup.tagline && <p className="text-slate-300 text-lg mb-3">{startup.tagline}</p>}
              <div className="flex flex-wrap gap-3 text-sm text-slate-400">
                <span>🏭 {startup.industry}</span>
                <span>📊 {startup.stage}</span>
                {startup.location?.country && <span>📍 {startup.location.city}, {startup.location.country}</span>}
                {startup.foundedYear && <span>📅 Founded {startup.foundedYear}</span>}
                {startup.teamSize && <span>👥 {startup.teamSize} people</span>}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {user && user._id !== startup.user?._id && user._id !== startup.user && (
                <>
                  <button onClick={handleConnect} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors">🤝 Connect</button>
                  <button onClick={handleMessage} className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors border border-white/20">💬 Message</button>
                </>
              )}
              <button onClick={handleLike} className={`px-6 py-2.5 rounded-xl font-semibold transition-colors border ${liked ? 'bg-red-500 border-red-500 text-white' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}>
                ❤️ {startup.likes?.length || 0}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {startup.description && (
            <div className="card p-6">
              <h2 className="font-bold text-slate-900 text-lg mb-3">About</h2>
              <p className="text-slate-600 leading-relaxed">{startup.description}</p>
            </div>
          )}
          {startup.problemStatement && (
            <div className="card p-6">
              <h2 className="font-bold text-slate-900 text-lg mb-4">The Story</h2>
              <div className="space-y-4">
                <div><h3 className="font-semibold text-slate-800 mb-2">🎯 Problem</h3><p className="text-slate-600 text-sm leading-relaxed">{startup.problemStatement}</p></div>
                {startup.solution && <div><h3 className="font-semibold text-slate-800 mb-2">💡 Solution</h3><p className="text-slate-600 text-sm leading-relaxed">{startup.solution}</p></div>}
                {startup.targetMarket && <div><h3 className="font-semibold text-slate-800 mb-2">🎯 Target Market</h3><p className="text-slate-600 text-sm">{startup.targetMarket}</p></div>}
                {startup.businessModel && <div><h3 className="font-semibold text-slate-800 mb-2">💼 Business Model</h3><p className="text-slate-600 text-sm">{startup.businessModel}</p></div>}
              </div>
            </div>
          )}
          {startup.traction?.revenue && (
            <div className="card p-6">
              <h2 className="font-bold text-slate-900 text-lg mb-4">📈 Traction</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[['Revenue', startup.traction.revenue], ['Users', startup.traction.users], ['Growth', startup.traction.growth]].filter(([, v]) => v).map(([label, value]) => (
                  <div key={label} className="bg-indigo-50 rounded-xl p-4">
                    <p className="text-indigo-700 font-bold text-lg">{value}</p>
                    <p className="text-slate-500 text-sm">{label}</p>
                  </div>
                ))}
              </div>
              {startup.traction.milestones?.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold text-slate-800 mb-2 text-sm">Key Milestones</h3>
                  <div className="flex flex-wrap gap-2">{startup.traction.milestones.map(m => <span key={m} className="badge badge-green">{m}</span>)}</div>
                </div>
              )}
            </div>
          )}
          {startup.team?.length > 0 && (
            <div className="card p-6">
              <h2 className="font-bold text-slate-900 text-lg mb-4">👥 Team</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {startup.team.map((member, i) => (
                  <div key={i} className="text-center p-3 rounded-xl bg-slate-50">
                    <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg mx-auto mb-2">
                      {member.name?.[0] || '?'}
                    </div>
                    <p className="font-semibold text-slate-900 text-sm">{member.name}</p>
                    <p className="text-slate-500 text-xs">{member.role}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {startup.funding?.raised > 0 && (
            <div className="card p-5">
              <h3 className="font-bold text-slate-900 mb-3">💰 Funding</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Raised</span><span className="font-semibold">${(startup.funding.raised / 1000000).toFixed(1)}M</span></div>
                {startup.funding.seeking && <div className="flex justify-between"><span className="text-slate-500">Seeking</span><span className="font-semibold text-indigo-600">${(startup.funding.seeking / 1000000).toFixed(1)}M</span></div>}
                {startup.funding.stage && <div className="flex justify-between"><span className="text-slate-500">Stage</span><span className="badge badge-blue">{startup.funding.stage}</span></div>}
              </div>
            </div>
          )}
          {startup.technologies?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-bold text-slate-900 mb-3">🛠 Tech Stack</h3>
              <div className="flex flex-wrap gap-2">{startup.technologies.map(t => <span key={t} className="badge badge-purple">{t}</span>)}</div>
            </div>
          )}
          {startup.tags?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-bold text-slate-900 mb-3">🏷 Tags</h3>
              <div className="flex flex-wrap gap-2">{startup.tags.map(t => <span key={t} className="badge badge-blue">{t}</span>)}</div>
            </div>
          )}
          <div className="card p-5">
            <h3 className="font-bold text-slate-900 mb-3">📊 Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Profile Views</span><span className="font-semibold">{startup.views || 0}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Likes</span><span className="font-semibold">{startup.likes?.length || 0}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Followers</span><span className="font-semibold">{startup.followers?.length || 0}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Profile</span><span className="font-semibold">{startup.profileCompletion || 0}% complete</span></div>
            </div>
          </div>
          {startup.website && (
            <a href={startup.website} target="_blank" rel="noreferrer" className="btn-outline block text-center w-full">🌐 Visit Website</a>
          )}
        </div>
      </div>
    </div>
  );
}

export default StartupDetailPage;
