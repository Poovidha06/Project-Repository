import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import ItemCard from '../components/ItemCard';

const TABS = ['Lost Reports', 'Found Reports', 'My Claims', 'Bookmarks'];

export default function MyReports() {
  const [tab, setTab] = useState(0);
  const [data, setData] = useState({ lost: [], found: [], bookmarks: [] });
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    api.get('/items/user/mine').then(({ data }) => setData(data));
    api.get('/claims/mine').then(({ data }) => setClaims(data.claims));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-14">
      <h1 className="font-display text-3xl font-bold mb-8">My Reports</h1>

      <div className="flex gap-2 mb-8 flex-wrap">
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

      {tab === 0 && <ItemGrid items={data.lost} empty="You haven't reported any lost items yet." />}
      {tab === 1 && <ItemGrid items={data.found} empty="You haven't reported any found items yet." />}
      {tab === 3 && <ItemGrid items={data.bookmarks} empty="No bookmarked items yet." />}

      {tab === 2 && (
        claims.length === 0 ? (
          <p className="text-muted">You haven't submitted any claims yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {claims.map((c) => (
              <div key={c.id} className="bg-base-light border border-white/5 rounded-xl2 p-5 flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold">{c.item?.title || 'Item removed'}</div>
                  <div className="text-xs text-muted mt-1">Submitted {new Date(c.createdAt).toLocaleDateString()}</div>
                  {c.adminRemarks && <div className="text-xs text-cream/70 mt-1">Admin note: {c.adminRemarks}</div>}
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

function ItemGrid({ items, empty }) {
  if (!items?.length) return <p className="text-muted">{empty}</p>;
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => <ItemCard key={item.id} item={item} />)}
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

function StatusBadge({ status }) {
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize whitespace-nowrap ${STATUS_COLORS[status] || ''}`}>
      {status?.replace('_', ' ')}
    </span>
  );
}
