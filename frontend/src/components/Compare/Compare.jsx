import React, { useState, useMemo } from 'react';
import { Card, CardBody, CardTitle, Btn } from '../UI';
import { SAMPLE_PROPERTIES } from '../../data/indiaData';

const ROWS = [
  { label:'Price',          fn: p => p.pD,             bestFn: ps => ps.indexOf(ps.reduce((a,b) => a.price < b.price ? a : b)) },
  { label:'Price/sqft',     fn: p => p.type==='Plot' ? 'N/A' : `₹${Math.round(p.price/p.area).toLocaleString()}`, bestFn: ps => ps.indexOf(ps.filter(p=>p.type!=='Plot').reduce((a,b)=>a.price/a.area<b.price/b.area?a:b,ps[0])) },
  { label:'Area',           fn: p => `${p.area.toLocaleString()} ${p.type==='Plot'?'sqyd':'sqft'}`, bestFn: ps => ps.indexOf(ps.reduce((a,b)=>a.area>b.area?a:b)) },
  { label:'Type',           fn: p => p.type },
  { label:'BHK',            fn: p => p.bed > 0 ? `${p.bed} BHK` : 'N/A' },
  { label:'Floor',          fn: p => p.floor > 0 ? `${p.floor} / ${p.totalFloors}` : 'Ground' },
  { label:'Age (years)',    fn: p => p.age },
  { label:'City',           fn: p => p.city },
  { label:'Locality',       fn: p => p.locality },
  { label:'State',          fn: p => p.state },
  { label:'Locality Score', fn: p => `${p.score}/100`, bestFn: ps => ps.indexOf(ps.reduce((a,b)=>a.score>b.score?a:b)) },
  { label:'Metro Dist',     fn: p => `${p.metro} km`,   bestFn: ps => ps.indexOf(ps.reduce((a,b)=>a.metro<b.metro?a:b)) },
  { label:'5yr ROI',        fn: p => `${p.roi}%`,       bestFn: ps => ps.indexOf(ps.reduce((a,b)=>a.roi>b.roi?a:b)) },
  { label:'Bedrooms',       fn: p => p.bed || 'N/A' },
  { label:'Bathrooms',      fn: p => p.bath || 'N/A' },
  { label:'Listing Type',   fn: p => p.listType },
  { label:'Seller Type',    fn: p => p.sellerType === 'agent' ? '🏢 Agent' : '👤 Owner' },
  { label:'Verified',       fn: p => p.verified ? '✅ Yes' : '❌ No' },
  { label:'Seller',         fn: p => p.sellerName },
  { label:'Contact',        fn: p => p.phone },
];

export default function Compare({ compareList = [], setCompareList }) {
  const [searchQ,    setSearchQ]    = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const selected = SAMPLE_PROPERTIES.filter(p => compareList.includes(p.id));

  const searchResults = useMemo(() => {
    if (!searchQ || searchQ.length < 2) return [];
    const q = searchQ.toLowerCase();
    return SAMPLE_PROPERTIES.filter(p =>
      !compareList.includes(p.id) &&
      (p.title?.toLowerCase().includes(q) || p.locality.toLowerCase().includes(q) || p.city.toLowerCase().includes(q))
    ).slice(0, 8);
  }, [searchQ, compareList]);

  const addProperty = (p) => {
    if (compareList.length < 4) setCompareList && setCompareList(l => [...l, p.id]);
    setSearchQ(''); setShowSearch(false);
  };
  const removeProperty = (id) => setCompareList && setCompareList(l => l.filter(x => x !== id));

  const downloadReport = () => {
    const lines = [
      'BRICKSBRAIN-AI Property Comparison Report',
      '='.repeat(60), '',
      `Generated: ${new Date().toLocaleString()}`,
      `Properties compared: ${selected.length}`, '',
    ];
    ROWS.forEach(row => {
      lines.push(`${row.label}:`);
      selected.forEach(p => lines.push(`  ${p.city} / ${p.locality}: ${row.fn(p)}`));
      lines.push('');
    });
    lines.push('', '— BRICKSBRAIN-AI | India\'s Smartest Real Estate Platform —');
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `BRICKSBRAIN-AI-Comparison-${Date.now()}.txt`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Property Comparison</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Add up to 4 properties · Side-by-side data analysis</p>
        </div>
        {selected.length >= 2 && (
          <button onClick={downloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all">
            ⬇ Download Report
          </button>
        )}
      </div>

      {/* Search to add */}
      <Card><CardBody>
        <div className="flex justify-between items-center mb-3">
          <CardTitle className="mb-0">🔍 Search &amp; Add Properties</CardTitle>
          <span className="text-xs font-bold text-slate-400">{selected.length}/4 selected</span>
        </div>
        <div className="relative">
          <input className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
            placeholder="Search by property name, locality or city to compare..."
            value={searchQ}
            onChange={e => { setSearchQ(e.target.value); setShowSearch(true); }}
            onFocus={() => setShowSearch(true)} />
          {showSearch && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto mt-1">
              {searchResults.map(p => (
                <div key={p.id}
                  className="px-4 py-3 cursor-pointer text-sm hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 last:border-0 flex justify-between items-center"
                  onClick={() => addProperty(p)}>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-white">{p.title || p.name}</span>
                    <span className="text-slate-400 ml-2">·</span>
                    <span className="text-slate-500 dark:text-slate-400 ml-2 text-xs">{p.locality}, {p.city}</span>
                  </div>
                  <span className="text-brand-600 font-black text-xs">{p.pD}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Selected pills */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selected.map(p => (
              <div key={p.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-800 rounded-full text-xs font-bold text-brand-700 dark:text-brand-400">
                {p.emoji} {p.city} · {p.pD}
                <button className="ml-1 text-brand-400 hover:text-brand-700 font-black text-sm leading-none" onClick={() => removeProperty(p.id)}>×</button>
              </div>
            ))}
          </div>
        )}
      </CardBody></Card>

      {selected.length < 2 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">
          <div className="text-5xl mb-3">⇄</div>
          <p className="font-bold text-slate-500 dark:text-slate-400 text-base">Add at least 2 properties to compare</p>
          <p className="text-sm mt-1">Use the search above or click "+ Compare" on any listing</p>
        </div>
      ) : (
        <Card>
          <CardBody>
            <CardTitle>📊 Comparison Table</CardTitle>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ minWidth: selected.length * 200 + 180 }}>
                <thead>
                  <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-3 w-40 text-xs font-black text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-700/50">Factor</th>
                    {selected.map(p => (
                      <th key={p.id} className="text-left py-3 px-3 bg-slate-50 dark:bg-slate-700/50">
                        <div className="font-black text-slate-900 dark:text-white">{p.emoji} {p.city}</div>
                        <div className="text-xs font-semibold text-slate-400 mt-0.5">{p.locality}</div>
                        <div className="text-xs font-black text-brand-600 mt-0.5">{p.pD}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row, ri) => {
                    const bestIdx = row.bestFn ? row.bestFn(selected) : -1;
                    return (
                      <tr key={ri} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="py-2.5 px-3 text-xs font-bold text-slate-500 dark:text-slate-400">{row.label}</td>
                        {selected.map((p, pi) => (
                          <td key={p.id} className={`py-2.5 px-3 text-sm font-semibold ${
                            bestIdx === pi ? 'text-brand-700 dark:text-brand-400 font-black' : 'text-slate-700 dark:text-slate-300'
                          }`}>
                            {bestIdx === pi && <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-500 mr-1.5 mb-0.5" />}
                            {row.fn(p)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-400 mt-3">● Green dot = best value in that category</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
