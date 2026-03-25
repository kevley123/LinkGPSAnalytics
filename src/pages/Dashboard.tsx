import { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap
} from 'lucide-react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { useAppContext } from '../context/AppContext';
import logo from '../assets/logo_home.png';

// --- Heatmap Layer Component ---
const HeatmapLayer = memo(({ points }: { points: any[] }) => {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;
    
    // @ts-ignore
    const heat = L.heatLayer(
      points.map(p => [p.lat, p.lon, (p.intensity || 0.5) * 5]), // Increased multiplier for stronger visual
      {
        radius: 40, // Larger radius for national view
        blur: 25,
        maxOpacity: 0.9,
        minOpacity: 0.4,
        gradient: {
            0.1: '#3B82F6', // Blue
            0.3: '#06B6D4', // Cyan
            0.5: '#10B981', // Green
            0.7: '#FBBF24', // Yellow
            0.9: '#F97316', // Orange
            1.0: '#EF4444'  // Red
        }
      }
    ).addTo(map);

    return () => { map.removeLayer(heat); };
  }, [map, points]);

  return null;
});

// --- Digital Clock Component ---
const DigitalClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-3">
      <div className="text-xl font-black text-white tracking-tighter tabular-nums flex items-baseline gap-1">
        {time.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', hour12: false })}
        <span className="text-brand-orange text-[10px] animate-pulse">
           {time.getSeconds().toString().padStart(2, '0')}
        </span>
      </div>
      <div className="w-px h-4 bg-white/10" />
      <div className="text-[8px] font-black text-neutral-500 uppercase tracking-widest leading-none">
        Telemetry<br/>Live
      </div>
    </div>
  );
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://11tkrk1f2zwo.share.zrok.io';

