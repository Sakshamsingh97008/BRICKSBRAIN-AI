import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardBody, CardTitle, MetricCard, PropertyCard, LocationSearch, ContactModal } from '../UI';
import { SAMPLE_PROPERTIES } from '../../data/indiaData';

const METRICS = [
  { label:'Avg Price/sqft (India)', value:'₹7,840', sub:'↑ 4.2% this quarter' },
  { label:'Active Listings',        value:'2,34,156', sub:'↑ 12% vs last month' },
  { label:'Cities Covered',         value:'45+', sub:'Pan-India coverage' },
  { label:'Avg ROI (5yr)',          value:'38%', sub:'ML forecast' },
];

const TREND_DATA = [
  { name:'Mumbai', value:18000 },{ name:'Bengaluru', value:9500 },
  { name:'Gurugram', value:9200 },{ name:'Delhi', value:8000 },
  { name:'Hyderabad', value:7500 },{ name:'Chennai', value:7000 },
  { name:'Noida', value:6000 },{ name:'Kolkata', value:6500 },
];

const FORECAST = [
  {y:'2024',p:72},{y:'2025',p:78},{y:'2026',p:84},
  {y:'2027',p:91},{y:'2028',p:99},{y:'2030',p:116},
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [compareList, setCompareList] = useState([]);
  const [contactProp, setContactProp] = useState(null);

  return (
    <div className="animate-fade-in space-y-4">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-slate-900 via-brand-900 to-brand-800 rounded-2xl p-6 md:p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <h1 className="text-2xl md:text-3xl font-black text-white mb-1 tracking-tight">Find Your Dream Property in India 🏠</h1>
        <p className="text-brand-200 text-sm mb-5 font-medium">Search across 45+ cities · AI-powered · Verified listings · Zero brokerage on direct</p>
        <div className="flex flex-wrap gap-2 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
          <div className="flex-1 min-w-[200px]">
            <LocationSearch placeholder="Search city, locality or project name..." />
          </div>
          <select className="px-3 py-2.5 rounded-lg bg-white/90 text-slate-800 text-sm font-semibold focus:outline-none">
            <option>Buy</option><option>Rent</option>
          </select>
          <select className="px-3 py-2.5 rounded-lg bg-white/90 text-slate-800 text-sm font-semibold focus:outline-none">
            <option>All Types</option><option>Flat</option><option>Villa</option><option>Plot</option><option>Commercial</option>
          </select>
          <button className="px-5 py-2.5 bg-white text-brand-700 font-black text-sm rounded-lg hover:bg-brand-50 transition-all" onClick={() => navigate('/listings')}>
            🔍 Search
          </button>
        </div>
        <div className="flex flex-wrap gap-6 mt-5">
          {[['2.3L+','Properties'],['45+','Cities'],['4,200+','Agents'],['₹0','Brokerage']].map(([n,l]) => (
            <div key={l}>
              <div className="text-xl font-black text-white">{n}</div>
              <div className="text-xs text-brand-300 font-semibold">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {METRICS.map(m => <MetricCard key={m.label} {...m} />)}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card><CardBody>
          <CardTitle>📊 Price per sqft — Top Cities</CardTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={TREND_DATA} layout="vertical" margin={{left:60,right:20}}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" tick={{fontSize:10,fill:'#94a3b8'}} tickFormatter={v=>`₹${(v/1000).toFixed(0)}K`} />
              <YAxis dataKey="name" type="category" tick={{fontSize:11,fill:'#64748b'}} width={60} />
              <Tooltip formatter={v=>[`₹${v.toLocaleString()}/sqft`,'Price']} />
              <Bar dataKey="value" radius={[0,4,4,0]}>
                {TREND_DATA.map((d,i) => <Cell key={i} fill={d.value>10000?'#2563eb':d.value>8000?'#16a34a':'#d97706'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardBody></Card>

        <Card><CardBody>
          <CardTitle>📈 5-Year Price Forecast (NCR · ₹ Lakhs)</CardTitle>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={FORECAST} margin={{top:4,right:10,left:-20,bottom:0}}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="y" tick={{fontSize:11,fill:'#94a3b8'}}/>
              <YAxis tick={{fontSize:10,fill:'#94a3b8'}}/>
              <Tooltip formatter={v=>[`₹${v}L`,'Price']}/>
              <Area type="monotone" dataKey="p" stroke="#16a34a" strokeWidth={2.5} fill="url(#g1)" dot={{fill:'#16a34a',r:3}}/>
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-3 p-3 bg-brand-50 dark:bg-brand-900/20 rounded-lg text-xs text-slate-600 dark:text-slate-400 leading-relaxed border border-brand-100 dark:border-brand-900">
            <span className="font-bold text-brand-700 dark:text-brand-400">AI Insight:</span> NCR shows strong fundamentals. Upcoming metro expansions in Noida Sec 143 & Gurugram Sec 106 expected to drive 15–20% appreciation by 2027.
          </div>
        </CardBody></Card>
      </div>

      {/* Featured */}
      <Card><CardBody>
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="mb-0">🌟 Featured Properties Across India</CardTitle>
          <button className="text-xs font-bold text-brand-600 hover:underline" onClick={() => navigate('/listings')}>View All →</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SAMPLE_PROPERTIES.slice(0,6).map(p => (
            <PropertyCard key={p.id} p={p} compareList={compareList}
              onCompare={id => setCompareList(l => l.includes(id) ? l.filter(x=>x!==id) : [...l.slice(-3), id])}
              onContact={setContactProp} />
          ))}
        </div>
      </CardBody></Card>

      <ContactModal prop={contactProp} onClose={() => setContactProp(null)} />
    </div>
  );
}
