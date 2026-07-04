import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { HiOutlineBell, HiOutlineMenu, HiOutlineX, HiOutlineSearch } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${isActive ? 'text-coral' : 'text-cream/70 hover:text-cream'}`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    api
      .get('/notifications')
      .then(({ data }) => setUnread(data.unreadCount))
      .catch(() => {});
  }, [user]);

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl">
          <span className="w-8 h-8 rounded-lg bg-coral-gradient flex items-center justify-center text-base font-black">F</span>
          Find<span className="text-gradient">It</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          <NavLink to="/" className={navLinkClass} end>Home</NavLink>
          <NavLink to="/browse?type=lost" className={navLinkClass}>Lost Items</NavLink>
          <NavLink to="/browse?type=found" className={navLinkClass}>Found Items</NavLink>
          {user?.role === 'student' && (
            <>
              <NavLink to="/report/lost" className={navLinkClass}>Report Lost</NavLink>
              <NavLink to="/report/found" className={navLinkClass}>Report Found</NavLink>
              <NavLink to="/my-reports" className={navLinkClass}>My Reports</NavLink>
            </>
          )}
          {user?.role === 'admin' && <NavLink to="/admin" className={navLinkClass}>Admin Dashboard</NavLink>}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link to="/notifications" className="relative text-cream/80 hover:text-coral transition-colors">
                <HiOutlineBell size={22} />
                {unread > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-coral text-[10px] leading-none rounded-full w-4 h-4 flex items-center justify-center font-semibold">
                    {unread}
                  </span>
                )}
              </Link>
              <Link to="/profile" className="w-9 h-9 rounded-full bg-base-lighter border border-white/10 flex items-center justify-center text-sm font-semibold hover:border-coral transition-colors">
                {user.name?.[0]?.toUpperCase() || 'U'}
              </Link>
              <button onClick={handleLogout} className="text-sm text-cream/60 hover:text-coral">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-cream/80 hover:text-coral">Student Login</Link>
              <Link to="/admin/login" className="text-sm font-medium text-cream/60 hover:text-coral">Admin</Link>
              <Link to="/register" className="px-4 py-2 rounded-full bg-coral-gradient text-base-DEFAULT text-sm font-semibold shadow-glow hover:opacity-90 transition">
                Get Started
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden text-cream" onClick={() => setOpen((o) => !o)}>
          {open ? <HiOutlineX size={24} /> : <HiOutlineMenu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden px-6 pb-6 flex flex-col gap-4 border-t border-white/5">
          <NavLink to="/" className={navLinkClass} onClick={() => setOpen(false)} end>Home</NavLink>
          <NavLink to="/browse?type=lost" className={navLinkClass} onClick={() => setOpen(false)}>Lost Items</NavLink>
          <NavLink to="/browse?type=found" className={navLinkClass} onClick={() => setOpen(false)}>Found Items</NavLink>
          {user?.role === 'student' && (
            <>
              <NavLink to="/report/lost" className={navLinkClass} onClick={() => setOpen(false)}>Report Lost</NavLink>
              <NavLink to="/report/found" className={navLinkClass} onClick={() => setOpen(false)}>Report Found</NavLink>
              <NavLink to="/my-reports" className={navLinkClass} onClick={() => setOpen(false)}>My Reports</NavLink>
              <NavLink to="/notifications" className={navLinkClass} onClick={() => setOpen(false)}>Notifications</NavLink>
              <NavLink to="/profile" className={navLinkClass} onClick={() => setOpen(false)}>Profile</NavLink>
            </>
          )}
          {user?.role === 'admin' && <NavLink to="/admin" className={navLinkClass} onClick={() => setOpen(false)}>Admin Dashboard</NavLink>}
          {user ? (
            <button onClick={handleLogout} className="text-left text-sm text-coral">Logout</button>
          ) : (
            <div className="flex gap-4 pt-2">
              <Link to="/login" className="text-sm text-cream/80" onClick={() => setOpen(false)}>Student Login</Link>
              <Link to="/admin/login" className="text-sm text-cream/60" onClick={() => setOpen(false)}>Admin Login</Link>
              <Link to="/register" className="text-sm text-coral" onClick={() => setOpen(false)}>Register</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
