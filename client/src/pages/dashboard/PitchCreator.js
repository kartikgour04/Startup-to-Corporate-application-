import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export function PitchCreator() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', summary: '', problem: '', solution: '', uniqueValue: '', marketSize: '', traction: '', team: '', ask: '', pitchDeck: '', video: '', status: 'draft' });
  const [corporates, setCorporates] = useState([]);
  const [targetCorporate, setTargetCorporate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/corporates?limit=50').then(r => setCorporates(r.data.corporates || [])).catch(() => {});
  }, []);

  const handleSubmit = async (e, status = 'submitted') => {
    e.preventDefault();
    if (!form.title || !form.summary) return toast.error('Title and summary are required');
    setSaving(true);
    try {
      await api.post('/pitches', { ...form, status, targetCorporate: targetCorporate || undefined });
      toast.success(status === 'draft' ? 'Pitch saved as draft!' : 'Pitch submitted! 🎉');
      navigate('/dashboard/pitches');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating pitch');
    } finally { setSaving(false); }
  };

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Create a Pitch 🎯</h1>
        <p className="text-slate-500 text-sm mt-1">Craft a compelling pitch to send to corporate partners</p>
      </div>

      <form className="space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-slate-900">Basic Info</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Pitch Title *</label>
            <input className="input" placeholder="e.g. AI-Powered Supply Chain Optimization for TechCorp" value={form.title} onChange={e => set('title', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Target Corporate (optional)</label>
            <select className="input" value={targetCorporate} onChange={e => setTargetCorporate(e.target.value)}>
              <option value="">Select a corporate (or leave blank for general)</option>
              {corporates.map(c => <option key={c._id} value={c._id}>{c.companyName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Executive Summary *</label>
            <textarea rows={4} className="input resize-none" placeholder="A concise 2-3 sentence overview of your pitch..." value={form.summary} onChange={e => set('summary', e.target.value)} />
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-slate-900">The Story</h2>
          {[
            ['problem', 'Problem Statement', 'What problem does your startup solve?'],
            ['solution', 'Your Solution', 'How does your product/service solve it?'],
            ['uniqueValue', 'Unique Value Proposition', 'What makes you different from alternatives?'],
            ['marketSize', 'Market Opportunity', 'How big is the market? TAM/SAM/SOM...'],
            ['traction', 'Traction & Metrics', 'Revenue, customers, growth rate, key milestones...'],
            ['team', 'The Team', 'Why is your team uniquely positioned to win?'],
            ['ask', 'The Ask', 'What are you asking for? Investment, partnership, pilot terms...'],
          ].map(([key, label, ph]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
              <textarea rows={3} className="input resize-none" placeholder={ph} value={form[key]} onChange={e => set(key, e.target.value)} />
            </div>
          ))}
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-slate-900">Supporting Materials</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Pitch Deck URL</label>
            <input className="input" placeholder="https://docsend.com/..." value={form.pitchDeck} onChange={e => set('pitchDeck', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Demo Video URL</label>
            <input className="input" placeholder="https://youtube.com/..." value={form.video} onChange={e => set('video', e.target.value)} />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={(e) => handleSubmit(e, 'draft')} disabled={saving} className="btn-secondary">
            💾 Save as Draft
          </button>
          <button type="button" onClick={(e) => handleSubmit(e, 'submitted')} disabled={saving} className="btn-primary">
            {saving ? 'Submitting...' : '🚀 Submit Pitch'}
          </button>
        </div>
      </form>
    </div>
  );
}

export function PostOpportunity() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', type: 'pilot', industry: [], budget: { min: '', max: '', currency: 'USD', isNegotiable: true },
    timeline: { duration: '' }, location: { remote: true }, requirements: [], benefits: [], slots: 1,
    deadline: '', tags: []
  });
  const [saving, setSaving] = useState(false);
  const [reqInput, setReqInput] = useState('');
  const [benInput, setBenInput] = useState('');

  const TYPES = ['pilot', 'investment', 'partnership', 'acquisition', 'accelerator', 'poc', 'vendor', 'licensing'];
  const INDUSTRIES = ['Technology', 'FinTech', 'HealthTech', 'CleanTech', 'AI/ML', 'Cybersecurity', 'Logistics', 'EdTech'];

  const set = (path, value) => {
    setForm(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = copy;
      for (let i = 0; i < keys.length - 1; i++) { if (!obj[keys[i]]) obj[keys[i]] = {}; obj = obj[keys[i]]; }
      obj[keys[keys.length - 1]] = value;
      return copy;
    });
  };

  const toggleIndustry = (ind) => {
    setForm(prev => ({ ...prev, industry: prev.industry.includes(ind) ? prev.industry.filter(i => i !== ind) : [...prev.industry, ind] }));
  };

  const addReq = () => { if (reqInput.trim()) { setForm(p => ({ ...p, requirements: [...p.requirements, reqInput.trim()] })); setReqInput(''); } };
  const addBen = () => { if (benInput.trim()) { setForm(p => ({ ...p, benefits: [...p.benefits, benInput.trim()] })); setBenInput(''); } };

  const handleSubmit = async (e, status = 'active') => {
    e.preventDefault();
    if (!form.title || !form.description) return toast.error('Title and description required');
    setSaving(true);
    try {
      await api.post('/opportunities', { ...form, status, budget: { ...form.budget, min: Number(form.budget.min), max: Number(form.budget.max) } });
      toast.success('Opportunity posted! 🎉');
      navigate('/dashboard/opportunities');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Post an Opportunity 💡</h1>
        <p className="text-slate-500 text-sm mt-1">Attract the best startup applications</p>
      </div>
      <form className="space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-slate-900">Basic Details</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
            <input className="input" placeholder="e.g. AI Pilot Program - Enterprise Automation" value={form.title} onChange={e => set('title', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
            <div className="flex flex-wrap gap-2">
              {TYPES.map(t => (
                <button key={t} type="button" onClick={() => set('type', t)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${form.type === t ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
            <textarea rows={5} className="input resize-none" placeholder="Describe the opportunity, what you're looking for, and why startups should apply..." value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Target Industries</label>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map(ind => (
                <button key={ind} type="button" onClick={() => toggleIndustry(ind)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${form.industry.includes(ind) ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{ind}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-slate-900">Budget & Timeline</h2>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Min Budget ($)</label>
              <input type="number" className="input" value={form.budget.min} onChange={e => set('budget.min', e.target.value)} /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Max Budget ($)</label>
              <input type="number" className="input" value={form.budget.max} onChange={e => set('budget.max', e.target.value)} /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
              <select className="input" value={form.budget.currency} onChange={e => set('budget.currency', e.target.value)}>
                <option>USD</option><option>EUR</option><option>GBP</option><option>INR</option>
              </select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
              <input className="input" placeholder="e.g. 3 months, 12 weeks" value={form.timeline.duration} onChange={e => set('timeline.duration', e.target.value)} /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Deadline</label>
              <input type="date" className="input" value={form.deadline} onChange={e => set('deadline', e.target.value)} /></div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="remote" checked={form.location.remote} onChange={e => set('location.remote', e.target.checked)} />
            <label htmlFor="remote" className="text-sm text-slate-700">Remote applications accepted</label>
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Open Slots</label>
            <input type="number" min={1} max={100} className="input w-24" value={form.slots} onChange={e => set('slots', Number(e.target.value))} /></div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-slate-900">Requirements & Benefits</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Requirements</label>
            <div className="flex gap-2 mb-2">
              <input className="input flex-1" placeholder="Add a requirement..." value={reqInput} onChange={e => setReqInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addReq())} />
              <button type="button" onClick={addReq} className="btn-outline px-3">+</button>
            </div>
            <div className="flex flex-wrap gap-2">{form.requirements.map((r, i) => <span key={i} className="badge badge-blue gap-1">{r} <button type="button" onClick={() => setForm(p => ({ ...p, requirements: p.requirements.filter((_, idx) => idx !== i) }))} className="ml-1 hover:text-red-400">×</button></span>)}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Benefits for Startups</label>
            <div className="flex gap-2 mb-2">
              <input className="input flex-1" placeholder="Add a benefit..." value={benInput} onChange={e => setBenInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addBen())} />
              <button type="button" onClick={addBen} className="btn-outline px-3">+</button>
            </div>
            <div className="flex flex-wrap gap-2">{form.benefits.map((b, i) => <span key={i} className="badge badge-green gap-1">{b} <button type="button" onClick={() => setForm(p => ({ ...p, benefits: p.benefits.filter((_, idx) => idx !== i) }))} className="ml-1 hover:text-red-400">×</button></span>)}</div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={e => handleSubmit(e, 'draft')} disabled={saving} className="btn-secondary">💾 Save Draft</button>
          <button type="button" onClick={e => handleSubmit(e, 'active')} disabled={saving} className="btn-primary">{saving ? 'Posting...' : '🚀 Publish Opportunity'}</button>
        </div>
      </form>
    </div>
  );
}

export default PitchCreator;
