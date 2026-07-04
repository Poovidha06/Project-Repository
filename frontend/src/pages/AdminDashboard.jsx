import React, { useEffect, useState } from 'react';
import { HiOutlineUsers, HiOutlineExclamationCircle, HiOutlineCheckCircle, HiOutlineSparkles, HiOutlineSpeakerphone } from 'react-icons/hi';
import api from '../api/axios';

const TABS = ['Overview', 'Claims', 'Users', 'Items', 'Announcements'];

export default function AdminDashboard() {
  const [tab, setTab] = useState(0);
  const [dashboard, setDashboard] = useState(null);
  const [claims, setClaims] = useState([]);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [announcement, setAnnouncement] = useState({ title: '', message: '' });
  const [announceStatus, setAnnounceStatus] = useState('');

  function loadDashboard() { api.get('/admin/dashboard').then(({ data }) => setDashboard(data)); }
  function loadClaims() { api.get('/claims').then(({ data }) => setClaims(data.claims)); }
  function loadUsers() { api.get('/admin/users').then(({ data }) => setUsers(data.users)); }
  function loadItems() { api.get('/items?limit=100').then(({ data }) => setItems(data.items)); }

  useEffect(() => {
    loadDashboard();
    loadClaims();
    loadUsers();
    loadItems();
  }, []);

  async function reviewClaim(id, status) {
    await api.put(`/claims/${id}`, { status });
    loadClaims();
    loadDashboard();
  }

  async function suspendUser(id) {
    await api.put(`/admin/users/${id}/suspend`);
    loadUsers();
  }

  async function reinstateUser(id) {
    await api.put(`/admin/users/${id}/reinstate`);
    loadUsers();
  }

  async function deleteItem(id) {
    if (!confirm('Delete this report permanently?')) return;
    await api.delete(`/admin/items/${id}`);
    loadItems();
    loadDashboard();
  }

  async function sendAnnouncement(e) {
    e.preventDefault();
    setAnnounceStatus('');
    try {
      const { data } = await api.post('/admin/announcements', announcement);
      setAnnounceStatus(data.message);
      setAnnouncement({ title: '', message: '' });
    } catch (err) {
      setAnnounceStatus(err.response?.data?.message || 'Could not send.');
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-14">
      <h1 className="font-display text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="flex gap-2 mb-10 flex-wrap">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`px-4 py-2 rounded-full text-sm font-medium border ${tab === i ? 'bg-coral-gradient text-base border-transparent' : 'border-white/10 text-cream/70 hover:border-coral'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && dashboard && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-10">
            {Object.entries(dashboard.counts).map(([key, value]) => (
              <div key={key} className="bg-base-light border border-white/5 rounded-xl2 py-5 text-center">
                <div className="font-display text-2xl font-bold text-gradient">{value}</div>
                <div className="text-[11px] text-muted mt-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-base-light border border-white/5 rounded-xl2 p-6">
              <h3 className="font-display font-semibold mb-4">Items by category</h3>
              <div className="flex flex-col gap-2">
                {Object.entries(dashboard.charts.byCategory).map(([cat, count]) => (
                  <BarRow key={cat} label={cat} value={count} max={Math.max(...Object.values(dashboard.charts.byCategory))} />
                ))}
              </div>
            </div>
            <div className="bg-base-light border border-white/5 rounded-xl2 p-6">
              <h3 className="font-display font-semibold mb-4">Claim status breakdown</h3>
              <div className="flex flex-col gap-2">
                {Object.entries(dashboard.charts.claimStatusBreakdown).map(([status, count]) => (
                  <BarRow key={status} label={status.replace('_', ' ')} value={count} max={Math.max(1, ...Object.values(dashboard.charts.claimStatusBreakdown))} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 1 && (
        <div className="flex flex-col gap-4">
          {claims.length === 0 && <p className="text-muted">No claims submitted yet.</p>}
          {claims.map((c) => (
            <div key={c.id} className="bg-base-light border border-white/5 rounded-xl2 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{c.item?.title || 'Item removed'}</h3>
                  <p className="text-xs text-muted mt-1">Claimant: {c.claimantUser?.name} ({c.claimantUser?.email})</p>
                  <p className="text-sm text-cream/80 mt-3"><span className="text-muted">Unique marks:</span> {c.answers?.uniqueMarks}</p>
                  {c.answers?.whatWasInside && <p className="text-sm text-cream/80 mt-1"><span className="text-muted">Contents:</span> {c.answers.whatWasInside}</p>}
                  {c.answers?.additionalExplanation && <p className="text-sm text-cream/80 mt-1"><span className="text-muted">Explanation:</span> {c.answers.additionalExplanation}</p>}
                </div>
                <StatusPill status={c.status} />
              </div>
              {['pending', 'under_review'].includes(c.status) && (
                <div className="flex gap-3 mt-4">
                  <button onClick={() => reviewClaim(c.id, 'under_review')} className="px-4 py-2 rounded-lg border border-white/15 text-sm hover:border-coral">Mark Under Review</button>
                  <button onClick={() => reviewClaim(c.id, 'approved')} className="px-4 py-2 rounded-lg bg-success/90 text-base font-semibold text-sm">Approve</button>
                  <button onClick={() => reviewClaim(c.id, 'rejected')} className="px-4 py-2 rounded-lg bg-danger/90 text-base font-semibold text-sm">Reject</button>
                </div>
              )}
              {c.status === 'approved' && (
                <button onClick={() => reviewClaim(c.id, 'completed')} className="mt-4 px-4 py-2 rounded-lg border border-success text-success text-sm hover:bg-success hover:text-base">
                  Mark item as returned
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 2 && (
        <div className="bg-base-light border border-white/5 rounded-xl2 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-base-lighter text-muted text-left">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Register No.</th>
                <th className="p-4">Department</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-white/5">
                  <td className="p-4">{u.name}</td>
                  <td className="p-4 text-muted">{u.email}</td>
                  <td className="p-4 text-muted">{u.registerNumber || '—'}</td>
                  <td className="p-4 text-muted">{u.department || '—'}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${u.suspended ? 'bg-danger/15 text-danger' : 'bg-success/15 text-success'}`}>
                      {u.suspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="p-4">
                    {u.suspended ? (
                      <button onClick={() => reinstateUser(u.id)} className="text-coral text-xs font-semibold">Reinstate</button>
                    ) : (
                      <button onClick={() => suspendUser(u.id)} className="text-danger text-xs font-semibold">Suspend</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 3 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-base-light border border-white/5 rounded-xl2 p-5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-sm">{item.title}</h3>
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${item.type === 'lost' ? 'bg-danger/15 text-danger' : 'bg-coral/15 text-coral'}`}>{item.type}</span>
              </div>
              <p className="text-xs text-muted mb-3">{item.category} · {item.status}</p>
              <button onClick={() => deleteItem(item.id)} className="text-danger text-xs font-semibold">Delete report</button>
            </div>
          ))}
        </div>
      )}

      {tab === 4 && (
        <form onSubmit={sendAnnouncement} className="max-w-lg bg-base-light border border-white/5 rounded-xl2 p-8 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-coral mb-1">
            <HiOutlineSpeakerphone /> <span className="font-display font-semibold">Send announcement</span>
          </div>
          <input
            placeholder="Title"
            value={announcement.title}
            onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
            className="bg-base-lighter border border-white/10 rounded-lg px-4 py-3 text-sm"
          />
          <textarea
            placeholder="Message to all students"
            rows={4}
            value={announcement.message}
            onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })}
            className="bg-base-lighter border border-white/10 rounded-lg px-4 py-3 text-sm"
          />
          {announceStatus && <p className="text-sm text-coral">{announceStatus}</p>}
          <button className="py-3 rounded-lg bg-coral-gradient font-semibold text-base">Broadcast to all students</button>
        </form>
      )}
    </div>
  );
}

function BarRow({ label, value, max }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="capitalize text-cream/80">{label}</span>
        <span className="text-muted">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-base-lighter overflow-hidden">
        <div className="h-full bg-coral-gradient" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const STATUS_COLORS = {
  pending: 'bg-warning/15 text-warning',
  under_review: 'bg-coral/15 text-coral',
  approved: 'bg-success/15 text-success',
  rejected: 'bg-danger/15 text-danger',
  completed: 'bg-muted/15 text-muted'
};

function StatusPill({ status }) {
  return <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize whitespace-nowrap ${STATUS_COLORS[status] || ''}`}>{status?.replace('_', ' ')}</span>;
}
