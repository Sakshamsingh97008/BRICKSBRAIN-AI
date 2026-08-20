import React, { useState } from 'react';
import { Card, CardBody, CardTitle, Toast } from '../UI';
import { useAuth } from '../../context/AuthContext';
import { INDIA_CITIES } from '../../data/indiaData';
import AuthModal from '../Auth/AuthModal';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const [editing, setEditing]   = useState(false);
  const [toast,   setToast]     = useState('');
  const [showAuth,setShowAuth]  = useState(false);
  const [form, setForm] = useState({
    name:  user?.name  || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city:  user?.city  || '',
    role:  user?.role  || 'buyer',
  });

  if (!user) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-3">👤</div>
        <h2 className="text-xl font-black text-slate-800 dark:text-white mb-2">Sign in to view your profile</h2>
        <button onClick={() => setShowAuth(true)} className="px-6 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all">Sign In →</button>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    );
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = () => {
    updateUser && updateUser({ ...form, avatar: form.name?.[0]?.toUpperCase() || 'U' });
    setEditing(false);
    setToast('Profile updated successfully!');
  };

  const SAVED_PROPS = [1, 3, 7];
  const { SAMPLE_PROPERTIES } = require('../../data/indiaData');
  const savedList = SAMPLE_PROPERTIES.filter(p => SAVED_PROPS.includes(p.id));

  return (
    <div className="animate-fade-in space-y-4 max-w-2xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">My Profile</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your account, preferences and saved properties</p>
        </div>
        <button onClick={logout} className="px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-bold rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
          🚪 Sign Out
        </button>
      </div>

      <Card><CardBody>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full bg-brand-600 flex items-center justify-center text-white font-black text-2xl">
            {user.avatar || user.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="font-black text-lg text-slate-900 dark:text-white">{user.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{user.role} · {user.city || 'India'}</p>
            <span className="inline-flex items-center mt-1 px-2.5 py-0.5 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-xs font-bold rounded-full">
              ✓ Verified Account
            </span>
          </div>
          <button onClick={() => setEditing(!editing)}
            className="ml-auto px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
            {editing ? 'Cancel' : '✏️ Edit'}
          </button>
        </div>

        {editing ? (
          <div className="space-y-3">
            {[
              { label:'Full Name', k:'name', type:'text', ph:'Your full name' },
              { label:'Email', k:'email', type:'email', ph:'your@email.com' },
              { label:'Phone', k:'phone', type:'tel', ph:'+91-XXXXXXXXXX' },
            ].map(({ label, k, type, ph }) => (
              <div key={k}>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">{label}</label>
                <input type={type} className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                  placeholder={ph} value={form[k]} onChange={e => set(k, e.target.value)} />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">City</label>
                <select className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  value={form.city} onChange={e => set('city', e.target.value)}>
                  {INDIA_CITIES.map(c => <option key={c.city}>{c.city}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Role</label>
                <select className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  value={form.role} onChange={e => set('role', e.target.value)}>
                  <option value="buyer">Buyer / Renter</option>
                  <option value="seller">Property Owner</option>
                  <option value="agent">Agent / Broker</option>
                </select>
              </div>
            </div>
            <button onClick={save} className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-lg transition-all">
              💾 Save Changes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            {[['Name', user.name],['Email', user.email],['Phone', user.phone || 'Not set'],['City', user.city || 'Not set'],['Role', user.role],['Member since', 'Jan 2025']].map(([l,v]) => (
              <div key={l}>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">{l}</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{v}</p>
              </div>
            ))}
          </div>
        )}
      </CardBody></Card>

      <Card><CardBody>
        <CardTitle>❤️ Saved Properties ({savedList.length})</CardTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {savedList.map(p => (
            <div key={p.id} className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-brand-300 transition-all">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0" style={{background:p.color}}>{p.emoji}</div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{p.title || p.name}</p>
                <p className="text-xs text-slate-400 truncate">{p.locality}, {p.city}</p>
                <p className="text-xs font-black text-brand-600 dark:text-brand-400">{p.pD}</p>
              </div>
            </div>
          ))}
        </div>
      </CardBody></Card>

      {toast && <Toast msg={toast} onClose={() => setToast('')} />}
    </div>
  );
}
