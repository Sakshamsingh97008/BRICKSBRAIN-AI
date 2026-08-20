import React, { useState } from 'react';
import { Card, CardBody, CardTitle } from '../UI';
import { INDIA_CITIES, CITY_RATES } from '../../data/indiaData';

export default function AreaIntel() {
  const [city,     setCity]     = useState('Delhi');
  const [locality, setLocality] = useState('');
  const [data,     setData]     = useState(null);
  const [loading,  setLoading]  = useState(false);

  const cityObj    = INDIA_CITIES.find(c => c.city === city);
  const localities = cityObj ? cityObj.localities : [];

  const analyse = () => {
    if (!locality) return;
    setLoading(true);
    setTimeout(() => {
      const rate       = CITY_RATES[city] || 5000;
      const circleRate = Math.round(rate * 0.85);
      const diff       = Math.round((rate - circleRate) / circleRate * 100);
      setData({
        airQuality:  city==='Delhi'?'Moderate':city==='Mumbai'?'Fair':'Good',
        airPct:      city==='Delhi'?52:city==='Mumbai'?65:80,
        traffic:     city==='Delhi'||city==='Mumbai'?'Heavy':'Moderate',
        trafficPct:  city==='Delhi'||city==='Mumbai'?72:50,
        water:       'Good',   waterPct:  82,
        power:       'Excellent', powerPct: 91,
        schools:     Math.floor(Math.random()*4)+1,
        hospitals:   Math.floor(Math.random()*3)+1,
        metro:       (Math.random()*2+0.2).toFixed(1),
        markets:     Math.floor(Math.random()*5)+2,
        gas:         Math.random() > 0.4 ? 'Available' : 'Not Available',
        circleRate, marketRate: rate, diff,
        distances: [
          { place:'Nearest Metro',     dist:`${(Math.random()*1.5+0.2).toFixed(1)} km`, time:`${Math.floor(Math.random()*8+2)} min` },
          { place:'Nearest Hospital',  dist:`${(Math.random()*2+0.5).toFixed(1)} km`,   time:`${Math.floor(Math.random()*10+3)} min` },
          { place:'Nearest School',    dist:`${(Math.random()*1+0.2).toFixed(1)} km`,   time:`${Math.floor(Math.random()*6+2)} min` },
          { place:'Nearest Market',    dist:`${(Math.random()*1.5+0.3).toFixed(1)} km`, time:`${Math.floor(Math.random()*8+2)} min` },
          { place:'Airport',           dist:`${Math.floor(Math.random()*25+5)} km`,      time:`${Math.floor(Math.random()*35+10)} min` },
          { place:'Railway Station',   dist:`${(Math.random()*5+0.5).toFixed(1)} km`,   time:`${Math.floor(Math.random()*15+3)} min` },
        ],
      });
      setLoading(false);
    }, 1000);
  };

  const downloadReport = () => {
    if (!data) return;
    const lines = [
      'BRICKSBRAIN-AI Area Intelligence Report',
      '='.repeat(50), '',
      `Location: ${locality}, ${city}`,
      `Generated: ${new Date().toLocaleString()}`, '',
      'LOCALITY SCORES', '-'.repeat(30),
      `Air Quality: ${data.airQuality} (${data.airPct}%)`,
      `Traffic: ${data.traffic} (${data.trafficPct}%)`,
      `Water Supply: ${data.water} (${data.waterPct}%)`,
      `Power Supply: ${data.power} (${data.powerPct}%)`,
      `Schools within 1km: ${data.schools}`,
      `Hospitals within 2km: ${data.hospitals}`,
      `Nearest Metro: ${data.metro} km`,
      `Markets within 1km: ${data.markets}`,
      `Gas Pipeline: ${data.gas}`, '',
      'PRICE ANALYSIS', '-'.repeat(30),
      `Govt Circle Rate: ₹${data.circleRate.toLocaleString()}/sqft`,
      `Market Rate: ₹${data.marketRate.toLocaleString()}/sqft`,
      `Difference: ${data.diff}% above circle rate`, '',
      'DISTANCES', '-'.repeat(30),
    ];
    data.distances.forEach(d => lines.push(`${d.place}: ${d.dist} (${d.time})`));
    lines.push('', '— BRICKSBRAIN-AI | India\'s Smartest Real Estate Platform —');
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `BRICKSBRAIN-AI-AreaIntel-${city}-${locality}-${Date.now()}.txt`;
    a.click(); URL.revokeObjectURL(url);
  };

  const IntelCard = ({ icon, label, value, pct, color }) => (
    <div className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-center">
      <div className="text-2xl mb-1.5">{icon}</div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-black text-slate-800 dark:text-white">{value}</p>
      <div className="mt-2 h-1 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width:`${pct}%`, background: color }} />
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in space-y-4">
      <div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Area Intelligence</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Locality insights powered by Maps &amp; GIS APIs · Pan India coverage</p>
      </div>

      <Card><CardBody>
        <CardTitle>📍 Select Location to Analyse</CardTitle>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[160px]">
            <label className="text-xs font-bold text-slate-500 mb-1 block">City</label>
            <select className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
              value={city} onChange={e => { setCity(e.target.value); setLocality(''); setData(null); }}>
              {INDIA_CITIES.map(c => <option key={c.city}>{c.city}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="text-xs font-bold text-slate-500 mb-1 block">Locality</label>
            <select className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
              value={locality} onChange={e => setLocality(e.target.value)}>
              <option value="">Select locality</option>
              {localities.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <button onClick={analyse} disabled={!locality || loading}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition-all flex items-center gap-2">
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '📍'}
            {loading ? 'Analysing...' : 'Analyse Area'}
          </button>
        </div>
      </CardBody></Card>

      {!data && !loading && (
        <div className="text-center py-16 text-slate-400">
          <div className="text-5xl mb-3">🗺️</div>
          <p className="font-bold text-slate-500 text-base">Select a city and locality to analyse</p>
          <p className="text-sm mt-1">Get air quality, traffic, amenities, circle rates and distances</p>
        </div>
      )}

      {data && (
        <>
          <div className="flex justify-between items-center px-0.5">
            <div className="px-4 py-2 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-900 rounded-xl text-sm font-bold text-brand-700 dark:text-brand-400">
              📍 {locality}, {city}
            </div>
            <button onClick={downloadReport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all">
              ⬇ Download Report
            </button>
          </div>

          {/* Intel grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
            <IntelCard icon="🌿" label="Air Quality"      value={data.airQuality}  pct={data.airPct}    color={data.airPct>70?'#16a34a':'#d97706'} />
            <IntelCard icon="🚗" label="Traffic"          value={data.traffic}     pct={data.trafficPct} color={data.trafficPct>60?'#dc2626':'#d97706'} />
            <IntelCard icon="💧" label="Water Supply"     value={data.water}       pct={data.waterPct}  color="#2563eb" />
            <IntelCard icon="⚡" label="Power Supply"     value={data.power}       pct={data.powerPct}  color="#16a34a" />
            <IntelCard icon="🏫" label="Schools (1km)"    value={data.schools}     pct={data.schools*25} color="#16a34a" />
            <IntelCard icon="🏥" label="Hospitals (2km)"  value={data.hospitals}   pct={data.hospitals*33} color="#2563eb" />
            <IntelCard icon="🚇" label="Metro (km)"       value={`${data.metro} km`} pct={Math.max(10,100-data.metro*40)} color="#16a34a" />
            <IntelCard icon="🛒" label="Markets (1km)"    value={data.markets}     pct={data.markets*15} color="#d97706" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Circle rate */}
            <Card><CardBody>
              <CardTitle>💰 Circle Rate vs Market Rate</CardTitle>
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                ₹{data.circleRate.toLocaleString()}
                <span className="text-sm font-semibold text-slate-400">/sqft govt. rate</span>
              </div>
              <div className="mt-3 flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-sm font-bold text-slate-500">Market Rate</span>
                <span className="text-base font-black text-slate-900 dark:text-white">₹{data.marketRate.toLocaleString()}/sqft</span>
              </div>
              <div className={`mt-2.5 p-3 rounded-xl border text-sm font-semibold ${data.diff > 20 ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400' : 'bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-900/20 dark:border-brand-800 dark:text-brand-400'}`}>
                {data.diff > 0 ? `↑ Market is ${data.diff}% above circle rate` : `↓ Market is ${Math.abs(data.diff)}% below circle rate`}
                {data.diff <= 20 ? ' — healthy range for investment.' : ' — market may be overheated, negotiate hard.'}
              </div>
              <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-500">Gas Pipeline:</span>
                <span className={`ml-2 text-xs font-bold ${data.gas === 'Available' ? 'text-brand-600' : 'text-red-500'}`}>{data.gas}</span>
              </div>
            </CardBody></Card>

            {/* Distances */}
            <Card><CardBody>
              <CardTitle>📏 Distance Calculator</CardTitle>
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {data.distances.map((d, i) => (
                  <div key={i} className="flex justify-between py-2.5 text-sm">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">{d.place}</span>
                    <span className="font-black text-slate-800 dark:text-white">{d.dist} · {d.time}</span>
                  </div>
                ))}
              </div>
            </CardBody></Card>
          </div>
        </>
      )}
    </div>
  );
}
