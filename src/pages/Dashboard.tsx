import { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, 
  ShieldCheck, Globe, 
  ChevronRight, AlertTriangle
} from 'lucide-react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppContext } from '../context/AppContext';

// --- Heatmap Layer Component ---
const HeatmapLayer = memo(({ points }: { points: any[] }) => {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;
    
    // @ts-ignore
    const heat = L.heatLayer(
      points.map(p => [p.lat, p.lon, p.intensity * 2]), // Amplify intensity for visibility
      {
        radius: 35,
        blur: 25,
        maxZoom: 10,
        gradient: {
            0.2: '#3B82F6', // Blue
            0.4: '#F97316', // Orange
            0.7: '#EF4444', // Red
            1.0: '#7F1D1D'  // Dark Red
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
    <div className="flex flex-col items-end">
      <div className="text-2xl font-black text-white tracking-tighter tabular-nums flex items-baseline gap-1">
        {time.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', hour12: false })}
        <span className="text-brand-orange text-xs animate-pulse">
           {time.getSeconds().toString().padStart(2, '0')}
        </span>
      </div>
      <div className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">
        Real Time Telemetry
      </div>
    </div>
  );
};

const API_BASE = import.meta.env.VITE_API_BASE_URL;

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
        const res = await fetch(`${API_BASE}/api/analytics/mapa-principal`, {
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
    <div className="relative h-[calc(100vh-120px)] w-full overflow-hidden rounded-[48px] border border-white/5 bg-brand-dark shadow-3xl">
      
      {/* ── Background Map (Silver Tech View) ────────────────────────────────── */}
      <div className="absolute inset-0 z-0 silver-map-container">
        <MapContainer
          center={[-16.5, -64.0]} // Focus on Bolivia
          zoom={6}
          zoomControl={false}
          className="h-full w-full"
          style={{ background: '#111' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
            attribution='&copy; LinkGPS IA Intelligence'
          />
          {!loading && <HeatmapLayer points={riskData} />}
        </MapContainer>
        
        {/* Overlay Dark Gradient for Contrast */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-brand-dark via-transparent to-brand-dark/40" />
      </div>

      {/* ── Header Overlay ─────────────────────────────────────────────────── */}
      <div className="absolute top-8 left-8 right-8 z-10 flex items-start justify-between">
         <motion.div 
           initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
           className="bg-brand-dark-2/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 shadow-2xl flex items-center gap-6"
         >
            <div className="w-14 h-14 rounded-2xl bg-brand-orange flex items-center justify-center shadow-lg shadow-brand-orange/20">
               <Globe className="text-white" size={28} />
            </div>
            <div>
               <p className="text-neutral-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Status Global Analytics</p>
               <h1 className="text-xl font-black text-white uppercase tracking-tight">Hola, {user?.name?.split(' ')[0] ?? 'Operator'}</h1>
            </div>
         </motion.div>

         <motion.div 
           initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
           className="bg-brand-dark-2/40 backdrop-blur-xl border border-white/10 rounded-[30px] px-8 py-5 shadow-2xl"
         >
            <DigitalClock />
         </motion.div>
      </div>

      {/* ── Left Situation Report ─────────────────────────────────────────── */}
      <motion.div 
        initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}
        className="absolute left-8 top-44 w-80 h-[calc(100%-400px)] z-10 flex flex-col gap-4 pointer-events-none"
      >
        <div className="bg-brand-dark-3/60 backdrop-blur-2xl border border-white/10 rounded-[40px] p-8 pointer-events-auto shadow-2xl overflow-y-auto">
           <div className="flex items-center gap-2 mb-6">
              <Activity className="text-brand-orange" size={20} />
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Reporte de Situación</h3>
           </div>
           
           <div className="space-y-6">
              <p className="text-neutral-400 text-xs leading-relaxed font-medium">
                 Actualmente, el motor de IA de **LinkGPS** está procesando <span className="text-white font-black">{riskData.length}</span> puntos críticos en el territorio boliviano.
              </p>
              
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                 <div className="flex items-center gap-2 mb-2 text-red-500">
                    <AlertTriangle size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Alerta de Intensidad</span>
                 </div>
                 <p className="text-[10px] text-red-100/60 leading-tight">
                    Se detecta un incremento del 12% en anomalías de ruta en el eje troncal durante las últimas 24 horas.
                 </p>
              </div>

              <div className="p-4 rounded-2xl bg-brand-orange/5 border border-white/5">
                 <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-2 flex items-center justify-between">
                    Top Zonas de Riesgo <ChevronRight size={12} className="text-brand-orange" />
                 </h4>
                 <div className="space-y-2">
                    {[1,2,3].map(i => (
                       <div key={i} className="flex items-center justify-between text-[11px] font-medium text-neutral-400">
                          <span>Cluster IA {i}</span>
                          <span className="text-white font-black">Nivel {9 - i}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* What our web does */}
        <div className="bg-brand-orange/10 backdrop-blur-xl border border-brand-orange/20 rounded-[32px] p-6 pointer-events-auto">
           <div className="flex items-center gap-3 mb-3">
              <ShieldCheck className="text-brand-orange" size={20} />
              <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Nuestra Tecnología</h4>
           </div>
           <p className="text-[10px] text-neutral-300 leading-relaxed font-medium">
              Utilizamos indexación geoespacial **H3 Uber** combinada con redes neuronales recurrentes para predecir incidentes antes de que ocurran. Monitoreamos patrones ocultos en cada coordenada.
           </p>
        </div>
      </motion.div>

      {/* ── Right Statistics Analytics ────────────────────────────────────── */}
      <motion.div 
        initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}
        className="absolute right-8 top-44 w-72 z-10 flex flex-col gap-4 pointer-events-auto"
      >
        <div className="bg-brand-dark-2/50 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 shadow-2xl">
           <h3 className="text-xs font-black text-neutral-500 uppercase tracking-[0.2em] mb-8 text-center">Intelligence Matrix</h3>
           
           <div className="space-y-8">
              <div className="text-center group">
                 <div className="text-4xl font-black text-white tracking-tighter mb-1 group-hover:text-brand-orange transition-colors tabular-nums">
                    {stats.alerts}
                 </div>
                 <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Alertas de Pánico</p>
              </div>

              <div className="h-px bg-white/5 w-1/2 mx-auto" />

              <div className="text-center group">
                 <div className="text-4xl font-black text-white tracking-tighter mb-1 group-hover:text-cyan-400 transition-colors tabular-nums">
                    {stats.anomalies}
                 </div>
                 <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Anomalías Detectadas</p>
              </div>

              <div className="h-px bg-white/5 w-1/2 mx-auto" />

              <div className="text-center group">
                 <div className="relative inline-block">
                    <div className="text-5xl font-black text-brand-orange tracking-tighter mb-1 tabular-nums">
                       {stats.riskScore}
                    </div>
                    <span className="absolute -top-1 -right-4 text-[10px] font-black text-neutral-500">MAX</span>
                 </div>
                 <p className="text-[9px] font-black text-white uppercase tracking-widest">Global Risk Score</p>
              </div>
           </div>

           <button className="mt-10 w-full py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-brand-orange hover:text-white hover:border-brand-orange text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] transition-all">
              Generar Auditoría
           </button>
        </div>
      </motion.div>

      {/* ── Bottom Floating Legend ────────────────────────────────────────── */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex items-center gap-8 bg-brand-dark/80 backdrop-blur-xl border border-white/10 px-10 py-5 rounded-full shadow-3xl">
         <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-600 shadow-lg shadow-red-600/40" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Zona de Extremo Riesgo</span>
         </div>
         <div className="w-px h-6 bg-white/10" />
         <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Tránsito Precautorio</span>
         </div>
         <div className="w-px h-6 bg-white/10" />
         <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Zonas Activas</span>
         </div>
      </div>

      {/* ── Custom CSS for Silver Map Theme ────────────────────────────────  */}
      <style>{`
        .silver-map-container .leaflet-tile-pane {
           filter: grayscale(100%) brightness(0.9) contrast(1.1) invert(5%);
        }
        .silver-map-container .leaflet-container {
           background: #111 !important;
        }
        /* Custom scrollbar for situation report */
        .overflow-y-auto::-webkit-scrollbar { width: 4px; }
        .overflow-y-auto::-webkit-scrollbar-track { background: transparent; }
        .overflow-y-auto::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
}
