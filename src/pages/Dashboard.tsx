import { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck,
  Send
} from 'lucide-react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { useAppContext } from '../context/AppContext';
import assistantIcon from '../assets/asistente.png';
import { env } from '../config/env';

const API_BASE = env.API_BASE_URL;

// --- Heatmap Layer Component ---
const HeatmapLayer = memo(({ points }: { points: any[] }) => {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;
    
    // @ts-ignore
    const heat = L.heatLayer(
      points.map(p => [p.lat, p.lon, (p.intensity || 0.5) * 6]),
      {
        radius: 55,
        blur: 45,
        maxOpacity: 0.85,
        minOpacity: 0.2,
        gradient: {
          0.2: '#0000ff', // Blue
          0.5: '#00ff00', // Green
          0.8: '#ffff00', // Yellow
          1.0: '#ff0000'  // Red
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
      <div className="text-xl font-black text-black tracking-tighter tabular-nums flex items-baseline gap-0.5">
        {time.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', hour12: false })}
        <span className="text-brand-orange text-[10px] animate-pulse">
          :{time.getSeconds().toString().padStart(2, '0')}
        </span>
      </div>
      <div className="w-px h-5 bg-black/10" />
      <div className="text-[8px] font-black text-black/40 uppercase tracking-widest leading-none">
        Misión<br />Crítica
      </div>
    </div>
  );
};

const chatbotMessage = `Hola. Analizando el mapa térmico de anomalías vehiculares de Bolivia, he identificado las zonas de mayor peligro y riesgo elevado para dejar tu vehículo estacionado en la calle sin supervisión:

1. El Alto (Feria 16 de Julio y Zona 12 de Octubre): Mayor tasa de robos y sustracción de autopartes.
2. La Paz (Zonas de San Pedro y el Cementerio General): Reportes constantes de vulnerabilidad nocturna.
3. Santa Cruz (Zonas de La Ramada y el Mercado Mutualista): Puntos negros para el robo estacionario.
4. Cochabamba (Alrededores de La Cancha y Avenida Aroma): Frecuentes anomalías registradas en nuestro sistema.

Te aconsejo establecer alertas de geocercas inteligentes y monitorear activamente estas coordenadas.`;

export default function Dashboard() {
  const { user, authToken } = useAppContext();
  const [riskData, setRiskData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats] = useState({
    alerts: 142,
    anomalies: 28,
    riskScore: 6.4
  });

  const [displayText, setDisplayText] = useState('');
  
  // Simulated AI response typewriter effect
  useEffect(() => {
    let index = 0;
    setDisplayText('');
    const timer = setInterval(() => {
      if (index < chatbotMessage.length) {
        setDisplayText((prev) => prev + chatbotMessage.charAt(index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 15);
    return () => clearInterval(timer);
  }, []);

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
    <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.9fr] gap-6 h-[calc(100vh-100px)] w-full pb-4">
      {/* Left Column (Info Panel + Chatbot) */}
      <div className="flex flex-col gap-6 h-full overflow-hidden">
        
        {/* Left Top Card: User Info & Digital Clock */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[32px] border-4 border-black/5 p-6 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-black leading-tight">Bienvenido, {user?.name?.split(' ')[0] ?? 'Operator'}</h2>
              <p className="text-[9px] font-black text-black/40 uppercase tracking-widest mt-1">Panel de control y seguridad</p>
            </div>
            <div className="bg-black/5 rounded-2xl px-4 py-2 border border-black/5 shrink-0">
              <DigitalClock />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-black/5">
            <div className="bg-[#f8f9fa] p-3 rounded-2xl border border-black/5 flex flex-col justify-between">
              <span className="text-[8px] font-black text-black/40 uppercase tracking-wider block">Alertas IA</span>
              <span className="text-lg font-black text-brand-orange mt-1">{stats.alerts}</span>
            </div>
            <div className="bg-[#f8f9fa] p-3 rounded-2xl border border-black/5 flex flex-col justify-between">
              <span className="text-[8px] font-black text-black/40 uppercase tracking-wider block">Anomalías</span>
              <span className="text-lg font-black text-black mt-1">{stats.anomalies}</span>
            </div>
            <div className="bg-[#f8f9fa] p-3 rounded-2xl border border-black/5 flex flex-col justify-between">
              <span className="text-[8px] font-black text-black/40 uppercase tracking-wider block">Risk Score</span>
              <span className="text-lg font-black text-brand-orange mt-1">{stats.riskScore}</span>
            </div>
          </div>
        </motion.div>

        {/* Left Bottom Card: Chatbot */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex-1 bg-white rounded-[32px] border-4 border-black/5 p-6 shadow-sm flex flex-col justify-between overflow-hidden"
        >
          <div className="flex flex-col h-full gap-4 overflow-hidden">
            {/* Chat Header */}
            <div className="flex items-center gap-3 border-b border-black/5 pb-4 shrink-0">
              <img src={assistantIcon} className="w-10 h-10 rounded-full border-2 border-brand-orange object-cover shadow-sm" alt="Asistente" />
              <div>
                <h3 className="text-sm font-black text-black leading-none">Asistente de Seguridad IA</h3>
                <span className="text-[9px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1.5 mt-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Activo
                </span>
              </div>
            </div>

            {/* Chat Message Stream */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 scrollbar-none">
              <div className="flex items-start gap-3">
                <img src={assistantIcon} className="w-7 h-7 rounded-full border border-black/5 object-cover mt-0.5 shrink-0" />
                <div className="bg-[#f8f9fa] border border-black/5 p-4 rounded-3xl rounded-tl-none text-[11px] text-black leading-relaxed font-semibold whitespace-pre-line">
                  {displayText}
                  {displayText.length < chatbotMessage.length && (
                    <span className="inline-block w-1.5 h-3.5 ml-1 bg-brand-orange animate-pulse align-middle" />
                  )}
                </div>
              </div>
            </div>

            {/* Chat Input */}
            <div className="flex items-center gap-2 border-t border-black/5 pt-3 shrink-0">
              <input 
                type="text" 
                placeholder="Pregunta sobre zonas de riesgo..." 
                className="flex-1 bg-[#f8f9fa] border border-black/5 rounded-2xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-brand-orange text-black"
                disabled
              />
              <button className="p-3 bg-black hover:bg-neutral-800 text-white rounded-2xl transition-all cursor-not-allowed" disabled>
                <Send size={14} />
              </button>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Right Column (Leaflet Map) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-[32px] border-4 border-black/5 overflow-hidden shadow-2xl relative h-full flex flex-col"
      >
        <div className="flex-1 z-0 relative">
          <MapContainer
            center={[-16.5, -66.0]} 
            zoom={7}
            zoomControl={false}
            className="h-full w-full animate-fade-in"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            {!loading && <HeatmapLayer points={riskData} />}
          </MapContainer>

          {/* Floating Live Tag */}
          <div className="absolute top-6 left-6 z-[1000]">
            <div className="bg-white/95 backdrop-blur-xl px-5 py-3 rounded-2xl border border-black/5 flex items-center gap-3 shadow-xl">
              <div className="w-8 h-8 rounded-xl bg-brand-orange flex items-center justify-center text-white">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-[9px] font-black text-black/40 uppercase tracking-widest leading-none">Monitoreo Nacional</p>
                <p className="text-[11px] font-black text-black uppercase mt-1">Zonas Rojas Bolivia</p>
              </div>
            </div>
          </div>

          {/* Shrunken Legend / IA Status Overlay */}
          <div className="absolute bottom-6 right-6 z-[1000] w-64">
            <div className="bg-white/95 backdrop-blur-xl border border-black/5 rounded-2xl p-4 flex flex-col gap-2 shadow-2xl">
              <div className="flex items-center justify-between text-[9px] font-black text-black/40 uppercase tracking-widest">
                <span>IA Engine:</span>
                <span className="text-green-500 flex items-center gap-1">Online</span>
              </div>
              <p className="text-black/60 text-[9px] leading-normal font-medium">
                Mapa térmico predictivo basado en analítica geoespacial para la detección de robos y anomalías.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
