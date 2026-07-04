import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <h1 className="font-display text-6xl font-bold text-gradient mb-4">404</h1>
      <p className="text-muted mb-6">This page wandered off campus. Maybe someone should report it lost.</p>
      <Link to="/" className="px-6 py-3 rounded-full bg-coral-gradient text-base font-semibold">Back to Home</Link>
    </div>
  );
}
