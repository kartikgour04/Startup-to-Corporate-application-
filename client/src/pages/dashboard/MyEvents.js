import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

export default function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/events/my/registered').then(r => setEvents(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-900">My Events 📅</h1>
        <Link to="/events" className="btn-secondary text-sm">Browse Events</Link>
      </div>
      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="card h-20 animate-pulse bg-slate-100" />)}</div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-5xl mb-4">📅</p>
          <p className="text-xl mb-2">No events registered</p>
          <Link to="/events" className="btn-primary">Browse Upcoming Events</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {events.map(e => (
            <div key={e._id} className="card p-5">
              <span className="badge badge-purple capitalize mb-2 inline-block">{e.type}</span>
              <h3 className="font-bold text-slate-900">{e.title}</h3>
              <div className="text-sm text-slate-500 mt-2 space-y-1">
                <p>📅 {new Date(e.date).toLocaleString()}</p>
                <p>{e.isOnline ? '🌐 Online' : `📍 ${e.location}`}</p>
              </div>
              {e.isOnline && e.meetingLink && (
                <a href={e.meetingLink} target="_blank" rel="noreferrer" className="btn-primary text-xs mt-3 inline-block">Join Event →</a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