export default function Dashboard() {
  const { user, authToken } = useAppContext();
  const [riskData, setRiskData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats] = useState({
    alerts: 142,
    anomalies: 28,
    riskScore: 6.4
  });

  useEffect(() => {
    if (!authToken) return;
    const fetchGlobalRisk = async () => {
      try {
        const res = await fetch(`${API_BASE}/analytics/mapa-principal`, {
          headers: { 'Authorization': `Bearer ${authToken}`, 'Accept': 'application/json' },
        });
        if (!res.ok) throw new Error('Error fetching risk data');
        const json = await res.json();
        if (json.success) setRiskData(json.data);
      } catch (e) {
        console.error('Fetch dashboard data error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchGlobalRisk();
  }, [authToken]);

  return (
    <div className="relative h-[calc(100vh-120px)] w-full overflow-hidden rounded-[40px] border border-white/5 bg-brand-dark shadow-3xl">
      
      {/* ── Background Map (Ultra Dark Tech View) ───────────────────────────── */}
      <div className="absolute inset-0 z-0 silver-map-container">
        <MapContainer
          center={[-16.5, -67.0]} // Shifted to see La Paz better
          zoom={7}
          zoomControl={false}
          className="h-full w-full"
          style={{ background: '#080808' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
            attribution='&copy; LinkGPS IA Intelligence'
          />
          {!loading && <HeatmapLayer points={riskData} />}
        </MapContainer>
        
        {/* Dark Overlays */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-brand-dark via-transparent to-brand-dark/60" />
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />
      </div>

      {/* ── Header Overlay (Slim Line) ────────────────────────────────────────── */}
      <div className="absolute top-6 left-6 right-6 z-10 flex items-center justify-between">
         <motion.div 
           initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
           className="bg-brand-dark-2/50 backdrop-blur-xl border border-white/10 rounded-full pl-3 pr-8 py-2 shadow-2xl flex items-center gap-6"
         >
            <div className="w-10 h-10 rounded-full bg-brand-dark-3 flex items-center justify-center border border-white/10 p-2">
               <img src={logo} alt="LinkGPS" className="w-full h-auto object-contain" />
            </div>
            <div className="flex flex-col">
               <p className="text-neutral-500 text-[8px] font-black uppercase tracking-[0.2em] -mb-1">Intelligence Dashboard</p>
               <h1 className="text-sm font-black text-white uppercase tracking-tight">Hola, {user?.name?.split(' ')[0] ?? 'Operator'}</h1>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20 ml-2">
               <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
               <span className="text-[8px] font-black text-green-400 uppercase tracking-widest">IA Engine Online</span>
            </div>
         </motion.div>

         <motion.div 
           initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
           className="bg-brand-dark-2/50 backdrop-blur-xl border border-white/10 rounded-full px-6 py-2 shadow-2xl"
         >
            <DigitalClock />
         </motion.div>
      </div>

      {/* ── Right Small Statistics Matrix ────────────────────────────────────── */}
      <motion.div 
        initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}
        className="absolute right-6 top-24 w-56 z-10 flex flex-col gap-3 pointer-events-auto"
      >
        <div className="bg-brand-dark-2/60 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 shadow-2xl">
           <h3 className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-6 text-center">Intelligence Matrix</h3>
           
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <div className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Alertas</div>
                 <div className="text-xl font-black text-white tracking-tighter tabular-nums">{stats.alerts}</div>
              </div>

              <div className="h-px bg-white/5 w-full" />

              <div className="flex items-center justify-between">
                 <div className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Anomalías</div>
                 <div className="text-xl font-black text-cyan-400 tracking-tighter tabular-nums">{stats.anomalies}</div>
              </div>

              <div className="h-px bg-white/5 w-full" />

              <div className="flex items-center justify-between">
                 <div className="text-[9px] font-black text-white uppercase tracking-widest">Risk Score</div>
                 <div className="text-2xl font-black text-brand-orange tracking-tighter tabular-nums">{stats.riskScore}</div>
              </div>
           </div>

           <button className="mt-6 w-full py-3 rounded-xl bg-white/5 border border-white/5 hover:bg-brand-orange hover:text-white text-[8px] font-black text-neutral-500 uppercase tracking-[0.2em] transition-all">
              Auditoría Full
           </button>
        </div>

        {/* Legend Shrunken */}
        <div className="bg-brand-dark-3/40 backdrop-blur-md border border-white/5 rounded-2xl p-4 space-y-2">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
              <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Riesgo Extremo</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Precaución</span>
           </div>
        </div>
      </motion.div>

      {/* ── Bottom Info Card (Technology) ─────────────────────────────────── */}
      <motion.div 
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
        className="absolute bottom-6 left-6 right-6 z-10 pointer-events-none flex justify-between items-end"
      >
        <div className="bg-brand-orange/10 backdrop-blur-2xl border border-brand-orange/20 rounded-3xl p-5 w-80 pointer-events-auto">
           <div className="flex items-center gap-2 mb-2">
              <Zap className="text-brand-orange" size={14} />
              <h4 className="text-[9px] font-black text-white uppercase tracking-widest">Tecnología de Riesgo H3</h4>
           </div>
           <p className="text-[9px] text-neutral-400 leading-relaxed font-medium">
              Este mapa utiliza indexación **H3 Uber** de alta resolución para visualizar el riesgo nacional. El gradiente térmico detecta acumulaciones inusuales de incidentes y robos en tiempo real para optimizar tu logística.
           </p>
        </div>

        <div className="flex gap-2 pointer-events-auto">
           <button className="h-10 px-6 rounded-full bg-brand-dark-2 border border-white/10 text-[9px] font-black text-white uppercase tracking-widest hover:bg-brand-orange transition-colors">
              Nacional
           </button>
           <button className="h-10 px-6 rounded-full bg-white/5 border border-white/5 text-[9px] font-black text-neutral-500 uppercase tracking-widest">
              Filtros IA
           </button>
        </div>
      </motion.div>

      {/* ── Custom CSS for Ultra Dark Theme ────────────────────────────────  */}
      <style>{`
        .silver-map-container .leaflet-tile-pane {
           filter: grayscale(100%) brightness(0.6) contrast(1.3) invert(10%);
        }
        .silver-map-container .leaflet-container {
           background: #080808 !important;
        }
        /* Custom scrollbar for situation report */
        .overflow-y-auto::-webkit-scrollbar { width: 4px; }
        .overflow-y-auto::-webkit-scrollbar-track { background: transparent; }
        .overflow-y-auto::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
}
