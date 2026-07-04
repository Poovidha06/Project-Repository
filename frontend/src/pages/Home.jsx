import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineSearch, HiOutlineUpload, HiOutlineSparkles, HiOutlineCheckCircle, HiOutlineGift } from 'react-icons/hi';
import api from '../api/axios';
import ItemCard from '../components/ItemCard';

const STEPS = [
  { title: 'Report', desc: 'Log a lost or found item in under two minutes.', icon: HiOutlineUpload },
  { title: 'Search', desc: 'Browse or search with smart, typo-tolerant matching.', icon: HiOutlineSearch },
  { title: 'Match', desc: 'Get notified the moment a likely match appears.', icon: HiOutlineSparkles },
  { title: 'Claim', desc: 'Submit proof of ownership for admin verification.', icon: HiOutlineCheckCircle },
  { title: 'Receive Item', desc: 'Collect your belonging from the campus office.', icon: HiOutlineGift }
];

export default function Home() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    api.get('/items/stats').then(({ data }) => setStats(data)).catch(() => {});
    api.get('/items?limit=6').then(({ data }) => setRecent(data.items)).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-radial-fade">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-24 grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block text-xs font-semibold tracking-wider uppercase text-coral bg-coral/10 px-3 py-1 rounded-full mb-5">
              Campus Lost &amp; Found
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-6">
              Helping students find their belongings <span className="text-gradient">faster</span>
            </h1>
            <p className="text-muted text-lg mb-8 max-w-md">
              Report, search, and reclaim lost items across campus with smart matching and a verified claim process — no more flyers on notice boards.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/report/lost" className="px-6 py-3 rounded-full bg-coral-gradient text-base font-semibold shadow-glow hover:opacity-90 transition">
                Report Lost
              </Link>
              <Link to="/report/found" className="px-6 py-3 rounded-full border border-white/15 font-semibold hover:border-coral hover:text-coral transition">
                Report Found
              </Link>
              <Link to="/browse" className="px-6 py-3 rounded-full text-cream/70 font-semibold hover:text-coral transition">
                Browse Items →
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="relative h-80 md:h-96 flex items-center justify-center"
          >
            <HeroGraphic />
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-6 -mt-6 mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Items', value: stats?.totalItems ?? '—' },
            { label: 'Items Returned', value: stats?.itemsReturned ?? '—' },
            { label: 'Active Users', value: stats?.activeUsers ?? '—' },
            { label: 'Success Rate', value: stats ? `${stats.successRate}%` : '—' }
          ].map((s) => (
            <div key={s.label} className="glass rounded-xl2 py-6 text-center">
              <div className="font-display text-3xl font-bold text-gradient">{s.value}</div>
              <div className="text-xs text-muted mt-1 uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-6 mb-24">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-2">How it works</h2>
        <p className="text-muted text-center mb-12">Five simple steps from losing something to holding it again.</p>
        <div className="grid md:grid-cols-5 gap-6">
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-base-light border border-coral/30 flex items-center justify-center mb-4 text-coral">
                <step.icon size={26} />
              </div>
              <h3 className="font-display font-semibold mb-1">{step.title}</h3>
              <p className="text-xs text-muted">{step.desc}</p>
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-7 left-[60%] w-full h-px bg-gradient-to-r from-coral/40 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Recent items */}
      {recent.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 mb-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold">Recently reported</h2>
            <Link to="/browse" className="text-coral text-sm font-semibold hover:underline">View all →</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recent.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 mb-24">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-10">What students are saying</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Priya S.', dept: 'ECE, 2nd Year', quote: 'Got my ID card back within a day of posting. The notification when it was found was a relief.' },
            { name: 'Rahul M.', dept: 'Mechanical, Final Year', quote: 'Found a wallet near the canteen and reported it in two minutes. Nice to see the owner get it back.' },
            { name: 'Divya K.', dept: 'CSE, 3rd Year', quote: "The claim process felt secure — no one could just say \"that's mine\" without proof." }
          ].map((t) => (
            <div key={t.name} className="bg-base-light border border-white/5 rounded-xl2 p-6">
              <p className="text-sm text-cream/80 mb-4">“{t.quote}”</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-coral-gradient flex items-center justify-center font-semibold text-base text-sm">
                  {t.name[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted">{t.dept}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function HeroGraphic() {
  return (
    <svg viewBox="0 0 400 400" className="w-full h-full max-w-md" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffab91" />
          <stop offset="100%" stopColor="#e85d3f" />
        </linearGradient>
      </defs>
      <circle cx="200" cy="200" r="150" fill="none" stroke="url(#g1)" strokeOpacity="0.25" strokeWidth="1.5" />
      <circle cx="200" cy="200" r="110" fill="none" stroke="url(#g1)" strokeOpacity="0.4" strokeWidth="1.5" />
      <circle cx="200" cy="200" r="70" fill="none" stroke="url(#g1)" strokeOpacity="0.6" strokeWidth="1.5" />
      <circle cx="200" cy="200" r="14" fill="url(#g1)" />
      <circle cx="320" cy="120" r="14" fill="#ffab91" opacity="0.85" />
      <circle cx="90" cy="300" r="10" fill="#e85d3f" opacity="0.7" />
      <circle cx="330" cy="290" r="7" fill="#ffab91" opacity="0.6" />
      <polygon points="60,60 130,40 110,120" fill="url(#g1)" opacity="0.5" />
    </svg>
  );
}
