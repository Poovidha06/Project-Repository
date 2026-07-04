import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { HiOutlineCloudUpload } from 'react-icons/hi';
import api from '../api/axios';
import { CATEGORIES, CAMPUS_BLOCKS } from '../data/categories';

const HANDOVER_LOCATIONS = ['Library Office', 'Security Office', 'Lab Assistant', 'Student Council', 'Department Office'];

export default function ReportFound() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(values) {
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('type', 'found');
      Object.entries(values).forEach(([k, v]) => formData.append(k, v));
      files.forEach((f) => formData.append('images', f));

      const { data } = await api.post('/items', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate(`/items/${data.item.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit report.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass = 'mt-1 w-full bg-base-lighter border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-coral outline-none';
  const labelClass = 'text-sm text-cream/80';

  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <h1 className="font-display text-3xl font-bold mb-2">Report a <span className="text-gradient">Found</span> Item</h1>
      <p className="text-muted mb-8">Thank you for helping return this to its owner. Please hand it in to the location you specify below.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-base-light border border-white/5 rounded-xl2 p-8 flex flex-col gap-5">
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Item name</label>
            <input className={inputClass} placeholder="e.g. Black Wired Earphones" {...register('title', { required: true })} />
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <select className={inputClass} {...register('category', { required: true })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea rows={3} className={inputClass} placeholder="Describe the item in detail" {...register('description', { required: true })} />
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <div>
            <label className={labelClass}>Brand</label>
            <input className={inputClass} placeholder="e.g. boAt" {...register('brand')} />
          </div>
          <div>
            <label className={labelClass}>Color</label>
            <input className={inputClass} placeholder="e.g. Black" {...register('color')} />
          </div>
          <div>
            <label className={labelClass}>Unique identifiers</label>
            <input className={inputClass} placeholder="Scratches, stickers, engravings" {...register('uniqueIdentifiers')} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Date found</label>
            <input type="date" className={inputClass} {...register('dateLost', { required: true })} />
          </div>
          <div>
            <label className={labelClass}>Approximate time</label>
            <input className={inputClass} placeholder="e.g. 1:00 PM" {...register('approximateTime')} />
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-5">
          <div>
            <label className={labelClass}>Campus block</label>
            <select className={inputClass} {...register('campusBlock')}>
              <option value="">Select</option>
              {CAMPUS_BLOCKS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Building</label>
            <input className={inputClass} placeholder="Canteen" {...register('building')} />
          </div>
          <div>
            <label className={labelClass}>Floor</label>
            <input className={inputClass} placeholder="Ground Floor" {...register('floor')} />
          </div>
          <div>
            <label className={labelClass}>Room (optional)</label>
            <input className={inputClass} {...register('room')} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Current item location</label>
          <select className={inputClass} {...register('currentItemLocation', { required: true })}>
            <option value="">Where did you hand it in?</option>
            {HANDOVER_LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <div>
          <label className={labelClass}>Upload images</label>
          <label className="mt-1 flex items-center gap-3 border border-dashed border-white/15 rounded-lg px-4 py-6 cursor-pointer hover:border-coral transition text-muted text-sm">
            <HiOutlineCloudUpload size={22} />
            {files.length ? `${files.length} file(s) selected` : 'Click to upload or drag and drop (up to 5 images)'}
            <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => setFiles(Array.from(e.target.files))} />
          </label>
        </div>

        <div>
          <label className={labelClass}>Contact preference</label>
          <select className={inputClass} {...register('contactPreference')}>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="anonymous">Anonymous (via platform only)</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Additional notes</label>
          <textarea rows={2} className={inputClass} placeholder="Anything else that might help" {...register('additionalNotes')} />
        </div>

        {error && <p className="text-danger text-sm">{error}</p>}

        <motion.button whileTap={{ scale: 0.98 }} disabled={loading} className="mt-2 py-3 rounded-lg bg-coral-gradient font-semibold text-base disabled:opacity-60">
          {loading ? 'Submitting…' : 'Submit Found Report'}
        </motion.button>
      </form>
    </div>
  );
}
