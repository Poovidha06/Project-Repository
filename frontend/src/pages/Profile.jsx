import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, setUser } = useAuth();
  const { register, handleSubmit, reset } = useForm();
  const [stats, setStats] = useState(null);
  const [saved, setSaved] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [pwMessage, setPwMessage] = useState('');

  useEffect(() => {
    api.get('/auth/profile').then(({ data }) => {
      setStats(data.stats);
      reset(data.user);
    });
  }, [reset]);

  async function onSubmit(values) {
    const { data } = await api.put('/auth/profile', values);
    setUser(data.user);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function changePassword(e) {
    e.preventDefault();
    setPwMessage('');
    try {
      await api.put('/auth/change-password', pwForm);
      setPwMessage('Password updated.');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPwMessage(err.response?.data?.message || 'Could not update password.');
    }
  }

  const inputClass = 'mt-1 w-full bg-base-lighter border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-coral outline-none';

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-16 h-16 rounded-full bg-coral-gradient flex items-center justify-center text-2xl font-bold text-base">
          {user.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">{user.name}</h1>
          <p className="text-muted text-sm">{user.department} {user.year ? `· ${user.year}` : ''}</p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Items Reported', value: stats.itemsReported },
            { label: 'Successful Claims', value: stats.successfulClaims },
            { label: 'Reputation', value: stats.reputationScore }
          ].map((s) => (
            <div key={s.label} className="bg-base-light border border-white/5 rounded-xl2 py-5 text-center">
              <div className="font-display text-2xl font-bold text-gradient">{s.value}</div>
              <div className="text-xs text-muted mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-base-light border border-white/5 rounded-xl2 p-8 flex flex-col gap-4 mb-8">
        <h3 className="font-display text-lg font-semibold mb-1">Edit profile</h3>
        <div>
          <label className="text-sm text-cream/80">Name</label>
          <input className={inputClass} {...register('name')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-cream/80">Department</label>
            <input className={inputClass} {...register('department')} />
          </div>
          <div>
            <label className="text-sm text-cream/80">Year</label>
            <input className={inputClass} {...register('year')} />
          </div>
        </div>
        <div>
          <label className="text-sm text-cream/80">Phone</label>
          <input className={inputClass} {...register('phone')} />
        </div>
        {saved && <p className="text-success text-sm">Profile updated.</p>}
        <button className="mt-2 py-3 rounded-lg bg-coral-gradient font-semibold text-base w-fit px-8">Save changes</button>
      </form>

      <form onSubmit={changePassword} className="bg-base-light border border-white/5 rounded-xl2 p-8 flex flex-col gap-4">
        <h3 className="font-display text-lg font-semibold mb-1">Change password</h3>
        <div>
          <label className="text-sm text-cream/80">Current password</label>
          <input type="password" className={inputClass} value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
        </div>
        <div>
          <label className="text-sm text-cream/80">New password</label>
          <input type="password" className={inputClass} value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} />
        </div>
        {pwMessage && <p className="text-sm text-coral">{pwMessage}</p>}
        <button className="mt-2 py-3 rounded-lg border border-coral text-coral font-semibold w-fit px-8 hover:bg-coral hover:text-base transition">Update password</button>
      </form>
    </div>
  );
}
