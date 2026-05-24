import { useState, useEffect, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, AlertCircle, ShieldCheck, 
  Loader2, CheckCircle, 
  ChevronLeft, Satellite, X, ArrowRight,
  Target, Compass
} from 'lucide-react';
import { MapContainer, TileLayer, useMap, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import Spline from '@splinetool/react-spline';
// @ts-ignore
import townaceModel from '../assets/models/animacion_townace.spline?url';
import agenteAlertaIcon from '../assets/agente_alerta.png';
import { useAppContext } from '../context/AppContext';
import { env } from '../config/env';

const API_BASE = env.API_BASE_URL;

interface Toast {
  id: string;
  message: string;
}

// ── Typewriter Text Component ───────────────────────────────────────────────
const TypewriterText = memo(({ text, speed = 25 }: { text: string; speed?: number }) => {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    let idx = 0;
    setDisplayed('');
    const timer = setInterval(() => {
      if (idx < text.length) {
        setDisplayed((prev) => prev + text.charAt(idx));
        idx++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span>
      {displayed}
      {displayed.length < text.length && (
        <span className="inline-block w-1.5 h-3.5 ml-1 bg-brand-orange animate-pulse align-middle" />
      )}
    </span>
  );
});

// ── View Updater Component ────────────────────────────────────────────────────
const ViewUpdater = ({ lat, lng }: { lat: number | null; lng: number | null }) => {
  const map = useMap();
  useEffect(() => {
    if (lat !== null && lng !== null) {
      map.flyTo([lat, lng], 12, { duration: 1.2 });
    }
  }, [lat, lng, map]);
  return null;
};

// ── Heatmap Layer Component ──────────────────────────────────────────────────
const HeatmapLayer = memo(({ points, options }: { points: any[]; options: any }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !points || points.length === 0) return;

    // @ts-ignore
    const heatLayer = L.heatLayer(points, options).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points, options]);

  return null;
});

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

