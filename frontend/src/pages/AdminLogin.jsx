import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { HiOutlineShieldCheck } from 'react-icons/hi';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';

export default function AdminLogin() {
  const { register, handleSubmit } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(values) {
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/admin-login', values);
      login(data.token, data.user);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout  accent subtitle="Restricted access for campus staff managing lost & found operations.">
      <div className="flex items-center gap-2 text-coral mb-6">
        <HiOutlineShieldCheck size={20} />
        <span className="text-xs font-semibold uppercase tracking-wide">Staff-only area</span>
      </div>
      <p className="text-xs text-muted mb-6 bg-base-lighter rounded-lg px-3 py-2">
        Demo admin login: <span className="text-coral">admin@college.edu</span> / <span className="text-coral">Admin@123</span>
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="text-sm text-cream/80">Admin email</label>
          <input
            type="email"
            className="mt-1 w-full bg-base-lighter border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-coral outline-none"
            {...register('email', { required: true })}
          />
        </div>
        <div>
          <label className="text-sm text-cream/80">Password</label>
          <input
            type="password"
            className="mt-1 w-full bg-base-lighter border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-coral outline-none"
            {...register('password', { required: true })}
          />
        </div>
        {error && <p className="text-danger text-sm">{error}</p>}
        <motion.button whileTap={{ scale: 0.97 }} disabled={loading} className="mt-2 py-3 rounded-lg bg-coral-gradient font-semibold text-base disabled:opacity-60">
          {loading ? 'Signing in…' : 'Sign in to Admin Panel'}
        </motion.button>
      </form>
      <p className="text-sm text-muted text-center mt-6">
        Not staff? <Link to="/login" className="text-coral font-semibold">Student login</Link>
      </p>
    </AuthLayout>
  );
}
