import { useState, useEffect, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import {
  Car, Loader2, ChevronLeft, AlertCircle,
  ArrowRight, Activity, Map as MapIcon, Layers,
  Search, ShieldCheck, Target, Zap
} from 'lucide-react';
import {
  MapContainer, TileLayer, useMap, Marker, Popup, Circle
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingScreen from './LoadingScreen';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://11tkrk1f2zwo.share.zrok.io';

// ── Heatmap Layer Component ──────────────────────────────────────────────────
const HeatmapLayer = ({ points, options }: { points: any[]; options: any }) => {
  const map = useMap();
  useEffect(() => {
    if (!map || !points || points.length === 0) return;
    // @ts-ignore
    const heatLayer = L.heatLayer(points, options).addTo(map);
    return () => { map.removeLayer(heatLayer); };
  }, [map, points, options]);
  return null;
};

// ── View Updater Component ────────────────────────────────────────────────────
const ViewUpdater = ({ lat, lng, zoom = 14 }: { lat: number; lng: number; zoom?: number }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], zoom, { duration: 1.5 });
    }
  }, [lat, lng, zoom, map]);
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

// ── Analysis Mode Selector Modal ─────────────────────────────────────────────
const ModalSelectorAnalisis = memo(({ isOpen, onClose, onSelect }: any) => {
  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-brand-dark/95 backdrop-blur-xl"
        onClick={onClose}
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-3xl bg-brand-dark-2 rounded-[40px] border border-white/10 shadow-2xl p-8 md:p-12"
      >
        <div className="text-center mb-10">
           <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Selección de Inteligencia</h3>
           <p className="text-neutral-500 text-xs font-bold uppercase tracking-[0.2em]">Seleccione el tipo de análisis geoespacial para procesar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <button 
             onClick={() => onSelect('HEATMAP')}
             className="group relative p-8 rounded-[32px] bg-brand-dark-3 border border-white/5 hover:border-brand-orange/40 hover:bg-brand-orange/5 transition-all text-left flex flex-col items-center text-center gap-6 overflow-hidden"
           >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Layers size={120} className="text-brand-orange" />
              </div>
              <div className="w-16 h-16 rounded-2xl bg-brand-orange/10 flex items-center justify-center border border-brand-orange/20 text-brand-orange group-hover:scale-110 transition-transform">
                <Layers size={32} />
              </div>
              <div>
                <h4 className="text-xl font-black text-white mb-3">Zonas Habituales</h4>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Mapa de calor de densidad acumulada. Identifica los sectores con mayor tiempo de permanencia mediante gradientes térmicos.
                </p>
              </div>
              <div className="mt-auto px-6 py-2 rounded-full bg-white/5 group-hover:bg-brand-orange text-[9px] font-black text-neutral-500 group-hover:text-white uppercase tracking-widest transition-colors">
                Generar Heatmap
              </div>
           </button>

           <button 
             onClick={() => onSelect('CLUSTERS')}
             className="group relative p-8 rounded-[32px] bg-brand-dark-3 border border-white/5 hover:border-brand-orange/40 hover:bg-brand-orange/5 transition-all text-left flex flex-col items-center text-center gap-6 overflow-hidden"
           >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Target size={120} className="text-brand-orange" />
              </div>
              <div className="w-16 h-16 rounded-2xl bg-brand-orange/10 flex items-center justify-center border border-brand-orange/20 text-brand-orange group-hover:scale-110 transition-transform">
                <Target size={32} />
              </div>
              <div>
                <h4 className="text-xl font-black text-white mb-3">Paradas Frecuentes</h4>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Identifica clústeres discretos (Bases/Clientes) con cálculo de radio de influencia y densidad de observaciones.
                </p>
              </div>
              <div className="mt-auto px-6 py-2 rounded-full bg-white/5 group-hover:bg-brand-orange text-[9px] font-black text-neutral-500 group-hover:text-white uppercase tracking-widest transition-colors">
                Identificar Clústeres
              </div>
           </button>
        </div>

        <button onClick={onClose} className="mt-10 w-full text-center text-neutral-600 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">
           Cancelar Selección
        </button>
      </motion.div>
    </div>,
    document.body
  );
});

