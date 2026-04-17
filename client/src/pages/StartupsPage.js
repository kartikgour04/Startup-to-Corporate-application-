import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { StartupCard } from '../components/cards';

const INDUSTRIES = ['All', 'Technology', 'FinTech', 'HealthTech', 'CleanTech', 'EdTech', 'AgriTech', 'Retail', 'Logistics', 'AI/ML'];
const STAGES = ['All', 'idea', 'mvp', 'early-stage', 'growth', 'scaling', 'established'];

export default function StartupsPage() {
  const [startups, setStartups] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ industry: '', stage: '', search: '', page: 1, sort: '-createdAt' });

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v && v !== 'All') params.set(k, v); });
    api.get(`/startups?${params}`).then(r => {
      setStartups(r.data.startups); setTotal(r.data.total); setPages(r.data.pages);
    }).finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="pt-16 min-h-screen">
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white py-14 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-black mb-3">Discover Startups 🚀</h1>
          <p className="text-slate-400 text-lg mb-6">Find innovative startups across every industry and stage</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <input value={filters.search} onChange={e => setFilters({...filters, search: e.target.value, page: 1})}
              placeholder="Search startups, technologies, keywords..."
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            <button onClick={() => setFilters({...filters, page: 1})} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors">Search</button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-slate-500 self-center">Industry:</span>
            {INDUSTRIES.map(i => (
              <button key={i} onClick={() => setFilters({...filters, industry: i === 'All' ? '' : i, page: 1})}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filters.industry === (i === 'All' ? '' : i) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{i}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-2 w-full">
            <span className="text-sm text-slate-500 self-center">Stage:</span>
            {STAGES.map(s => (
              <button key={s} onClick={() => setFilters({...filters, stage: s === 'All' ? '' : s, page: 1})}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filters.stage === (s === 'All' ? '' : s) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{s}</button>
            ))}
          </div>
          <select value={filters.sort} onChange={e => setFilters({...filters, sort: e.target.value, page: 1})} className="ml-auto input w-auto">
            <option value="-createdAt">Newest</option>
            <option value="-views">Most Viewed</option>
            <option value="-funding.raised">Most Funded</option>
          </select>
        </div>
        <p className="text-slate-500 text-sm mb-6">{total} startups found</p>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <div key={i} className="card p-5 h-64 animate-pulse bg-slate-100" />)}
          </div>
        ) : startups.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-xl font-semibold">No startups found</p>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {startups.map(s => <StartupCard key={s._id} startup={s} />)}
          </div>
        )}
        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {[...Array(pages)].map((_, i) => (
              <button key={i} onClick={() => setFilters({...filters, page: i + 1})}
                className={`w-10 h-10 rounded-lg font-medium transition-colors ${filters.page === i + 1 ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{i + 1}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
