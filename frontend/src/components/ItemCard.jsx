import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineLocationMarker, HiOutlineCalendar, HiOutlineBookmark } from 'react-icons/hi';
import { motion } from 'framer-motion';

const STATUS_STYLES = {
  active: 'bg-success/15 text-success',
  claim_pending: 'bg-warning/15 text-warning',
  resolved: 'bg-muted/15 text-muted'
};

const STATUS_LABEL = {
  active: 'Active',
  claim_pending: 'Claim Pending',
  resolved: 'Resolved'
};

export default function ItemCard({ item, onBookmark }) {
  const image = item.images?.[0];
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-xl2 overflow-hidden bg-base-light border border-white/5 shadow-card flex flex-col"
    >
      <div className="relative h-44 bg-base-lighter">
        {image ? (
          <img src={image} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl font-display text-coral/30">
            {item.category?.[0] || '?'}
          </div>
        )}
        <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${item.type === 'lost' ? 'bg-danger/15 text-danger' : 'bg-coral/15 text-coral'}`}>
          {item.type === 'lost' ? 'Lost' : 'Found'}
        </span>
        {onBookmark && (
          <button
            onClick={() => onBookmark(item.id)}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center hover:bg-coral/80 transition"
          >
            <HiOutlineBookmark size={16} />
          </button>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-semibold leading-snug">{item.title}</h3>
          <span className={`text-[11px] whitespace-nowrap px-2 py-0.5 rounded-full ${STATUS_STYLES[item.status] || STATUS_STYLES.active}`}>
            {STATUS_LABEL[item.status] || 'Active'}
          </span>
        </div>
        <p className="text-xs text-muted">{item.category}</p>
        <div className="flex flex-col gap-1 text-xs text-muted mt-1">
          <span className="flex items-center gap-1.5">
            <HiOutlineLocationMarker /> {[item.campusBlock, item.building].filter(Boolean).join(', ') || 'Location unspecified'}
          </span>
          <span className="flex items-center gap-1.5">
            <HiOutlineCalendar /> {item.dateLost}
          </span>
        </div>
        <Link
          to={`/items/${item.id}`}
          className="mt-3 text-center text-sm font-semibold py-2 rounded-lg border border-coral/40 text-coral hover:bg-coral hover:text-base transition-colors"
        >
          View details
        </Link>
      </div>
    </motion.div>
  );
}