export default function RutasFrecuentes() {
  const { authToken } = useAppContext();

  const [step, setStep] = useState(1);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [vehSel, setVehSel] = useState<any>(null);
  
  // App States
  const [mode, setMode] = useState<'HEATMAP' | 'CLUSTERS'>('HEATMAP');
  const [loading, setLoading] = useState(false);
  const [loadingVeh, setLoadingVeh] = useState(true);
  const [dataHeatmap, setDataHeatmap] = useState<any>(null);
  const [dataClusters, setDataClusters] = useState<any>(null);
  const [errorHeader, setErrorHeader] = useState<string | null>(null);
  const [showChoiceModal, setShowChoiceModal] = useState(false);

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

  const fetchAnalytics = useCallback(async (vehId: number, targetMode: 'HEATMAP' | 'CLUSTERS') => {
    if (!authToken || !vehId) return;
    setLoading(true);
    setMode(targetMode);
    setErrorHeader(null);
    setShowChoiceModal(false);
    
    try {
      const endpoint = targetMode === 'HEATMAP' 
        ? `${API_BASE}/api/analytics/mapa-clusterin/${vehId}`
        : `${API_BASE}/api/analytics/paradas-frecuentes/${vehId}`;

      const res = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${authToken}`, 'Accept': 'application/json' },
      });

      if (res.status === 403) {
        setErrorHeader('Servicio Analytics no activo o restringido para esta unidad.');
        return;
      }
      if (!res.ok) throw new Error("Error loading Analytics Data");
      
      const resJson = await res.json();
      if (targetMode === 'HEATMAP') setDataHeatmap(resJson);
      else setDataClusters(resJson);

      setStep(2);
    } catch (e) {
      console.error('Fetch Analytics error:', e);
      setErrorHeader('Ocurrió un error al procesar los datos de IA.');
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  const onSelectVehicle = (veh: any) => {
    setVehSel(veh);
    setShowChoiceModal(true);
  };

  if (loading) return <LoadingScreen message={`Identificando patrones para ${vehSel?.placa}...`} />;

  // Map settings
  const pointsHeatmap = dataHeatmap?.points?.map((p: any) => [p.lat, p.lng, p.weight * 2]) || [];
  const center = dataHeatmap?.points?.[0] || dataClusters?.clusters?.[0]?.centroid || { lat: -16.4897, lng: -68.1193 };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-brand-orange/10 flex items-center justify-center border border-brand-orange/20">
              <Target className="text-brand-orange" size={20} />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Rutas y Zonas Frecuentes</h1>
          </div>
          <p className="text-neutral-500 text-sm font-medium italic">Clustering espacial para la identificación de bases, clientes y paradas recurrentes.</p>
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

      {errorHeader && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold uppercase tracking-wider">
           <AlertCircle size={16} /> {errorHeader}
        </div>
      )}

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
                  loading={loading && vehSel?.id === v.id} 
                  onSelect={onSelectVehicle} 
                />
              ))
            )}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-6"
          >
            {/* Mode Explanation Card */}
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-brand-dark-3 border border-white/10 rounded-[40px] p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  {mode === 'HEATMAP' ? <Layers size={140} className="text-brand-orange" /> : <Target size={140} className="text-brand-orange" />}
               </div>
               <div className="w-20 h-20 rounded-3xl bg-brand-orange/10 flex items-center justify-center border border-brand-orange/20 shrink-0 shadow-lg shadow-brand-orange/5 relative z-10">
                  {mode === 'HEATMAP' ? <Layers className="text-brand-orange" size={40} /> : <Target className="text-brand-orange" size={40} />}
               </div>
               <div className="flex-1 text-center md:text-left relative z-10">
                  <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                    <span className="px-3 py-1 rounded-full bg-brand-orange text-[9px] font-black text-white uppercase tracking-[0.2em]">IA Engine</span>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                       {mode === 'HEATMAP' ? 'Zonas Habituales' : 'Paradas Frecuentes'}
                    </h2>
                  </div>
                  <p className="text-neutral-400 text-sm font-medium leading-relaxed max-w-2xl">
                     {mode === 'HEATMAP' 
                       ? 'Este mapa de calor procesa el histórico completo de permanencia del vehículo para resaltar sectores con mayor recurrencia. Los tonos verdes profundos indican la zona de "estancia" con mayor peso operativo.'
                       : 'Utilizando el algoritmo de clustering LinkGPS, el sistema ha detectado núcleos de detención prolongada. Los clusters en naranja representan puntos neurálgicos (Bases) mientras que los verdes son paradas secundarias.'}
                  </p>
               </div>
               <div className="hidden lg:flex items-center gap-3 bg-brand-orange/5 px-6 py-3 rounded-2xl border border-brand-orange/10 relative z-10">
                  <div className="relative">
                    <div className="absolute inset-0 bg-brand-orange rounded-full animate-ping opacity-20" />
                    <Zap size={18} className="text-brand-orange relative" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-white uppercase tracking-wider">Análisis Activo</p>
                    <p className="text-[9px] text-brand-orange font-bold uppercase tracking-tight">Vectores ML</p>
                  </div>
               </div>
            </motion.div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
               <button 
                onClick={() => { setStep(1); setVehSel(null); }}
                className="flex items-center gap-2 text-neutral-500 hover:text-white font-black text-[10px] uppercase tracking-[0.2em] transition-colors"
               >
                 <ChevronLeft size={16} /> Volver a selección
               </button>
               
               <div className="flex items-center gap-2 glass px-2 py-1.5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2 px-4 border-r border-white/10">
                    <Activity className="text-brand-orange" size={14} />
                    <span className="text-[10px] font-black text-white uppercase tracking-wider">{vehSel?.placa}</span>
                  </div>
                  <div className="flex items-center gap-1">
                     <button 
                       onClick={() => setMode('HEATMAP')}
                       className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                         mode === 'HEATMAP' ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' : 'text-neutral-500 hover:text-white'
                       }`}
                     >
                       <Layers size={12} /> Zonas Habituales
                     </button>
                     <button 
                       onClick={() => setMode('CLUSTERS')}
                       className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                         mode === 'CLUSTERS' ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' : 'text-neutral-500 hover:text-white'
                       }`}
                     >
                       <MapIcon size={12} /> Paradas Frecuentes
                     </button>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Map Container */}
              <div className="lg:col-span-3 relative rounded-[40px] overflow-hidden border border-white/10 shadow-2xl h-[650px] bg-brand-dark-2">
                <MapContainer
                  center={[center.lat, center.lng]}
                  zoom={14}
                  style={{ width: '100%', height: '100%' }}
                  zoomControl={false}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; CARTO'
                  />
                  
                  <ViewUpdater lat={center.lat} lng={center.lng} />

                  {mode === 'HEATMAP' && (
                    <HeatmapLayer 
                      points={pointsHeatmap} 
                      options={{
                        radius: 35,
                        blur: 15,
                        max: 1.0,
                        gradient: { 0.1: '#2563eb', 0.4: '#3b82f6', 0.7: '#2ecc71', 1.0: '#27ae60' }
                      }} 
                    />
                  )}

                  {mode === 'CLUSTERS' && dataClusters?.clusters?.map((c: any, i: number) => (
                    <div key={i}>
                      <Circle 
                        center={[c.centroid.lat, c.centroid.lng]}
                        radius={c.radius}
                        pathOptions={{ 
                          color: c.label === 'main' ? '#F97316' : '#2ecc71', 
                          fillColor: c.label === 'main' ? '#F97316' : '#2ecc71',
                          fillOpacity: 0.15,
                          weight: 1
                        }}
                      />
                      <Marker position={[c.centroid.lat, c.centroid.lng]}>
                        <Popup className="tech-popup">
                          <div className="space-y-1">
                            <p className="font-black text-brand-orange">Zona {c.label === 'main' ? 'Principal' : 'Secundaria'}</p>
                            <p className="text-[10px] text-neutral-400">Densidad: {c.density}%</p>
                            <p className="text-[10px] text-neutral-400">Puntos: {c.point_count}</p>
                          </div>
                        </Popup>
                      </Marker>
                    </div>
                  ))}
                </MapContainer>

                {/* Legend Overlay */}
                <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-2">
                   <div className="glass p-4 rounded-2xl border-white/10 flex flex-col gap-3">
                     {mode === 'HEATMAP' ? (
                       <div className="flex items-center gap-2">
                         <div className="w-8 h-2 rounded bg-gradient-to-r from-blue-600 to-green-500" />
                         <span className="text-[10px] font-black text-white uppercase tracking-wider">Flujo Habitual</span>
                       </div>
                     ) : (
                       <div className="flex flex-col gap-2">
                         <div className="flex items-center gap-2">
                           <div className="w-3 h-3 rounded-full bg-brand-orange shadow-[0_0_8px_#F97316]" />
                           <span className="text-[10px] font-black text-white uppercase tracking-wider">Clusters Principales (Bases)</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <div className="w-3 h-3 rounded-full bg-[#2ecc71] shadow-[0_0_8px_#2ecc71]" />
                           <span className="text-[10px] font-black text-white uppercase tracking-wider">Paradas Secundarias</span>
                         </div>
                       </div>
                     )}
                   </div>
                </div>
              </div>

              {/* Sidebar Stats */}
              <div className="space-y-6">
                <div className="glass p-6 rounded-[32px] border border-white/5 space-y-6">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <ShieldCheck className="text-brand-orange" size={18} />
                    <h3 className="font-black text-xs text-white uppercase tracking-[0.2em]">Analítica IA</h3>
                  </div>

                  <div className="space-y-4">
                     <div className="bg-brand-dark-3 p-5 rounded-[24px] border border-white/5">
                        <p className="text-[10px] font-bold text-neutral-500 uppercase mb-1">Total de Clusters</p>
                        <p className="text-3xl font-black text-white">{dataClusters?.total_clusters || 0}</p>
                        <div className="flex items-center gap-2 mt-2">
                           <span className="text-[9px] font-bold text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded uppercase">Identificados</span>
                        </div>
                     </div>

                     <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
                        {dataClusters?.clusters?.map((c: any, i: number) => (
                           <div key={i} className="flex flex-col p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-white/10 transition-all">
                              <div className="flex items-center justify-between mb-1">
                                 <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                                    c.label === 'main' ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'
                                 }`}>
                                    {c.label === 'main' ? 'Base / Principal' : 'Secundaria'}
                                 </span>
                                 <div className="text-[10px] font-mono text-neutral-500 flex items-center gap-1">
                                    <Target size={10} /> {c.density}%
                                 </div>
                              </div>
                              <p className="text-[10px] font-bold text-white truncate">Cluster #{c.cluster_id}</p>
                              <p className="text-[9px] text-neutral-500 uppercase tracking-tighter mt-1">{c.point_count} Observaciones Geo</p>
                           </div>
                        ))}
                        {(!dataClusters?.clusters || dataClusters?.clusters.length === 0) && (
                           <div className="text-center py-10 opacity-30 italic text-xs text-neutral-500">
                             Esperando procesamiento...
                           </div>
                        )}
                     </div>
                  </div>
                </div>

                <div className="glass-orange p-6 rounded-[32px] border border-brand-orange/10 flex flex-col items-center text-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-brand-orange flex items-center justify-center shadow-lg shadow-brand-orange/20">
                      <Search className="text-white" size={24} />
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-brand-orange uppercase tracking-widest mb-1">Nota del Modelo</p>
                     <p className="text-[10px] text-brand-orange/80 font-medium leading-relaxed">
                       Los clusters principales representan áreas donde el vehículo permanece estacionado más del 60% de su tiempo de operación habitual.
                     </p>
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
         <ModalSelectorAnalisis 
           isOpen={showChoiceModal} 
           onClose={() => setShowChoiceModal(false)} 
           onSelect={(m: 'HEATMAP' | 'CLUSTERS') => fetchAnalytics(vehSel?.id, m)}
         />
      </AnimatePresence>

      <style>{`
        .leaflet-container { background: #0a0a0a !important; }
        .tech-popup .leaflet-popup-content-wrapper {
          background: #181818 !important;
          color: white !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 12px !important;
          font-family: inherit !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          font-size: 10px !important;
          letter-spacing: 0.1em !important;
        }
        .tech-popup .leaflet-popup-tip { background: #181818 !important; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
