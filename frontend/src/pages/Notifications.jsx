import React, { useEffect, useState } from 'react';
import { HiOutlineBell } from 'react-icons/hi';
import api from '../api/axios';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    api.get('/notifications').then(({ data }) => {
      setNotifications(data.notifications);
      setLoading(false);
    });
  }

  useEffect(() => { load(); }, []);

  async function markAllRead() {
    await api.put('/notifications/read', {});
    load();
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold">Notifications</h1>
        <button onClick={markAllRead} className="text-sm text-coral font-semibold hover:underline">Mark all as read</button>
      </div>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 text-muted">
          <HiOutlineBell size={40} className="mx-auto mb-4 text-coral/40" />
          You're all caught up.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n) => (
            <div key={n.id} className={`rounded-xl2 p-5 border ${n.read ? 'border-white/5 bg-base-light' : 'border-coral/30 bg-coral/5'}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">{n.title}</h3>
                <span className="text-xs text-muted">{new Date(n.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-sm text-muted mt-1">{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
