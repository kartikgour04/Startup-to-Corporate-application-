import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function ConnectionsPage() {
  const { user } = useAuthStore();
  const [connections, setConnections] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('connections');

  useEffect(() => {
    Promise.all([
      api.get('/connections').then(r => setConnections(r.data)),
      api.get('/connections/requests').then(r => setRequests(r.data))
    ]).finally(() => setLoading(false));
  }, []);

  const handleRequest = async (id, action) => {
    try {
      await api.put(`/connections/${id}/${action}`);
      setRequests(prev => prev.filter(r => r._id !== id));
      if (action === 'accept') {
        toast.success('Connection accepted! 🤝');
        api.get('/connections').then(r => setConnections(r.data));
      } else {
        toast.success('Request declined');
      }
    } catch { toast.error('Something went wrong'); }
  };

  const handleMessage = async (userId) => {
    try {
      const r = await api.post('/messages/conversations', { userId });
      window.location.href = `/dashboard/messages?conv=${r.data._id}`;
    } catch { toast.error('Error opening conversation'); }
  };

  const getOther = (conn) => {
    if (!conn.requester || !conn.recipient) return null;
    return conn.requester._id === user._id ? conn.recipient : conn.requester;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-black text-slate-900">Connections 🤝</h1>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {['connections', 'requests'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
            {t}
            {t === 'requests' && requests.length > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{requests.length}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="card h-24 animate-pulse bg-slate-100" />)}</div>
      ) : (
        <>
          {tab === 'connections' && (
            connections.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <p className="text-4xl mb-4">🤝</p>
                <p className="text-lg font-semibold">No connections yet</p>
                <p className="text-sm mt-2">Browse startups or corporates and send connection requests</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {connections.map(conn => {
                  const other = getOther(conn);
                  if (!other) return null;
                  return (
                    <div key={conn._id} className="card p-4 flex items-center gap-3">
                      <img
                        src={other.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(other.name || 'U')}&background=6366f1&color=fff`}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0" alt={other.name}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900">{other.name}</p>
                        <p className="text-slate-500 text-sm capitalize">{other.role}</p>
                        <p className="text-slate-400 text-xs">{conn.type} · {new Date(conn.connectedAt || conn.createdAt).toLocaleDateString()}</p>
                      </div>
                      <button onClick={() => handleMessage(other._id)} className="btn-outline text-xs py-1.5 px-3 flex-shrink-0">
                        💬 Message
                      </button>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {tab === 'requests' && (
            requests.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <p className="text-4xl mb-4">📥</p>
                <p className="text-lg">No pending requests</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map(req => (
                  <div key={req._id} className="card p-4 flex items-center gap-3">
                    <img
                      src={req.requester.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.requester.name || 'U')}&background=6366f1&color=fff`}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0" alt={req.requester.name}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900">{req.requester.name}</p>
                      <p className="text-slate-500 text-sm capitalize">{req.requester.role}</p>
                      {req.message && <p className="text-slate-400 text-xs mt-1 italic">"{req.message}"</p>}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => handleRequest(req._id, 'accept')} className="btn-primary text-xs py-1.5 px-3">Accept</button>
                      <button onClick={() => handleRequest(req._id, 'reject')} className="btn-secondary text-xs py-1.5 px-3">Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
