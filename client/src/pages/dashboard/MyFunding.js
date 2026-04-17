import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

export default function MyFunding() {
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/funding/my/rounds').then(r => setRounds(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-900">Funding Rounds 💰</h1>
        <Link to="/funding" className="btn-secondary text-sm">Browse Investors</Link>
      </div>
      {loading ? (
        <div className="space-y-3">{[...Array(2)].map((_, i) => <div key={i} className="card h-32 animate-pulse bg-slate-100" />)}</div>
      ) : rounds.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-5xl mb-4">💰</p>
          <p className="text-xl mb-2">No funding rounds yet</p>
          <p className="text-sm mb-4">Create a funding round to connect with investors on Nexus</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rounds.map(r => {
            const progress = r.targetAmount ? Math.min(100, Math.round((r.raisedAmount / r.targetAmount) * 100)) : 0;
            return (
              <div key={r._id} className="card p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900">{r.title}</h3>
                    <p className="text-slate-500 text-sm capitalize">{r.roundType}</p>
                  </div>
                  <span className={`badge ${r.status === 'open' ? 'badge-green' : 'badge-yellow'} capitalize`}>{r.status}</span>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>${(r.raisedAmount / 1000000).toFixed(2)}M raised</span>
                    <span>${(r.targetAmount / 1000000).toFixed(2)}M target</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <p className="text-sm text-slate-500">{r.investors?.length || 0} investors expressed interest · {progress}% funded</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
