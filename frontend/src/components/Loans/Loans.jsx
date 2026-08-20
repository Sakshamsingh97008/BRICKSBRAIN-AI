import React, { useState, useMemo } from 'react';
import { Card, CardBody, CardTitle } from '../UI';
import { LOAN_BANKS } from '../../data/indiaData';

export default function Loans() {
  const [amount,  setAmount]  = useState(6000000);
  const [income,  setIncome]  = useState(1500000);
  const [tenure,  setTenure]  = useState(20);
  const [applied, setApplied] = useState(null);

  const calcEMI = (p, r, n) => {
    const rate = r / 1200;
    return Math.round(p * rate * Math.pow(1+rate,n) / (Math.pow(1+rate,n)-1));
  };

  const loans = useMemo(() => LOAN_BANKS.map(l => {
    const emi   = calcEMI(amount, l.rate, Math.min(tenure, l.maxTenure) * 12);
    const total = emi * Math.min(tenure, l.maxTenure) * 12;
    return { ...l, emi, totalPayable: total, totalInterest: total - amount, eligible: emi < income * 0.5 / 12 };
  }), [amount, income, tenure]);

  const downloadReport = () => {
    const lines = ['BRICKSBRAIN-AI Loan EMI Comparison Report', '='.repeat(50), '',
      `Loan Amount: ₹${(amount/100000).toFixed(1)} Lakhs`,
      `Annual Income: ₹${(income/100000).toFixed(1)} Lakhs`,
      `Tenure: ${tenure} years`, '', 'BANK-WISE COMPARISON', '-'.repeat(30)];
    loans.forEach(l => lines.push(
      `${l.bank}: ${l.rate}% | EMI ₹${l.emi.toLocaleString()} | Total ₹${(l.totalPayable/100000).toFixed(1)}L | Interest ₹${(l.totalInterest/100000).toFixed(1)}L | Eligible: ${l.eligible?'Yes':'No'}`
    ));
    lines.push('', `Generated: ${new Date().toLocaleString()}`, '', '— BRICKSBRAIN-AI | India\'s Smartest Real Estate Platform —');
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `BRICKSBRAIN-AI-Loans-${Date.now()}.txt`; a.click(); URL.revokeObjectURL(url);
  };

  const bestLoan = loans.filter(l => l.eligible).sort((a,b) => a.rate - b.rate)[0];

  return (
    <div className="animate-fade-in space-y-4">
      <div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Home Loan Matcher</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Compare 8 banks · Live EMI calculator · Instant eligibility check</p>
      </div>

      <Card><CardBody>
        <CardTitle>🧮 Loan Calculator</CardTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {[
            { label:'Loan Amount (₹)', val:amount, set:setAmount, sub:`₹${(amount/100000).toFixed(1)} Lakhs` },
            { label:'Annual Income (₹)', val:income, set:setIncome, sub:`₹${(income/100000).toFixed(1)}L / year` },
            { label:'Tenure (years)', val:tenure, set:setTenure, sub:'5–30 years', min:5, max:30 },
          ].map(({ label, val, set, sub, min, max }) => (
            <div key={label}>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">{label}</label>
              <input type="number" min={min} max={max}
                className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
                value={val} onChange={e => set(+e.target.value)} />
              <p className="text-xs text-slate-400 mt-1">{sub}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-lg transition-all">🔍 Find Best Loans</button>
          <button onClick={downloadReport} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all">⬇ Download Report</button>
        </div>
      </CardBody></Card>

      {bestLoan && (
        <div className="p-4 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-xl text-sm font-semibold text-brand-700 dark:text-brand-400">
          🏆 Best match for your profile: <strong>{bestLoan.bank}</strong> at <strong>{bestLoan.rate}%</strong> — EMI ₹{bestLoan.emi.toLocaleString()}/mo — Total payable ₹{(bestLoan.totalPayable/100000).toFixed(1)}L
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loans.map((l, i) => (
          <div key={i} className={`bg-white dark:bg-slate-800 rounded-xl p-4 flex flex-col border-2 transition-all ${
            l.best ? 'border-brand-500 shadow-lg' : 'border-slate-200 dark:border-slate-700'
          }`}>
            {l.best && <span className="text-[11px] bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 border border-brand-200 dark:border-brand-800 px-2.5 py-0.5 rounded-full self-start mb-2 font-black">⭐ Best Match</span>}
            {!l.eligible && <span className="text-[11px] bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full self-start mb-2 font-black">⚠ Low Eligibility</span>}
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-xl mb-1">{l.logo}</div>
                <div className="font-black text-sm text-slate-900 dark:text-white">{l.bank}</div>
                <div className="text-xs text-slate-400 mt-0.5">{l.type}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-slate-900 dark:text-white">{l.rate}<span className="text-sm font-medium text-slate-400">%</span></div>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 mb-3 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">EMI</span>
                <span className="font-black text-brand-600 dark:text-brand-400">₹{l.emi.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Total Payable</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">₹{(l.totalPayable/100000).toFixed(1)}L</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Total Interest</span>
                <span className="font-bold text-red-500">₹{(l.totalInterest/100000).toFixed(1)}L</span>
              </div>
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500 space-y-1 mb-3 flex-1">
              <div>Processing fee: ₹{l.processingFee?.toLocaleString()}</div>
              <div>Max tenure: {l.maxTenure} years</div>
              <div>Pre-closure: {l.preClosure}</div>
            </div>
            <button onClick={() => setApplied(l.bank)}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg transition-all">
              {applied === l.bank ? '✓ Applied!' : 'Apply Now →'}
            </button>
          </div>
        ))}
      </div>

      {applied && (
        <div className="fixed inset-0 bg-black/60 z-[900] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setApplied(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="font-black text-xl text-slate-900 dark:text-white mb-2">Application Submitted!</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">{applied} will contact you within 24 hours. Keep income documents ready.</p>
            <button className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all" onClick={() => setApplied(null)}>Done ✓</button>
          </div>
        </div>
      )}
    </div>
  );
}
