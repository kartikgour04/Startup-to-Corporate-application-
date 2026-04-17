import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { CorporateCard } from '../components/cards';

const INDUSTRIES = ['All', 'Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Retail', 'Energy', 'Logistics'];
const SIZES = ['All', '50-200', '201-500', '501-1000', '1001-5000', '5000+'];

export default function CorporatesPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ industry: '', size: '', search: '', page: 1 });

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v && v !== 'All') params.set(k, v); });
    api.get(`/corporates?${params}`).then(r => { setItems(r.data.corporates); setTotal(r.data.total); }).finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="pt-16 min-h-screen">
      <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white py-14 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-black mb-3">Corporate Partners 🏢</h1>
          <p className="text-slate-400 text-lg mb-6">Connect with Fortune 500s and leading enterprises seeking innovation</p>
          <input value={filters.search} onChange={e => setFilters({...filters, search: e.target.value, page: 1})}
            placeholder="Search corporates by name, industry..."
            className="w-full max-w-xl px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-2 mb-6">
          {INDUSTRIES.map(i => (
            <button key={i} onClick={() => setFilters({...filters, industry: i === 'All' ? '' : i, page: 1})}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filters.industry === (i === 'All' ? '' : i) ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{i}</button>
          ))}
        </div>
        <p className="text-slate-500 text-sm mb-6">{total} corporates found</p>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="card p-5 h-56 animate-pulse bg-slate-100" />)}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-slate-400"><div className="text-5xl mb-4">🏢</div><p className="text-xl">No corporates found</p></div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{items.map(c => <CorporateCard key={c._id} corporate={c} />)}</div>
        )}
      </div>
    </div>
  );
}
