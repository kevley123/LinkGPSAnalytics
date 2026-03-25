import { useState, useEffect, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import {
  Car, Loader2, X,
  ChevronLeft, AlertCircle, Satellite,
  ArrowRight, Activity, Zap,
  Thermometer, Info, Filter
} from 'lucide-react';
import {
  MapContainer, TileLayer, useMap
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://11tkrk1f2zwo.share.zrok.io';

// ── Heatmap Layer Component ──────────────────────────────────────────────────
const HeatmapLayer = ({ points, options }: { points: any[]; options: any }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !points || points.length === 0) return;

    // @ts-ignore - L.heatLayer comes from leaflet.heat
    const heatLayer = L.heatLayer(points, options).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points, options]);

  return null;
};

// ── Update View component ─────────────────────────────────────────────────────
const ViewUpdater = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 15, { duration: 1.5 });
    }
  }, [lat, lng, map]);
  return null;
};


// ── Vehicle Selection Chip ───────────────────────────────────────────────────
const VehicleChip = memo(({ veh, selected, onSelect, loading }: any) => (
  <button
    type="button"
    onClick={() => !loading && onSelect(veh)}
    disabled={loading}
    className={`group relative w-full text-left flex items-center gap-3 px-4 py-4 rounded-2xl border transition-all duration-200
      ${selected
        ? 'border-brand-orange bg-brand-orange/10 shadow-[0_0_20px_-5px_rgba(249,115,22,0.3)]'
        : 'border-white/5 bg-brand-dark-3 hover:border-white/20'
      } ${loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <div className="w-12 h-12 rounded-xl bg-brand-dark-2 flex items-center justify-center border border-white/5">
      <Car className={selected ? 'text-brand-orange' : 'text-neutral-500'} size={22} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-bold text-white truncate">{veh.modelo}</p>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[10px] font-black text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded uppercase tracking-wider">{veh.placa}</span>
        <span className="text-[10px] text-neutral-500 capitalize">{veh.color || 'N/A'}</span>
      </div>
    </div>
    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all
      ${selected ? 'bg-brand-orange text-white' : 'bg-white/5 text-neutral-600'}`}>
      {loading ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
    </div>
  </button>
));

// ── No Service Modal ─────────────────────────────────────────────────────────
const ModalNoService = memo(({ message, onClose, onSolicitar }: any) =>
  createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-brand-dark/90 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-sm bg-brand-dark-2 rounded-[32px] overflow-hidden border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.8)]"
      >
        <div className="bg-gradient-to-br from-red-500 to-red-700 p-8 flex flex-col items-center text-center gap-4">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
            <X size={20} />
          </button>
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center border border-white/20 relative">
             <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-white/20"
             />
             <AlertCircle size={40} className="text-white relative z-10" />
          </div>
          <div>
            <p className="text-xs font-black text-white/60 uppercase tracking-[0.2em] mb-1">Acceso Denegado</p>
            <h3 className="text-2xl font-black text-white">Análisis Inactivo</h3>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <p className="text-neutral-400 text-sm leading-relaxed text-center">
            {message}
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={onSolicitar}
              className="w-full py-4 rounded-2xl bg-brand-orange hover:bg-brand-orange-light text-white font-black text-sm transition-all shadow-lg shadow-brand-orange/20 flex items-center justify-center gap-2"
            >
              <Satellite size={16} /> REVISAR SERVICIO
            </button>
            <button 
              onClick={onClose}
              className="w-full py-3 text-neutral-500 hover:text-white font-bold text-sm transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  )
);

