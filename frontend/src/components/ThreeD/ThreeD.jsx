import React, { useState, useMemo, Suspense, useRef, useEffect, Component } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Text } from '@react-three/drei';
import { Card, CardBody, CardTitle, SliderRow, PredBox } from '../UI';

// ── WebGL Error Boundary ────────────────────────────────────────────────────
class WebGLErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error) { console.warn('ThreeD WebGL error caught:', error.message); }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// Check if WebGL is supported well enough
function checkWebGL() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return false;
    const ext = gl.getExtension('ANGLE_instanced_arrays');
    return !!ext;
  } catch { return false; }
}

// ── CSS 3D Fallback (when WebGL/ANGLE not available) ──────────────────────
function CSS3DFallback({ floors, width, depth, wallColor, roofColor }) {
  const floorEls = Array.from({ length: floors });
  const bH = Math.min(70, floors * 38);
  return (
    <div className="flex flex-col items-center justify-center h-full select-none">
      <div style={{ perspective: '600px', perspectiveOrigin: '50% 60%' }}>
        <div style={{ transformStyle: 'preserve-3d', transform: 'rotateX(20deg) rotateY(-25deg)', display: 'inline-block' }}>
          {/* Building body */}
          {floorEls.map((_, i) => (
            <div key={i} style={{
              width: `${width * 7}px`, height: '38px', marginBottom: '1px',
              background: wallColor, border: '1.5px solid rgba(0,0,0,0.12)',
              boxShadow: 'inset -8px 0 16px rgba(0,0,0,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-around',
              padding: '0 10px', borderRadius: i === floors - 1 ? '2px 2px 0 0' : '0',
            }}>
              {[0,1,2].map(w => (
                <div key={w} style={{ width: 10, height: 16, background: '#bae6fd', opacity: 0.8, borderRadius: 2 }} />
              ))}
            </div>
          ))}
          {/* Roof */}
          <div style={{
            width: 0, height: 0,
            borderLeft: `${width * 3.5}px solid transparent`,
            borderRight: `${width * 3.5}px solid transparent`,
            borderBottom: `${Math.max(20, floors * 6)}px solid ${roofColor}`,
            transform: 'translateY(0)',
            filter: 'drop-shadow(0 -2px 4px rgba(0,0,0,0.2))',
          }} />
        </div>
      </div>
      <p className="text-xs text-slate-400 mt-4">G+{floors - 1} · {width}m × {depth}m</p>
      <p className="text-xs text-amber-500 mt-1 font-semibold">⚠️ WebGL not supported — CSS 3D preview</p>
    </div>
  );
}


const WALL_COLORS  = ['#fef9c3','#dbeafe','#dcfce7','#fce7f3','#f1f5f9'];
const ROOF_COLORS  = ['#dc2626','#92400e','#1e3a5f','#4c1d95','#064e3b'];
const WALL_NAMES   = ['Cream','Sky Blue','Mint','Blush','Gray'];
const ROOF_NAMES   = ['Red','Brown','Navy','Purple','Green'];
const WINDOW_STYLES = [
  { label: 'Classic', color: '#bae6fd' },
  { label: 'Frosted', color: '#e2e8f0' },
  { label: 'Tinted', color: '#94a3b8' },
];

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

// Rough conversion from a plot's area (sqyd) to a buildable footprint
// (width/depth in metres) after accounting for typical setback margins.
// This is an approximation for visualization only — actual buildable area
// depends on local municipal bylaws (FAR, ground coverage limits, etc).
function footprintFromPlotArea(areaSqyd) {
  const areaSqm     = areaSqyd * 0.836127;
  const buildableSqm = areaSqm * 0.62; // ~62% ground coverage after setbacks
  const side         = Math.sqrt(buildableSqm);
  const width = clamp(Math.round(side * 1.15), 4, 16);
  const depth = clamp(Math.round(side * 0.87), 4, 14);
  return { width, depth };
}

