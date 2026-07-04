import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { HiOutlineLocationMarker, HiOutlineCalendar, HiOutlineGift, HiOutlineSparkles } from 'react-icons/hi';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ItemCard from '../components/ItemCard';

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [matches, setMatches] = useState([]);
  const [claimOpen, setClaimOpen] = useState(false);
  const [claimSent, setClaimSent] = useState(false);
  const [claimError, setClaimError] = useState('');
  const { register, handleSubmit, reset } = useForm();
  const [proofFiles, setProofFiles] = useState([]);

  useEffect(() => {
    api.get(`/items/${id}`).then(({ data }) => setItem(data.item));
  }, [id]);

  useEffect(() => {
    if (user) {
      api.get(`/items/${id}/matches`).then(({ data }) => setMatches(data.matches)).catch(() => {});
    }
  }, [id, user]);

  async function onSubmitClaim(values) {
    setClaimError('');
    try {
      const formData = new FormData();
      formData.append('itemId', id);
      Object.entries(values).forEach(([k, v]) => formData.append(k, v));
      proofFiles.forEach((f) => formData.append('proofImages', f));
      await api.post('/claims', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setClaimSent(true);
      setClaimOpen(false);
      reset();
    } catch (err) {
      setClaimError(err.response?.data?.message || 'Could not submit claim.');
    }
  }

  if (!item) {
    return <div className="max-w-5xl mx-auto px-6 py-20 text-muted">Loading item…</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-14">
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <div className="rounded-xl2 overflow-hidden bg-base-light border border-white/5 h-80 flex items-center justify-center">
            {item.images?.[0] ? (
              <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <span className="text-6xl font-display text-coral/20">{item.category?.[0]}</span>
            )}
          </div>
          {item.images?.length > 1 && (
            <div className="flex gap-3 mt-3">
              {item.images.slice(1).map((img) => (
                <img key={img} src={img} className="w-20 h-20 rounded-lg object-cover border border-white/10" />
              ))}
            </div>
          )}
        </div>

        <div>
          <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4 ${item.type === 'lost' ? 'bg-danger/15 text-danger' : 'bg-coral/15 text-coral'}`}>
            {item.type === 'lost' ? 'Lost Item' : 'Found Item'}
          </span>
          <h1 className="font-display text-3xl font-bold mb-2">{item.title}</h1>
          <p className="text-muted mb-6">{item.description}</p>

          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            <Detail label="Category" value={item.category} />
            <Detail label="Brand" value={item.brand || '—'} />
            <Detail label="Color" value={item.color || '—'} />
            <Detail label="Date" value={item.dateLost} />
            <Detail label="Location" value={[item.campusBlock, item.building].filter(Boolean).join(', ') || '—'} />
            <Detail label="Status" value={item.status?.replace('_', ' ')} />
            {item.reward && <Detail label="Reward" value={item.reward} />}
          </div>

          {item.type === 'lost' && item.reward && (
            <div className="flex items-center gap-2 text-warning text-sm mb-6">
              <HiOutlineGift /> Reward offered for return
            </div>
          )}

          {user?.role === 'student' && item.type === 'found' && item.status === 'active' && (
            <button
              onClick={() => setClaimOpen((o) => !o)}
              className="px-6 py-3 rounded-full bg-coral-gradient text-base font-semibold shadow-glow"
            >
              This is mine — Claim it
            </button>
          )}
          {!user && item.type === 'found' && (
            <Link to="/login" className="px-6 py-3 inline-block rounded-full border border-white/15 font-semibold hover:border-coral">
              Log in to claim this item
            </Link>
          )}
          {claimSent && <p className="text-success text-sm mt-4">Claim submitted! You'll be notified once admin reviews it.</p>}
        </div>
      </div>

      {claimOpen && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit(onSubmitClaim)}
          className="mt-10 bg-base-light border border-white/5 rounded-xl2 p-8 flex flex-col gap-4"
        >
          <h3 className="font-display text-xl font-semibold">Proof of ownership</h3>
          <div>
            <label className="text-sm text-cream/80">Describe unique marks</label>
            <textarea rows={2} className="mt-1 w-full bg-base-lighter border border-white/10 rounded-lg px-4 py-3 text-sm" {...register('uniqueMarks', { required: true })} />
          </div>
          <div>
            <label className="text-sm text-cream/80">What was inside / with it?</label>
            <textarea rows={2} className="mt-1 w-full bg-base-lighter border border-white/10 rounded-lg px-4 py-3 text-sm" {...register('whatWasInside')} />
          </div>
          <div>
            <label className="text-sm text-cream/80">Purchase proof (optional)</label>
            <input className="mt-1 w-full bg-base-lighter border border-white/10 rounded-lg px-4 py-3 text-sm" placeholder="Order ID, receipt reference, etc." {...register('purchaseProof')} />
          </div>
          <div>
            <label className="text-sm text-cream/80">Additional explanation</label>
            <textarea rows={2} className="mt-1 w-full bg-base-lighter border border-white/10 rounded-lg px-4 py-3 text-sm" {...register('additionalExplanation')} />
          </div>
          <div>
            <label className="text-sm text-cream/80">Upload supporting image (optional)</label>
            <input type="file" multiple accept="image/*" onChange={(e) => setProofFiles(Array.from(e.target.files))} className="mt-1 text-sm text-muted" />
          </div>
          {claimError && <p className="text-danger text-sm">{claimError}</p>}
          <button className="mt-2 py-3 rounded-lg bg-coral-gradient font-semibold text-base">Submit Claim</button>
        </motion.form>
      )}

      {matches.length > 0 && (
        <div className="mt-14">
          <h3 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
            <HiOutlineSparkles className="text-coral" /> Possible matches
          </h3>
          <div className="grid sm:grid-cols-2 gap-6">
            {matches.map((m) => {
              const other = m.lostItem.id === item.id ? m.foundItem : m.lostItem;
              return other ? <ItemCard key={m.id} item={other} /> : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <div className="text-xs text-muted uppercase tracking-wide">{label}</div>
      <div className="text-cream/90 capitalize">{value}</div>
    </div>
  );
}
