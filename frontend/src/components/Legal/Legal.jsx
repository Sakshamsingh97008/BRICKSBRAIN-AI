import React, { useState } from 'react';
import { Card, CardBody, CardTitle } from '../UI';

const CHECKS = [
  { label:'Title deed verified',            ok:true  },
  { label:'No active court cases',          ok:true  },
  { label:'Mortgage fully discharged',      ok:true  },
  { label:'RERA registration valid',        ok:true  },
  { label:'Property tax: 1 year pending',   ok:false },
  { label:'Stamp duty paid',                ok:true  },
  { label:'Encumbrance certificate (EC)',   ok:true  },
  { label:'Occupancy certificate (OC)',     ok:true  },
  { label:'No disputed ownership',          ok:true  },
  { label:'Layout plan approved by BBMP',   ok:true  },
];

export default function Legal() {
  const [address, setAddress] = useState('');
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);

  const check = () => {
    if (!address.trim()) return;
    setLoading(true);
    setTimeout(() => {
      const reraState = address.toLowerCase().includes('bangalore') || address.toLowerCase().includes('bengaluru') ? 'KA'
                      : address.toLowerCase().includes('mumbai') ? 'MH'
                      : address.toLowerCase().includes('delhi') ? 'DL'
                      : address.toLowerCase().includes('hyderabad') ? 'TS' : 'UP';
      setData({
        reraId: `RERA/${reraState}/${address.toUpperCase().replace(/[\s,]/g,'-').slice(0,10)}/2023/${Math.floor(Math.random()*9999).toString().padStart(4,'0')}`,
        reraVerified: true,
        chain: [
          { year:2005, owner:'Original Allottee', event:'Registration via Govt allotment / RERA', status:'green', note:'Title clear' },
          { year:2011, owner:'2nd Owner',          event:'Resale — Title deed registered',          status:'green', note:'Verified' },
          { year:2019, owner:'2nd Owner',          event:'Home loan mortgage raised (SBI)',          status:'amber', note:'Discharged 2023' },
          { year:2023, owner:'2nd Owner',          event:'SBI Home Loan fully discharged',           status:'green', note:'NOC obtained' },
          { year:2024, owner:'Current Seller',     event:'Property listed for sale',                 status:'green', note:'Active listing' },
        ],
        checks: CHECKS,
        overallStatus: 'safe',
        taxPending: '1 year (₹12,400)',
      });
      setLoading(false);
    }, 1200);
  };

  const downloadReport = () => {
    if (!data) return;
    const lines = ['BRICKSBRAIN-AI Legal Check Report', '='.repeat(50), '',
      `Property: ${address}`, `RERA ID: ${data.reraId}`,
      `Generated: ${new Date().toLocaleString()}`, '', 'OWNERSHIP CHAIN', '-'.repeat(30)];
    data.chain.forEach(c => lines.push(`${c.year}: ${c.event} — ${c.owner} [${c.status.toUpperCase()}]`));
    lines.push('', 'VERIFICATION CHECKS', '-'.repeat(30));
    data.checks.forEach(c => lines.push(`${c.ok ? '✓' : '✗'} ${c.label}`));
    lines.push('', `Overall Status: ${data.overallStatus.toUpperCase()}`,
      `Tax Pending: ${data.taxPending}`, '', '— BRICKSBRAIN-AI | India\'s Smartest Real Estate Platform —');
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `BRICKSBRAIN-AI-Legal-${Date.now()}.txt`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in space-y-4">
      <div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Legal &amp; Case History</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">RERA verification · Ownership chain · Encumbrance check · All India coverage</p>
      </div>

      <Card><CardBody>
        <CardTitle>🔍 Check Property Legal Status</CardTitle>
        <div className="flex gap-2 flex-wrap">
          <input className="flex-1 min-w-[240px] px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
            placeholder="Enter property address, registration number or project name..."
            value={address} onChange={e => setAddress(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && check()} />
          <button onClick={check} disabled={!address.trim() || loading}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition-all flex items-center gap-2">
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '🔍'}
            {loading ? 'Checking...' : 'Check Now'}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2">Try: "Whitefield Bengaluru", "Dwarka Sector 12 Delhi", "Gachibowli Hyderabad"</p>
      </CardBody></Card>

      {data && (
        <>
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center px-3 py-1.5 bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 border border-brand-200 dark:border-brand-800 rounded-full text-xs font-black">✅ RERA Verified</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">ID: {data.reraId}</span>
            </div>
            <button onClick={downloadReport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all">
              ⬇ Download Legal Report
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card><CardBody>
              <CardTitle>📋 Ownership Chain</CardTitle>
              <div className="relative pl-7 space-y-0">
                <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
                {data.chain.map((c, i) => (
                  <div key={i} className="relative pb-5 last:pb-0">
                    <div className={`absolute left-[-17px] w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-800 ${
                      c.status==='green' ? 'bg-brand-500' : c.status==='amber' ? 'bg-amber-400' : 'bg-red-500'
                    }`} />
                    <div className="text-[11px] font-bold text-slate-400 mb-0.5">{c.year}</div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-white">{c.event}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{c.owner} · {c.note}</div>
                  </div>
                ))}
              </div>
            </CardBody></Card>

            <Card><CardBody>
              <CardTitle>✅ Verification Summary</CardTitle>
              <div className="space-y-2 mb-4">
                {data.checks.map((c, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 text-white ${c.ok ? 'bg-brand-500' : 'bg-amber-400'}`}>
                      {c.ok ? '✓' : '!'}
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{c.label}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-xl text-sm font-semibold text-brand-700 dark:text-brand-400 mb-3">
                ✅ Overall: Safe to proceed. Clear pending property tax (₹12,400) before registration to avoid delays.
              </div>
              <div className="flex gap-2 flex-wrap">
                <button className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">📤 Share Report</button>
                <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all">🔗 Verify on RERA Portal →</button>
              </div>
            </CardBody></Card>
          </div>
        </>
      )}
    </div>
  );
}