function House({ floors, width, depth, wallColor, roofColor, windowStyle, bedrooms, bathrooms, diningRooms, kitchen, showInterior }) {
  const fH = 2.8, totalH = floors * fH;
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current && !showInterior) {
      ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.18) * 0.06;
    }
  });

  const windowColor = WINDOW_STYLES[windowStyle].color;
  const wallOpacity = showInterior ? 0.35 : 1;
  const wallTransparent = showInterior;
  const interiorWidth = Math.max(4, width - 1.4);
  const interiorDepth = Math.max(4, depth - 1.4);
  const leftWidth = interiorWidth * 0.44;
  const rightWidth = interiorWidth - leftWidth - 0.16;
  const bedroomBand = Math.max(1.4, interiorDepth * 0.52);
  const bathroomBand = Math.max(1.2, interiorDepth * 0.26);
  const bedroomDepth = bedroomBand / Math.max(1, bedrooms);
  const bathroomDepth = bathroomBand / Math.max(1, bathrooms);
  const leftX = -interiorWidth / 2 + leftWidth / 2 + 0.08;
  const rightX = interiorWidth / 2 - rightWidth / 2 - 0.08;

  if (showInterior) {
    return (
      <group ref={ref}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[width + 0.8, depth + 0.8]}/>
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <planeGeometry args={[interiorWidth, interiorDepth]}/>
          <meshStandardMaterial color="#f8fafc" />
        </mesh>

        <mesh position={[0, 0.12, -interiorDepth / 2]}>
          <boxGeometry args={[interiorWidth + 0.08, 0.24, 0.08]}/>
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[0, 0.12, interiorDepth / 2]}>
          <boxGeometry args={[interiorWidth + 0.08, 0.24, 0.08]}/>
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[-interiorWidth / 2, 0.12, 0]}>
          <boxGeometry args={[0.08, 0.24, interiorDepth + 0.08]}/>
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[interiorWidth / 2, 0.12, 0]}>
          <boxGeometry args={[0.08, 0.24, interiorDepth + 0.08]}/>
          <meshStandardMaterial color="#334155" />
        </mesh>

        <mesh position={[0, 0.12, -interiorDepth / 8]}>
          <boxGeometry args={[interiorWidth - 0.14, 0.08, 0.08]}/>
          <meshStandardMaterial color="#334155" />
        </mesh>

        {[...Array(bedrooms)].map((_, idx) => (
          <mesh key={`bed-${idx}`} position={[leftX, 0.1, -interiorDepth / 2 + bedroomDepth / 2 + idx * bedroomDepth]}>
            <boxGeometry args={[leftWidth - 0.24, 0.12, bedroomDepth - 0.06]}/>
            <meshStandardMaterial color="#fde68a" />
          </mesh>
        ))}
        {[...Array(bathrooms)].map((_, idx) => (
          <mesh key={`bath-${idx}`} position={[leftX, 0.1, interiorDepth / 2 - bathroomDepth / 2 - idx * bathroomDepth]}>
            <boxGeometry args={[leftWidth - 0.24, 0.12, bathroomDepth - 0.06]}/>
            <meshStandardMaterial color="#bfdbfe" />
          </mesh>
        ))}
        {diningRooms > 0 && (
          <mesh position={[rightX, 0.1, -interiorDepth / 4]}>
            <boxGeometry args={[rightWidth - 0.18, 0.12, interiorDepth * 0.35]}/>
            <meshStandardMaterial color="#fb7185" />
          </mesh>
        )}
        {kitchen && (
          <mesh position={[rightX, 0.1, interiorDepth / 2 - 0.8]}>
            <boxGeometry args={[rightWidth - 0.18, 0.12, 1.1]}/>
            <meshStandardMaterial color="#a855f7" />
          </mesh>
        )}

        <Text position={[leftX, 0.32, -interiorDepth / 2 + 0.14]} fontSize={0.18} color="#475569">Bedroom</Text>
        <Text position={[leftX, 0.32, interiorDepth / 2 - 0.14]} fontSize={0.18} color="#1e3a8a">Bath</Text>
        {diningRooms > 0 && <Text position={[rightX, 0.32, -interiorDepth / 4]} fontSize={0.18} color="#b91c1c">Dining</Text>}
        {kitchen && <Text position={[rightX, 0.32, interiorDepth / 2 - 0.9]} fontSize={0.18} color="#7c3aed">Kitchen</Text>}
      </group>
    );
  }

  return (
    <group ref={ref}>
      <mesh position={[0,-0.2,0]}><boxGeometry args={[width+0.8,0.4,depth+0.8]}/><meshStandardMaterial color="#94a3b8"/></mesh>
      {Array.from({length:floors}).map((_,i) => (
        <group key={i} position={[0, i*fH + fH/2, 0]}>
          <mesh><boxGeometry args={[width,fH-0.1,depth]}/><meshStandardMaterial color={wallColor} transparent={wallTransparent} opacity={wallOpacity}/></mesh>
          {[ -width/2 + 1.2, 0, width/2 - 1.2 ].map((x,j) => (
            <mesh key={j} position={[x, 0.35, depth/2+0.025]}><boxGeometry args={[0.9,1.1,0.05]}/><meshStandardMaterial color={windowColor} transparent opacity={0.78}/></mesh>
          ))}
          <mesh position={[0, fH/2-0.08, 0]}><boxGeometry args={[width+0.18,0.16,depth+0.18]}/><meshStandardMaterial color="#64748b"/></mesh>
        </group>
      ))}
      <mesh position={[0,0.9,depth/2+0.03]}><boxGeometry args={[1.2,2,0.08]}/><meshStandardMaterial color="#92400e"/></mesh>
      <mesh position={[0,0.75,depth/2+0.079]}><boxGeometry args={[0.9,1.1,0.08]}/><meshStandardMaterial color="#fde68a"/></mesh>
      <group position={[0,0,depth/2+0.6]}>
        <mesh position={[0, -0.15, 0.25]}>
          <boxGeometry args={[width - 1.2, 0.1, 0.12]}/>
          <meshStandardMaterial color="#3f3f46"/>
        </mesh>
      </group>
      {showInterior && (
        <group>
          <mesh position={[0, 0, -depth/2 + 0.28]}>
            <boxGeometry args={[width - 0.4, 0.04, depth - 0.56]}/>
            <meshStandardMaterial color="#f8fafc" transparent opacity={0.28}/>
          </mesh>
          <mesh position={[0, 0.46, 0]}>
            <boxGeometry args={[width - 0.4, 0.04, depth - 0.56]}/>
            <meshStandardMaterial color="#e2e8f0" transparent opacity={0.22}/>
          </mesh>

          <mesh position={[-interiorWidth/2 + leftWidth + 0.08, 0.45, 0]}>
            <boxGeometry args={[0.08, 0.9, interiorDepth]}/>
            <meshStandardMaterial color="#334155"/>
          </mesh>
          <mesh position={[0, 0.45, -interiorDepth/8]}>
            <boxGeometry args={[interiorWidth - 0.14, 0.9, 0.08]}/>
            <meshStandardMaterial color="#334155"/>
          </mesh>

          {[...Array(bedrooms)].map((_, idx) => (
            <mesh key={`bed-${idx}`} position={[leftX, 0.15, -interiorDepth/2 + bedroomDepth/2 + idx * bedroomDepth]}>
              <boxGeometry args={[leftWidth - 0.18, 0.3, bedroomDepth - 0.06]}/>
              <meshStandardMaterial color="#fde68a" transparent opacity={0.82}/>
            </mesh>
          ))}

          {[...Array(bathrooms)].map((_, idx) => (
            <mesh key={`bath-${idx}`} position={[leftX, 0.15, interiorDepth/2 - bathroomDepth/2 - idx * bathroomDepth]}>
              <boxGeometry args={[leftWidth - 0.18, 0.3, bathroomDepth - 0.06]}/>
              <meshStandardMaterial color="#bfdbfe" transparent opacity={0.82}/>
            </mesh>
          ))}

          {diningRooms > 0 && (
            <mesh position={[rightX, 0.15, -interiorDepth/4]}>
              <boxGeometry args={[rightWidth - 0.16, 0.3, interiorDepth * 0.35]}/>
              <meshStandardMaterial color="#fb7185" transparent opacity={0.82}/>
            </mesh>
          )}

          {kitchen && (
            <mesh position={[rightX, 0.15, interiorDepth/2 - 0.8]}>
              <boxGeometry args={[rightWidth - 0.16, 0.3, 1.1]}/>
              <meshStandardMaterial color="#6d28d9" transparent opacity={0.82}/>
            </mesh>
          )}

          <Text position={[leftX, 0.6, -interiorDepth/2 + 0.4]} fontSize={0.18} color="#475569">Bedroom</Text>
          <Text position={[leftX, 0.6, interiorDepth/2 - 0.5]} fontSize={0.18} color="#1e3a8a">Bath</Text>
          {diningRooms > 0 && <Text position={[rightX, 0.6, -interiorDepth/4]} fontSize={0.18} color="#b91c1c">Dining</Text>}
          {kitchen && <Text position={[rightX, 0.6, interiorDepth/2 - 0.9]} fontSize={0.18} color="#7c3aed">Kitchen</Text>}
        </group>
      )}
      <mesh position={[0, totalH+0.9, 0]} rotation={[0,Math.PI/4,0]}>
        <coneGeometry args={[Math.max(width,depth)*0.78, 1.8, 4]}/>
        <meshStandardMaterial color={roofColor}/>
      </mesh>
      <Text position={[0, totalH+2.4, 0]} fontSize={0.32} color="#374151" anchorX="center">
        {`G+${floors-1} · ${floors} Floor${floors>1?'s':''}`}
      </Text>
    </group>
  );
}

