import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export function CorporateDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [corp, setCorp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get(`/corporates/${id}`).then(r => setCorp(r.data)).finally(() => setLoading(false)); }, [id]);

  const handleConnect = async () => {
    if (!user) return toast.error('Please login first');
    try { await api.post(`/connections/request/${corp.user._id}`); toast.success('Connection request sent!'); }
    catch (e) { toast.error(e.response?.data?.message || 'Error'); }
  };

  if (loading) return <div className="pt-16 flex items-center justify-center min-h-screen"><div className="animate-spin w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full" /></div>;
  if (!corp) return <div className="pt-16 text-center py-20">Not found</div>;

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-6 items-start">
          <img src={corp.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(corp.companyName)}&background=10b981&color=fff&size=128`}
            className="w-24 h-24 rounded-2xl object-cover border-2 border-white/20" alt={corp.companyName} />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-black">{corp.companyName}</h1>
              {corp.isVerified && <span className="bg-emerald-500/30 text-emerald-200 text-xs px-2 py-1 rounded-full">✓ Verified</span>}
            </div>
            {corp.tagline && <p className="text-slate-300 text-lg mb-3">{corp.tagline}</p>}
            <div className="flex flex-wrap gap-3 text-sm text-slate-400">
              <span>🏭 {corp.industry}</span>
              <span>👥 {corp.size} employees</span>
              {corp.location?.country && <span>📍 {corp.location.city}, {corp.location.country}</span>}
              {corp.founded && <span>📅 Est. {corp.founded}</span>}
              {corp.revenue && <span>💰 Revenue: {corp.revenue}</span>}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={handleConnect} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors">🤝 Connect</button>
            {corp.website && <a href={corp.website} target="_blank" rel="noreferrer" className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors border border-white/20 text-center">🌐 Website</a>}
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {corp.description && <div className="card p-6"><h2 className="font-bold text-slate-900 text-lg mb-3">About</h2><p className="text-slate-600 leading-relaxed">{corp.description}</p></div>}
          {corp.acceleratorPrograms?.length > 0 && (
            <div className="card p-6">
              <h2 className="font-bold text-slate-900 text-lg mb-4">🎓 Accelerator Programs</h2>
              {corp.acceleratorPrograms.filter(p => p.isActive).map((p, i) => (
                <div key={i} className="border border-slate-200 rounded-xl p-4 mb-3">
                  <h3 className="font-bold text-slate-900">{p.name}</h3>
                  {p.description && <p className="text-slate-600 text-sm mt-1">{p.description}</p>}
                  {p.deadline && <p className="text-red-500 text-xs mt-2">Deadline: {new Date(p.deadline).toLocaleDateString()}</p>}
                  <div className="flex flex-wrap gap-2 mt-2">{p.benefits?.map(b => <span key={b} className="badge badge-green">{b}</span>)}</div>
                </div>
              ))}
            </div>
          )}
          {corp.successStories?.length > 0 && (
            <div className="card p-6">
              <h2 className="font-bold text-slate-900 text-lg mb-4">🏆 Success Stories</h2>
              {corp.successStories.map((s, i) => (
                <div key={i} className="border-l-4 border-emerald-400 pl-4 mb-4">
                  <h3 className="font-semibold text-slate-900">{s.startup}</h3>
                  <p className="text-slate-600 text-sm">{s.description}</p>
                  {s.impact && <p className="text-emerald-600 text-sm font-medium mt-1">Impact: {s.impact}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-4">
          {corp.innovationFocus?.length > 0 && <div className="card p-5"><h3 className="font-bold text-slate-900 mb-3">🔬 Innovation Focus</h3><div className="flex flex-wrap gap-2">{corp.innovationFocus.map(f => <span key={f} className="badge badge-green">{f}</span>)}</div></div>}
          {corp.partnershipTypes?.length > 0 && <div className="card p-5"><h3 className="font-bold text-slate-900 mb-3">🤝 Partnership Types</h3><div className="flex flex-wrap gap-2">{corp.partnershipTypes.map(t => <span key={t} className="badge badge-blue capitalize">{t}</span>)}</div></div>}
          {corp.investmentBudget?.min && (
            <div className="card p-5">
              <h3 className="font-bold text-slate-900 mb-3">💰 Investment Budget</h3>
              <p className="text-emerald-600 font-bold">${(corp.investmentBudget.min / 1000).toFixed(0)}K – ${(corp.investmentBudget.max / 1000000).toFixed(1)}M</p>
              <p className="text-slate-500 text-sm">{corp.investmentBudget.currency}</p>
            </div>
          )}
          <div className="card p-5">
            <h3 className="font-bold text-slate-900 mb-3">📊 Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Profile Views</span><span className="font-semibold">{corp.views || 0}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Followers</span><span className="font-semibold">{corp.followers?.length || 0}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OpportunityDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [opp, setOpp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [appForm, setAppForm] = useState({ coverLetter: '', pitch: '', phone: '', linkedinUrl: '', portfolioUrl: '', availableFrom: '', teamSize: '', revenueStage: '' });
  const [hasApplied, setHasApplied] = useState(false);

  // Check if current user already applied
  React.useEffect(() => {
    if (opp && user) {
      const myApp = opp.applications?.find(a => a.user === user._id || a.user?._id === user._id);
      if (myApp) setHasApplied(true);
    }
  }, [opp, user]);

  useEffect(() => { api.get(`/opportunities/${id}`).then(r => setOpp(r.data)).finally(() => setLoading(false)); }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login first');
    // Validate all mandatory fields
    const required = ['coverLetter', 'pitch', 'phone', 'linkedinUrl', 'teamSize', 'revenueStage'];
    const missing = required.filter(f => !appForm[f]?.trim());
    if (missing.length) return toast.error(`Please fill all required fields: ${missing.join(', ')}`);
    setApplying(true);
    try {
      await api.post(`/opportunities/${id}/apply`, appForm);
      toast.success('Application submitted successfully! 🎉');
      setShowForm(false);
      setHasApplied(true);
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    finally { setApplying(false); }
  };

  if (loading) return <div className="pt-16 flex items-center justify-center min-h-screen"><div className="animate-spin w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full" /></div>;
  if (!opp) return <div className="pt-16 text-center py-20">Not found</div>;

  const daysLeft = opp.deadline ? Math.max(0, Math.ceil((new Date(opp.deadline) - new Date()) / (1000 * 60 * 60 * 24))) : null;

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-purple-950 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap gap-3 mb-3">
            <span className="bg-purple-500/30 text-purple-200 text-sm px-3 py-1 rounded-full capitalize">{opp.type}</span>
            {opp.isFeatured && <span className="bg-amber-500/30 text-amber-200 text-sm px-3 py-1 rounded-full">⭐ Featured</span>}
            {daysLeft !== null && <span className={`text-sm px-3 py-1 rounded-full ${daysLeft <= 7 ? 'bg-red-500/30 text-red-200' : 'bg-white/10 text-white'}`}>⏰ {daysLeft} days left</span>}
          </div>
          <h1 className="text-3xl font-black mb-3">{opp.title}</h1>
          {opp.corporate?.companyName && (
            <div className="flex items-center gap-2 text-slate-300">
              {opp.corporate.logo && <img src={opp.corporate.logo} alt="" className="w-6 h-6 rounded" />}
              <span>Posted by {opp.corporate.companyName}</span>
            </div>
          )}
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="card p-6"><h2 className="font-bold text-slate-900 text-lg mb-3">Description</h2><p className="text-slate-600 leading-relaxed">{opp.description}</p></div>
          {opp.requirements?.length > 0 && (
            <div className="card p-6">
              <h2 className="font-bold text-slate-900 text-lg mb-3">Requirements</h2>
              <ul className="space-y-2">{opp.requirements.map((r, i) => <li key={i} className="flex items-start gap-2 text-slate-600 text-sm"><span className="text-indigo-500 mt-0.5">✓</span>{r}</li>)}</ul>
            </div>
          )}
          {opp.benefits?.length > 0 && (
            <div className="card p-6">
              <h2 className="font-bold text-slate-900 text-lg mb-3">What You Get</h2>
              <ul className="space-y-2">{opp.benefits.map((b, i) => <li key={i} className="flex items-start gap-2 text-slate-600 text-sm"><span className="text-emerald-500 mt-0.5">⭐</span>{b}</li>)}</ul>
            </div>
          )}
          {showForm && (
            <div className="card p-6">
              <h2 className="font-bold text-slate-900 text-lg mb-1">Submit Application</h2>
              <p className="text-slate-400 text-xs mb-4">Fields marked * are required</p>
              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cover Letter <span className="text-red-500">*</span></label>
                  <textarea required rows={4} value={appForm.coverLetter} onChange={e => setAppForm({...appForm, coverLetter: e.target.value})}
                    className="input resize-none" placeholder="Why is your startup the right fit for this opportunity?" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pitch Summary <span className="text-red-500">*</span></label>
                  <textarea required rows={3} value={appForm.pitch} onChange={e => setAppForm({...appForm, pitch: e.target.value})}
                    className="input resize-none" placeholder="Describe your product, traction, and what you are asking for" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone / WhatsApp <span className="text-red-500">*</span></label>
                    <input required className="input" placeholder="+91 9876543210" value={appForm.phone} onChange={e => setAppForm({...appForm, phone: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn URL <span className="text-red-500">*</span></label>
                    <input required className="input" placeholder="https://linkedin.com/in/yourprofile" value={appForm.linkedinUrl} onChange={e => setAppForm({...appForm, linkedinUrl: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Website / Portfolio</label>
                    <input className="input" placeholder="https://yourstartup.com" value={appForm.portfolioUrl} onChange={e => setAppForm({...appForm, portfolioUrl: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Available to Start</label>
                    <input type="date" className="input" value={appForm.availableFrom} onChange={e => setAppForm({...appForm, availableFrom: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Team Size <span className="text-red-500">*</span></label>
                    <select required className="input" value={appForm.teamSize} onChange={e => setAppForm({...appForm, teamSize: e.target.value})}>
                      <option value="">Select team size</option>
                      {['Solo founder','2–5','6–15','16–50','50+'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Revenue Stage <span className="text-red-500">*</span></label>
                    <select required className="input" value={appForm.revenueStage} onChange={e => setAppForm({...appForm, revenueStage: e.target.value})}>
                      <option value="">Select stage</option>
                      {['Pre-revenue','₹0–₹10L MRR','₹10L–₹50L MRR','₹50L–₹2Cr MRR','₹2Cr+ MRR'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={applying} className="btn-primary flex-1">{applying ? 'Submitting...' : 'Submit Application'}</button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary px-6">Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div className="card p-5">
            {opp.budget?.min && (
              <div className="mb-4 pb-4 border-b border-slate-100">
                <p className="text-slate-500 text-sm mb-1">Budget Range</p>
                <p className="font-bold text-emerald-600 text-lg">${(opp.budget.min / 1000).toFixed(0)}K – ${(opp.budget.max / 1000).toFixed(0)}K</p>
                {opp.budget.isNegotiable && <p className="text-slate-400 text-xs">Negotiable</p>}
              </div>
            )}
            <div className="space-y-3 text-sm">
              {opp.timeline?.duration && <div className="flex justify-between"><span className="text-slate-500">Duration</span><span>{opp.timeline.duration}</span></div>}
              {opp.slots && <div className="flex justify-between"><span className="text-slate-500">Open slots</span><span className="font-semibold">{opp.slots}</span></div>}
              <div className="flex justify-between"><span className="text-slate-500">Applications</span><span>{opp.applications?.length || 0}</span></div>
              {opp.location?.remote && <div><span className="badge badge-green">🌐 Remote OK</span></div>}
            </div>
            {!showForm && (
              <div className="mt-4">
                {hasApplied ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                    <p className="text-emerald-700 font-semibold text-sm">✅ You've applied to this opportunity</p>
                    <p className="text-emerald-600 text-xs mt-1">Track status in your <a href="/dashboard/applications" className="underline">Applications</a></p>
                  </div>
                ) : opp.postedBy?._id === user?._id ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center text-slate-500 text-sm">
                    This is your opportunity
                  </div>
                ) : (
                  <button onClick={() => { if (!user) { toast.error('Please login first'); return; } setShowForm(true); }}
                    className="btn-primary w-full">Apply Now →</button>
                )}
              </div>
            )}
          </div>
          {opp.industry?.length > 0 && <div className="card p-5"><h3 className="font-bold text-slate-900 mb-3">Industries</h3><div className="flex flex-wrap gap-2">{opp.industry.map(i => <span key={i} className="badge badge-blue">{i}</span>)}</div></div>}
          {opp.requiredStage?.length > 0 && <div className="card p-5"><h3 className="font-bold text-slate-900 mb-3">Required Stage</h3><div className="flex flex-wrap gap-2">{opp.requiredStage.map(s => <span key={s} className="badge badge-purple capitalize">{s}</span>)}</div></div>}
        </div>
      </div>
    </div>
  );
}

export function EventDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => { api.get(`/events/${id}`).then(r => setEvent(r.data)).finally(() => setLoading(false)); }, [id]);

  const handleRegister = async () => {
    if (!user) return toast.error('Please login first');
    setRegistering(true);
    try { await api.post(`/events/${id}/register`); toast.success('Registered! 🎉'); setEvent(prev => ({ ...prev, registrations: [...(prev.registrations || []), { user: user._id }] })); }
    catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    finally { setRegistering(false); }
  };

  if (loading) return <div className="pt-16 flex items-center justify-center min-h-screen"><div className="animate-spin w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full" /></div>;
  if (!event) return <div className="pt-16 text-center py-20">Not found</div>;

  const isRegistered = user && event.registrations?.some(r => r.user === user._id || r.user?._id === user._id);

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-amber-950 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <span className="bg-amber-500/30 text-amber-200 text-sm px-3 py-1 rounded-full capitalize mb-3 inline-block">{event.type}</span>
          <h1 className="text-3xl font-black mb-3">{event.title}</h1>
          <div className="flex flex-wrap gap-4 text-slate-300 text-sm">
            <span>📅 {new Date(event.date).toLocaleString()}</span>
            <span>{event.isOnline ? '🌐 Online' : `📍 ${event.location}`}</span>
            <span>💰 {event.price === 0 ? 'Free' : `$${event.price}`}</span>
            <span>👥 {event.registrations?.length || 0}{event.capacity ? `/${event.capacity}` : ''} registered</span>
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {event.description && <div className="card p-6"><h2 className="font-bold text-slate-900 text-lg mb-3">About</h2><p className="text-slate-600">{event.description}</p></div>}
          {event.agenda?.length > 0 && (
            <div className="card p-6">
              <h2 className="font-bold text-slate-900 text-lg mb-4">📋 Agenda</h2>
              {event.agenda.map((item, i) => (
                <div key={i} className="flex gap-4 mb-4 pb-4 border-b border-slate-100 last:border-0 last:mb-0 last:pb-0">
                  <span className="text-slate-400 text-sm font-mono w-20 flex-shrink-0">{item.time}</span>
                  <div><p className="font-semibold text-slate-900 text-sm">{item.title}</p>{item.description && <p className="text-slate-500 text-xs mt-1">{item.description}</p>}</div>
                </div>
              ))}
            </div>
          )}
          {event.speakers?.length > 0 && (
            <div className="card p-6">
              <h2 className="font-bold text-slate-900 text-lg mb-4">🎤 Speakers</h2>
              <div className="grid grid-cols-2 gap-4">
                {event.speakers.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">{s.name?.[0]}</div>
                    <div><p className="font-semibold text-slate-900 text-sm">{s.name}</p><p className="text-slate-500 text-xs">{s.role}, {s.company}</p></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-bold text-slate-900 mb-4">Register</h3>
            {isRegistered ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <p className="text-emerald-700 font-semibold">✓ You're registered!</p>
                {event.isOnline && event.meetingLink && <a href={event.meetingLink} target="_blank" rel="noreferrer" className="btn-primary block mt-3 text-sm">Join Event →</a>}
              </div>
            ) : (
              <button onClick={handleRegister} disabled={registering} className="btn-primary w-full">
                {registering ? 'Registering...' : event.price === 0 ? 'Register Free' : `Register - $${event.price}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FundingDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [round, setRound] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get(`/funding/${id}`).then(r => setRound(r.data)).finally(() => setLoading(false)); }, [id]);

  const handleInterest = async () => {
    if (!user) return toast.error('Please login first');
    try {
      await api.post(`/funding/${id}/express-interest`, { amount: round.minInvestment || 50000 });
      toast.success('Interest registered! The startup will be in touch.');
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
  };

  if (loading) return <div className="pt-16 flex items-center justify-center min-h-screen"><div className="animate-spin w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full" /></div>;
  if (!round) return <div className="pt-16 text-center py-20">Not found</div>;

  const progress = round.targetAmount ? Math.min(100, Math.round((round.raisedAmount / round.targetAmount) * 100)) : 0;

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-green-950 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <span className="bg-green-500/30 text-green-200 text-sm px-3 py-1 rounded-full capitalize mb-3 inline-block">{round.roundType}</span>
          <h1 className="text-3xl font-black mb-2">{round.title}</h1>
          <p className="text-slate-300">{round.startup?.companyName} · {round.startup?.industry}</p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="font-bold text-slate-900 text-lg mb-4">Funding Progress</h2>
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>Raised: <strong className="text-emerald-600">${(round.raisedAmount / 1000000).toFixed(2)}M</strong></span>
              <span>Target: <strong>${(round.targetAmount / 1000000).toFixed(2)}M</strong></span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-sm text-slate-500 mt-2">{progress}% funded · {round.investors?.length || 0} investors</p>
          </div>
          {round.highlights?.length > 0 && (
            <div className="card p-6">
              <h2 className="font-bold text-slate-900 text-lg mb-4">Highlights</h2>
              <div className="grid grid-cols-2 gap-3">{round.highlights.map((h, i) => <div key={i} className="bg-indigo-50 rounded-xl p-3 text-sm font-medium text-indigo-700">✓ {h}</div>)}</div>
            </div>
          )}
          {round.useOfFunds && <div className="card p-6"><h2 className="font-bold text-slate-900 text-lg mb-3">Use of Funds</h2><p className="text-slate-600">{round.useOfFunds}</p></div>}
        </div>
        <div className="space-y-4">
          <div className="card p-5">
            <div className="space-y-3 text-sm mb-4">
              {[['Target', `$${(round.targetAmount / 1000000).toFixed(1)}M`], ['Min Investment', `$${(round.minInvestment || 0).toLocaleString()}`], ['Equity', round.equity ? `${round.equity}%` : 'N/A'], ['Valuation', round.valuation ? `$${(round.valuation / 1000000).toFixed(0)}M` : 'N/A']].map(([label, value]) => (
                <div key={label} className="flex justify-between"><span className="text-slate-500">{label}</span><span className="font-semibold">{value}</span></div>
              ))}
              {round.deadline && <div className="flex justify-between"><span className="text-slate-500">Deadline</span><span className="text-red-500 font-semibold">{new Date(round.deadline).toLocaleDateString()}</span></div>}
            </div>
            <button onClick={handleInterest} className="btn-primary w-full">Express Interest →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CorporateDetailPage;
