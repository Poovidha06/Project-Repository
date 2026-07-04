import React from 'react';

export default function AuthLayout({ title, subtitle, children, accent = false }) {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6 py-16 bg-radial-fade relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-coral-gradient opacity-10 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-coral-gradient opacity-10 blur-3xl" />
      <div className="w-full max-w-md glass rounded-xl2 p-8 relative z-10">
        <h1 className="font-display text-2xl font-bold mb-1">
          {title} {accent && <span className="text-gradient">Admin</span>}
        </h1>
        <p className="text-sm text-muted mb-6">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
