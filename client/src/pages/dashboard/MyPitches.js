import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  draft: 'badge-blue', submitted: 'badge-yellow', viewed: 'badge-purple',
  shortlisted: 'badge-green', meeting_scheduled: 'badge-green',
  accepted: 'badge-green', rejected: 'badge-red', on_hold: 'badge-yellow'
};
const STATUS_LABELS = {
  draft: '📝 Draft', submitted: '📤 Submitted', viewed: '👁 Viewed',
  shortlisted: '⭐ Shortlisted', meeting_scheduled: '📅 Meeting Scheduled',
  accepted: '✅ Accepted', rejected: '❌ Rejected', on_hold: '⏸ On Hold'
};

function EditPitchModal({ pitch, onClose, onSave }) {
  const [form, setForm] = useState({ ...pitch });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const handleSave = async () => {
    setSaving(true);
    try {
      const r = await api.put(`/pitches/${pitch._id}`, form);
      toast.success('Pitch updated!');
      onSave(r.data);
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <h2 className="font-black text-slate-900 text-lg">Edit Pitch</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
            <input className="input" value={form.title || ''} onChange={e => set('title', e.target.value)} /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Executive Summary *</label>
            <textarea rows={3} className="input resize-none" value={form.summary || ''} onChange={e => set('summary', e.target.value)} /></div>
          {[['problem','Problem Statement'],['solution','Solution'],['uniqueValue','Unique Value Prop'],
            ['marketSize','Market Size'],['traction','Traction & Metrics'],['team','Team'],['ask','The Ask']
          ].map(([k, label]) => (
            <div key={k}><label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
              <textarea rows={2} className="input resize-none" value={form[k] || ''} onChange={e => set(k, e.target.value)} /></div>
          ))}
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Pitch Deck URL</label>
            <input className="input" value={form.pitchDeck || ''} onChange={e => set('pitchDeck', e.target.value)} /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Demo Video URL</label>
            <input className="input" value={form.video || ''} onChange={e => set('video', e.target.value)} /></div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <div className="flex gap-3">
              {[['draft','Save as Draft'],['submitted','Submit']].map(([val, label]) => (
                <label key={val} className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer ${form.status === val ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600'}`}>
                  <input type="radio" name="status" value={val} checked={form.status === val} onChange={() => set('status', val)} className="hidden" />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : '💾 Save Changes'}</button>
        </div>
      </div>
    </div>
  );
}

function PitchDetailModal({ pitch, onClose, onUpdate }) {
  const navigate = useNavigate();
  const [showEdit, setShowEdit] = useState(false);
  const handleMessage = async () => {
    const userId = pitch.targetCorporate?.user?._id || pitch.targetCorporate?.user;
    if (!userId) return toast.error('No corporate contact available');
    try {
      const r = await api.post('/messages/conversations', { userId });
      navigate(`/dashboard/messages?conv=${r.data._id}`);
    } catch { toast.error('Could not start conversation'); }
  };
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-start">
            <div>
              <h2 className="font-black text-slate-900 text-lg">{pitch.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`badge ${STATUS_COLORS[pitch.status]}`}>{STATUS_LABELS[pitch.status]}</span>
                <span className="text-slate-400 text-xs">{new Date(pitch.createdAt).toLocaleDateString()} · {pitch.views || 0} views</span>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <button onClick={() => setShowEdit(true)} className="btn-outline text-sm">✏️ Edit</button>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl ml-1">×</button>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {pitch.targetCorporate && (
              <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
                <img src={pitch.targetCorporate.logo || `https://ui-avatars.com/api/?name=C&background=10b981&color=fff`} className="w-10 h-10 rounded-lg" alt="" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 text-sm">Pitched to: {pitch.targetCorporate.companyName}</p>
                  <p className="text-slate-500 text-xs">{pitch.targetCorporate.industry}</p>
                </div>
                <button onClick={handleMessage} className="btn-outline text-xs py-1.5">💬 Message</button>
              </div>
            )}
            <div className="card p-4">
              <h3 className="font-bold text-slate-900 mb-2">Executive Summary</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{pitch.summary || '—'}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[['🎯 Problem',pitch.problem],['💡 Solution',pitch.solution],['⚡ Unique Value',pitch.uniqueValue],
                ['📊 Market Size',pitch.marketSize],['📈 Traction',pitch.traction],['👥 Team',pitch.team],['💰 The Ask',pitch.ask]
              ].filter(([,v]) => v).map(([label, value]) => (
                <div key={label} className="bg-slate-50 rounded-xl p-4">
                  <p className="font-semibold text-slate-800 text-sm mb-1">{label}</p>
                  <p className="text-slate-600 text-sm leading-relaxed">{value}</p>
                </div>
              ))}
            </div>
            {(pitch.pitchDeck || pitch.video) && (
              <div className="flex gap-3 flex-wrap">
                {pitch.pitchDeck && <a href={pitch.pitchDeck} target="_blank" rel="noreferrer" className="btn-outline text-sm">📄 Pitch Deck</a>}
                {pitch.video && <a href={pitch.video} target="_blank" rel="noreferrer" className="btn-outline text-sm">🎥 Demo Video</a>}
              </div>
            )}
            {pitch.feedback?.length > 0 && (
              <div>
                <h3 className="font-bold text-slate-900 mb-3">💬 Feedback Received ({pitch.feedback.length})</h3>
                <div className="space-y-3">
                  {pitch.feedback.map((fb, i) => (
                    <div key={i} className="border border-slate-200 rounded-xl p-4">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-slate-900 text-sm">{fb.from?.name || 'Corporate Reviewer'}</span>
                        <span className="text-slate-400 text-xs">{new Date(fb.date).toLocaleDateString()}</span>
                      </div>
                      {fb.rating && <div className="flex gap-0.5 mb-2">{[...Array(5)].map((_,j) => <span key={j} className={j < fb.rating ? 'text-amber-400' : 'text-slate-200'}>★</span>)}</div>}
                      <p className="text-slate-600 text-sm">{fb.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {pitch.meetings?.length > 0 && (
              <div>
                <h3 className="font-bold text-slate-900 mb-3">📅 Meetings</h3>
                {pitch.meetings.map((m, i) => (
                  <div key={i} className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{new Date(m.scheduledAt).toLocaleString()}</p>
                      <p className="text-slate-500 text-xs">{m.duration} min · <span className="capitalize">{m.status}</span></p>
                    </div>
                    {m.link && <a href={m.link} target="_blank" rel="noreferrer" className="btn-primary text-xs py-1.5">Join →</a>}
                  </div>
                ))}
              </div>
            )}
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-bold text-slate-900 mb-3 text-sm">Progress</h3>
              <div className="flex items-center gap-1 flex-wrap">
                {['submitted','viewed','shortlisted','meeting_scheduled','accepted'].map((s, i, arr) => {
                  const idx = arr.indexOf(pitch.status);
                  const done = arr.indexOf(s) <= idx && !['rejected','draft'].includes(pitch.status);
                  return (
                    <React.Fragment key={s}>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${done ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{s.replace('_',' ')}</span>
                      {i < arr.length-1 && <span className="text-slate-300 text-xs">›</span>}
                    </React.Fragment>
                  );
                })}
              </div>
              {pitch.status === 'rejected' && <p className="text-red-500 text-sm mt-2">❌ Not accepted this time. Revise and resubmit!</p>}
            </div>
          </div>
        </div>
      </div>
      {showEdit && <EditPitchModal pitch={pitch} onClose={() => setShowEdit(false)} onSave={(u) => { onUpdate(u); setShowEdit(false); }} />}
    </>
  );
}

export default function MyPitches() {
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => { api.get('/pitches/my').then(r => setPitches(r.data)).finally(() => setLoading(false)); }, []);

  const filtered = filter === 'all' ? pitches : pitches.filter(p => p.status === filter);
  const handleUpdate = (u) => { setPitches(prev => prev.map(p => p._id === u._id ? u : p)); setSelected(u); };
  const stats = { total: pitches.length, active: pitches.filter(p => !['draft','rejected'].includes(p.status)).length, shortlisted: pitches.filter(p => p.status === 'shortlisted').length, accepted: pitches.filter(p => p.status === 'accepted').length };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-900">My Pitches 🎯</h1>
        <Link to="/dashboard/pitches/new" className="btn-primary text-sm">+ New Pitch</Link>
      </div>
      {pitches.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {[['Total',stats.total,'text-slate-700'],['Active',stats.active,'text-indigo-600'],['Shortlisted',stats.shortlisted,'text-amber-600'],['Accepted',stats.accepted,'text-emerald-600']].map(([l,v,c]) => (
            <div key={l} className="card p-3 text-center"><p className={`text-2xl font-black ${c}`}>{v}</p><p className="text-xs text-slate-500">{l}</p></div>
          ))}
        </div>
      )}
      {pitches.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {['all','draft','submitted','viewed','shortlisted','accepted','rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${filter === f ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{f}</button>
          ))}
        </div>
      )}
      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_,i) => <div key={i} className="card h-24 animate-pulse bg-slate-100" />)}</div>
      ) : pitches.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-5xl mb-4">🎯</p><p className="text-xl mb-2">No pitches yet</p>
          <Link to="/dashboard/pitches/new" className="btn-primary">Create Your First Pitch</Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400"><p>No pitches with status "{filter}"</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => (
            <div key={p._id} className="card p-5 hover:border-indigo-200 transition-colors cursor-pointer" onClick={() => setSelected(p)}>
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-slate-900">{p.title}</h3>
                    <span className={`badge ${STATUS_COLORS[p.status]}`}>{STATUS_LABELS[p.status]}</span>
                  </div>
                  <p className="text-slate-500 text-sm line-clamp-2">{p.summary}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 flex-wrap">
                    <span>📅 {new Date(p.createdAt).toLocaleDateString()}</span>
                    <span>👁 {p.views || 0} views</span>
                    {p.feedback?.length > 0 && <span className="text-indigo-500">💬 {p.feedback.length} feedback</span>}
                    {p.targetCorporate?.companyName && <span>🏢 {p.targetCorporate.companyName}</span>}
                  </div>
                </div>
                <button onClick={e => { e.stopPropagation(); setSelected(p); }} className="btn-outline text-xs py-1.5 px-3 flex-shrink-0">View →</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {selected && <PitchDetailModal pitch={selected} onClose={() => setSelected(null)} onUpdate={handleUpdate} />}
    </div>
  );
}
