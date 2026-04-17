import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications').then(r => {
      setNotifications(r.data.notifications);
      setUnread(r.data.unread);
    }).finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnread(0);
  };

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
  };

  const typeIcon = {
    connection_request: '🤝', connection_accepted: '✅', message: '💬',
    opportunity: '💡', application: '📋', review: '⭐', event: '📅',
    funding: '💰', system: '🔔', pitch: '🎯'
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Notifications 🔔</h1>
          {unread > 0 && <p className="text-sm text-slate-500 mt-1">{unread} unread</p>}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="btn-secondary text-sm">Mark all read</button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="card h-16 animate-pulse bg-slate-100" />)}</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-5xl mb-4">🔔</p>
          <p className="text-xl font-semibold">No notifications yet</p>
          <p className="text-sm mt-2">Connect with startups and corporates to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div
              key={n._id}
              onClick={() => !n.isRead && markRead(n._id)}
              className={`card p-4 flex items-start gap-3 cursor-pointer transition-colors ${!n.isRead ? 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100' : 'hover:bg-slate-50'}`}
            >
              <span className="text-2xl flex-shrink-0 mt-0.5">{typeIcon[n.type] || '🔔'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm">{n.title}</p>
                <p className="text-slate-600 text-sm mt-0.5">{n.message}</p>
                <p className="text-slate-400 text-xs mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!n.isRead && (
                <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full flex-shrink-0 mt-1.5" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
