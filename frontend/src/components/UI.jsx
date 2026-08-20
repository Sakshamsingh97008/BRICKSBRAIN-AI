import React from 'react';
import { useNavigate } from 'react-router-dom';

// ── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
  );
}

// ── CardBody ─────────────────────────────────────────────────────────────────
export function CardBody({ children, className = '' }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

// ── CardTitle ─────────────────────────────────────────────────────────────────
export function CardTitle({ children, className = '' }) {
  return <h3 className={`text-sm font-bold text-slate-900 dark:text-white mb-3 ${className}`}>{children}</h3>;
}

// ── PageHeader ────────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ── MetricCard ────────────────────────────────────────────────────────────────
export function MetricCard({ label, value, sub, subClass = 'text-brand-600' }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
      <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">{label}</p>
      <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
      {sub && <p className={`text-xs font-semibold mt-1 ${subClass}`}>{sub}</p>}
    </div>
  );
}

// ── Button ────────────────────────────────────────────────────────────────────
export function Btn({ children, variant='primary', size='md', className='', disabled=false, onClick, type='button', full=false }) {
  const variants = {
    primary:  'bg-brand-600 hover:bg-brand-700 text-white shadow-sm',
    outline:  'border-2 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700',
    blue:     'bg-blue-600 hover:bg-blue-700 text-white',
    red:      'bg-red-600 hover:bg-red-700 text-white',
    ghost:    'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700',
  };
  const sizes = { sm:'px-3 py-1.5 text-xs', md:'px-4 py-2.5 text-sm', lg:'px-6 py-3 text-base' };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`${variants[variant]} ${sizes[size]} font-bold rounded-lg transition-all inline-flex items-center justify-center gap-1.5 ${full?'w-full':''} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}>
      {children}
    </button>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({ label, ...props }) {
  return (
    <div>
      {label && <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">{label}</label>}
      <input className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all placeholder:text-slate-400" {...props} />
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────────────────────
export function Select({ label, children, ...props }) {
  return (
    <div>
      {label && <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">{label}</label>}
      <select className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500 transition-all cursor-pointer" {...props}>
        {children}
      </select>
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ children, variant='gray', className='' }) {
  const v = {
    green:'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400',
    amber:'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400',
    red:  'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400',
    gray: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${v[variant]} ${className}`}>{children}</span>;
}

