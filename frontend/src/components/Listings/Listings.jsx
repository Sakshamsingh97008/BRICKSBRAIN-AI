import React, { useState, useMemo } from 'react';
import { Card, CardBody, PropertyCard, ContactModal } from '../UI';
import { SAMPLE_PROPERTIES, INDIA_CITIES } from '../../data/indiaData';

const TYPES    = ['All','Flat','Villa','Plot','Commercial'];
const LIST_T   = ['All','Sale','Rent'];
const SELLER_T = ['All','Owner','Agent'];
const BEDS     = ['Any','1','2','3','4','5+'];
const SORTS    = [
  { value:'score',      label:'Score: Highest'    },
  { value:'price_asc',  label:'Price: Low → High' },
  { value:'price_desc', label:'Price: High → Low' },
  { value:'roi',        label:'ROI: Highest'       },
  { value:'area',       label:'Area: Largest'      },
];

export default function Listings({ compareList = [], setCompareList }) {
  const [type,      setType]      = useState('All');
  const [listType,  setListType]  = useState('All');
  const [city,      setCity]      = useState('All');
  const [bed,       setBed]       = useState('Any');
  const [seller,    setSeller]    = useState('All');
  const [sort,      setSort]      = useState('score');
  const [query,     setQuery]     = useState('');
  const [minP,      setMinP]      = useState('');
  const [maxP,      setMaxP]      = useState('');
  const [contactP,  setContactP]  = useState(null);

  const cities = ['All', ...new Set(SAMPLE_PROPERTIES.map(p => p.city))].sort();

  const filtered = useMemo(() => {
    return SAMPLE_PROPERTIES.filter(p => {
      if (type !== 'All'      && p.type     !== type)                 return false;
      if (listType !== 'All'  && p.listType !== listType)             return false;
      if (city !== 'All'      && p.city     !== city)                 return false;
      if (seller !== 'All'    && p.sellerType !== seller.toLowerCase()) return false;
      if (bed !== 'Any') {
        const b = parseInt(bed);
        if (bed === '5+' ? p.bed < 5 : p.bed !== b) return false;
      }
      if (minP && p.price < parseInt(minP) * 100000) return false;
      if (maxP && p.price > parseInt(maxP) * 100000) return false;
      if (query) {
        const q = query.toLowerCase();
        return p.title?.toLowerCase().includes(q) || p.locality.toLowerCase().includes(q) || p.city.toLowerCase().includes(q);
      }
      return true;
    }).sort((a, b) => {
      switch (sort) {
        case 'price_asc':  return a.price - b.price;
        case 'price_desc': return b.price - a.price;
        case 'roi':        return b.roi   - a.roi;
        case 'area':       return b.area  - a.area;
        default:           return b.score - a.score;
      }
    });
  }, [type, listType, city, bed, seller, sort, query, minP, maxP]);

  const FilterChip = ({ label, active, onClick }) => (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all whitespace-nowrap ${
        active ? 'bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-900/30 dark:border-brand-500 dark:text-brand-400'
               : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-brand-300 bg-white dark:bg-slate-800'
      }`}>{label}</button>
  );

  return (
    <div className="animate-fade-in space-y-4">
      <div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Property Listings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{filtered.length} properties found · Pan India</p>
      </div>

      <Card><CardBody className="space-y-3">
        {/* Search + sort */}
        <div className="flex flex-wrap gap-2">
          <input className="flex-1 min-w-[200px] px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
            placeholder="🔍 Search property, locality, city..." value={query} onChange={e => setQuery(e.target.value)} />
          <select className="px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none"
            value={city} onChange={e => setCity(e.target.value)}>
            {cities.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none"
            value={sort} onChange={e => setSort(e.target.value)}>
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* Type chips */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Type:</span>
          {TYPES.map(t => <FilterChip key={t} label={t} active={type===t} onClick={() => setType(t)} />)}
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-2">For:</span>
          {LIST_T.map(t => <FilterChip key={t} label={t} active={listType===t} onClick={() => setListType(t)} />)}
        </div>

        {/* BHK + seller + price */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">BHK:</span>
          {BEDS.map(b => <FilterChip key={b} label={b} active={bed===b} onClick={() => setBed(b)} />)}
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-2">Seller:</span>
          {SELLER_T.map(s => <FilterChip key={s} label={s} active={seller===s} onClick={() => setSeller(s)} />)}
          <div className="ml-auto flex items-center gap-2">
            <input className="w-24 px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              placeholder="Min (L)" value={minP} onChange={e => setMinP(e.target.value)} />
            <span className="text-slate-400 text-xs font-bold">—</span>
            <input className="w-24 px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              placeholder="Max (L)" value={maxP} onChange={e => setMaxP(e.target.value)} />
          </div>
        </div>
      </CardBody></Card>

      {filtered.length === 0
        ? <div className="text-center py-16 text-slate-400 dark:text-slate-500">
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-bold text-slate-500 dark:text-slate-400">No properties match your filters</p>
            <p className="text-sm mt-1">Try adjusting your search criteria</p>
          </div>
        : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(p => (
              <PropertyCard key={p.id} p={p} compareList={compareList}
                onCompare={id => setCompareList && setCompareList(l => l.includes(id) ? l.filter(x=>x!==id) : l.length < 4 ? [...l, id] : l)}
                onContact={setContactP} />
            ))}
          </div>
      }

      <ContactModal prop={contactP} onClose={() => setContactP(null)} />
    </div>
  );
}
