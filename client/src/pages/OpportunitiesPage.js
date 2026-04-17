import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { OpportunityCard } from '../components/cards';

const TYPES = ['All', 'pilot', 'investment', 'partnership', 'accelerator', 'poc', 'vendor', 'licensing'];

export default function OpportunitiesPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', search: '', page: 1, remote: '' });

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v && v !== 'All') params.set(k, v); });
    api.get(`/opportunities?${params}`).then(r => { setItems(r.data.opportunities); setTotal(r.data.total); }).finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="pt-16 min-h-screen">
      <div className="bg-gradient-to-br from-slate-900 to-purple-950 text-white py-14 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-black mb-3">Opportunities 💡</h1>
          <p className="text-slate-400 text-lg mb-6">Pilots, investments, partnerships, and accelerators from leading corporates</p>
          <input value={filters.search} onChange={e => setFilters({...filters, search: e.target.value, page: 1})}
            placeholder="Search opportunities..."
            className="w-full max-w-xl px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-2 mb-4">
          {TYPES.map(t => (
            <button key={t} onClick={() => setFilters({...filters, type: t === 'All' ? '' : t, page: 1})}
              className={`px-3 py-1 rounded-full text-sm font-medium capitalize transition-colors ${filters.type === (t === 'All' ? '' : t) ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{t}</button>
          ))}
          <label className="flex items-center gap-2 ml-auto text-sm text-slate-600">
            <input type="checkbox" checked={filters.remote === 'true'} onChange={e => setFilters({...filters, remote: e.target.checked ? 'true' : '', page: 1})} className="rounded" />
            Remote only
          </label>
        </div>
        <p className="text-slate-500 text-sm mb-6">{total} opportunities available</p>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="card p-5 h-56 animate-pulse bg-slate-100" />)}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-slate-400"><div className="text-5xl mb-4">💡</div><p className="text-xl">No opportunities found</p></div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{items.map(o => <OpportunityCard key={o._id} opportunity={o} />)}</div>
        )}
      </div>
    </div>
  );
}
