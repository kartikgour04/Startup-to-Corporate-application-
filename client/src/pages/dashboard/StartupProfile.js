import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const INDUSTRIES = ['Technology / IT', 'FinTech', 'HealthTech', 'EdTech', 'AgriTech', 'CleanTech', 'E-Commerce', 'Logistics', 'SaaS', 'AI / ML', 'Cybersecurity', 'Gaming', 'Media & Entertainment', 'Real Estate', 'Manufacturing', 'Pharma', 'GovTech', 'Other'];
const STAGES = ['idea', 'mvp', 'early-stage', 'growth', 'scaling', 'established'];
const TEAM_SIZES = ['1-5', '6-10', '11-25', '26-50', '50+'];

export default function StartupProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [teamMember, setTeamMember] = useState({ name: '', role: '', linkedin: '', bio: '' });

  useEffect(() => {
    api.get('/startups/my/profile').then(r => {
      setProfile(r.data || {});
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const r = await api.put('/startups/my/profile', profile);
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

  const addTeamMember = () => {
    if (!teamMember.name) return toast.error('Name required');
    setProfile(prev => ({ ...prev, team: [...(prev.team || []), teamMember] }));
    setTeamMember({ name: '', role: '', linkedin: '', bio: '' });
  };

  const removeTeamMember = (i) => setProfile(prev => ({ ...prev, team: prev.team.filter((_, idx) => idx !== i) }));

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>;

  const tabs = ['basic', 'story', 'traction', 'funding', 'team', 'media'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Startup Profile 🚀</h1>
          <p className="text-slate-500 text-sm mt-1">Profile completion: <span className="font-semibold text-indigo-600">{profile?.profileCompletion || 0}%</span></p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : '💾 Save Changes'}</button>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500" style={{ width: `${profile?.profileCompletion || 0}%` }} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap border-b border-slate-200 pb-2">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{tab}</button>
        ))}
      </div>

      {/* Basic Info */}
      {activeTab === 'basic' && (
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-slate-900">Basic Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
              <input className="input" value={profile?.companyName || ''} onChange={e => set('companyName', e.target.value)} /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Tagline</label>
              <input className="input" placeholder="One-liner pitch..." value={profile?.tagline || ''} onChange={e => set('tagline', e.target.value)} /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Industry *</label>
              <select className="input" value={profile?.industry || ''} onChange={e => set('industry', e.target.value)}>
                <option value="">Select industry</option>
                {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
              </select></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Stage *</label>
              <select className="input" value={profile?.stage || ''} onChange={e => set('stage', e.target.value)}>
                <option value="">Select stage</option>
                {STAGES.map(s => <option key={s}>{s}</option>)}
              </select></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Founded Year</label>
              <input type="number" className="input" placeholder="2022" value={profile?.foundedYear || ''} onChange={e => set('foundedYear', e.target.value)} /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Team Size</label>
              <select className="input" value={profile?.teamSize || ''} onChange={e => set('teamSize', e.target.value)}>
                <option value="">Select size</option>
                {TEAM_SIZES.map(s => <option key={s}>{s}</option>)}
              </select></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
              <input className="input" placeholder="https://yoursite.com" value={profile?.website || ''} onChange={e => set('website', e.target.value)} /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Logo URL</label>
              <input className="input" placeholder="https://logo.url" value={profile?.logo || ''} onChange={e => set('logo', e.target.value)} /></div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">City</label>
              <input className="input" list="cities-list" value={profile?.location?.city || ''} onChange={e => set('location.city', e.target.value)} placeholder="e.g. Mumbai, Bangalore..." />
              <datalist id="cities-list">{['Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Pune','Ahmedabad','Kolkata','Noida','Gurugram','Jaipur','Indore','Chandigarh','Kochi','Bhubaneswar'].map(c => <option key={c} value={c} />)}</datalist>
            </div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">State</label>
              <select className="input" value={profile?.location?.state || ''} onChange={e => set('location.state', e.target.value)}>
                <option value="">Select state</option>
                {['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Chandigarh','Puducherry','Jammu & Kashmir','Other'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input type="checkbox" id="remote" checked={profile?.location?.remote || false} onChange={e => set('location.remote', e.target.checked)} />
              <label htmlFor="remote" className="text-sm text-slate-700">Remote-first company</label>
            </div>
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Technologies (comma-separated)</label>
            <input className="input" placeholder="React, Node.js, Python..." value={(profile?.technologies || []).join(', ')} onChange={e => set('technologies', e.target.value.split(',').map(t => t.trim()).filter(Boolean))} /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Tags (comma-separated)</label>
            <input className="input" placeholder="AI, B2B, SaaS..." value={(profile?.tags || []).join(', ')} onChange={e => set('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))} /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea rows={4} className="input resize-none" placeholder="Describe your startup..." value={profile?.description || ''} onChange={e => set('description', e.target.value)} /></div>
        </div>
      )}

      {/* Story */}
      {activeTab === 'story' && (
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-slate-900">Your Story</h2>
          {[['problemStatement', 'Problem Statement', 'What problem are you solving?'],
            ['solution', 'Solution', 'How does your product solve it?'],
            ['targetMarket', 'Target Market', 'Who are your ideal customers?'],
            ['businessModel', 'Business Model', 'How do you make money?']
          ].map(([key, label, placeholder]) => (
            <div key={key}><label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
              <textarea rows={3} className="input resize-none" placeholder={placeholder} value={profile?.[key] || ''} onChange={e => set(key, e.target.value)} /></div>
          ))}
        </div>
      )}

      {/* Traction */}
      {activeTab === 'traction' && (
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-slate-900">Traction & Metrics</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[['traction.revenue', 'Revenue / ARR', '$2.4M ARR'],
              ['traction.users', 'Users / Customers', '250 enterprise clients'],
              ['traction.growth', 'Growth Rate', '280% YoY']
            ].map(([key, label, ph]) => (
              <div key={key}><label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                <input className="input" placeholder={ph} value={(profile?.traction?.[key.split('.')[1]]) || ''} onChange={e => set(key, e.target.value)} /></div>
            ))}
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Key Milestones (comma-separated)</label>
            <input className="input" placeholder="Series A closed, SOC2 certified, AWS partnership" value={(profile?.traction?.milestones || []).join(', ')} onChange={e => set('traction.milestones', e.target.value.split(',').map(t => t.trim()).filter(Boolean))} /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Pitch Deck URL</label>
            <input className="input" placeholder="https://..." value={profile?.pitchDeck || ''} onChange={e => set('pitchDeck', e.target.value)} /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Demo Video URL</label>
            <input className="input" placeholder="https://youtube.com/..." value={profile?.demoVideo || ''} onChange={e => set('demoVideo', e.target.value)} /></div>
        </div>
      )}

      {/* Funding */}
      {activeTab === 'funding' && (
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-slate-900">Funding Details</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
              <select className="input" value={profile?.funding?.currency || 'INR'} onChange={e => set('funding.currency', e.target.value)}>
                <option value="INR">₹ INR (Indian Rupee)</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
                <option value="GBP">£ GBP</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Funding Stage</label>
              <select className="input" value={profile?.funding?.stage || ''} onChange={e => set('funding.stage', e.target.value)}>
                <option value="">Select</option>
                {['Bootstrapped','Pre-Seed','Seed','Pre-Series A','Series A','Series B','Series C','Growth','Profitable'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Total Raised ({profile?.funding?.currency || 'INR'})</label>
              <input type="number" className="input" placeholder={profile?.funding?.currency === 'INR' ? 'e.g. 5000000 (50 Lakhs)' : 'e.g. 500000'} value={profile?.funding?.raised || ''} onChange={e => set('funding.raised', Number(e.target.value))} /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Currently Seeking ({profile?.funding?.currency || 'INR'})</label>
              <input type="number" className="input" placeholder={profile?.funding?.currency === 'INR' ? 'e.g. 20000000 (2 Crore)' : 'e.g. 2000000'} value={profile?.funding?.seeking || ''} onChange={e => set('funding.seeking', Number(e.target.value))} /></div>
          </div>
          {profile?.funding?.currency === 'INR' && profile?.funding?.raised > 0 && (
            <div className="bg-indigo-50 rounded-xl p-3 text-sm text-indigo-700">
              💡 Raised: {profile.funding.raised >= 10000000 ? `₹${(profile.funding.raised/10000000).toFixed(2)} Crore` : profile.funding.raised >= 100000 ? `₹${(profile.funding.raised/100000).toFixed(2)} Lakh` : `₹${profile.funding.raised.toLocaleString('en-IN')}`}
              {profile?.funding?.seeking > 0 && ` · Seeking: ${profile.funding.seeking >= 10000000 ? `₹${(profile.funding.seeking/10000000).toFixed(2)} Crore` : `₹${(profile.funding.seeking/100000).toFixed(2)} Lakh`}`}
            </div>
          )}
        </div>
      )}

      {/* Team */}
      {activeTab === 'team' && (
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-slate-900">Team Members</h2>
          {profile?.team?.map((member, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">{member.name?.[0]}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm">{member.name}</p>
                <p className="text-slate-500 text-xs">{member.role}</p>
              </div>
              <button onClick={() => removeTeamMember(i)} className="text-red-400 hover:text-red-600 text-sm">✕</button>
            </div>
          ))}
          <div className="border border-dashed border-slate-300 rounded-xl p-4 space-y-3">
            <p className="font-semibold text-slate-700 text-sm">Add Team Member</p>
            <div className="grid md:grid-cols-2 gap-3">
              <input className="input" placeholder="Full name" value={teamMember.name} onChange={e => setTeamMember({...teamMember, name: e.target.value})} />
              <input className="input" placeholder="Role / Title" value={teamMember.role} onChange={e => setTeamMember({...teamMember, role: e.target.value})} />
              <input className="input" placeholder="LinkedIn URL" value={teamMember.linkedin} onChange={e => setTeamMember({...teamMember, linkedin: e.target.value})} />
              <textarea rows={2} className="input resize-none" placeholder="Short bio" value={teamMember.bio} onChange={e => setTeamMember({...teamMember, bio: e.target.value})} />
            </div>
            <button onClick={addTeamMember} className="btn-outline text-sm">+ Add Member</button>
          </div>
        </div>
      )}

      {/* Media */}
      {activeTab === 'media' && (
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-slate-900">Social & Media Links</h2>
          {[['socialLinks.linkedin', 'LinkedIn URL'], ['socialLinks.twitter', 'Twitter / X URL'], ['socialLinks.website', 'Website']].map(([key, label]) => (
            <div key={key}><label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
              <input className="input" placeholder="https://..." value={profile?.[key.split('.')[0]]?.[key.split('.')[1]] || ''} onChange={e => set(key, e.target.value)} /></div>
          ))}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Awards (comma-separated)</p>
            <input className="input" placeholder="Y Combinator W22, TechCrunch Disrupt Winner..." value={(profile?.awards?.map(a => a.title) || []).join(', ')} onChange={e => set('awards', e.target.value.split(',').map(t => ({ title: t.trim() })).filter(a => a.title))} />
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary px-8">{saving ? 'Saving...' : '💾 Save All Changes'}</button>
      </div>
    </div>
  );
}
