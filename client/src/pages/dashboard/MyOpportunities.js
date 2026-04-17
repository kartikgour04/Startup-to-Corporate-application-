import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const APP_COLORS = { pending:'badge-blue', reviewing:'badge-yellow', shortlisted:'badge-purple', accepted:'badge-green', rejected:'badge-red' };

function ApplicantProfileModal({ application, opportunityId, onClose, onStatusChange }) {
  const navigate = useNavigate();
  const [startup, setStartup] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (application.startup?._id || application.startup) {
      const sid = application.startup?._id || application.startup;
      api.get(`/startups/${sid}`).then(r => setStartup(r.data)).catch(() => {}).finally(() => setLoadingProfile(false));
    } else { setLoadingProfile(false); }
  }, [application]);

  const handleMessage = async () => {
    try {
      const userId = application.user?._id || application.user;
      const r = await api.post('/messages/conversations', { userId });
      navigate(`/dashboard/messages?conv=${r.data._id}`);
    } catch { toast.error('Could not open chat'); }
  };

  const handleStatus = async (status) => {
    try {
      await api.put(`/opportunities/${opportunityId}/applications/${application._id}`, { status });
      toast.success(`Application ${status}`);
      onStatusChange(application._id, status);
    } catch { toast.error('Error updating status'); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <h2 className="font-black text-slate-900 text-lg">Applicant Profile</h2>
          <div className="flex gap-2 items-center">
            <button onClick={handleMessage} className="btn-primary text-sm">💬 Start Chat</button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl ml-1">×</button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Application status control */}
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-slate-900">Update Status</p>
              <span className={`badge ${APP_COLORS[application.status]} capitalize`}>{application.status}</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['reviewing','shortlisted','accepted','rejected'].map(s => (
                <button key={s} onClick={() => handleStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${application.status === s ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}>{s}</button>
              ))}
            </div>
          </div>

          {/* Application details */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900">Application Submitted</h3>
            {application.coverLetter && (
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="font-semibold text-slate-700 text-sm mb-2">Cover Letter</p>
                <p className="text-slate-600 text-sm leading-relaxed">{application.coverLetter}</p>
              </div>
            )}
            {application.pitch && (
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="font-semibold text-slate-700 text-sm mb-2">Pitch Summary</p>
                <p className="text-slate-600 text-sm leading-relaxed">{application.pitch}</p>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {[['📞 Phone',application.phone],['💼 LinkedIn',application.linkedinUrl],['🌐 Portfolio',application.portfolioUrl],['📅 Available',application.availableFrom ? new Date(application.availableFrom).toLocaleDateString() : null],['👥 Team',application.teamSize],['💰 Revenue',application.revenueStage]].filter(([,v])=>v).map(([l,v]) => (
                <div key={l} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-slate-400 text-xs">{l}</p>
                  {typeof v === 'string' && v.startsWith('http') ? <a href={v} target="_blank" rel="noreferrer" className="text-indigo-600 text-xs font-medium hover:underline truncate block">{v}</a> : <p className="font-semibold text-slate-900 text-sm">{v}</p>}
                </div>
              ))}
            </div>
            <p className="text-slate-400 text-xs">Applied on {new Date(application.appliedAt).toLocaleString()}</p>
          </div>

          {/* Startup profile */}
          {loadingProfile ? (
            <div className="card p-6 animate-pulse"><div className="h-4 bg-slate-200 rounded w-1/2 mb-3" /><div className="h-3 bg-slate-200 rounded w-full" /></div>
          ) : startup ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900">Startup Profile</h3>
                <Link to={`/startups/${startup._id}`} target="_blank" className="btn-outline text-xs py-1.5">View Full Profile →</Link>
              </div>
              <div className="card p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <img src={startup.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(startup.companyName)}&background=6366f1&color=fff`} className="w-14 h-14 rounded-xl object-cover border border-slate-200" alt="" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-slate-900">{startup.companyName}</h4>
                      {startup.isVerified && <span className="text-indigo-500">✓</span>}
                    </div>
                    <p className="text-slate-500 text-sm">{startup.tagline}</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <span className="badge badge-blue">{startup.industry}</span>
                      <span className="badge badge-purple capitalize">{startup.stage}</span>
                      {startup.location?.country && <span className="text-slate-400 text-xs">📍 {startup.location.city}, {startup.location.country}</span>}
                    </div>
                  </div>
                </div>
                {startup.description && <p className="text-slate-600 text-sm leading-relaxed">{startup.description}</p>}
                {startup.traction?.revenue && (
                  <div className="grid grid-cols-3 gap-3">
                    {[['Revenue',startup.traction.revenue],['Users',startup.traction.users],['Growth',startup.traction.growth]].filter(([,v])=>v).map(([l,v]) => (
                      <div key={l} className="bg-indigo-50 rounded-xl p-3 text-center">
                        <p className="font-bold text-indigo-700 text-sm">{v}</p>
                        <p className="text-slate-500 text-xs">{l}</p>
                      </div>
                    ))}
                  </div>
                )}
                {startup.traction?.milestones?.length > 0 && (
                  <div className="flex flex-wrap gap-2">{startup.traction.milestones.map(m => <span key={m} className="badge badge-green">{m}</span>)}</div>
                )}
                {startup.funding?.raised > 0 && (
                  <div className="bg-emerald-50 rounded-xl p-3 flex justify-between items-center">
                    <div><p className="font-bold text-emerald-700">${(startup.funding.raised/1000000).toFixed(1)}M raised</p><p className="text-slate-500 text-xs">{startup.funding.stage}</p></div>
                    {startup.funding.seeking && <p className="text-slate-600 text-sm">Seeking: ${(startup.funding.seeking/1000000).toFixed(1)}M</p>}
                  </div>
                )}
                {startup.technologies?.length > 0 && (
                  <div><p className="text-sm font-medium text-slate-700 mb-2">Tech Stack</p><div className="flex flex-wrap gap-2">{startup.technologies.map(t => <span key={t} className="badge badge-purple">{t}</span>)}</div></div>
                )}
                {startup.team?.length > 0 && (
                  <div><p className="text-sm font-medium text-slate-700 mb-2">Team ({startup.teamSize})</p>
                    <div className="flex gap-3 flex-wrap">{startup.team.slice(0,4).map((m,i) => (
                      <div key={i} className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">{m.name?.[0]}</div>
                        <div><p className="text-xs font-semibold text-slate-900">{m.name}</p><p className="text-xs text-slate-400">{m.role}</p></div>
                      </div>
                    ))}</div>
                  </div>
                )}
                {(startup.website || startup.pitchDeck || startup.demoVideo) && (
                  <div className="flex gap-3 flex-wrap pt-2 border-t border-slate-100">
                    {startup.website && <a href={startup.website} target="_blank" rel="noreferrer" className="btn-outline text-xs py-1.5">🌐 Website</a>}
                    {startup.pitchDeck && <a href={startup.pitchDeck} target="_blank" rel="noreferrer" className="btn-outline text-xs py-1.5">📄 Pitch Deck</a>}
                    {startup.demoVideo && <a href={startup.demoVideo} target="_blank" rel="noreferrer" className="btn-outline text-xs py-1.5">🎥 Demo</a>}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl p-4 text-center text-slate-400 text-sm">No startup profile linked</div>
          )}
        </div>
      </div>
    </div>
  );
}

function OpportunityDetailModal({ opp, onClose, onUpdate }) {
  const [selectedApp, setSelectedApp] = useState(null);
  const [localOpp, setLocalOpp] = useState(opp);
  const [filterStatus, setFilterStatus] = useState('all');

  const handleAppStatusChange = (appId, status) => {
    const updated = { ...localOpp, applications: localOpp.applications.map(a => a._id === appId ? { ...a, status } : a) };
    setLocalOpp(updated);
    onUpdate(updated);
    if (selectedApp?._id === appId) setSelectedApp(prev => ({ ...prev, status }));
  };

  const toggleStatus = async (status) => {
    try {
      await api.put(`/opportunities/${localOpp._id}`, { status });
      const updated = { ...localOpp, status };
      setLocalOpp(updated);
      onUpdate(updated);
      toast.success(`Opportunity ${status}`);
    } catch { toast.error('Error'); }
  };

  const filteredApps = filterStatus === 'all' ? localOpp.applications : localOpp.applications.filter(a => a.status === filterStatus);
  const appCounts = localOpp.applications.reduce((acc, a) => { acc[a.status] = (acc[a.status]||0)+1; return acc; }, {});

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-start">
            <div>
              <h2 className="font-black text-slate-900 text-lg">{localOpp.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`badge capitalize ${localOpp.status === 'active' ? 'badge-green' : localOpp.status === 'paused' ? 'badge-yellow' : 'badge-red'}`}>{localOpp.status}</span>
                <span className="text-slate-400 text-xs capitalize">{localOpp.type}</span>
                <span className="text-slate-400 text-xs">{localOpp.applications?.length || 0} applicants</span>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <button onClick={() => toggleStatus(localOpp.status === 'active' ? 'paused' : 'active')} className="btn-secondary text-sm">{localOpp.status === 'active' ? 'Pause' : 'Activate'}</button>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl ml-1">×</button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Stats row */}
            <div className="grid grid-cols-5 gap-3">
              {[['Total',localOpp.applications?.length||0,'text-slate-700'],['Pending',appCounts.pending||0,'text-blue-600'],['Reviewing',appCounts.reviewing||0,'text-yellow-600'],['Shortlisted',appCounts.shortlisted||0,'text-purple-600'],['Accepted',appCounts.accepted||0,'text-emerald-600']].map(([l,v,c]) => (
                <div key={l} className="card p-3 text-center"><p className={`text-xl font-black ${c}`}>{v}</p><p className="text-xs text-slate-500">{l}</p></div>
              ))}
            </div>

            {/* Opportunity details */}
            <div className="card p-4 grid md:grid-cols-2 gap-4 text-sm">
              {localOpp.description && <div className="md:col-span-2"><p className="font-semibold text-slate-700 mb-1">Description</p><p className="text-slate-600">{localOpp.description}</p></div>}
              {localOpp.budget?.min && <div><p className="text-slate-400 text-xs">Budget</p><p className="font-semibold">${(localOpp.budget.min/1000).toFixed(0)}K–${(localOpp.budget.max/1000).toFixed(0)}K {localOpp.budget.currency}</p></div>}
              {localOpp.timeline?.duration && <div><p className="text-slate-400 text-xs">Duration</p><p className="font-semibold">{localOpp.timeline.duration}</p></div>}
              {localOpp.deadline && <div><p className="text-slate-400 text-xs">Deadline</p><p className={`font-semibold ${new Date(localOpp.deadline) < new Date() ? 'text-red-500' : ''}`}>{new Date(localOpp.deadline).toLocaleDateString()}</p></div>}
              <div><p className="text-slate-400 text-xs">Slots</p><p className="font-semibold">{localOpp.slots}</p></div>
            </div>

            {/* Applications list */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900">Applications ({localOpp.applications?.length || 0})</h3>
                <div className="flex gap-2">
                  {['all','pending','reviewing','shortlisted','accepted','rejected'].map(f => (
                    <button key={f} onClick={() => setFilterStatus(f)} className={`px-2 py-1 rounded-full text-xs font-medium capitalize transition-colors ${filterStatus===f ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{f}</button>
                  ))}
                </div>
              </div>
              {filteredApps.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <p className="text-3xl mb-2">📭</p>
                  <p>{localOpp.applications?.length === 0 ? 'No applications yet' : `No applications with status "${filterStatus}"`}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredApps.map(app => (
                    <div key={app._id} className="border border-slate-200 rounded-xl p-4 hover:border-indigo-200 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                          {app.startup?.companyName?.[0] || app.user?.name?.[0] || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-slate-900">{app.startup?.companyName || 'Startup'}</p>
                            <span className={`badge ${APP_COLORS[app.status]} capitalize`}>{app.status}</span>
                          </div>
                          {app.startup?.industry && <p className="text-slate-500 text-xs mt-0.5">{app.startup.industry} · {app.startup.stage}</p>}
                          {app.coverLetter && <p className="text-slate-600 text-sm mt-2 line-clamp-2 italic">"{app.coverLetter}"</p>}
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                            <span>📅 {new Date(app.appliedAt).toLocaleDateString()}</span>
                            {app.teamSize && <span>👥 {app.teamSize}</span>}
                            {app.revenueStage && <span>💰 {app.revenueStage}</span>}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => setSelectedApp(app)} className="btn-outline text-xs py-1.5 px-3">View Profile</button>
                        </div>
                      </div>
                      {/* Quick status buttons */}
                      <div className="flex gap-1.5 mt-3 pt-3 border-t border-slate-100 flex-wrap">
                        {['reviewing','shortlisted','accepted','rejected'].map(s => (
                          <button key={s} onClick={() => handleAppStatusChange(app._id, s)}
                            className={`text-xs px-2.5 py-1 rounded-lg capitalize transition-colors ${app.status===s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{s}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedApp && (
        <ApplicantProfileModal
          application={selectedApp}
          opportunityId={localOpp._id}
          onClose={() => setSelectedApp(null)}
          onStatusChange={(appId, status) => { handleAppStatusChange(appId, status); setSelectedApp(prev => ({...prev, status})); }}
        />
      )}
    </>
  );
}

export default function MyOpportunities() {
  const [opps, setOpps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => { api.get('/opportunities/my/posted').then(r => setOpps(r.data)).finally(() => setLoading(false)); }, []);

  const filtered = filter === 'all' ? opps : opps.filter(o => o.status === filter);
  const handleUpdate = (updated) => { setOpps(prev => prev.map(o => o._id === updated._id ? updated : o)); };
  const stats = { total: opps.length, active: opps.filter(o=>o.status==='active').length, totalApps: opps.reduce((a,o)=>a+(o.applications?.length||0),0), accepted: opps.reduce((a,o)=>a+(o.applications?.filter(ap=>ap.status==='accepted').length||0),0) };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-900">My Opportunities 💡</h1>
        <Link to="/dashboard/opportunities/new" className="btn-primary text-sm">+ Post Opportunity</Link>
      </div>

      {opps.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {[['Total',stats.total,'text-slate-700'],['Active',stats.active,'text-indigo-600'],['Applications',stats.totalApps,'text-amber-600'],['Accepted',stats.accepted,'text-emerald-600']].map(([l,v,c]) => (
            <div key={l} className="card p-3 text-center"><p className={`text-2xl font-black ${c}`}>{v}</p><p className="text-xs text-slate-500">{l}</p></div>
          ))}
        </div>
      )}

      {opps.length > 0 && (
        <div className="flex gap-2">
          {['all','active','paused','closed','draft'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${filter===f ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{f}</button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_,i) => <div key={i} className="card h-24 animate-pulse bg-slate-100" />)}</div>
      ) : opps.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-5xl mb-4">💡</p><p className="text-xl mb-2">No opportunities yet</p>
          <Link to="/dashboard/opportunities/new" className="btn-primary">Post Your First Opportunity</Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400"><p>No opportunities with status "{filter}"</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(opp => {
            const pending = opp.applications?.filter(a=>a.status==='pending').length||0;
            const shortlisted = opp.applications?.filter(a=>a.status==='shortlisted').length||0;
            return (
              <div key={opp._id} className="card p-5 hover:border-indigo-200 transition-colors cursor-pointer" onClick={() => setSelected(opp)}>
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-slate-900">{opp.title}</h3>
                      <span className={`badge capitalize ${opp.status==='active'?'badge-green':opp.status==='paused'?'badge-yellow':'badge-red'}`}>{opp.status}</span>
                      <span className="badge badge-blue capitalize">{opp.type}</span>
                    </div>
                    <p className="text-slate-500 text-sm line-clamp-1">{opp.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs flex-wrap">
                      <span className="text-slate-500">👥 {opp.applications?.length||0} total</span>
                      {pending > 0 && <span className="text-blue-600 font-medium">⏳ {pending} pending</span>}
                      {shortlisted > 0 && <span className="text-amber-600 font-medium">⭐ {shortlisted} shortlisted</span>}
                      {opp.deadline && <span className={`${new Date(opp.deadline)<new Date()?'text-red-500':'text-slate-400'}`}>⏰ {new Date(opp.deadline).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <button onClick={e=>{e.stopPropagation();setSelected(opp);}} className="btn-outline text-xs py-1.5 px-3 flex-shrink-0">Manage →</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && <OpportunityDetailModal opp={selected} onClose={() => setSelected(null)} onUpdate={handleUpdate} />}
    </div>
  );
}