export default function MapaAnomalia() {
  const { authToken } = useAppContext();

  const [step, setStep] = useState(1);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [vehSel, setVehSel] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [loadingVeh, setLoadingVeh] = useState(true);
  const [loadingML, setLoadingML] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  // Heatmap Controls
  const [showNormal, setShowNormal] = useState(true);
  const [showAnomaly, setShowAnomaly] = useState(true);
  const [radius, setRadius] = useState(25);
  const [blur, setBlur] = useState(15);
  const [intensity, setIntensity] = useState(0.8);

  useEffect(() => {
    if (!authToken) return;
    const fetchVehicles = async () => {
      try {
        setLoadingVeh(true);
        const res = await fetch(`${API_BASE}/api/analytics/mis_vehiculos`, {
          headers: { 'Authorization': `Bearer ${authToken}`, 'Accept': 'application/json' },
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const dataVeh = await res.json();
        setVehicles(Array.isArray(dataVeh) ? dataVeh : (dataVeh.vehiculos ?? []));
      } catch (e) {
        console.error('Fetch vehicles error:', e);
      } finally {
        setLoadingVeh(false);
      }
    };
    fetchVehicles();
  }, [authToken]);

  const fetchMLData = useCallback(async (vehId: number) => {
    if (!authToken || !vehId) return;
    setLoadingML(true);
    try {
      const res = await fetch(`${API_BASE}/api/analytics/mapa-anomalias/${vehId}`, {
        headers: { 'Authorization': `Bearer ${authToken}`, 'Accept': 'application/json' },
      });

      if (res.status === 403) {
        setErrorModal('No tienes permiso para usar Analytics o no tienes un servicio activo.');
        return;
      }
      if (!res.ok) throw new Error(`Error ${res.status}`);

      const mlData = await res.json();
      setData(mlData);
      setStep(2);
    } catch (e) {
      console.error('Fetch ML data error:', e);
    } finally {
      setLoadingML(false);
    }
  }, [authToken]);

  const onSelectVehicle = useCallback((veh: any) => {
    setVehSel(veh);
    fetchMLData(veh.id);
  }, [fetchMLData]);

  // Format points for leaflet.heat
  const normalPoints = data?.normal_points?.map((p: any) => [p.lat, p.lng, p.weight * intensity]) || [];
  const anomalyPoints = data?.anomaly_points?.map((p: any) => [p.lat, p.lng, p.weight * intensity * 1.5]) || [];

  // Determine center based on first point
  const firstPoint = data?.anomaly_points?.[0] || data?.normal_points?.[0];
  const centerLat = firstPoint?.lat || -16.4897;
  const centerLng = firstPoint?.lng || -68.1193;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-brand-orange/10 flex items-center justify-center border border-brand-orange/20">
              <Thermometer className="text-brand-orange" size={20} />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Mapa de Anomalías</h1>
          </div>
          <p className="text-neutral-500 text-sm font-medium italic">Clustering de Machine Learning para detección de comportamientos atípicos en las últimas {data?.hours || 24} horas.</p>
        </div>

        <div className="flex items-center gap-1 bg-brand-dark-3 p-1.5 rounded-2xl border border-white/5">
           {[1, 2].map((s) => (
             <div key={s} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
               step === s ? 'bg-brand-orange text-white' : 'text-neutral-600'
             }`}>
               Step {s}
             </div>
           ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6">
        {step === 1 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {loadingVeh ? (
              [1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl bg-brand-dark-3 animate-pulse border border-white/5" />)
            ) : (
              vehicles.map(v => (
                <VehicleChip 
                  key={v.id} 
                  veh={v} 
                  selected={vehSel?.id === v.id}
                  loading={loadingML && vehSel?.id === v.id} 
                  onSelect={onSelectVehicle} 
                />
              ))
            )}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
               <button 
                onClick={() => { setStep(1); setVehSel(null); setData(null); }}
                className="flex items-center gap-2 text-neutral-500 hover:text-white font-black text-[10px] uppercase tracking-[0.2em] transition-colors"
               >
                 <ChevronLeft size={16} /> Volver a selección
               </button>
               
               <div className="flex items-center gap-4 glass px-6 py-2 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
                  <div className="flex items-center gap-2 pr-4 border-r border-white/10 shrink-0">
                    <Activity className="text-brand-orange" size={14} />
                    <span className="text-[10px] font-black text-white uppercase tracking-wider">{vehSel?.placa}</span>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={showNormal} onChange={e => setShowNormal(e.target.checked)} className="accent-blue-500" />
                      <span className="text-[10px] font-bold text-neutral-400 group-hover:text-blue-400 transition-colors uppercase">Zonas Regulares</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={showAnomaly} onChange={e => setShowAnomaly(e.target.checked)} className="accent-red-500" />
                      <span className="text-[10px] font-bold text-neutral-400 group-hover:text-red-400 transition-colors uppercase">Anomalías Detectadas</span>
                    </label>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 relative rounded-[40px] overflow-hidden border border-white/10 shadow-2xl h-[600px] bg-brand-dark-2">
                <MapContainer
                  center={[centerLat, centerLng]}
                  zoom={15}
                  style={{ width: '100%', height: '100%' }}
                  zoomControl={false}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; CARTO'
                  />
                  
                  <ViewUpdater lat={centerLat} lng={centerLng} />

                  {showNormal && (
                    <HeatmapLayer 
                      points={normalPoints} 
                      options={{
                        radius: radius,
                        blur: blur,
                        max: 1.0,
                        gradient: { 0.2: 'blue', 0.5: 'cyan', 0.8: 'lime', 1: 'green' }
                      }} 
                    />
                  )}

                  {showAnomaly && (
                    <HeatmapLayer 
                      points={anomalyPoints} 
                      options={{
                        radius: radius + 5,
                        blur: blur,
                        max: 1.0,
                        gradient: { 0.4: 'yellow', 0.7: 'orange', 1: 'red' }
                      }} 
                    />
                  )}
                </MapContainer>

                {/* Legend Overlay */}
                <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-2">
                  <div className="glass p-4 rounded-2xl border-white/10 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                      <span className="text-[10px] font-black text-white uppercase tracking-wider">Patrón Regular</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse" />
                      <span className="text-[10px] font-black text-white uppercase tracking-wider">Desviación ML</span>
                    </div>
                  </div>
                </div>

                {/* Floating Indicators */}
                <div className="absolute bottom-6 right-6 z-[1000] flex items-center gap-3">
                   <div className="bg-brand-dark/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-2">
                      <Info size={14} className="text-brand-orange" />
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest">{data?.total_returned} Vectores Procesados</span>
                   </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="glass p-6 rounded-[32px] border border-white/5 space-y-6">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <Filter className="text-brand-orange" size={18} />
                    <h3 className="font-black text-xs text-white uppercase tracking-[0.2em]">Config. Heatmap</h3>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Radio de Macha</span>
                        <span className="text-xs font-mono text-brand-orange">{radius}px</span>
                      </div>
                      <input type="range" min="5" max="50" step="1" value={radius} onChange={e => setRadius(parseInt(e.target.value))} className="w-full accent-brand-orange h-1 opacity-70 hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Desenfoque (Blur)</span>
                        <span className="text-xs font-mono text-brand-orange">{blur}px</span>
                      </div>
                      <input type="range" min="5" max="30" step="1" value={blur} onChange={e => setBlur(parseInt(e.target.value))} className="w-full accent-brand-orange h-1 opacity-70 hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Intensidad ML</span>
                        <span className="text-xs font-mono text-brand-orange">{intensity.toFixed(1)}</span>
                      </div>
                      <input type="range" min="0.1" max="2" step="0.1" value={intensity} onChange={e => setIntensity(parseFloat(e.target.value))} className="w-full accent-brand-orange h-1 opacity-70 hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>

                <div className="glass-orange p-6 rounded-[32px] border border-brand-orange/10 flex flex-col items-center text-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-brand-orange flex items-center justify-center shadow-lg shadow-brand-orange/20">
                      <Zap className="text-white fill-white" size={24} />
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-brand-orange uppercase tracking-widest mb-1">IA Insights</p>
                     <p className="text-xs text-brand-orange/80 font-medium leading-relaxed">
                       El modelo ha identificado {anomalyPoints.length} áreas de interés con baja probabilidad de pertenencia al patrón de ruta habitual.
                     </p>
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {errorModal && (
          <ModalNoService 
            message={errorModal} 
            onClose={() => setErrorModal(null)} 
            onSolicitar={() => {
              setErrorModal(null);
              window.location.href = 'https://link-gps-frontend.vercel.app/pricing';
            }}
          />
        )}
      </AnimatePresence>

      <style>{`
        .leaflet-container { background: #0a0a0a !important; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
