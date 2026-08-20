import React, { useState } from 'react';
import { Card, CardBody, CardTitle, MetricCard, PropertyCard } from '../UI';
import { SAMPLE_PROPERTIES, AGENTS } from '../../data/indiaData';
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../Auth/AuthModal';

const LEADS = [
  { id:1, name:'Rahul Gupta',   phone:'+91-9876543210', city:'Delhi',     budget:'₹80L',     interest:'3BHK Dwarka / Janakpuri',  status:'hot',  time:'2 hrs ago'  },
  { id:2, name:'Priya Singh',   phone:'+91-9812345678', city:'Gurugram',  budget:'₹1.2Cr',   interest:'4BHK DLF Phase',           status:'warm', time:'5 hrs ago'  },
  { id:3, name:'Amit Sharma',   phone:'+91-9934567890', city:'Noida',     budget:'₹60L',     interest:'2BHK Sec 75/100',          status:'cold', time:'1 day ago'  },
  { id:4, name:'Neha Verma',    phone:'+91-9898765432', city:'Mumbai',    budget:'₹2Cr',     interest:'Luxury Bandra/Juhu',       status:'hot',  time:'30 min ago' },
  { id:5, name:'Suresh Patil',  phone:'+91-9765432100', city:'Pune',      budget:'₹70L',     interest:'3BHK Baner/Wakad',         status:'warm', time:'3 hrs ago'  },
  { id:6, name:'Kavita Rao',    phone:'+91-9876001122', city:'Bengaluru', budget:'₹1Cr',     interest:'3BHK Whitefield/Sarjapur', status:'hot',  time:'1 hr ago'   },
];