// ── PropertyCard ──────────────────────────────────────────────────────────────
export function PropertyCard({ p, onCompare, compareList = [], onContact }) {
  const inCompare = compareList.includes(p.id);
  const navigate  = useNavigate();
  const isPlot    = p.type === 'Plot';

  const previewBuild = () => {
    navigate('/3d', {
      state: {
        fromPlot:     true,
        plotId:       p.id,
        plotTitle:    p.title || p.name,
        plotAreaSqyd: p.area,
        plotLocality: p.locality,
        plotCity:     p.city,
      },
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:border-brand-400 dark:hover:border-brand-500 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      {/* Image */}
      <div className="h-32 flex items-center justify-center text-5xl relative" style={{ background: p.color }}>
        {p.emoji}
        <span className={`absolute top-2 right-2 text-[11px] px-2 py-0.5 rounded-full font-bold ${p.badgeColor}`}>{p.badge}</span>
        {p.verified && <span className="absolute top-2 left-2 bg-brand-600/90 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">✓ Verified</span>}
      </div>
      {/* Body */}
      <div className="p-3.5">
        <div className="flex justify-between items-start mb-0.5">
          <span className="text-[17px] font-black text-slate-900 dark:text-white tracking-tight">{p.pD}</span>
          <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded font-bold">{p.listType}</span>
        </div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{p.title || p.name}</p>
        <p className="text-xs text-slate-400 mt-1">📍 {p.locality}, {p.city}</p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {p.bed > 0 && <span className="text-[11px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md font-semibold">🛏 {p.bed} BHK</span>}
          <span className="text-[11px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md font-semibold">📐 {p.area.toLocaleString()} {p.type==='Plot'?'sqyd':'sqft'}</span>
          {p.floor > 0 && <span className="text-[11px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md font-semibold">🏢 Fl.{p.floor}</span>}
        </div>
        {/* Score */}
        <div className="flex items-center gap-2 mt-2.5">
          <span className="text-[11px] text-slate-400 font-semibold">Score</span>
          <div className="flex-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="score-bar h-full bg-brand-500 rounded-full" style={{ width: `${p.score}%` }} />
          </div>
          <span className="text-[11px] font-black text-brand-600 min-w-[22px] text-right">{p.score}</span>
        </div>
        {/* Actions */}
        {isPlot && (
          <button onClick={previewBuild}
            className="w-full mt-3 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-brand-600 dark:hover:bg-brand-700 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5">
            🏗️ Preview 3D Build on This Plot
          </button>
        )}
        <div className="flex gap-2 mt-2">
          <button onClick={() => onContact && onContact(p)}
            className="flex-1 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg transition-all">
            Contact
          </button>
          <button onClick={() => onCompare && onCompare(p.id)}
            className={`py-2 px-3 text-xs font-bold rounded-lg border-2 transition-all ${
              inCompare
                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : 'border-slate-300 dark:border-slate-600 text-slate-500 hover:border-brand-400'
            }`}>
            {inCompare ? '✓' : '+'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SliderRow ─────────────────────────────────────────────────────────────────
export function SliderRow({ label, value, onChange, min, max, step=1, display }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 w-32 shrink-0">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)} className="flex-1" />
      <span className="text-xs font-black text-slate-800 dark:text-white min-w-[64px] text-right">{display ?? value}</span>
    </div>
  );
}

// ── PredBox ───────────────────────────────────────────────────────────────────
export function PredBox({ label, price, sub }) {
  return (
    <div className="bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-900/30 dark:to-brand-900/10 border border-brand-200 dark:border-brand-800 rounded-xl p-4 text-center mt-4">
      <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold mb-1">{label}</p>
      <p className="text-3xl font-black text-brand-700 dark:text-brand-300 tracking-tight">{price}</p>
      {sub && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{sub}</p>}
    </div>
  );
}

// ── LocationSearch (autocomplete) ─────────────────────────────────────────────
export function LocationSearch({ value, onChange, placeholder, className='' }) {
  const { searchLocations } = require('../data/indiaData');
  const [q,       setQ]       = React.useState(value || '');
  const [results, setResults] = React.useState([]);
  const [open,    setOpen]    = React.useState(false);
  const ref = React.useRef();

  React.useEffect(() => {
    setResults(searchLocations(q));
    setOpen(q.length >= 2);
  }, [q]);

  React.useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <input
        className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all placeholder:text-slate-400"
        value={q}
        placeholder={placeholder || 'Search city or locality...'}
        onChange={e => { setQ(e.target.value); onChange && onChange(''); }}
        onFocus={() => q.length >= 2 && setOpen(true)}
      />
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 max-h-56 overflow-y-auto mt-0.5">
          {results.map((r, i) => (
            <div key={i}
              className="px-3 py-2.5 cursor-pointer text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex justify-between items-center border-b border-slate-100 dark:border-slate-700 last:border-0 font-medium"
              onClick={() => { setQ(r.label); onChange && onChange(r); setOpen(false); }}>
              {r.label}
              <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded font-bold text-slate-400">{r.type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
export function Toast({ msg, type='success', onClose }) {
  React.useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  const colors = { success:'bg-slate-900 text-white', error:'bg-red-600 text-white', info:'bg-blue-600 text-white' };
  return (
    <div className={`fixed bottom-6 right-6 ${colors[type]} px-4 py-3 rounded-xl shadow-2xl z-[9999] text-sm font-bold flex items-center gap-2 animate-slide-up`}>
      {type==='success'?'✓':type==='error'?'✕':'ℹ'} {msg}
    </div>
  );
}

// ── ContactModal ──────────────────────────────────────────────────────────────
export function ContactModal({ prop, onClose }) {
  if (!prop) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[900] flex items-center justify-center p-4 backdrop-blur-sm" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-slide-up">
        <h3 className="font-black text-lg mb-1 text-slate-900 dark:text-white">Contact Seller</h3>
        <p className="text-xs text-slate-500 mb-4">{prop.title || prop.name} · {prop.locality}, {prop.city} · {prop.pD}</p>
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl mb-4">
          <div className="w-11 h-11 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-black text-lg">{prop.sellerName?.[0] || 'S'}</div>
          <div>
            <p className="font-bold text-sm text-slate-900 dark:text-white">{prop.sellerName}</p>
            <p className="text-xs text-slate-500">{prop.sellerType==='agent'?'🏢 Agent':'👤 Owner'} · {prop.verified?'✅ Verified':'Unverified'}</p>
            <p className="text-xs text-brand-600 font-semibold mt-0.5">{prop.phone}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 mb-4">
          <a href={`tel:${prop.phone}`} className="py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl text-center transition-all">📞 Call {prop.phone}</a>
          <button className="py-2.5 border-2 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">💬 WhatsApp Message</button>
          <button className="py-2.5 border-2 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">📧 Send Email Enquiry</button>
        </div>
        <button onClick={onClose} className="w-full py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-all">Close</button>
      </div>
    </div>
  );
}
