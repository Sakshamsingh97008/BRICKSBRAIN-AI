import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, CardTitle, Toast } from '../UI';
import { INDIA_CITIES } from '../../data/indiaData';
import { useAuth } from '../../context/AuthContext';

const STEPS = ['Property Details', 'Location & Price', 'Photos & Publish'];

export default function Sell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step,  setStep]  = useState(0);
  const [toast, setToast] = useState('');
  const [form,  setForm]  = useState({
    title:'', type:'Flat', listType:'Sale', bed:'2', bath:'2', floor:'',
    area:'', desc:'', amenities:[], city:'', locality:'', price:'', phone: user?.phone || '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const cityObj    = INDIA_CITIES.find(c => c.city === form.city);
  const localities = cityObj ? cityObj.localities : [];

  const AMENITIES = ['Parking','Lift','Gym','Swimming Pool','Power Backup','Security','Club House','Garden','Play Area','Jogging Track'];

  const toggleAmenity = (a) => setForm(f => ({
    ...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a]
  }));

  const publish = () => {
    if (!form.title || !form.city || !form.price) { setToast('Fill all required fields'); return; }
    setToast('🎉 Property listed successfully! You will receive enquiries shortly.');
    setTimeout(() => navigate('/listings'), 2500);
  };

  return (
    <div className="animate-fade-in space-y-4 max-w-2xl">
      <div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">List Your Property — Free</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Post for free · Reach lakhs of buyers · Zero brokerage on direct sales</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <React.Fragment key={i}>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => i < step && setStep(i)}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                step > i ? 'bg-brand-600 text-white' : step === i ? 'bg-brand-100 text-brand-700 border-2 border-brand-500' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 border-2 border-slate-200 dark:border-slate-600'
              }`}>
                {step > i ? '✓' : i + 1}
              </div>
              <span className={`text-xs font-bold hidden sm:block ${step === i ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 transition-all ${step > i ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <Card><CardBody>
        {step === 0 && (
          <>
            <CardTitle>📋 Property Details</CardTitle>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Property Title *</label>
                <input className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
                  placeholder="e.g. 3BHK Apartment near Metro, Whitefield Bengaluru" value={form.title} onChange={e => set('title', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Property Type *</label>
                  <select className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
                    value={form.type} onChange={e => set('type', e.target.value)}>
                    {['Flat','Villa','Plot','Commercial','PG / Co-living','Farmhouse'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Listing For *</label>
                  <select className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
                    value={form.listType} onChange={e => set('listType', e.target.value)}>
                    <option>Sale</option><option>Rent</option><option>Lease</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Bedrooms</label>
                  <select className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none"
                    value={form.bed} onChange={e => set('bed', e.target.value)}>
                    {['1','2','3','4','5','6+'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Bathrooms</label>
                  <select className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none"
                    value={form.bath} onChange={e => set('bath', e.target.value)}>
                    {['1','2','3','4','5+'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Area (sqft) *</label>
                  <input type="number" className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
                    placeholder="e.g. 1200" value={form.area} onChange={e => set('area', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Floor Number</label>
                  <input type="number" className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
                    placeholder="0 = Ground" value={form.floor} onChange={e => set('floor', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 block">Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES.map(a => (
                    <button key={a} onClick={() => toggleAmenity(a)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${
                        form.amenities.includes(a)
                          ? 'bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-900/30 dark:border-brand-500 dark:text-brand-400'
                          : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 hover:border-brand-300'
                      }`}>{a}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Description</label>
                <textarea rows={3} className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500 resize-none"
                  placeholder="Describe your property — highlights, nearby landmarks, why it's worth it..." value={form.desc} onChange={e => set('desc', e.target.value)} />
              </div>
              <button className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-lg transition-all" onClick={() => setStep(1)}>
                Next: Location &amp; Price →
              </button>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <CardTitle>📍 Location &amp; Pricing</CardTitle>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">City *</label>
                  <select className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
                    value={form.city} onChange={e => { set('city', e.target.value); set('locality', ''); }}>
                    <option value="">Select city</option>
                    {INDIA_CITIES.map(c => <option key={c.city}>{c.city}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Locality *</label>
                  <select className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
                    value={form.locality} onChange={e => set('locality', e.target.value)} disabled={!form.city}>
                    <option value="">Select locality</option>
                    {localities.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Asking Price (₹) *</label>
                  <input type="number" className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
                    placeholder="e.g. 5000000" value={form.price} onChange={e => set('price', e.target.value)} />
                  {form.price && <p className="text-xs text-brand-600 mt-1">₹{(form.price/100000).toFixed(1)} Lakhs{form.area ? ` · ₹${Math.round(form.price/form.area).toLocaleString()}/sqft` : ''}</p>}
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Contact Phone *</label>
                  <input className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
                    placeholder="+91-XXXXXXXXXX" value={form.phone} onChange={e => set('phone', e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 text-sm font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all" onClick={() => setStep(0)}>← Back</button>
                <button className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-lg transition-all" onClick={() => setStep(2)}>Next: Publish →</button>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <CardTitle>📸 Photos &amp; Publish</CardTitle>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-10 text-center bg-slate-50 dark:bg-slate-700/30 cursor-pointer hover:border-brand-400 transition-all" onClick={() => {}}>
                <div className="text-4xl mb-2">📷</div>
                <p className="font-bold text-slate-600 dark:text-slate-400">Upload Property Photos</p>
                <p className="text-xs text-slate-400 mt-1">Drag & drop or click · Max 10 photos · JPG, PNG · Max 5MB each</p>
                <p className="text-xs text-brand-600 mt-2 font-semibold">Properties with photos get 3x more enquiries!</p>
              </div>

              {/* Summary */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Listing Summary</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  {[
                    ['Title', form.title || '—'],
                    ['Type', `${form.type} · ${form.listType}`],
                    ['Location', form.locality && form.city ? `${form.locality}, ${form.city}` : '—'],
                    ['Price', form.price ? `₹${(form.price/100000).toFixed(1)}L` : '—'],
                    ['Area', form.area ? `${form.area} sqft` : '—'],
                    ['BHK', `${form.bed} BHK · ${form.bath} Bath`],
                  ].map(([l,v]) => (
                    <div key={l}><span className="text-slate-400">{l}:</span> <span className="font-semibold text-slate-800 dark:text-white">{v}</span></div>
                  ))}
                </div>
                {form.amenities.length > 0 && (
                  <div className="mt-2 text-xs text-slate-500">Amenities: {form.amenities.join(', ')}</div>
                )}
              </div>

              <div className="flex gap-2">
                <button className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 text-sm font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all" onClick={() => setStep(1)}>← Back</button>
                <button className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-lg transition-all flex items-center gap-2" onClick={publish}>
                  🚀 Publish Listing Free
                </button>
              </div>
            </div>
          </>
        )}
      </CardBody></Card>

      {toast && <Toast msg={toast} onClose={() => setToast('')} />}
    </div>
  );
}
