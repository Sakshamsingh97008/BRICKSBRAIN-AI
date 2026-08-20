import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { INDIA_CITIES } from '../../data/indiaData';

export default function AuthModal({ onClose }) {
  const { login } = useAuth();
  const [tab,  setTab]  = useState('login');
  const [role, setRole] = useState('buyer');
  const [loading, setLoading] = useState(false);
  const [err, setErr]   = useState('');
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'', city:'' });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const ROLES = [
    { key:'buyer',  icon:'🏠', title:'Buyer',   sub:'Looking to buy/rent' },
    { key:'seller', icon:'🏷️', title:'Owner',   sub:'Selling my property' },
    { key:'agent',  icon:'👔', title:'Agent',   sub:'Professional broker' },
  ];

  const submit = async () => {
    setErr('');
    if (!form.email || !form.password) { setErr('Email and password are required'); return; }
    if (tab === 'register' && !form.name) { setErr('Full name is required'); return; }
    setLoading(true);
    // Simulate API call — replace with real authAPI.login/register
    await new Promise(r => setTimeout(r, 800));
    const userData = {
      id:    Date.now(),
      name:  form.name  || form.email.split('@')[0],
      email: form.email,
      role,
      city:  form.city  || 'Delhi',
      phone: form.phone,
      avatar:form.name  ? form.name[0].toUpperCase() : 'U',
    };
    login(userData, `mock_token_${Date.now()}`);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[900] flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-7 w-full max-w-md shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Logo */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-black">B</div>
            <span className="font-black text-xl text-slate-900 dark:text-white">BRICKSBRAIN-AI</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">AI-powered smart real estate platform for India</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 mb-5">
          {[['login','Sign In'],['register','Create Account']].map(([t,l]) => (
            <button key={t} onClick={() => { setTab(t); setErr(''); }}
              className={`flex-1 py-2.5 text-sm font-bold border-b-2 -mb-px transition-all ${
                tab === t ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}>{l}</button>
          ))}
        </div>

        {/* Role selector (register only) */}
        {tab === 'register' && (
          <div className="mb-4">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">I am a</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map(r => (
                <button key={r.key} onClick={() => setRole(r.key)}
                  className={`border-2 rounded-xl p-3 text-center transition-all ${
                    role === r.key
                      ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-brand-300'
                  }`}>
                  <div className="text-2xl mb-1">{r.icon}</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{r.title}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{r.sub}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form fields */}
        {tab === 'register' && (
          <div className="mb-3">
            <label className="text-xs font-bold text-slate-500 mb-1 block">Full Name *</label>
            <input className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500" placeholder="Your full name" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
        )}

        <div className="mb-3">
          <label className="text-xs font-bold text-slate-500 mb-1 block">Email Address *</label>
          <input type="email" className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
        </div>

        {tab === 'register' && (
          <div className="flex gap-3 mb-3">
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-500 mb-1 block">Phone</label>
              <input className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm focus:outline-none focus:border-brand-500" placeholder="+91-XXXXXXXXXX" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-500 mb-1 block">City</label>
              <select className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500" value={form.city} onChange={e => set('city', e.target.value)}>
                <option value="">Select city</option>
                {INDIA_CITIES.map(c => <option key={c.city}>{c.city}</option>)}
              </select>
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="text-xs font-bold text-slate-500 mb-1 block">Password *</label>
          <input type="password" className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} onKeyDown={e => e.key==='Enter' && submit()} />
        </div>

        {err && <p className="text-red-500 text-xs mb-3 font-semibold">{err}</p>}

        <button onClick={submit} disabled={loading}
          className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2">
          {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
          {tab === 'login' ? '🔑 Sign In' : '🚀 Create Account'}
        </button>

        {/* Social */}
        <div className="mt-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-xs text-slate-400 font-medium">or</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {['Google','Facebook'].map(p => (
              <button key={p} onClick={() => {
                login({ id:Date.now(), name:`${p} User`, email:`user@${p.toLowerCase()}.com`, role:'buyer', avatar:'U', city:'Delhi' }, `social_token_${Date.now()}`);
                onClose();
              }}
                className="py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                {p === 'Google' ? '🔵' : '🔷'} {p}
              </button>
            ))}
          </div>
        </div>

        <p className="text-center mt-4 text-xs text-slate-500">
          {tab==='login' ? "Don't have an account? " : "Already have an account? "}
          <button className="text-brand-600 font-bold hover:underline" onClick={() => setTab(tab==='login'?'register':'login')}>
            {tab==='login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}
