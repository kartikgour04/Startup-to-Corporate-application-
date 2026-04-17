import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = { pending:'badge-blue', reviewing:'badge-yellow', shortlisted:'badge-purple', accepted:'badge-green', rejected:'badge-red' };
const STATUS_LABELS = { pending:'⏳ Pending', reviewing:'🔍 Reviewing', shortlisted:'⭐ Shortlisted', accepted:'✅ Accepted', rejected:'❌ Rejected' };

function ApplicationDetailModal({ item, onClose, onUpdate }) {
  const navigate = useNavigate();
  const { opportunity, application } = item;
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ coverLetter: application.coverLetter || '', pitch: application.pitch || '', phone: application.phone || '', linkedinUrl: application.linkedinUrl || '', portfolioUrl: application.portfolioUrl || '', availableFrom: application.availableFrom || '', teamSize: application.teamSize || '', revenueStage: application.revenueStage || '' });
  const [saving, setSaving] = useState(false);

  const handleMessage = async () => {
    try {
      const r = await api.post('/messages/conversations', { userId: opportunity.postedBy?._id });
      navigate(`/dashboard/messages?conv=${r.data._id}`);
    } catch { toast.error('Could not open chat'); }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await api.put(`/opportunities/${opportunity._id}/my-application`, editForm);
      toast.success('Application updated!');
      onUpdate({ ...item, application: { ...application, ...editForm } });
      setShowEdit(false);
    } catch (e) { toast.error(e.response?.data?.message || 'Error saving'); }
    finally { setSaving(false); }
  };

  const handleWithdraw = async () => {
    if (!window.confirm('Withdraw this application?')) return;
    try {
      await api.delete(`/opportunities/${opportunity._id}/apply`);
      toast.success('Application withdrawn');
      onClose();
    } catch (e) { toast.error(e.response?.data?.message || 'Cannot withdraw'); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-start">
          <div>
            <h2 className="font-black text-slate-900 text-lg">{opportunity.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`badge ${STATUS_COLORS[application.status]}`}>{STATUS_LABELS[application.status]}</span>
              <span className="text-slate-400 text-xs">Applied {new Date(application.appliedAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {['pending','reviewing'].includes(application.status) && (
              <button onClick={() => setShowEdit(!showEdit)} className="btn-outline text-sm">✏️ Edit</button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl ml-1">×</button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Corporate info */}
          {opportunity.corporate && (
            <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
              <img src={opportunity.corporate.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(opportunity.corporate.companyName||'C')}&background=10b981&color=fff`}
                className="w-10 h-10 rounded-lg" alt="" />
              <div className="flex-1">
                <p className="font-semibold text-slate-900 text-sm">{opportunity.corporate.companyName}</p>
                <p className="text-slate-500 text-xs capitalize">{opportunity.type} opportunity</p>
              </div>
              <div className="flex gap-2">
                <Link to={`/corporates/${opportunity.corporate._id}`} target="_blank" className="btn-outline text-xs py-1.5">View Profile</Link>
                <button onClick={handleMessage} className="btn-primary text-xs py-1.5">💬 Chat</button>
              </div>
            </div>
          )}

          {/* Status + what happens next */}
          <div className={`rounded-xl p-4 border ${application.status === 'accepted' ? 'bg-emerald-50 border-emerald-200' : application.status === 'rejected' ? 'bg-red-50 border-red-200' : application.status === 'shortlisted' ? 'bg-amber-50 border-amber-200' : 'bg-indigo-50 border-indigo-200'}`}>
            <p className="font-semibold text-slate-900 text-sm mb-1">Status: {STATUS_LABELS[application.status]}</p>
            <p className="text-slate-600 text-sm">
              {application.status === 'pending' && 'Your application has been submitted and is waiting for review.'}
              {application.status === 'reviewing' && '🎉 Great news! The corporate is actively reviewing your application.'}
              {application.status === 'shortlisted' && '⭐ You\'ve been shortlisted! Expect to hear from them soon.'}
              {application.status === 'accepted' && '🎊 Congratulations! Your application was accepted. Check messages for next steps.'}
              {application.status === 'rejected' && 'Unfortunately this application wasn\'t successful. Keep applying to other opportunities!'}
            </p>
            {application.notes && <p className="text-slate-700 text-sm mt-2 italic border-t border-slate-200 pt-2">Note from corporate: "{application.notes}"</p>}
          </div>

          {/* Progress tracker */}
          <div className="bg-slate-50 rounded-xl p-4">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Application Progress</h3>
            <div className="flex items-center gap-1 flex-wrap">
              {['pending','reviewing','shortlisted','accepted'].map((s, i, arr) => {
                const statusOrder = ['pending','reviewing','shortlisted','accepted'];
                const currentIdx = statusOrder.indexOf(application.status);
                const done = statusOrder.indexOf(s) <= currentIdx && application.status !== 'rejected';
                return (
                  <React.Fragment key={s}>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${done ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{s}</span>
                    {i < arr.length-1 && <span className="text-slate-300 text-xs">›</span>}
                  </React.Fragment>
                );
              })}
              {application.status === 'rejected' && <span className="text-xs px-2 py-1 rounded-full font-medium bg-red-500 text-white">rejected</span>}
            </div>
          </div>

          {/* Application details - view or edit */}
          {showEdit ? (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900">Edit Your Application</h3>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Cover Letter</label>
                <textarea rows={4} className="input resize-none" value={editForm.coverLetter} onChange={e => setEditForm(p=>({...p,coverLetter:e.target.value}))} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Pitch / Summary</label>
                <textarea rows={3} className="input resize-none" value={editForm.pitch} onChange={e => setEditForm(p=>({...p,pitch:e.target.value}))} /></div>
              <div className="grid md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Phone</label><input className="input" value={editForm.phone} onChange={e => setEditForm(p=>({...p,phone:e.target.value}))} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn URL</label><input className="input" value={editForm.linkedinUrl} onChange={e => setEditForm(p=>({...p,linkedinUrl:e.target.value}))} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Portfolio / Website</label><input className="input" value={editForm.portfolioUrl} onChange={e => setEditForm(p=>({...p,portfolioUrl:e.target.value}))} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Available From</label><input type="date" className="input" value={editForm.availableFrom} onChange={e => setEditForm(p=>({...p,availableFrom:e.target.value}))} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Team Size</label>
                  <select className="input" value={editForm.teamSize} onChange={e => setEditForm(p=>({...p,teamSize:e.target.value}))}>
                    <option value="">Select</option>
                    {['Solo founder','2-5','6-15','16-50','50+'].map(s=><option key={s}>{s}</option>)}
                  </select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Revenue Stage</label>
                  <select className="input" value={editForm.revenueStage} onChange={e => setEditForm(p=>({...p,revenueStage:e.target.value}))}>
                    <option value="">Select</option>
                    {['Pre-revenue','<$10K MRR','$10K-$50K MRR','$50K-$200K MRR','$200K+ MRR'].map(s=><option key={s}>{s}</option>)}
                  </select></div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleSaveEdit} disabled={saving} className="btn-primary">{saving ? 'Saving...' : '💾 Save'}</button>
                <button onClick={() => setShowEdit(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900">Your Application Details</h3>
              {application.coverLetter && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="font-semibold text-slate-800 text-sm mb-2">Cover Letter</p>
                  <p className="text-slate-600 text-sm leading-relaxed">{application.coverLetter}</p>
                </div>
              )}
              {application.pitch && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="font-semibold text-slate-800 text-sm mb-2">Pitch Summary</p>
                  <p className="text-slate-600 text-sm leading-relaxed">{application.pitch}</p>
                </div>
              )}
              <div className="grid md:grid-cols-3 gap-3 text-sm">
                {[['📞 Phone', application.phone],['💼 LinkedIn', application.linkedinUrl],['🌐 Portfolio', application.portfolioUrl],['📅 Available From', application.availableFrom],['👥 Team Size', application.teamSize],['💰 Revenue Stage', application.revenueStage]].filter(([,v])=>v).map(([l,v]) => (
                  <div key={l} className="bg-slate-50 rounded-lg p-3">
                    <p className="text-slate-500 text-xs">{l}</p>
                    {v.startsWith('http') ? <a href={v} target="_blank" rel="noreferrer" className="text-indigo-600 font-medium text-xs truncate block hover:underline">{v}</a> : <p className="text-slate-900 font-medium">{v}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Opportunity details */}
          <div className="border-t border-slate-200 pt-4">
            <h3 className="font-bold text-slate-900 mb-3 text-sm">Opportunity Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {[['Type',opportunity.type],['Budget',opportunity.budget?.min ? `$${(opportunity.budget.min/1000).toFixed(0)}K–$${(opportunity.budget.max/1000).toFixed(0)}K` : 'N/A'],['Duration',opportunity.timeline?.duration || 'N/A'],['Slots',opportunity.slots || '?']].map(([l,v]) => (
                <div key={l} className="bg-slate-50 rounded-lg p-2 text-center">
                  <p className="text-slate-400">{l}</p>
                  <p className="font-semibold text-slate-800 capitalize mt-0.5">{v}</p>
                </div>
              ))}
            </div>
          </div>

          {['pending','reviewing'].includes(application.status) && (
            <button onClick={handleWithdraw} className="text-red-500 hover:text-red-700 text-sm font-medium">Withdraw Application</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MyApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => { api.get('/opportunities/my/applications').then(r => setApps(r.data)).finally(() => setLoading(false)); }, []);

  // Real-time status update via Socket.io
  useEffect(() => {
    const token = localStorage.getItem('nexus_token');
    if (!token) return;
    let socket;
    try {
      const { io } = require('socket.io-client');
      socket = io(process.env.REACT_APP_SOCKET_URL || '', { auth: { token } });
      socket.on('application_status_update', ({ opportunityId, opportunityTitle, status, notes, appId }) => {
        // Update state immediately without page refresh
        setApps(prev => prev.map(item => {
          if (item.application._id === appId || item.opportunity._id === opportunityId) {
            return { ...item, application: { ...item.application, status, notes } };
          }
          return item;
        }));
        // Update selected modal too if open
        setSelected(prev => {
          if (prev && (prev.application._id === appId)) {
            return { ...prev, application: { ...prev.application, status, notes } };
          }
          return prev;
        });
        // Show toast notification
        const statusMsg = { reviewing: '🔍 Your application is being reviewed!', shortlisted: '⭐ You\'ve been shortlisted!', accepted: '🎊 Congratulations! Your application was accepted!', rejected: 'Application status updated' };
        toast(statusMsg[status] || `Application updated: ${status}`, { duration: 6000, style: { background: status === 'accepted' ? '#064e3b' : status === 'shortlisted' ? '#1e1b4b' : '#1e293b', color: '#f1f5f9' } });
      });
    } catch (e) { console.log('Socket not available'); }
    return () => { if (socket) socket.disconnect(); };
  }, []);

  const filtered = filter === 'all' ? apps : apps.filter(a => a.application.status === filter);
  const handleUpdate = (updated) => setApps(prev => prev.map(a => a.application._id === updated.application._id ? updated : a));

  const stats = {
    total: apps.length,
    active: apps.filter(a => ['pending','reviewing','shortlisted'].includes(a.application.status)).length,
    shortlisted: apps.filter(a => a.application.status === 'shortlisted').length,
    accepted: apps.filter(a => a.application.status === 'accepted').length,
  };

  // Poll for status updates every 30 seconds as fallback for socket
  useEffect(() => {
    const interval = setInterval(() => {
      api.get('/opportunities/my/applications').then(r => setApps(r.data)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    api.get('/opportunities/my/applications').then(r => setApps(r.data)).finally(() => setLoading(false));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-900">My Applications 📋</h1>
        <div className="flex gap-2">
          <button onClick={handleRefresh} className="btn-secondary text-sm" title="Refresh status">🔄 Refresh</button>
          <Link to="/opportunities" className="btn-secondary text-sm">Browse More</Link>
        </div>
      </div>

      {apps.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {[['Total',stats.total,'text-slate-700'],['Active',stats.active,'text-indigo-600'],['Shortlisted',stats.shortlisted,'text-amber-600'],['Accepted',stats.accepted,'text-emerald-600']].map(([l,v,c]) => (
            <div key={l} className="card p-3 text-center"><p className={`text-2xl font-black ${c}`}>{v}</p><p className="text-xs text-slate-500">{l}</p></div>
          ))}
        </div>
      )}

      {apps.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {['all','pending','reviewing','shortlisted','accepted','rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${filter === f ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{f}</button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_,i) => <div key={i} className="card h-24 animate-pulse bg-slate-100" />)}</div>
      ) : apps.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-5xl mb-4">📋</p><p className="text-xl mb-2">No applications yet</p>
          <Link to="/opportunities" className="btn-primary">Browse Opportunities</Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400"><p>No applications with status "{filter}"</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => {
            const { opportunity, application } = item;
            return (
              <div key={application._id} className="card p-5 hover:border-indigo-200 transition-colors cursor-pointer" onClick={() => setSelected(item)}>
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-slate-900">{opportunity.title}</h3>
                      <span className={`badge ${STATUS_COLORS[application.status]}`}>{STATUS_LABELS[application.status]}</span>
                    </div>
                    {opportunity.corporate && (
                      <p className="text-slate-600 text-sm flex items-center gap-1">
                        {opportunity.corporate.logo && <img src={opportunity.corporate.logo} alt="" className="w-4 h-4 rounded" />}
                        {opportunity.corporate.companyName}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 flex-wrap">
                      <span>📅 Applied {new Date(application.appliedAt).toLocaleDateString()}</span>
                      <span className="capitalize">📌 {opportunity.type}</span>
                      {application.notes && <span className="text-indigo-500">💬 Has feedback</span>}
                    </div>
                    {application.status === 'accepted' && (
                      <p className="text-emerald-600 font-medium text-sm mt-2">🎊 Accepted! Check messages for next steps.</p>
                    )}
                  </div>
                  <button onClick={e => { e.stopPropagation(); setSelected(item); }} className="btn-outline text-xs py-1.5 px-3 flex-shrink-0">View →</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && <ApplicationDetailModal item={selected} onClose={() => setSelected(null)} onUpdate={handleUpdate} />}
    </div>
  );
}