export default function ThreeD() {
  const location = useLocation();
  const navigate = useNavigate();
  const plotCtx  = location.state?.fromPlot ? location.state : null;

  const initialFootprint = plotCtx ? footprintFromPlotArea(plotCtx.plotAreaSqyd) : null;

  const [floors,  setFloors]  = useState(2);
  const [width,   setWidth]   = useState(initialFootprint?.width || 8);
  const [depth,   setDepth]   = useState(initialFootprint?.depth || 6);
  const [wallIdx, setWallIdx] = useState(0);
  const [roofIdx, setRoofIdx] = useState(0);
  const [windowIdx, setWindowIdx] = useState(0);
  const [bedrooms, setBedrooms] = useState(3);
  const [bathrooms, setBathrooms] = useState(2);
  const [diningRooms, setDiningRooms] = useState(1);
  const [kitchen, setKitchen] = useState(true);
  const [showInterior, setShowInterior] = useState(false);
  const [qual,    setQual]    = useState(0);
  const [webGLOk, setWebGLOk] = useState(true);

  useEffect(() => { setWebGLOk(checkWebGL()); }, []);

  // If the user navigates here again from a different plot, re-sync the footprint.
  const lastPlotId = useRef(plotCtx?.plotId);
  useEffect(() => {
    if (plotCtx && plotCtx.plotId !== lastPlotId.current) {
      lastPlotId.current = plotCtx.plotId;
    }
    if (plotCtx) {
      const fp = footprintFromPlotArea(plotCtx.plotAreaSqyd);
      setWidth(fp.width);
      setDepth(fp.depth);
    }
  }, [plotCtx]);

  const QUALS = [{label:'Standard',rate:1800},{label:'Premium',rate:2400},{label:'Luxury',rate:3200}];
  const sqft  = useMemo(() => Math.round(width * 3.28 * depth * 3.28 * floors), [width,depth,floors]);
  const cost  = useMemo(() => {
    const base = sqft * QUALS[qual].rate / 100000;
    return Math.round(base + bedrooms * 0.22 + bathrooms * 0.16 + diningRooms * 0.12 + (kitchen ? 0.18 : 0));
  }, [sqft, qual, bedrooms, bathrooms, diningRooms, kitchen]);

  const materials = useMemo(() => [
    { mat:'Cement', brand:'UltraTech / ACC',    qty:`${Math.round(sqft*0.4)} bags`, cost:`₹${Math.round(cost*0.30)}L` },
    { mat:'Steel',  brand:'TATA Steel / SAIL',  qty:`${Math.round(sqft*4)} kg`,    cost:`₹${Math.round(cost*0.25)}L` },
    { mat:'Bricks', brand:'Wienerberger/Jindal',qty:`${Math.round(sqft*8)} nos`,   cost:`₹${Math.round(cost*0.18)}L` },
    { mat:'Paint',  brand:'Asian Paints/Berger',qty:`${Math.round(sqft*0.15)} L`,  cost:`₹${Math.round(cost*0.07)}L` },
  ], [sqft, cost]);

  return (
    <div className="animate-fade-in space-y-4">
      <div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">3D Home Builder</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {plotCtx
            ? 'Preview how this plot could look after construction · Three.js + React Three Fiber'
            : 'Design your dream home · Three.js + React Three Fiber · Real-time cost estimation'}
        </p>
      </div>

      {plotCtx && (
        <div className="flex items-center justify-between bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-xl px-4 py-3">
          <div>
            <p className="text-xs font-black text-brand-700 dark:text-brand-400">🏗️ Previewing build on: {plotCtx.plotTitle}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {plotCtx.plotAreaSqyd?.toLocaleString()} sqyd · {plotCtx.plotLocality}, {plotCtx.plotCity} · Footprint auto-sized to ~62% ground coverage after setbacks
            </p>
          </div>
          <button onClick={() => navigate('/listings')}
            className="text-xs font-bold text-brand-600 hover:underline whitespace-nowrap ml-4">
            ← Back to listings
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card><CardBody>
          <CardTitle>⚙️ Building Configuration</CardTitle>
          <SliderRow label="Floors" min={1} max={4} value={floors} onChange={setFloors} />
          <SliderRow label="Width (m)" min={4} max={16} value={width} onChange={setWidth} />
          <SliderRow label="Depth (m)" min={4} max={14} value={depth} onChange={setDepth} />
          <div className="mb-4">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Wall color</p>
            <div className="flex gap-2 flex-wrap">
              {WALL_COLORS.map((c,i) => (
                <button key={i} title={WALL_NAMES[i]} onClick={() => setWallIdx(i)}
                  className={`w-8 h-8 rounded-full border-3 transition-all ${wallIdx===i?'border-brand-500 scale-110 ring-2 ring-brand-300':'border-slate-200'}`}
                  style={{background:c}} />
              ))}
            </div>
          </div>
          <div className="mb-4">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Window style</p>
            <div className="flex gap-2 flex-wrap">
              {WINDOW_STYLES.map((style,i) => (
                <button key={i} title={style.label} onClick={() => setWindowIdx(i)}
                  className={`px-3 py-1 rounded-full border text-xs transition-all ${windowIdx===i ? 'border-brand-500 bg-brand-100 text-brand-700' : 'border-slate-300 bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                  {style.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Bedrooms</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setBedrooms(Math.max(1, bedrooms - 1))}
                  className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300">-</button>
                <span className="text-sm font-bold">{bedrooms}</span>
                <button onClick={() => setBedrooms(Math.min(6, bedrooms + 1))}
                  className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300">+</button>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Bathrooms</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setBathrooms(Math.max(1, bathrooms - 1))}
                  className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300">-</button>
                <span className="text-sm font-bold">{bathrooms}</span>
                <button onClick={() => setBathrooms(Math.min(4, bathrooms + 1))}
                  className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300">+</button>
              </div>
            </div>
          </div>
          <div className="mb-4 grid grid-cols-2 gap-3 items-center">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Dining rooms</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setDiningRooms(Math.max(0, diningRooms - 1))}
                  className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300">-</button>
                <span className="text-sm font-bold">{diningRooms}</span>
                <button onClick={() => setDiningRooms(Math.min(2, diningRooms + 1))}
                  className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300">+</button>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Kitchen</p>
              <button onClick={() => setKitchen(k => !k)}
                className={`w-full py-2 rounded-lg font-bold transition-all ${kitchen ? 'bg-emerald-600 text-white' : 'border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800'}`}>
                {kitchen ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Roof color</p>
            <div className="flex gap-2 flex-wrap">
              {ROOF_COLORS.map((c,i) => (
                <button key={i} title={ROOF_NAMES[i]} onClick={() => setRoofIdx(i)}
                  className={`w-8 h-8 rounded-full border-3 transition-all ${roofIdx===i?'border-brand-500 scale-110 ring-2 ring-brand-300':'border-slate-200'}`}
                  style={{background:c}} />
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Finish Quality</label>
            <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none"
              value={qual} onChange={e => setQual(+e.target.value)}>
              {QUALS.map((q,i) => <option key={i} value={i}>{q.label} (₹{q.rate}/sqft)</option>)}
            </select>
          </div>
          <div className="bg-brand-50 dark:bg-brand-900/20 rounded-xl p-4 space-y-2 border border-brand-100 dark:border-brand-900">
            <p className="text-xs font-black text-brand-600 dark:text-brand-400 mb-2">Estimated Cost</p>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Built-up area</span><span className="font-bold">{sqft.toLocaleString()} sqft</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Rate/sqft</span><span className="font-bold">₹{QUALS[qual].rate.toLocaleString()}</span></div>
            <div className="flex justify-between border-t border-brand-200 dark:border-brand-800 pt-2 mt-1">
              <span className="font-black text-brand-700 dark:text-brand-400">Total</span>
              <span className="text-xl font-black text-brand-700 dark:text-brand-400">₹{cost}L</span>
            </div>
          </div>
          <div className="mb-4">
            <button onClick={() => setShowInterior(show => !show)}
              className="w-full py-2 text-sm bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold transition-all">
              {showInterior ? 'Hide Interior' : 'Show Interior'}
            </button>
          </div>
          <div className="flex gap-2 mt-2">
            <button className="flex-1 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">💾 Save</button>
            <button className="flex-1 py-2 text-sm bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold transition-all">📋 Get Quote</button>
          </div>
        </CardBody></Card>

        <div className="lg:col-span-2 space-y-4">
          <Card className="overflow-hidden">
            <div className="h-[400px] bg-gradient-to-b from-sky-100 to-sky-50 dark:from-slate-700 dark:to-slate-800">
              {webGLOk ? (
                <WebGLErrorBoundary fallback={
                  <CSS3DFallback floors={floors} width={width} depth={depth}
                    wallColor={WALL_COLORS[wallIdx]} roofColor={ROOF_COLORS[roofIdx]} />
                }>
                  <Suspense fallback={<div className="flex items-center justify-center h-full text-slate-400 text-sm">Loading 3D scene…</div>}>
                    <Canvas
                      camera={{ position: showInterior ? [0, 18, 0] : [12, 8, 14], fov: showInterior ? 60 : 45, near: 0.1, far: 100 }}
                      onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
                      shadows
                    >
                      <ambientLight intensity={0.65}/>
                      <directionalLight position={[10,15,8]} intensity={1.2} castShadow/>
                      <House
                        floors={floors}
                        width={width}
                        depth={depth}
                        wallColor={WALL_COLORS[wallIdx]}
                        roofColor={ROOF_COLORS[roofIdx]}
                        windowStyle={windowIdx}
                        bedrooms={bedrooms}
                        bathrooms={bathrooms}
                        diningRooms={diningRooms}
                        kitchen={kitchen}
                        showInterior={showInterior}
                      />
                      <Grid position={[0,-0.32,0]} args={[30,30]} cellColor="#e2e8f0" sectionColor="#cbd5e1" sectionSize={5} fadeDistance={25}/>
                      <OrbitControls
                        enablePan={!showInterior}
                        enableRotate={!showInterior}
                        minDistance={8}
                        maxDistance={showInterior ? 40 : 32}
                        minPolarAngle={showInterior ? Math.PI / 2 : 0}
                        maxPolarAngle={showInterior ? Math.PI / 2 : Math.PI / 2.05}
                      />
                    </Canvas>
                  </Suspense>
                </WebGLErrorBoundary>
              ) : (
                <CSS3DFallback floors={floors} width={width} depth={depth}
                  wallColor={WALL_COLORS[wallIdx]} roofColor={ROOF_COLORS[roofIdx]} />
              )}
            </div>
            <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <span className="text-xs text-slate-400">
                {webGLOk ? 'Drag to orbit · Scroll to zoom' : '⚠️ WebGL limited — showing CSS preview'}
              </span>
              <span className="text-xs font-bold text-brand-600">
                {webGLOk ? 'Three.js · React Three Fiber' : 'CSS 3D Fallback'}
              </span>
            </div>
          </Card>
          <Card><CardBody>
            <CardTitle>🧱 Recommended Materials &amp; Brands</CardTitle>
            <div className="grid grid-cols-2 gap-3">
              {materials.map(({ mat, brand, qty, cost: c }) => (
                <div key={mat} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{mat}</p>
                  <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold mb-2">{brand}</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">{qty}</span>
                    <span className="font-black text-slate-800 dark:text-white">{c}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardBody></Card>
        </div>
      </div>
    </div>
  );
}
