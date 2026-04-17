import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { EventCard } from '../components/cards';

const TYPES = ['All', 'webinar', 'demo-day', 'networking', 'workshop', 'summit', 'hackathon', 'pitch-contest'];

export default function EventsPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', search: '', page: 1, status: 'upcoming' });

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v && v !== 'All') params.set(k, v); });
    api.get(`/events?${params}`).then(r => { setItems(r.data.events); setTotal(r.data.total); }).finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="pt-16 min-h-screen">
      <div className="bg-gradient-to-br from-slate-900 to-amber-950 text-white py-14 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-black mb-3">Events & Summits 📅</h1>
          <p className="text-slate-400 text-lg mb-6">Webinars, Demo Days, Networking events, Hackathons and more</p>
          <div className="flex gap-2 mb-4">
            {['upcoming', 'live', 'completed'].map(s => (
              <button key={s} onClick={() => setFilters({...filters, status: s})}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${filters.status === s ? 'bg-white text-slate-900' : 'bg-white/10 text-white hover:bg-white/20'}`}>{s}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-2 mb-6">
          {TYPES.map(t => (
            <button key={t} onClick={() => setFilters({...filters, type: t === 'All' ? '' : t, page: 1})}
              className={`px-3 py-1 rounded-full text-sm font-medium capitalize transition-colors ${filters.type === (t === 'All' ? '' : t) ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{t}</button>
          ))}
        </div>
        <p className="text-slate-500 text-sm mb-6">{total} events found</p>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="card p-5 h-56 animate-pulse bg-slate-100" />)}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-slate-400"><div className="text-5xl mb-4">📅</div><p className="text-xl">No events found</p></div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{items.map(e => <EventCard key={e._id} event={e} />)}</div>
        )}
      </div>
    </div>
  );
}
