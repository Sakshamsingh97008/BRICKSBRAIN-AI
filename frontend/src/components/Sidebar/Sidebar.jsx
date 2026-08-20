import React from 'react';
import { NavLink } from 'react-router-dom';

const SECTIONS = [
  { label:'Discover', items:[
    { to:'/dashboard', icon:'🏠', text:'Overview'   },
    { to:'/listings',  icon:'🔍', text:'Properties', badge:'24+' },
    { to:'/compare',   icon:'⇄',  text:'Compare'    },
    { to:'/predict',   icon:'🤖', text:'Price AI'   },
    { to:'/area',      icon:'📍', text:'Area Intel' },
    { to:'/3d',        icon:'🏗️', text:'3D Builder' },
  ]},
  { label:'Finance', items:[
    { to:'/loans',   icon:'💰', text:'Loan Match'  },
    { to:'/legal',   icon:'⚖️', text:'Legal Check' },
    { to:'/payment', icon:'💳', text:'Plans'       },
  ]},
  { label:'Sell & Manage', items:[
    { to:'/sell',    icon:'🏷️', text:'List Property' },
    { to:'/agent',   icon:'👔', text:'Agent Dashboard'},
    { to:'/chat',    icon:'💬', text:'AI Assistant'  },
    { to:'/profile', icon:'👤', text:'My Profile'    },
  ]},
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <aside className={`
      fixed top-[60px] left-0 bottom-0 w-56 z-40
      bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700
      flex flex-col gap-0.5 px-2.5 py-3 overflow-y-auto
      transition-transform duration-200
      md:relative md:top-0 md:translate-x-0 md:flex md:flex-shrink-0 md:z-auto
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      {SECTIONS.map(({ label, items }) => (
        <div key={label}>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 pt-3 pb-1.5 mt-1">
            {label}
          </p>
          {items.map(({ to, icon, text, badge }) => (
            <NavLink key={to} to={to} onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-semibold cursor-pointer mb-0.5 transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-400 border border-brand-200 dark:border-brand-800'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white'
                }`
              }>
              <span className="text-sm w-4 text-center">{icon}</span>
              <span className="flex-1">{text}</span>
              {badge && (
                <span className="text-[10px] bg-brand-600 text-white rounded-full px-1.5 py-0.5 font-bold">{badge}</span>
              )}
            </NavLink>
          ))}
        </div>
      ))}
    </aside>
  );
}
