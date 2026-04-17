import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Retail', 'Energy', 'Logistics', 'Other'];
const SIZES = ['50-200', '201-500', '501-1000', '1001-5000', '5000+'];
const PARTNERSHIP_TYPES = ['pilot', 'investment', 'partnership', 'acquisition', 'accelerator', 'poc', 'vendor', 'licensing'];

export default function CorporateProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/corporates/my/profile').then(r => setProfile(r.data || {})).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const r = await api.put('/corporates/my/profile', profile);
      setProfile(r.data);
      toast.success('Profile saved! 🎉');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const set = (path, value) => {
    setProfile(prev => {
      const copy = { ...prev };
      const keys = path.split('.');
      let obj = copy;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {};
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return copy;
    });
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Company Profile 🏢</h1>
          <p className="text-slate-500 text-sm mt-1">Profile completion: <span className="font-semibold text-emerald-600">{profile?.profileCompletion || 0}%</span></p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : '💾 Save Changes'}</button>
      </div>

      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full transition-all" style={{ width: `${profile?.profileCompletion || 0}%` }} />
      </div>

      <div className="grid gap-6">
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-slate-900">Basic Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[['companyName', 'Company Name', ''], ['tagline', 'Tagline', 'What you stand for...'], ['website', 'Website', 'https://'], ['logo', 'Logo URL', 'https://...']].map(([key, label, ph]) => (
              <div key={key}><label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                <input className="input" placeholder={ph} value={profile?.[key] || ''} onChange={e => set(key, e.target.value)} /></div>
            ))}
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
              <select className="input" value={profile?.industry || ''} onChange={e => set('industry', e.target.value)}>
                <option value="">Select</option>{INDUSTRIES.map(i => <option key={i}>{i}</option>)}
              </select></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Company Size</label>
              <select className="input" value={profile?.size || ''} onChange={e => set('size', e.target.value)}>
                <option value="">Select</option>{SIZES.map(s => <option key={s}>{s}</option>)}
              </select></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">City</label>
              <input className="input" value={profile?.location?.city || ''} onChange={e => set('location.city', e.target.value)} /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
              <input className="input" value={profile?.location?.country || ''} onChange={e => set('location.country', e.target.value)} /></div>
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea rows={4} className="input resize-none" value={profile?.description || ''} onChange={e => set('description', e.target.value)} /></div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-slate-900">Innovation Focus & Partnerships</h2>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Innovation Focus Areas (comma-separated)</label>
            <input className="input" placeholder="AI/ML, FinTech, IoT..." value={(profile?.innovationFocus || []).join(', ')} onChange={e => set('innovationFocus', e.target.value.split(',').map(t => t.trim()).filter(Boolean))} /></div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Partnership Types</label>
            <div className="flex flex-wrap gap-2">
              {PARTNERSHIP_TYPES.map(type => (
                <button key={type} type="button" onClick={() => {
                  const current = profile?.partnershipTypes || [];
                  set('partnershipTypes', current.includes(type) ? current.filter(t => t !== type) : [...current, type]);
                }} className={`px-3 py-1 rounded-full text-sm font-medium capitalize transition-colors ${(profile?.partnershipTypes || []).includes(type) ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{type}</button>
              ))}
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Min Investment Budget ($)</label>
              <input type="number" className="input" value={profile?.investmentBudget?.min || ''} onChange={e => set('investmentBudget.min', Number(e.target.value))} /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Max Investment Budget ($)</label>
              <input type="number" className="input" value={profile?.investmentBudget?.max || ''} onChange={e => set('investmentBudget.max', Number(e.target.value))} /></div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary px-8">{saving ? 'Saving...' : '💾 Save All Changes'}</button>
      </div>
    </div>
  );
}
