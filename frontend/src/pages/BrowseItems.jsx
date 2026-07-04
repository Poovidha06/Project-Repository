import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HiOutlineSearch, HiOutlineFilter } from 'react-icons/hi';
import api from '../api/axios';
import ItemCard from '../components/ItemCard';
import { CATEGORIES, CAMPUS_BLOCKS } from '../data/categories';

export default function BrowseItems() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [q, setQ] = useState(searchParams.get('q') || '');
  const type = searchParams.get('type') || '';
  const category = searchParams.get('category') || '';
  const campusBlock = searchParams.get('campusBlock') || '';

  const fetchItems = useCallback(() => {
    setLoading(true);
    const params = { q, type, category, campusBlock, page };
    Object.keys(params).forEach((k) => !params[k] && delete params[k]);
    api
      .get('/items', { params })
      .then(({ data }) => {
        setItems(data.items);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [q, type, category, campusBlock, page]);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => { setPage(1); }, [q, type, category, campusBlock]);

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next);
  }

  async function handleBookmark(itemId) {
    try {
      await api.post(`/items/${itemId}/bookmark`);
    } catch {
      // silently ignore if not logged in
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-14">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Browse Items</h1>
          <p className="text-muted mt-1">{total} item{total !== 1 && 's'} reported so far</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, brand, color, keyword…"
              className="pl-10 pr-4 py-2.5 rounded-full bg-base-light border border-white/10 text-sm w-72 focus:border-coral outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters((s) => !s)}
            className="px-4 py-2.5 rounded-full border border-white/10 flex items-center gap-2 text-sm hover:border-coral"
          >
            <HiOutlineFilter /> Filters
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {['', 'lost', 'found'].map((t) => (
          <button
            key={t || 'all'}
            onClick={() => updateParam('type', t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border ${type === t ? 'bg-coral-gradient text-base border-transparent' : 'border-white/10 text-cream/70 hover:border-coral'}`}
          >
            {t ? t[0].toUpperCase() + t.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {showFilters && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8 bg-base-light border border-white/5 rounded-xl2 p-5">
          <div>
            <label className="text-xs text-muted">Category</label>
            <select
              value={category}
              onChange={(e) => updateParam('category', e.target.value)}
              className="mt-1 w-full bg-base-lighter border border-white/10 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted">Campus block</label>
            <select
              value={campusBlock}
              onChange={(e) => updateParam('campusBlock', e.target.value)}
              className="mt-1 w-full bg-base-lighter border border-white/10 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All blocks</option>
              {CAMPUS_BLOCKS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton rounded-xl2 h-72" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-muted">
          <p className="text-lg mb-2">No items match your search.</p>
          <p className="text-sm">Try a different keyword or clear your filters.</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} onBookmark={handleBookmark} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 rounded-full text-sm ${page === i + 1 ? 'bg-coral-gradient text-base font-semibold' : 'border border-white/10 text-cream/70'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
