import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(values) {
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', values);
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in with your college account to report or claim items.">
      <p className="text-xs text-muted mb-6 bg-base-lighter rounded-lg px-3 py-2">
        Demo student login: <span className="text-coral">asha.kumar@college.edu</span> / <span className="text-coral">Student@123</span>
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="text-sm text-cream/80">College email</label>
          <input
            type="email"
            placeholder="you@college.edu"
            className="mt-1 w-full bg-base-lighter border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-coral outline-none"
            {...register('email', { required: true })}
          />
          {errors.email && <p className="text-danger text-xs mt-1">Email is required.</p>}
        </div>
        <div>
          <label className="text-sm text-cream/80">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="mt-1 w-full bg-base-lighter border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-coral outline-none"
            {...register('password', { required: true })}
          />
          {errors.password && <p className="text-danger text-xs mt-1">Password is required.</p>}
        </div>
        {error && <p className="text-danger text-sm">{error}</p>}
        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={loading}
          className="mt-2 py-3 rounded-lg bg-coral-gradient font-semibold text-base disabled:opacity-60"
        >
          {loading ? 'Logging in…' : 'Log In'}
        </motion.button>
      </form>
      <p className="text-sm text-muted text-center mt-6">
        New here? <Link to="/register" className="text-coral font-semibold">Create an account</Link>
      </p>
      <p className="text-xs text-muted text-center mt-2">
        Campus staff? <Link to="/admin/login" className="text-coral">Admin login</Link>
      </p>
    </AuthLayout>
  );
}
