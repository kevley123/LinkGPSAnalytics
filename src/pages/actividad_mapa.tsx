import { useState, useEffect, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import {
  Car, Loader2, X,
  ChevronLeft, AlertCircle, Satellite,
  ArrowRight, Activity, Calendar,
  Navigation, Ruler, Gauge, Printer,
  Info, History
} from 'lucide-react';
import {
  MapContainer, TileLayer, Marker, Popup,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// @ts-ignore
import { antPath } from 'leaflet-ant-path';

// ── Custom AntPath Component (Native Leaflet) ────────────────────────────────
const AntPath = ({ positions, options }: { positions: any[]; options: any }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !positions || positions.length === 0) return;

    // @ts-ignore
    const path = antPath(positions, options);
    path.addTo(map);

    return () => {
      map.removeLayer(path);
    };
  }, [map, positions, JSON.stringify(options)]);

  return null;
};
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://11tkrk1f2zwo.share.zrok.io';

// ── Update View component ─────────────────────────────────────────────────────
const ViewUpdater = ({ bounds }: { bounds: L.LatLngBoundsExpression | null }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50], duration: 1.5 });
    }
  }, [bounds, map]);
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

// ── Custom Calendar Grid component ──────────────────────────────────────────
const CalendarGrid = memo(({ selectedDate, onSelect }: { selectedDate: string, onSelect: (d: string) => void }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const totalDays = daysInMonth(year, month);
  const startOffset = firstDayOfMonth(year, month);

  const days = Array.from({ length: totalDays }, (_, i) => i + 1);
  const monthName = currentMonth.toLocaleString('default', { month: 'long' });

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    const d = new Date(selectedDate + 'T12:00:00');
    return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
  };

  const handleSelect = (day: number) => {
    const d = new Date(year, month, day);
    const dateStr = d.toISOString().split('T')[0];
    onSelect(dateStr);
  };

  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{monthName} {year}</h4>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-1 hover:bg-white/10 rounded-lg text-neutral-500 hover:text-white transition-all"><ChevronLeft size={14} /></button>
          <button onClick={nextMonth} className="p-1 hover:bg-white/10 rounded-lg text-neutral-500 hover:text-white transition-all"><ArrowRight size={14} /></button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(d => (
          <div key={d} className="text-[8px] font-black text-neutral-600 text-center py-2">{d}</div>
        ))}
        {Array.from({ length: startOffset }).map((_, i) => <div key={`empty-${i}`} />)}
        {days.map(d => {
          const active = isSelected(d);
          return (
            <button
              key={d}
              onClick={() => handleSelect(d)}
              className={`text-[10px] font-bold py-2 rounded-lg transition-all
                ${active 
                  ? 'bg-brand-orange text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]' 
                  : 'text-neutral-400 hover:bg-white/5 hover:text-white'}`}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
});
export default function ActividadMapa() {
  const { authToken } = useAppContext();

  const [step, setStep] = useState(1);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [vehSel, setVehSel] = useState<any>(null);
  const [routeData, setRouteData] = useState<any>(null);
  const [loadingVeh, setLoadingVeh] = useState(true);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  // Configuration - No default date to avoid auto-fetch on empty days
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    if (!authToken) return;
    const fetchVehicles = async () => {
      try {
        setLoadingVeh(true);
        const res = await fetch(`${API_BASE}/api/analytics/mis_vehiculos`, {
          headers: { 'Authorization': `Bearer ${authToken}`, 'Accept': 'application/json' },
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        setVehicles(Array.isArray(data) ? data : (data.vehiculos ?? []));
      } catch (e) {
        console.error('Fetch vehicles error:', e);
      } finally {
        setLoadingVeh(false);
      }
    };
    fetchVehicles();
  }, [authToken]);

  const fetchRoute = useCallback(async (vehId: number, date: string) => {
    if (!authToken || !vehId || !date) return;
    setLoadingRoute(true);
    setRouteData(null); // Clear previous
    try {
      const res = await fetch(`${API_BASE}/api/analytics/ruta-por-dia/${vehId}/${date}`, {
        headers: { 'Authorization': `Bearer ${authToken}`, 'Accept': 'application/json' },
      });

      if (res.status === 403) {
        setErrorModal('No tienes permiso para usar Analytics o no tienes un servicio activo.');
        return;
      }
      
      if (res.status === 404) {
        setRouteData({ points: [], distance: 0, avg_speed: 0 }); // Explicit empty
        return;
      }

      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data = await res.json();
      setRouteData(data);
    } catch (e) {
      console.error('Fetch route error:', e);
      setRouteData({ points: [], distance: 0, avg_speed: 0 });
    } finally {
      setLoadingRoute(false);
    }
  }, [authToken]);

  const onSelectVehicle = useCallback((veh: any) => {
    setVehSel(veh);
    setStep(2); // Go to map but DON'T fetch yet
    setRouteData(null);
  }, []);

  const handleDateSelect = (newDate: string) => {
    setSelectedDate(newDate);
    if (vehSel) {
      fetchRoute(vehSel.id, newDate);
    }
  };

  const polylinePoints = routeData?.points?.map((p: any) => [p.latitude, p.longitude]) || [];
  
  const bounds = polylinePoints.length > 0 ? L.latLngBounds(polylinePoints) : null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto min-h-screen print:p-0">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-end justify-between gap-4 print:hidden"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-brand-orange/10 flex items-center justify-center border border-brand-orange/20">
              <History className="text-brand-orange" size={20} />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Actividad en Mapa</h1>
          </div>
          <p className="text-neutral-500 text-sm font-medium">Análisis retrospectivo de rutas y telemetría diaria.</p>
        </div>

        <div className="flex items-center gap-4">
           {step === 2 && (
             <button 
              onClick={handlePrint}
              className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
             >
               <Printer size={16} /> Imprimir Mapa
             </button>
           )}
           <div className="flex items-center gap-1 bg-brand-dark-3 p-1.5 rounded-2xl border border-white/5">
              {[1, 2].map((s) => (
                <div key={s} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  step === s ? 'bg-brand-orange text-white' : 'text-neutral-600'
                }`}>
                  Step {s}
                </div>
              ))}
           </div>
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
                  loading={loadingRoute && vehSel?.id === v.id} 
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
            <div className="flex flex-wrap items-center justify-between gap-4 print:hidden pointer-events-auto relative z-[1000]">
               <button 
                onClick={() => { setStep(1); setVehSel(null); setRouteData(null); }}
                className="flex items-center gap-2 text-neutral-500 hover:text-white font-black text-[10px] uppercase tracking-[0.2em] transition-colors"
               >
                 <ChevronLeft size={16} /> Volver a selección
               </button>
               
               <div className="flex items-center gap-4 glass px-6 py-2 rounded-2xl border border-white/5">
                  <Activity className="text-brand-orange" size={14} />
                  <span className="text-[10px] font-black text-white uppercase tracking-wider">{vehSel?.placa}</span>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 relative rounded-[40px] overflow-hidden border border-white/10 shadow-2xl h-[700px] bg-brand-dark-2 print:h-[800px] print:rounded-none print:border-none">
                {loadingRoute ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                    <Loader2 size={40} className="animate-spin text-brand-orange" />
                    <p className="text-neutral-500 font-black text-xs uppercase tracking-widest">Reconstruyendo Trayectoria...</p>
                  </div>
                ) : !selectedDate ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-center p-12">
                    <div className="w-20 h-20 rounded-full bg-brand-orange/5 border border-brand-orange/10 flex items-center justify-center mb-2">
                       <Calendar size={32} className="text-brand-orange/40" />
                    </div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">Consultar Actividad</h3>
                    <p className="text-neutral-500 text-sm max-w-xs">Por favor, selecciona una fecha en el panel lateral para visualizar el recorrido del vehículo.</p>
                  </div>
                ) : polylinePoints.length > 0 ? (
                  <MapContainer
                    bounds={bounds || [[-16.48, -68.11], [-16.49, -68.12]]}
                    style={{ width: '100%', height: '100%' }}
                    zoomControl={false}
                  >
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                      attribution='&copy; CARTO'
                    />
                    
                    <ViewUpdater bounds={bounds} />

                    <AntPath 
                      positions={polylinePoints} 
                      options={{
                        color: "#F97316",
                        paused: false,
                        reverse: false,
                        delay: 1500,
                        dashArray: [10, 20],
                        weight: 5,
                        opacity: 0.8,
                        pulseColor: "#ffffff"
                      }}
                    />

                    {/* Start/End Markers */}
                    <Marker position={polylinePoints[0]}>
                      <Popup className="tech-popup">Inicio de Ruta</Popup>
                    </Marker>
                    <Marker position={polylinePoints[polylinePoints.length - 1]}>
                      <Popup className="tech-popup">Fin de Ruta</Popup>
                    </Marker>

                  </MapContainer>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-center p-12">
                    <Activity size={60} className="text-neutral-800" />
                    <h3 className="text-xl font-bold text-white">Sin registros para el día {selectedDate}</h3>
                    <p className="text-neutral-500 text-sm max-w-xs">No se encontraron coordenadas o telemetría para esta unidad en la fecha seleccionada.</p>
                  </div>
                )}

                {/* Legend Overlay */}
                {polylinePoints.length > 0 && (
                  <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-2 print:hidden">
                    <div className="glass p-4 rounded-2xl border-white/10 flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-1 bg-brand-orange shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                        <span className="text-[10px] font-black text-white uppercase tracking-wider">Trayectoria Ant-Path</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6 print:hidden z-[1100] relative pointer-events-auto">
                {/* CALENDAR GRID */}
                <div className="glass p-6 rounded-[32px] border border-white/5">
                  <CalendarGrid selectedDate={selectedDate} onSelect={handleDateSelect} />
                </div>

                <div className="glass p-6 rounded-[32px] border border-white/5 space-y-6">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <Navigation className="text-brand-orange" size={18} />
                    <h3 className="font-black text-xs text-white uppercase tracking-[0.2em]">Telemetría</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-brand-dark-3 p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                          <Ruler size={14} />
                        </div>
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Distancia Total</span>
                      </div>
                      <p className="text-2xl font-black text-white">
                        {(routeData?.distance / 1000 || 0).toFixed(2)} <span className="text-xs text-neutral-500">KM</span>
                      </p>
                    </div>

                    <div className="bg-brand-dark-3 p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                          <Gauge size={14} />
                        </div>
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Velocidad Promedio</span>
                      </div>
                      <p className="text-2xl font-black text-white">
                        {(routeData?.avg_speed || 0).toFixed(1)} <span className="text-xs text-neutral-500">KM/H</span>
                      </p>
                    </div>

                    <div className="bg-brand-dark-3 p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                          <Activity size={14} />
                        </div>
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Puntos de Registro</span>
                      </div>
                      <p className="text-2xl font-black text-white">
                        {routeData?.points?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="glass-orange p-6 rounded-[32px] border border-brand-orange/10 flex flex-col items-center text-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-brand-orange flex items-center justify-center shadow-lg shadow-brand-orange/20">
                      <Info className="text-white" size={24} />
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-brand-orange uppercase tracking-widest mb-1">Nota de Actividad</p>
                     <p className="text-xs text-brand-orange/80 font-medium leading-relaxed">
                       Los datos mostrados corresponden exclusivamente al rango de 24 horas del día seleccionado.
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
        @media print {
          body * { visibility: hidden; }
          .print\:p-0, .print\:p-0 * { visibility: visible; }
          .print\:p-0 { position: absolute; left: 0; top: 0; width: 100vw; height: 100vh; }
          .print\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
