import { useState, useEffect, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, AlertCircle, 
  Loader2, CheckCircle, 
  ChevronLeft, Satellite, X, ArrowRight,
  Thermometer, Info, Settings, RefreshCw
} from 'lucide-react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { useAppContext } from '../context/AppContext';
import { env } from '../config/env';

const API_BASE = env.API_BASE_URL;

interface Toast {
  id: string;
  message: string;
}

// ── Heatmap Layer Component ──────────────────────────────────────────────────
const HeatmapLayer = memo(({ points, options }: { points: any[]; options: any }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !points || points.length === 0) return;

    // @ts-ignore - L.heatLayer comes from leaflet.heat
    const heatLayer = L.heatLayer(
      points.map(p => [p.lat, p.lng || p.lon, p.weight || p.intensity || 0.5]),
      options
    ).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points, options]);

  return null;
});

// ── View Updater Component ────────────────────────────────────────────────────
const ViewUpdater = ({ lat, lng }: { lat: number | null; lng: number | null }) => {
  const map = useMap();
  useEffect(() => {
    if (lat !== null && lng !== null) {
      map.flyTo([lat, lng], 14, { duration: 1.2 });
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
    className={`group relative w-full text-left flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-200
      ${selected
        ? 'border-brand-orange bg-brand-orange/5 shadow-sm'
        : 'border-black/5 bg-black/[0.02] hover:border-black/10 hover:bg-black/[0.04]'
      } ${loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center border border-black/5 shadow-sm">
      <Car className={selected ? 'text-brand-orange' : 'text-neutral-500'} size={16} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-black text-black truncate uppercase tracking-tight">{veh.modelo}</p>
      <div className="flex items-center gap-2 mt-0.5">
        <span className="text-[9px] font-bold text-brand-orange bg-brand-orange/10 px-1.5 py-0.5 rounded tracking-wide">{veh.placa}</span>
      </div>
    </div>
    <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all
      ${selected ? 'bg-brand-orange text-white' : 'bg-black/5 text-neutral-500'}`}>
      {loading ? <Loader2 size={12} className="animate-spin" /> : <ArrowRight size={12} />}
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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-sm bg-white rounded-[32px] overflow-hidden border border-black/5 shadow-[0_32px_80px_rgba(0,0,0,0.15)]"
      >
        <div className="bg-gradient-to-br from-red-500 to-red-600 p-8 flex flex-col items-center text-center gap-4">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
            <X size={18} />
          </button>
          <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center border border-white/20 relative">
             <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-white/20"
             />
             <AlertCircle size={32} className="text-white relative z-10" />
          </div>
          <div>
            <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.15em] mb-1">Acceso denegado</p>
            <h3 className="text-xl font-black text-white">Análisis inactivo</h3>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-neutral-500 text-xs leading-relaxed text-center font-medium">
            {message}
          </p>
          <div className="flex flex-col gap-2">
            <button 
              onClick={onSolicitar}
              className="w-full py-3 rounded-xl bg-black hover:bg-neutral-800 text-white font-black text-xs transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Satellite size={14} /> Revisar servicio
            </button>
            <button 
              onClick={onClose}
              className="w-full py-2.5 text-neutral-400 hover:text-black font-bold text-xs transition-colors"
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
  
  // ML API response state
  const [data, setData] = useState<any>(null);
  
  // Custom query parameters
  const [hours, setHours] = useState<number>(4000);
  const [sampling, setSampling] = useState<number>(5);
  
  // Rendering controls
  const [showNormal, setShowNormal] = useState(true);
  const [showAnomaly, setShowAnomaly] = useState(true);
  
  // Interactive heatmap parameters
  const [radius, setRadius] = useState(55);
  const [blur, setBlur] = useState(45);

  const [loadingVeh, setLoadingVeh] = useState(true);
  const [loadingML, setLoadingML] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [toast, setToast] = useState<Toast | null>(null);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  // Fetch vehicles list on load
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

  // Fetch Heatmap ML data from vehicle
  const fetchMLData = useCallback(async (vehId: number, queryHours: number, querySampling: number) => {
    if (!authToken || !vehId) return;
    setLoadingML(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/analytics/ml/vehicles/${vehId}/heatmap?hours=${queryHours}&sampling=${querySampling}`, {
        headers: { 
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json'
        }
      });

      if (res.status === 403) {
        setErrorModal('No tienes permiso para usar Analytics o no tienes un servicio activo.');
        return;
      }

      if (!res.ok) throw new Error(`Error de servidor: ${res.status}`);
      const mlData = await res.json();
      setData(mlData);
      setStep(2);
    } catch (err: any) {
      console.error("Error fetching ML heatmap:", err);
      setError("No se pudieron cargar los datos de anomalías de Machine Learning.");
      setToast({
        id: 'err-ml',
        message: 'Error al conectar con el servidor de IA.'
      });
    } finally {
      setLoadingML(false);
    }
  }, [authToken]);

  const onSelectVehicle = useCallback((veh: any) => {
    setVehSel(veh);
    fetchMLData(veh.id, hours, sampling);
  }, [fetchMLData, hours, sampling]);

  const handleUpdateQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehSel) return;
    
    // Clamp values as requested
    const validatedHours = Math.min(Math.max(hours, 1), 2160); // Max 90 days = 2160 hours
    const validatedSampling = Math.min(Math.max(sampling, 1), 6); // Max sampling 6
    
    setHours(validatedHours);
    setSampling(validatedSampling);
    
    fetchMLData(vehSel.id, validatedHours, validatedSampling);
  };

  // Toast automatic timer
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Calculate equivalent days (hours / 24)
  const equivalentDays = (hours / 24).toFixed(1);

  // Extract points
  const normalPoints = data?.normal_points || [];
  const anomalyPoints = data?.anomaly_points || [];

  // Determine map center
  const firstPoint = anomalyPoints[0] || normalPoints[0];
  const centerLat = firstPoint ? parseFloat(firstPoint.lat) : -16.5000;
  const centerLng = firstPoint ? parseFloat(firstPoint.lng || firstPoint.lon) : -68.1500;

  return (
    <div className="text-black h-[calc(100vh-172px)] flex flex-col gap-4 overflow-hidden p-2 relative">
      
      {/* Toast Notification Container */}
      <div className="fixed top-6 right-6 z-[99999] pointer-events-none">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-black text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 pointer-events-auto max-w-sm"
            >
              <CheckCircle className="text-green-500 shrink-0" size={18} />
              <p className="text-xs font-bold leading-normal">{toast.message}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Header Panel */}
      <div className="flex items-center justify-between gap-4 px-2 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center border border-brand-orange/20">
            <Thermometer className="text-brand-orange" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-black tracking-tight leading-none">Mapa de anomalías</h1>
            <p className="text-xs font-semibold text-black/40 mt-1.5 flex items-center gap-1.5">
              {vehSel ? (
                <>
                  Detección de patrones y anomalías geoespaciales para <span className="text-brand-orange font-bold uppercase">{vehSel.modelo} ({vehSel.placa})</span>
                </>
              ) : (
                'Análisis de clustering de rutas regulares y desvíos atípicos de vehículos'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {vehSel && (
            <button
              onClick={() => { setStep(1); setVehSel(null); setData(null); }}
              className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm shrink-0"
            >
              <ChevronLeft size={14} />
              Cambiar vehículo
            </button>
          )}
        </div>
      </div>

      {/* Main split interactive workspace */}
      <div className="flex-1 min-h-0 relative rounded-[32px] overflow-hidden border border-black/5 bg-[#f8f9fa] shadow-2xl flex flex-col">
        
        <div className="w-full h-full p-4 relative flex-1 flex flex-row gap-4 min-h-0">
          {error ? (
            <div className="w-full h-full bg-white border border-black/5 rounded-[24px] flex flex-col items-center justify-center gap-4 p-8 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
                <AlertCircle className="text-red-500" size={28} />
              </div>
              <div className="text-center max-w-sm">
                <h3 className="text-sm font-black text-black">Ocurrió un error</h3>
                <p className="text-neutral-500 text-xs mt-1 leading-relaxed">{error}</p>
              </div>
              <button 
                onClick={() => fetchMLData(vehSel.id, hours, sampling)}
                className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Reintentar
              </button>
            </div>
          ) : !vehSel ? (
            // Background placeholder while waiting for step 1
            <div className="w-full h-full bg-[#f1f3f5] flex items-center justify-center relative rounded-[24px]">
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `radial-gradient(circle, #000 10%, transparent 11%), radial-gradient(circle, #000 10%, transparent 11%)`,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 10px 10px'
              }} />
              <div className="flex flex-col items-center gap-2 text-center z-10 px-4">
                <Thermometer size={42} className="text-black/15 animate-bounce" />
                <p className="text-xs font-bold text-black/30 uppercase tracking-wider">Esperando selección de vehículo...</p>
              </div>
            </div>
          ) : loadingML ? (
            <div className="w-full h-full bg-[#f8f9fa] border border-black/5 rounded-[24px] flex flex-col items-center justify-center gap-3 shadow-inner">
              <Loader2 className="text-brand-orange animate-spin" size={32} />
              <p className="text-xs font-bold text-black/30 uppercase tracking-widest">Ejecutando clustering de Machine Learning...</p>
            </div>
          ) : (
            /* Split Layout: Leaflet Heatmap Map (Left) + ML Query Form (Right) */
            <>
              {/* Left Column: Leaflet Map (Dashboard.tsx Style) */}
              <div className="flex-1 h-full rounded-[24px] overflow-hidden border-4 border-black/5 relative shadow-2xl bg-white">
                <MapContainer
                  center={[centerLat, centerLng]}
                  zoom={14}
                  style={{ width: '100%', height: '100%' }}
                  zoomControl={false}
                >
                  {/* Standard OpenStreetMap Street Tile Layer as in Dashboard.tsx */}
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />

                  <ViewUpdater lat={centerLat} lng={centerLng} />

                  {/* Normal Heat points */}
                  {showNormal && normalPoints.length > 0 && (
                    <HeatmapLayer 
                      points={normalPoints} 
                      options={{
                        radius: radius,
                        blur: blur,
                        maxOpacity: 0.85,
                        minOpacity: 0.2,
                        gradient: {
                          0.25: '#22c55e', // Green
                          0.5: '#eab308',  // Yellow
                          0.75: '#f97316', // Orange
                          1.0: '#3b82f6'   // Blue / regular
                        }
                      }} 
                    />
                  )}

                  {/* Anomaly Heat points */}
                  {showAnomaly && anomalyPoints.length > 0 && (
                    <HeatmapLayer 
                      points={anomalyPoints} 
                      options={{
                        radius: radius + 5,
                        blur: blur - 5,
                        maxOpacity: 0.95,
                        minOpacity: 0.3,
                        gradient: {
                          0.4: '#eab308',  // Yellow
                          0.75: '#f97316', // Orange
                          1.0: '#ef4444'   // Red / anomaly
                        }
                      }} 
                    />
                  )}
                </MapContainer>

                {/* Floating Indicators Over Map */}
                <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
                  <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-black/5 flex flex-col gap-2 shadow-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm" />
                      <span className="text-[9px] font-black text-black uppercase tracking-wider">Patrón de Ruta Regular</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm animate-pulse" />
                      <span className="text-[9px] font-black text-black uppercase tracking-wider">Puntos de Anomalía</span>
                    </div>
                  </div>
                </div>

                {/* Botón flotante derecho de capas */}
                <div className="absolute top-4 right-4 z-[1000]">
                  <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl border border-black/5 flex items-center gap-4 shadow-xl">
                    <label className="flex items-center gap-1.5 cursor-pointer text-[9px] font-black uppercase tracking-wider text-neutral-600 hover:text-black">
                      <input type="checkbox" checked={showNormal} onChange={e => setShowNormal(e.target.checked)} className="accent-brand-orange" />
                      Normales
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-[9px] font-black uppercase tracking-wider text-neutral-600 hover:text-brand-orange">
                      <input type="checkbox" checked={showAnomaly} onChange={e => setShowAnomaly(e.target.checked)} className="accent-brand-orange" />
                      Anomalías
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column: Structured Query Parameter Inputs & Detailed Information */}
              <div className="w-[420px] lg:w-[480px] h-full bg-white p-5 rounded-[24px] border-4 border-black/5 shadow-2xl flex flex-col justify-between overflow-y-auto no-scrollbar shrink-0">
                
                <div className="space-y-4">
                  {/* Title & Setup section */}
                  <div className="flex items-center gap-3 border-b border-black/5 pb-3">
                    <Settings className="text-brand-orange" size={18} />
                    <h3 className="font-black text-xs text-black uppercase tracking-widest leading-none">Ajustes del Modelo IA</h3>
                  </div>

                  {/* Execution query controls form */}
                  <form onSubmit={handleUpdateQuery} className="space-y-3 bg-[#f8f9fa] p-4 rounded-2xl border border-black/5">
                    
                    {/* Hours (historial length) input */}
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="text-[8px] font-black text-black/40 uppercase tracking-wider block">Horas de Historial (hours)</label>
                        <span className="text-[9px] font-black text-brand-orange bg-brand-orange/10 px-1.5 py-0.5 rounded">
                          Equivale a {equivalentDays} días
                        </span>
                      </div>
                      <input 
                        type="number"
                        min="1"
                        max="2160"
                        value={hours}
                        onChange={(e) => setHours(parseInt(e.target.value) || 0)}
                        className="w-full bg-white border border-black/5 p-2 rounded-xl text-[11px] font-black text-black mt-1.5 focus:outline-none focus:border-brand-orange focus:ring-0"
                      />
                      <p className="text-[8.5px] text-neutral-400 font-semibold mt-1">
                        * Ingrese el total de horas de historial (máximo 90 días o 2160 horas).
                      </p>
                    </div>

                    {/* Sampling input */}
                    <div>
                      <label className="text-[8px] font-black text-black/40 uppercase tracking-wider block">Frecuencia de Muestreo (sampling)</label>
                      <input 
                        type="number"
                        min="1"
                        max="6"
                        value={sampling}
                        onChange={(e) => setSampling(parseInt(e.target.value) || 0)}
                        className="w-full bg-white border border-black/5 p-2 rounded-xl text-[11px] font-black text-black mt-1.5 focus:outline-none focus:border-brand-orange focus:ring-0"
                      />
                      <p className="text-[8.5px] text-neutral-400 font-semibold mt-1">
                        * Intervalo de salto de telemetría (rango de 1 a 6).
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loadingML}
                      className="w-full py-3 rounded-xl bg-black hover:bg-neutral-800 text-white font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-md"
                    >
                      {loadingML ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                      Recalcular Heatmap
                    </button>
                  </form>

                  {/* Summary of returned statistics */}
                  <div className="space-y-2">
                    <h4 className="font-black text-[9px] text-black/40 uppercase tracking-widest leading-none border-b border-black/5 pb-1.5 mb-2">
                      Estadísticas de Clustering
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#f8f9fa] border border-black/5 p-3 rounded-2xl flex flex-col">
                        <span className="text-[8px] font-black text-neutral-400 uppercase tracking-wider">Vectores Procesados</span>
                        <span className="text-lg font-black text-black mt-1">
                          {data?.total_returned || 0}
                        </span>
                      </div>
                      <div className="bg-[#f8f9fa] border border-black/5 p-3 rounded-2xl flex flex-col">
                        <span className="text-[8px] font-black text-neutral-400 uppercase tracking-wider">Índice de Anomalías</span>
                        <span className="text-lg font-black text-red-500 mt-1">
                          {anomalyPoints.length} / {normalPoints.length + anomalyPoints.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Manual visual sliders for map overlay tuning */}
                  <div className="space-y-3 bg-[#f8f9fa]/50 p-3 rounded-2xl border border-black/5">
                    <span className="text-[8px] font-black text-black/40 uppercase tracking-wider block">Visualización de Calor</span>
                    
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[9px] font-bold text-neutral-500 uppercase">Radio</span>
                      <input 
                        type="range" 
                        min="15" 
                        max="80" 
                        value={radius} 
                        onChange={(e) => setRadius(parseInt(e.target.value))}
                        className="flex-1 accent-brand-orange h-1 opacity-70 hover:opacity-100 transition-opacity" 
                      />
                      <span className="text-[9px] font-bold font-mono text-neutral-500 w-8 text-right">{radius}px</span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[9px] font-bold text-neutral-500 uppercase">Difuminado</span>
                      <input 
                        type="range" 
                        min="10" 
                        max="60" 
                        value={blur} 
                        onChange={(e) => setBlur(parseInt(e.target.value))}
                        className="flex-1 accent-brand-orange h-1 opacity-70 hover:opacity-100 transition-opacity" 
                      />
                      <span className="text-[9px] font-bold font-mono text-neutral-500 w-8 text-right">{blur}px</span>
                    </div>
                  </div>
                </div>

                {/* Machine learning explanation card */}
                <div className="bg-brand-orange/5 p-3.5 rounded-2xl border border-brand-orange/15 flex items-start gap-2.5 mt-2 shrink-0">
                   <Info className="text-brand-orange shrink-0 mt-0.5" size={14} />
                   <div>
                     <p className="text-[8px] font-black text-brand-orange uppercase tracking-wider leading-none">Interpretación del Modelo</p>
                     <p className="text-[9.5px] text-neutral-500 font-semibold leading-relaxed mt-1">
                       El heatmap muestra rutas frecuentes en azul/verde. Los desvíos e incidentes inusuales se agrupan en rojo.
                     </p>
                   </div>
                </div>

              </div>
            </>
          )}
        </div>

        {/* STEP 1: Modal Emergente (Vehicle Selection Dialog overlay) */}
        <AnimatePresence>
          {step === 1 && (
            <div className="absolute inset-0 z-[1001] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                className="bg-white border-4 border-black/5 rounded-[32px] p-6 max-w-md w-full shadow-2xl flex flex-col gap-4 overflow-hidden max-h-[90%]"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-orange/10 flex items-center justify-center border border-brand-orange/20 shrink-0">
                    <Thermometer className="text-brand-orange" size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-black leading-none">Seleccionar vehículo</h3>
                    <p className="text-neutral-500 text-xs font-semibold mt-1 leading-relaxed">
                      Para generar el clustering de Machine Learning y detectar paradas o desvíos anómalos de ruta, por favor seleccione la unidad de su flota.
                    </p>
                  </div>
                </div>

                <div className="border-t border-black/5 pt-3 flex-1 overflow-y-auto no-scrollbar space-y-2">
                  {loadingVeh ? (
                    [1, 2, 3].map(i => (
                      <div key={i} className="h-14 rounded-2xl bg-black/[0.02] animate-pulse border border-black/5" />
                    ))
                  ) : vehicles.length === 0 ? (
                    <div className="py-8 text-center bg-black/[0.02] rounded-2xl border border-black/5">
                      <Car className="mx-auto text-neutral-300 mb-2" size={36} />
                      <h4 className="text-xs font-black text-black">Sin unidades</h4>
                      <p className="text-neutral-400 text-[10px] mt-0.5">No hay vehículos vinculados en tu cuenta.</p>
                    </div>
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
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Inactive Service Modal */}
      <AnimatePresence>
        {errorModal && (
          <ModalNoService 
            message={errorModal} 
            onClose={() => setErrorModal(null)} 
            onSolicitar={() => {
              setErrorModal(null);
              window.location.href = `${env.FRONTEND_URL}/user/dashboard/servicios`;
            }}
          />
        )}
      </AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
