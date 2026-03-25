import { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Info
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
      points.map(p => [p.lat, p.lon, (p.intensity || 0.5) * 6]), // Higher intensity for "Red Zones"
      {
        radius: 45,
        blur: 30,
        maxOpacity: 1,
        minOpacity: 0.5,
        gradient: {
          0.2: '#1e1b4b', // Deep Blue
          0.4: '#312e81', // Indigo
          0.6: '#4338ca', // Violet
          0.8: '#f97316', // Orange
          1.0: '#ff0000'  // Pure Red
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
    <div className="flex items-center gap-4">
      <div className="text-4xl font-black text-white tracking-tighter tabular-nums flex items-baseline gap-1">
        {time.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', hour12: false })}
        <span className="text-brand-orange text-sm animate-pulse">
          {time.getSeconds().toString().padStart(2, '0')}
        </span>
      </div>
      <div className="w-px h-8 bg-white/20" />
      <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none">
        Misión<br />Crítica
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
    <div className="relative h-[calc(100vh-120px)] w-full overflow-hidden rounded-[40px] border-4 border-black bg-black shadow-3xl">
      
      {/* ── Background Map (Deepest Black Tech View) ─────────────────────────── */}
      <div className="absolute inset-0 z-0 silver-map-container">
        <MapContainer
          center={[-16.5, -64.0]} 
          zoom={5.5}
          zoomControl={false}
          className="h-full w-full"
          style={{ background: '#000' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
            attribution='&copy; LinkGPS National Intelligence'
          />
          {!loading && <HeatmapLayer points={riskData} />}
        </MapContainer>
        
        {/* Extreme Contrast Overlays */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black via-transparent to-black/80" />
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_200px_rgba(0,0,0,1)]" />
      </div>

      {/* ── Header Overlay (Solid Squared Black) ────────────────────────────── */}
      <div className="absolute top-8 left-8 right-8 z-10 flex items-center justify-between">
        <motion.div
          initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="bg-black border-2 border-brand-dark-3 rounded-2xl pl-4 pr-12 py-4 shadow-2xl flex items-center gap-6"
        >
          <div className="w-12 h-12 rounded-xl bg-brand-dark-3 flex items-center justify-center border border-white/10 p-2">
            <img src={logo} alt="LinkGPS" className="w-full h-auto object-contain" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-white uppercase tracking-tight leading-none">Bienvenido, {user?.name?.split(' ')[0] ?? 'Operator'}</h1>
            <p className="text-brand-orange text-[10px] font-black uppercase tracking-[0.3em] mt-1">Mapa de calor de zonas rojas</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="bg-black border-2 border-brand-dark-3 rounded-2xl px-10 py-5 shadow-2xl"
        >
          <DigitalClock />
        </motion.div>
      </div>

      {/* ── Right Detailed Statistics Matrix (Solid) ────────────────────────── */}
      <motion.div
        initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}
        className="absolute right-8 top-32 w-64 z-10 flex flex-col gap-4 pointer-events-auto"
      >
        <div className="bg-black border-2 border-brand-dark-3 rounded-[32px] p-6 shadow-2xl">
          <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-8 text-center border-b border-white/5 pb-4">Intelligence Matrix</h3>
          
          <div className="space-y-6">
            <div className="group">
              <div className="flex items-center justify-between mb-1">
                <div className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <AlertTriangle size={12} className="text-red-500" /> Alertas
                </div>
                <div className="text-2xl font-black text-white tracking-tighter tabular-nums">{stats.alerts}</div>
              </div>
              <p className="text-[8px] text-neutral-500 uppercase font-bold tracking-tighter">Eventos de pánico y SOS activos</p>
            </div>

            <div className="group">
              <div className="flex items-center justify-between mb-1">
                <div className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Activity size={12} className="text-cyan-400" /> Anomalías
                </div>
                <div className="text-2xl font-black text-cyan-400 tracking-tighter tabular-nums">{stats.anomalies}</div>
              </div>
              <p className="text-[8px] text-neutral-500 uppercase font-bold tracking-tighter">Desvíos detectados por IA hoy</p>
            </div>

            <div className="group">
              <div className="flex items-center justify-between mb-1">
                <div className="text-[10px] font-black text-brand-orange uppercase tracking-widest flex items-center gap-2">
                  <Zap size={12} /> Risk Score
                </div>
                <div className="text-3xl font-black text-brand-orange tracking-tighter tabular-nums">{stats.riskScore}</div>
              </div>
              <p className="text-[8px] text-neutral-500 uppercase font-bold tracking-tighter">Probabilidad de robo en ruta nacional</p>
            </div>
          </div>

          <button className="mt-8 w-full py-4 rounded-xl bg-brand-dark-3 border border-white/5 hover:bg-white hover:text-black text-[9px] font-black text-white uppercase tracking-[0.2em] transition-all">
            Auditoría de Seguridad
          </button>
        </div>

        {/* Shrunken Legend */}
        <div className="bg-brand-dark-3 border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
           <div className="flex items-center justify-between text-[9px] font-black">
              <span className="text-white">Estado del Motor:</span>
              <span className="text-green-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> OPTIMAL</span>
           </div>
        </div>
      </motion.div>

      {/* ── Tall Tech Card (Solid Orange) ─────────────────────────────────── */}
      <motion.div
        initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}
        className="absolute bottom-8 left-8 z-10 w-64 pointer-events-auto"
      >
        <div className="bg-brand-orange rounded-[32px] p-8 h-[380px] flex flex-col shadow-[0_20px_60px_rgba(249,115,22,0.3)] border-4 border-black">
          <div className="bg-black w-10 h-10 rounded-xl flex items-center justify-center mb-6">
            <ShieldCheck className="text-brand-orange" size={20} />
          </div>
          
          <h4 className="text-black font-black text-lg uppercase leading-tight mb-4 tracking-tighter">
            Análisis de<br />Riesgo H3
          </h4>
          
          <div className="flex-1 space-y-4">
             <div className="space-y-1">
                <p className="text-[9px] font-black text-black/40 uppercase tracking-widest">Tecnología</p>
                <p className="text-[10px] text-black font-bold leading-tight uppercase">Indexación Geoespacial de Alta Resolución (Uber H3)</p>
             </div>
             
             <div className="h-px bg-black/10 w-full" />
             
             <div className="space-y-1">
                <p className="text-[9px] font-black text-black/40 uppercase tracking-widest">Función</p>
                <p className="text-[10px] text-black font-bold leading-tight">El mapa agrupa incidentes históricos y patrones de robo para generar un gradiente de calor nacional que predice puntos ciegos.</p>
             </div>

             <div className="h-px bg-black/10 w-full" />

             <div className="flex items-center gap-2">
                <Info size={14} className="text-black" />
                <span className="text-[9px] font-black text-black uppercase">IA Verificada</span>
             </div>
          </div>

          <div className="mt-auto pt-6 border-t border-black/10">
             <p className="text-[8px] font-black text-black/60 uppercase tracking-widest">Actualizado: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </motion.div>

      {/* ── Custom CSS for Ultra Black Theme ────────────────────────────────  */}
      <style>{`
        .silver-map-container .leaflet-tile-pane {
          filter: grayscale(100%) brightness(0.2) contrast(1.5) invert(100%);
        }
        .silver-map-container .leaflet-container {
          background: #000 !important;
        }
        .leaflet-attribution-container { display: none !important; }
      `}</style>
    </div>
  );
}
