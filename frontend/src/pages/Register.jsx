import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'];

export default function Register() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(values) {
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', values);
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass = 'mt-1 w-full bg-base-lighter border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-coral outline-none';

  return (
    <AuthLayout title="Create your account" subtitle="Use your official college email — it's how we verify you're a member of campus.">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-sm text-cream/80">Full name</label>
            <input className={inputClass} placeholder="Asha Kumar" {...register('name', { required: true })} />
          </div>
          <div>
            <label className="text-sm text-cream/80">Register number</label>
            <input className={inputClass} placeholder="CS21B045" {...register('registerNumber')} />
          </div>
          <div>
            <label className="text-sm text-cream/80">Phone</label>
            <input className={inputClass} placeholder="98765 43210" {...register('phone')} />
          </div>
          <div>
            <label className="text-sm text-cream/80">Department</label>
            <input className={inputClass} placeholder="Computer Science" {...register('department')} />
          </div>
          <div>
            <label className="text-sm text-cream/80">Year</label>
            <select className={inputClass} {...register('year')}>
              <option value="">Select year</option>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-sm text-cream/80">College email</label>
            <input type="email" className={inputClass} placeholder="you@college.edu" {...register('email', { required: true })} />
          </div>
          <div>
            <label className="text-sm text-cream/80">Password</label>
            <input type="password" className={inputClass} placeholder="At least 8 characters" {...register('password', { required: true })} />
          </div>
          <div>
            <label className="text-sm text-cream/80">Confirm password</label>
            <input type="password" className={inputClass} placeholder="Repeat password" {...register('confirmPassword', { required: true })} />
          </div>
        </div>
        {error && <p className="text-danger text-sm">{error}</p>}
        <motion.button whileTap={{ scale: 0.97 }} disabled={loading} className="mt-2 py-3 rounded-lg bg-coral-gradient font-semibold text-base disabled:opacity-60">
          {loading ? 'Creating account…' : 'Create account'}
        </motion.button>
      </form>
      <p className="text-sm text-muted text-center mt-6">
        Already have an account? <Link to="/login" className="text-coral font-semibold">Log in</Link>
      </p>
    </AuthLayout>
  );
}
