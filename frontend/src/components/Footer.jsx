import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 font-display font-bold text-lg mb-3">
            <span className="w-7 h-7 rounded-lg bg-coral-gradient flex items-center justify-center text-sm font-black text-base">F</span>
            Find<span className="text-gradient">It</span>
          </div>
          <p className="text-sm text-muted">Helping students find their belongings faster, one report at a time.</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3 text-cream/90">Browse</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link to="/browse?type=lost" className="hover:text-coral">Lost items</Link></li>
            <li><Link to="/browse?type=found" className="hover:text-coral">Found items</Link></li>
            <li><Link to="/report/lost" className="hover:text-coral">Report lost</Link></li>
            <li><Link to="/report/found" className="hover:text-coral">Report found</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3 text-cream/90">Account</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link to="/login" className="hover:text-coral">Student login</Link></li>
            <li><Link to="/register" className="hover:text-coral">Register</Link></li>
            <li><Link to="/admin/login" className="hover:text-coral">Admin login</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3 text-cream/90">Campus</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li>Security Office · Block C</li>
            <li>Mon–Sat, 9am–6pm</li>
            <li>lostfound@college.edu</li>
          </ul>
        </div>
      </div>
      <div className="text-center text-xs text-muted pb-8">© {new Date().getFullYear()} FindIt Campus Lost &amp; Found. Built for students, by students.</div>
    </footer>
  );
}
