import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../Auth/AuthModal';

const NAV_LINKS = [
  { to:'/dashboard', label:'Home'      },
  { to:'/listings',  label:'Buy / Rent'},
  { to:'/sell',      label:'Sell Free' },
  { to:'/predict',   label:'Price AI'  },
  { to:'/loans',     label:'Loans'     },
];

export default function Navbar({ onMenuClick }) {
  const { user, logout, toggleTheme, theme } = useAuth();
  const [showAuth,    setShowAuth]    = useState(false);
  const [showDropdown,setShowDropdown]= useState(false);
  const dropRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setShowDropdown(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const MENU_ITEMS = [
    { icon:'👤', label:'My Profile',       path:'/profile'  },
    { icon:'🏷️', label:'My Listings',      path:'/sell'     },
    { icon:'👔', label:'Agent Dashboard',  path:'/agent'    },
    { icon:'💳', label:'Plans & Billing',  path:'/payment'  },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 h-[60px] bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-4 md:px-5 gap-3 shadow-sm">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-black text-base">B</div>
          <span className="font-black text-lg text-slate-900 dark:text-white tracking-tight hidden sm:block">BRICKSBRAIN-AI</span>
          <span className="text-[10px] bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300 px-1.5 py-0.5 rounded font-bold hidden sm:block">BETA</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex gap-1 ml-4">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white'
                }`}
            >{label}</NavLink>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Theme toggle */}
          <button onClick={toggleTheme}
            className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 flex items-center justify-center text-base hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            title="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {user ? (
            <div className="relative" ref={dropRef}>
              <button onClick={() => setShowDropdown(d => !d)}
                className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-white font-black text-sm hover:bg-brand-700 transition-all">
                {user.avatar || user.name?.[0]?.toUpperCase() || 'U'}
              </button>
              {showDropdown && (
                <div className="absolute right-0 top-11 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
                  <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                    <p className="font-bold text-sm text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user.role} · {user.city || 'India'}</p>
                  </div>
                  {MENU_ITEMS.map(m => (
                    <button key={m.path} onClick={() => { navigate(m.path); setShowDropdown(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white font-medium transition-colors text-left border-b border-slate-100 dark:border-slate-700 last:border-0">
                      <span>{m.icon}</span> {m.label}
                    </button>
                  ))}
                  <button onClick={() => { logout(); setShowDropdown(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-semibold transition-colors">
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => setShowAuth(true)}
              className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-lg transition-all">
              Sign In
            </button>
          )}

          {/* Mobile hamburger */}
          <button onClick={onMenuClick} className="md:hidden w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300">☰</button>
        </div>
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