const STATUS_STYLES = {
  hot:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  warm: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  cold: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

const BUYERS = [
  { name:'Saurabh Mehta',  city:'Mumbai',    budget:'₹1.5–2Cr',  want:'3BHK Bandra / Andheri',     urgency:'Immediate' },
  { name:'Ritu Agarwal',   city:'Delhi',     budget:'₹70–90L',   want:'3BHK Dwarka / Janakpuri',   urgency:'1 month'   },
  { name:'Vikas Nair',     city:'Bengaluru', budget:'₹80L–1Cr',  want:'3BHK Whitefield / Sarjapur',urgency:'2 months'  },
  { name:'Kavita Sharma',  city:'Gurugram',  budget:'₹50–70L',   want:'2BHK DLF / Sector 56',      urgency:'Immediate' },
  { name:'Prakash Reddy',  city:'Hyderabad', budget:'₹60–80L',   want:'3BHK Gachibowli / Kondapur',urgency:'1 month'   },
  { name:'Sunita Joshi',   city:'Pune',      budget:'₹50–65L',   want:'2BHK Baner / Wakad',        urgency:'2 months'  },
];

export default function AgentDash() {
  const { user } = useAuth();
  const [tab,         setTab]         = useState('overview');
  const [contactLead, setContactLead] = useState(null);
  const [showAuth,    setShowAuth]    = useState(false);

  if (!user) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-3">🔒</div>
        <h2 className="text-xl font-black text-slate-800 dark:text-white mb-2">Agent / Seller Account Required</h2>
        <p className="text-slate-500 mb-6">Sign in or create an account as Agent or Owner to access the dashboard</p>
        <button onClick={() => setShowAuth(true)} className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all">
          Sign In as Agent →
        </button>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    );
  }

  const STATS = [
    { label:'Total Leads',       value:'48',    sub:'↑ 8 this week'     },
    { label:'Active Listings',   value:'12',    sub:'3 pending review'   },
    { label:'Deals This Month',  value:'₹3.2Cr',sub:'4 deals closed'    },
    { label:'Avg Response Time', value:'< 1hr', sub:'Top 10% agent'     },
  ];

  const TABS = [
    { key:'overview',  label:'Overview'      },
    { key:'leads',     label:'All Leads'     },
    { key:'listings',  label:'My Listings'   },
    { key:'connect',   label:'🤝 Connect'    },
  ];

  return (
    <div className="animate-fade-in space-y-4">
      <div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Agent Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Welcome back, {user.name} · Manage leads, listings & client connections</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map(s => <MetricCard key={s.label} {...s} />)}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition-all ${
              tab === t.key ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}>{t.label}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card><CardBody>
            <CardTitle>🔥 Hot Leads</CardTitle>
            {LEADS.filter(l => l.status === 'hot').map(l => (
              <div key={l.id} className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
                <div>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">{l.name}</p>
                  <p className="text-xs text-slate-400">{l.interest} · {l.city} · {l.budget}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{l.time}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${STATUS_STYLES[l.status]}`}>{l.status}</span>
                  <button onClick={() => setContactLead(l)} className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg transition-all">Call</button>
                </div>
              </div>
            ))}
          </CardBody></Card>

          <Card><CardBody>
            <CardTitle>📊 This Month's Performance</CardTitle>
            {[['Calls Made','24','↑ 6 vs last month'],['Site Visits','11','3 pending'],['Offers Made','7','2 accepted'],['Conversions','4','57% rate'],['Revenue','₹3.2Cr','4 deals']].map(([l,v,s]) => (
              <div key={l} className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-700 last:border-0">
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{l}</span>
                <div className="text-right">
                  <span className="font-black text-slate-900 dark:text-white mr-2">{v}</span>
                  <span className="text-xs text-brand-600 dark:text-brand-400 font-semibold">{s}</span>
                </div>
              </div>
            ))}
          </CardBody></Card>
        </div>
      )}

      {tab === 'leads' && (
        <Card><CardBody>
          <div className="flex justify-between items-center mb-4">
            <CardTitle className="mb-0">All Leads ({LEADS.length})</CardTitle>
            <button className="px-3 py-1.5 bg-brand-600 text-white text-xs font-bold rounded-lg hover:bg-brand-700 transition-all">+ Add Lead</button>
          </div>
          {LEADS.map(l => (
            <div key={l.id} className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-400 flex items-center justify-center font-black text-base">
                  {l.name[0]}
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">{l.name} · {l.city}</p>
                  <p className="text-xs text-slate-400">{l.phone}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{l.interest} · Budget: {l.budget}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${STATUS_STYLES[l.status]}`}>{l.status}</span>
                <span className="text-xs text-slate-400 hidden sm:block">{l.time}</span>
                <button onClick={() => setContactLead(l)} className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg transition-all">📞 Contact</button>
              </div>
            </div>
          ))}
        </CardBody></Card>
      )}

      {tab === 'listings' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="font-black text-base text-slate-900 dark:text-white">My Listings</p>
            <button className="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-lg hover:bg-brand-700 transition-all">+ Add Listing</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SAMPLE_PROPERTIES.slice(0,4).map(p => <PropertyCard key={p.id} p={p} compareList={[]} onCompare={() => {}} onContact={() => {}} />)}
          </div>
        </div>
      )}

      {tab === 'connect' && (
        <div className="space-y-4">
          <Card><CardBody>
            <CardTitle>🎯 Active Buyers Looking in Your Cities</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">These buyers are actively looking for properties. Connect directly — no middleman.</p>
            {BUYERS.map((b, i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center font-black">
                    {b.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">{b.name} · {b.city}</p>
                    <p className="text-xs text-slate-400">Budget: {b.budget} · Wants: {b.want}</p>
                    <span className={`text-[11px] font-bold mt-0.5 inline-block ${b.urgency==='Immediate'?'text-red-500':'text-amber-500'}`}>⏱ {b.urgency}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">💬 Message</button>
                  <button className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg transition-all">📞 Call</button>
                </div>
              </div>
            ))}
          </CardBody></Card>

          <Card><CardBody>
            <CardTitle>🤝 Co-Broker with Top Agents</CardTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {AGENTS.map(a => (
                <div key={a.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:border-brand-300 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-2xl">{a.avatar}</div>
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{a.name}</p>
                      <p className="text-xs text-slate-400">{a.city} · {a.speciality}</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs mb-3">
                    <span className="text-amber-500 font-bold">⭐ {a.rating}</span>
                    <span className="text-slate-400">{a.deals} deals · {a.experience}yr exp</span>
                    {a.verified && <span className="text-brand-600 font-bold">✓ Verified</span>}
                  </div>
                  <button className="w-full py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-brand-400 transition-all">
                    Connect →
                  </button>
                </div>
              ))}
            </div>
          </CardBody></Card>
        </div>
      )}

      {contactLead && (
        <div className="fixed inset-0 bg-black/60 z-[900] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setContactLead(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <h3 className="font-black text-lg text-slate-900 dark:text-white mb-1">Contact {contactLead.name}</h3>
            <p className="text-xs text-slate-500 mb-5">{contactLead.interest} · {contactLead.city} · {contactLead.budget}</p>
            <div className="flex flex-col gap-2 mb-4">
              <a href={`tel:${contactLead.phone}`} className="py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl text-center transition-all">📞 Call {contactLead.phone}</a>
              <button className="py-3 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-sm rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">💬 WhatsApp</button>
              <button className="py-3 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-sm rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">✉️ Email</button>
            </div>
            <button className="w-full py-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-all" onClick={() => setContactLead(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
