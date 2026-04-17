import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FundingCard } from '../components/cards';

const ROUNDS = ['All', 'pre-seed', 'seed', 'series-a', 'series-b', 'series-c', 'growth', 'bridge'];

export default function FundingPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ roundType: '', page: 1 });

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v && v !== 'All') params.set(k, v); });
    api.get(`/funding?${params}`).then(r => { setItems(r.data.rounds); setTotal(r.data.total); }).finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="pt-16 min-h-screen">
      <div className="bg-gradient-to-br from-slate-900 to-green-950 text-white py-14 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-black mb-3">Funding Opportunities 💰</h1>
          <p className="text-slate-400 text-lg">Active funding rounds from verified startups</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-2 mb-6">
          {ROUNDS.map(r => (
            <button key={r} onClick={() => setFilters({...filters, roundType: r === 'All' ? '' : r, page: 1})}
              className={`px-3 py-1 rounded-full text-sm font-medium capitalize transition-colors ${filters.roundType === (r === 'All' ? '' : r) ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{r}</button>
          ))}
        </div>
        <p className="text-slate-500 text-sm mb-6">{total} open funding rounds</p>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="card p-5 h-48 animate-pulse bg-slate-100" />)}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-slate-400"><div className="text-5xl mb-4">💰</div><p className="text-xl">No open funding rounds</p></div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{items.map(r => <FundingCard key={r._id} round={r} />)}</div>
        )}
      </div>
    </div>
  );
}