export default function RutasFrecuentes() {
  const { authToken } = useAppContext();
  
  const [step, setStep] = useState(1);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [vehSel, setVehSel] = useState<any>(null);
  
  // Clusters API response state
  const [data, setData] = useState<any>(null);
  
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

  // Fetch route clusters for vehicle
  const fetchClusters = useCallback(async (vehId: number) => {
    if (!authToken || !vehId) return;
    setLoadingML(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/analytics/ml/vehicles/${vehId}/clusters`, {
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
      const clustersData = await res.json();
      setData(clustersData);
      setStep(2);
    } catch (err: any) {
      console.error("Error fetching ML route clusters:", err);
      setError("No se pudieron procesar los clústeres de rutas habituales.");
      setToast({
        id: 'err-clusters',
        message: 'Error al conectar con el servidor de clustering.'
      });
    } finally {
      setLoadingML(false);
    }
  }, [authToken]);

  const onSelectVehicle = useCallback((veh: any) => {
    setVehSel(veh);
    fetchClusters(veh.id);
  }, [fetchClusters]);

  // Toast timer
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Extract variables safely
  const totalClusters = data?.total_clusters ?? data?.count ?? data?.clusters?.length ?? 0;
  const mainClusters = data?.main_clusters ?? data?.clusters?.filter((c: any) => c.label === 'main')?.length ?? 0;
  const clustersList = Array.isArray(data?.clusters) ? data.clusters : [];

  // Determine map center coordinate
  const firstCluster = clustersList[0];
  const centerLat = firstCluster?.centroid?.lat ?? firstCluster?.lat ?? -16.5000;
  const centerLng = firstCluster?.centroid?.lng ?? firstCluster?.centroid?.lon ?? firstCluster?.lng ?? firstCluster?.lon ?? -68.1500;

  // Max density for relative percentage calculation
  const densities = clustersList.map((cl: any) => cl.density ?? 0);
  const maxDensity = densities.length > 0 ? Math.max(...densities) : 1;

  // Custom Leaflet Animated DivIcons to avoid image asset path issues in build
  const createMainIcon = () => {
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div class="relative flex items-center justify-center w-8 h-8">
          <div class="absolute inset-0 bg-brand-orange/40 rounded-full animate-ping"></div>
          <div class="relative w-6 h-6 bg-brand-orange border-2 border-white rounded-full shadow-lg flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
  };

  const createSecondaryIcon = () => {
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div class="relative flex items-center justify-center w-6 h-6">
          <div class="absolute inset-0 bg-emerald-500/40 rounded-full animate-pulse"></div>
          <div class="relative w-4 h-4 bg-emerald-500 border border-white rounded-full shadow-md flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  // Convert clustersList into Leaflet Heatmap Points
  const heatmapPoints = clustersList.map((c: any) => {
    const cLat = c.centroid?.lat ?? c.lat ?? 0;
    const cLng = c.centroid?.lng ?? c.centroid?.lon ?? c.lng ?? c.lon ?? 0;
    return [cLat, cLng, (c.density ?? c.point_count ?? 1) * 3];
  });

  return (
    <div className="text-black h-[calc(100vh-172px)] flex flex-col gap-4 overflow-hidden p-2 relative">
      
      {/* Toast Notifications */}
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
            <Target className="text-brand-orange" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-black tracking-tight leading-none">Rutas frecuentes</h1>
            <p className="text-xs font-semibold text-black/40 mt-1.5 flex items-center gap-1.5">
              {vehSel ? (
                <>
                  Historial de clústeres operativos detectados para <span className="text-brand-orange font-bold uppercase">{vehSel.modelo} ({vehSel.placa})</span>
                </>
              ) : (
                'Identificación automática de bases, paradas de clientes y rutas habituales'
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
                onClick={() => fetchClusters(vehSel.id)}
                className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Reintentar
              </button>
            </div>
          ) : !vehSel ? (
            // Background Placeholder while waiting for step 1
            <div className="w-full h-full bg-[#f1f3f5] flex items-center justify-center relative rounded-[24px]">
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `radial-gradient(circle, #000 10%, transparent 11%), radial-gradient(circle, #000 10%, transparent 11%)`,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 10px 10px'
              }} />
              <div className="flex flex-col items-center gap-2 text-center z-10 px-4">
                <Target size={42} className="text-black/15 animate-pulse" />
                <p className="text-xs font-bold text-black/30 uppercase tracking-wider">Esperando selección de vehículo...</p>
              </div>
            </div>
          ) : loadingML ? (
            <div className="w-full h-full bg-[#f8f9fa] border border-black/5 rounded-[24px] flex flex-col items-center justify-center gap-3 shadow-inner">
              <Loader2 className="text-brand-orange animate-spin" size={32} />
              <p className="text-xs font-bold text-black/30 uppercase tracking-widest">Calculando clústeres espaciales...</p>
            </div>
          ) : (
            /* Step 2 Screen Division:
               - Left Column (w-[340px]): 
                  - Top: Chatbot speech bubble card
                  - Bottom: 3D Element card with overlaid key parameters on top of the 3D scene (no separate stats card)
               - Right Column (flex-1): Zoomed-out map */
            <>
              {/* Left Column Stack */}
              <div className="w-[340px] h-full flex flex-col gap-4 shrink-0 min-h-0">
                
                {/* 1. Izquierda Superior: Chatbot bubble beautifully adjusted */}
                <div className="bg-white border border-black/5 rounded-[24px] p-4 shadow-sm flex flex-col gap-3 items-center justify-between min-h-0 flex-1">
                  <div className="flex items-center gap-3 w-full border-b border-black/5 pb-2">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-brand-orange/20 bg-white flex items-center justify-center shadow-md relative shrink-0">
                      <img src={agenteAlertaIcon} alt="Agente Alerta" className="w-9 h-9 object-contain" />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full animate-pulse"></span>
                    </div>
                    <div className="text-left">
                      <h3 className="text-xs font-black text-black tracking-tight leading-none">Agente Alerta [IA]</h3>
                      <span className="text-[7.5px] font-black text-brand-orange uppercase tracking-wider block mt-1">Soporte Operacional</span>
                    </div>
                  </div>

                  {/* Speech Bubble Container */}
                  <div className="w-full flex-1 flex flex-col justify-center py-1">
                    <div className="relative bg-brand-orange/5 border border-brand-orange/10 p-4 rounded-2xl shadow-sm flex flex-col gap-2">
                      {/* Speech bubble pointer */}
                      <div className="absolute top-[-5px] left-[24px] w-2.5 h-2.5 bg-[#fef6f0] border-t border-l border-brand-orange/10 rotate-45"></div>

                      <p className="text-[11px] text-neutral-700 font-bold leading-normal italic text-left">
                        <TypewriterText text="He analizado la telemetría de los últimos 20 días de esta unidad, filtrando puntos donde estuvo detenida o con movimiento mínimo. Las Zonas Habituales (main) corresponden a ubicaciones recurrentes (ej. base/empresa), mientras que los clústeres secundarios señalan paradas frecuentes." />
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Izquierda Inferior: 3D Scene + overlaid parameters (only the 3 key parameters shown over the 3D element) */}
                <div className="h-[260px] rounded-[24px] overflow-hidden relative border border-black/5 bg-[#f1f3f5] shrink-0">
                  {/* The interactive 3D Spline Scene */}
                  <div className="absolute inset-0 z-0">
                    <Spline scene={townaceModel} />
                  </div>

                  {/* Top-left static badge */}
                  <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2 pointer-events-none">
                    <div className="bg-black/90 backdrop-blur-xl px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1">
                      <Compass size={10} className="text-brand-orange" />
                      <span className="text-[7px] font-black text-white uppercase tracking-wider">Flota de Rutas IA</span>
                    </div>
                  </div>

                  {/* Overlaid parameters container directly on top/bottom of the 3D element */}
                  <div className="absolute bottom-3 inset-x-3 z-10 flex flex-col gap-1.5 pointer-events-auto bg-black/85 backdrop-blur-xl p-3 rounded-2xl border border-white/10 shadow-lg">
                    <div className="flex justify-between items-center text-[8.5px] font-bold text-white">
                      <span className="text-white/60 uppercase">Análisis</span>
                      <span className="font-mono text-brand-orange font-black">Últimos 20 Días</span>
                    </div>
                    <div className="w-full h-px bg-white/10" />
                    <div className="flex justify-between items-center text-[8.5px] font-bold text-white">
                      <span className="text-white/60 uppercase">Zonas Habituales (main)</span>
                      <span className="font-mono text-brand-orange font-black">{mainClusters} zonas</span>
                    </div>
                    <div className="w-full h-px bg-white/10" />
                    <div className="flex justify-between items-center text-[8.5px] font-bold text-white">
                      <span className="text-white/60 uppercase">Paradas Frecuentes</span>
                      <span className="font-mono text-emerald-400 font-black">{totalClusters - mainClusters} paradas</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Part 3: Right Column (Leaflet Map) */}
              <div className="flex-1 h-full rounded-[24px] overflow-hidden border-4 border-black/5 relative shadow-2xl bg-white">
                <MapContainer
                  center={[centerLat, centerLng]}
                  zoom={12}
                  style={{ width: '100%', height: '100%' }}
                  zoomControl={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />

                  <ViewUpdater lat={centerLat} lng={centerLng} />

                  {/* Draw real Heatmap density layer from cluster points */}
                  {heatmapPoints.length > 0 && (
                    <HeatmapLayer 
                      points={heatmapPoints}
                      options={{
                        radius: 60,
                        blur: 50,
                        maxOpacity: 0.75,
                        minOpacity: 0.15,
                        gradient: {
                          0.3: '#10b981', // Emerald for secondary/lower density
                          0.7: '#f59e0b', // Amber
                          1.0: '#f97316'  // Brand Orange for main clusters
                        }
                      }}
                    />
                  )}

                  {/* Draw Custom Animated Markers with custom DivIcon and Tooltips/Popups */}
                  {clustersList.map((c: any, index: number) => {
                    const cLat = c.centroid?.lat ?? c.lat ?? 0;
                    const cLng = c.centroid?.lng ?? c.centroid?.lon ?? c.lng ?? c.lon ?? 0;
                    const isMain = c.label === 'main';

                    // Relative occupation calculation
                    const relPct = Math.round(((c.density ?? 0) / maxDensity) * 100);

                    return (
                      <div key={index}>
                        <Marker 
                          position={[cLat, cLng]}
                          icon={isMain ? createMainIcon() : createSecondaryIcon()}
                        >
                          {/* Mouse hover details: Zone, density, radius, and estimated zone */}
                          <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                            <div className="p-2 font-sans text-neutral-800">
                              <p className="text-[10px] font-black uppercase text-brand-orange leading-none mb-1">
                                {isMain ? '📍 Zona Habitual (Base)' : '🛑 Parada Frecuente'}
                              </p>
                              {c.estimated_zone && (
                                <p className="text-[9.5px] font-black text-black leading-tight bg-black/5 px-1 py-0.5 rounded mb-1.5 border border-black/5">
                                  {c.estimated_zone}
                                </p>
                              )}
                              <div className="space-y-0.5 text-[8.5px] font-semibold text-neutral-500">
                                <p>Frecuencia: <span className="font-black text-black">{c.density} detenciones</span></p>
                                <p>Área calculada: <span className="font-black text-black">{c.radius?.toFixed(1)} m</span></p>
                                <p>Puntos de telemetría: <span className="font-black text-black">{c.point_count}</span></p>
                              </div>
                            </div>
                          </Tooltip>

                          {/* Click details: Custom SVG progress bar graph inside Leaflet Popup */}
                          <Popup className="tech-popup">
                            <div className="p-1 space-y-2.5 w-[160px] text-black">
                              <p className="text-[9.5px] font-black uppercase text-brand-orange border-b border-black/5 pb-1">
                                Clúster #{c.cluster_id}
                              </p>
                              {c.estimated_zone && (
                                <div className="text-[8.5px] font-semibold text-neutral-600">
                                  <span className="text-[7px] font-black text-neutral-400 uppercase block leading-none">Zona Estimada</span>
                                  <p className="mt-0.5 font-bold text-black">{c.estimated_zone}</p>
                                </div>
                              )}
                              <div className="space-y-1">
                                <span className="text-[7.5px] font-black text-neutral-400 uppercase block">Ocupación / Densidad</span>
                                <div className="w-full h-2 bg-neutral-100 rounded-full border border-black/5 overflow-hidden relative">
                                  <div className="h-full bg-gradient-to-r from-brand-orange/80 to-brand-orange rounded-full transition-all duration-500" style={{ width: `${relPct}%` }} />
                                </div>
                                <span className="text-[8px] font-bold text-neutral-500 block">
                                  {relPct}% de la base máxima
                                </span>
                              </div>
                              <div className="text-[8px] font-bold text-neutral-400 border-t border-black/5 pt-1">
                                {c.updated_at ? `Actualizado: ${new Date(c.updated_at).toLocaleDateString()}` : ''}
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      </div>
                    );
                  })}
                </MapContainer>

                {/* Floating Map Legend Tag */}
                <div className="absolute top-4 left-4 z-[1000]">
                  <div className="bg-white/95 backdrop-blur-xl px-4 py-2.5 rounded-xl border border-black/5 flex items-center gap-2.5 shadow-xl">
                    <div className="w-7 h-7 rounded-lg bg-brand-orange flex items-center justify-center text-white">
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-black/40 uppercase tracking-widest leading-none">Geo-Clustering IA</p>
                      <p className="text-[10px] font-black text-black uppercase mt-1 leading-none">Mapa de Bases Frecuentes</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* STEP 1: Modal Emergente (Vehicle Selection Dialog overlay with Agent speech bubble) */}
        <AnimatePresence>
          {step === 1 && (
            <div className="absolute inset-0 z-[1001] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                className="bg-white border-4 border-black/5 rounded-[32px] p-6 max-w-3xl w-full shadow-2xl flex flex-col md:flex-row gap-6 overflow-hidden max-h-[90%]"
              >
                {/* Left Side: Agent Alerta with styled bubble explaining the logic */}
                <div className="md:w-[320px] flex flex-col items-center justify-center text-center gap-4 bg-brand-orange/5 p-6 rounded-2xl border border-brand-orange/10 shrink-0">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-brand-orange/20 bg-white flex items-center justify-center shadow-md relative">
                    <img src={agenteAlertaIcon} alt="Agente Alerta" className="w-16 h-16 object-contain" />
                    <span className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full animate-pulse"></span>
                  </div>
                  
                  {/* Styled speech bubble with Typewriter Text animation */}
                  <div className="relative bg-white border border-black/5 p-4 rounded-2xl shadow-sm">
                    {/* speech bubble triangle */}
                    <div className="absolute top-[-6px] left-[50%] translate-x-[-50%] w-3 h-3 bg-white border-t border-l border-black/5 rotate-45"></div>
                    <span className="text-[9px] font-black text-brand-orange uppercase tracking-wider block leading-none mb-2">Agente Alerta [IA]</span>
                    <p className="text-[12px] text-neutral-700 font-bold leading-normal italic text-center">
                      <TypewriterText text="Hola. Este módulo de analítica geoespacial procesa el histórico completo de tus recorridos para identificar de forma inteligente tus rutas frecuentes y bases operativas mediante clústeres espaciales." />
                    </p>
                  </div>
                </div>

                {/* Right Side: Vehicle List Selection */}
                <div className="flex-1 flex flex-col gap-3 min-w-0">
                  <div>
                    <h3 className="text-base font-black text-black leading-none">Seleccionar vehículo</h3>
                    <p className="text-neutral-400 text-[10px] font-semibold mt-1">
                      Por favor escoja la unidad de su flota que desea analizar a continuación.
                    </p>
                  </div>

                  <div className="border-t border-black/5 pt-3 flex-1 overflow-y-auto no-scrollbar space-y-2 max-h-[300px]">
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
        .tech-popup .leaflet-popup-content-wrapper {
          border-radius: 16px !important;
          padding: 8px !important;
          border: 1px solid rgba(0,0,0,0.05) !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1) !important;
        }
        .tech-popup .leaflet-popup-tip {
          box-shadow: 0 10px 30px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </div>
  );
}
