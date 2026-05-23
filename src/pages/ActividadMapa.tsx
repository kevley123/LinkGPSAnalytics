import { useState, useEffect, useCallback, memo, useRef } from 'react';
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
import { env } from '../config/env';

const API_BASE = env.API_BASE_URL;

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

// ── Custom DivIcons for Start/End Markers ─────────────────────────────────────
const createStartIcon = () => new L.DivIcon({
  className: '',
  html: `
    <div style="width:24px;height:24px;background:#22c55e;border:3px solid white;border-radius:50%;box-shadow:0 2px 5px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;color:white;font-size:9px;font-weight:900;">
      I
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

const createEndIcon = () => new L.DivIcon({
  className: '',
  html: `
    <div style="width:24px;height:24px;background:#ef4444;border:3px solid white;border-radius:50%;box-shadow:0 2px 5px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;color:white;font-size:9px;font-weight:900;">
      F
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
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
  const monthName = currentMonth.toLocaleString('es-BO', { month: 'long' });

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
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-[10px] font-black text-black uppercase tracking-[0.15em]">{monthName} {year}</h4>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="w-6 h-6 flex items-center justify-center hover:bg-black/5 rounded-lg text-neutral-500 hover:text-black transition-all"><ChevronLeft size={12} /></button>
          <button onClick={nextMonth} className="w-6 h-6 flex items-center justify-center hover:bg-black/5 rounded-lg text-neutral-500 hover:text-black transition-all"><ArrowRight size={12} /></button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(d => (
          <div key={d} className="text-[9px] font-black text-neutral-400 text-center py-1.5">{d}</div>
        ))}
        {Array.from({ length: startOffset }).map((_, i) => <div key={`empty-${i}`} />)}
        {days.map(d => {
          const active = isSelected(d);
          return (
            <button
              key={d}
              onClick={() => handleSelect(d)}
              className={`text-[10px] font-bold py-1.5 rounded-lg transition-all
                ${active 
                  ? 'bg-brand-orange text-white shadow-sm font-black' 
                  : 'text-neutral-700 hover:bg-black/5 hover:text-black'}`}
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

  const startIconRef = useRef(createStartIcon());
  const endIconRef = useRef(createEndIcon());

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
    <div className="text-black h-[calc(100vh-172px)] flex flex-col gap-4 overflow-hidden p-2 print:p-0">
      
      {/* Header Layout */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4 px-2 print:hidden shrink-0"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center border border-brand-orange/20">
            <History className="text-brand-orange" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-black tracking-tight leading-none">Actividad en mapa</h1>
            <p className="text-xs font-semibold text-black/40 mt-1.5">Análisis retrospectivo de rutas y telemetría</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           {step === 2 && (
             <button 
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-sm"
             >
               <Printer size={14} /> Imprimir
             </button>
           )}
           {vehSel && (
             <button
               onClick={() => { setStep(1); setVehSel(null); setRouteData(null); setSelectedDate(''); }}
               className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
             >
               <ChevronLeft size={14} />
               Cambiar vehículo
             </button>
           )}
        </div>
      </motion.div>

      {/* Main Content Layout */}
      <div className="flex-1 min-h-0 relative rounded-[32px] overflow-hidden border border-black/5 bg-[#f8f9fa] shadow-2xl flex flex-col">
        
        {/* Step 2 view: Map + Sidebar split */}
        <div className="w-full h-full flex flex-row gap-4 p-4 min-h-0">
          
          {/* Left panel: Map Area */}
          <div className="flex-1 h-full rounded-[24px] overflow-hidden border border-black/5 shadow-inner relative bg-[#f1f3f5]">
            {loadingRoute ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <Loader2 size={32} className="animate-spin text-brand-orange" />
                <p className="text-neutral-500 font-bold text-xs uppercase tracking-widest">Reconstruyendo trayectoria...</p>
              </div>
            ) : !selectedDate ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-center p-6 bg-white/50 backdrop-blur-sm">
                <div className="w-16 h-16 rounded-full bg-brand-orange/5 border border-brand-orange/15 flex items-center justify-center mb-1">
                   <Calendar size={24} className="text-brand-orange/60" />
                </div>
                <h3 className="text-sm font-black text-black tracking-tight leading-none">Consultar actividad</h3>
                <p className="text-neutral-500 text-xs max-w-xs font-medium mt-1">Por favor, selecciona una fecha en el panel lateral para visualizar el recorrido del vehículo.</p>
              </div>
            ) : polylinePoints.length > 0 ? (
              <MapContainer
                bounds={bounds || [[-16.48, -68.11], [-16.49, -68.12]]}
                style={{ width: '100%', height: '100%' }}
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
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
                    opacity: 0.85,
                    pulseColor: "#ffffff"
                  }}
                />

                {/* Custom Styled Markers */}
                <Marker position={polylinePoints[0]} icon={startIconRef.current}>
                  <Popup>
                    <div className="text-center font-bold text-black p-0.5">
                      <div className="text-xs font-black">Inicio de ruta</div>
                      <div className="text-[9px] text-neutral-500 mt-1 font-mono">{polylinePoints[0][0].toFixed(5)}, {polylinePoints[0][1].toFixed(5)}</div>
                    </div>
                  </Popup>
                </Marker>
                <Marker position={polylinePoints[polylinePoints.length - 1]} icon={endIconRef.current}>
                  <Popup>
                    <div className="text-center font-bold text-black p-0.5">
                      <div className="text-xs font-black">Fin de ruta</div>
                      <div className="text-[9px] text-neutral-500 mt-1 font-mono">{polylinePoints[polylinePoints.length - 1][0].toFixed(5)}, {polylinePoints[polylinePoints.length - 1][1].toFixed(5)}</div>
                    </div>
                  </Popup>
                </Marker>

              </MapContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-center p-6 bg-white/50 backdrop-blur-sm">
                <Activity size={40} className="text-neutral-300" />
                <h3 className="text-sm font-black text-black">Sin registros para el día {selectedDate}</h3>
                <p className="text-neutral-500 text-xs max-w-xs font-medium mt-1">No se encontraron coordenadas o telemetría para esta unidad en la fecha seleccionada.</p>
              </div>
            )}

            {/* Path Legend Overlay */}
            {polylinePoints.length > 0 && selectedDate && (
              <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2 print:hidden">
                <div className="bg-white border-4 border-black/5 p-3.5 rounded-2xl shadow-xl flex items-center gap-2">
                  <div className="w-6 h-1 bg-brand-orange rounded" style={{ boxShadow: '0 0 6px rgba(249,115,22,0.4)' }} />
                  <span className="text-[9px] font-black text-black uppercase tracking-wider">Recorrido activo</span>
                </div>
              </div>
            )}
          </div>

          {/* Right panel: Calendar & Telemetry Sidebar */}
          <div className="w-72 h-full flex flex-col gap-4 overflow-y-auto no-scrollbar shrink-0 print:hidden">
            {/* Calendar Selector Card */}
            <div className="bg-white p-4 rounded-[28px] border-4 border-black/5 shadow-sm">
              <CalendarGrid selectedDate={selectedDate} onSelect={handleDateSelect} />
            </div>

            {/* Telemetry Metrics Card */}
            <div className="bg-white p-4 rounded-[28px] border-4 border-black/5 shadow-sm flex-1 flex flex-col justify-between min-h-0">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 border-b border-black/5 pb-2.5">
                  <Navigation className="text-brand-orange" size={14} />
                  <h3 className="font-black text-[9px] text-black uppercase tracking-widest leading-none">Telemetría de la ruta</h3>
                </div>

                <div className="space-y-2">
                  <div className="bg-[#f8f9fa] p-3 rounded-2xl border border-black/5">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1 rounded bg-blue-500/10 text-blue-500">
                        <Ruler size={10} />
                      </div>
                      <span className="text-[9px] font-black text-black/40 uppercase tracking-wider leading-none">Distancia total</span>
                    </div>
                    <p className="text-lg font-black text-black leading-none mt-1">
                      {(routeData?.distance / 1000 || 0).toFixed(2)} <span className="text-xs text-neutral-500 font-bold">KM</span>
                    </p>
                  </div>

                  <div className="bg-[#f8f9fa] p-3 rounded-2xl border border-black/5">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1 rounded bg-orange-500/10 text-brand-orange">
                        <Gauge size={10} />
                      </div>
                      <span className="text-[9px] font-black text-black/40 uppercase tracking-wider leading-none">Velocidad promedio</span>
                    </div>
                    <p className="text-lg font-black text-black leading-none mt-1">
                      {(routeData?.avg_speed || 0).toFixed(1)} <span className="text-xs text-neutral-500 font-bold">KM/H</span>
                    </p>
                  </div>

                  <div className="bg-[#f8f9fa] p-3 rounded-2xl border border-black/5">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1 rounded bg-purple-500/10 text-purple-500">
                        <Activity size={10} />
                      </div>
                      <span className="text-[9px] font-black text-black/40 uppercase tracking-wider leading-none">Puntos registrados</span>
                    </div>
                    <p className="text-lg font-black text-black leading-none mt-1">
                      {routeData?.points?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* IA Details Badge info */}
              <div className="bg-brand-orange/5 p-3 rounded-2xl border border-brand-orange/15 flex items-start gap-2.5 mt-2 shrink-0">
                 <Info className="text-brand-orange shrink-0 mt-0.5" size={14} />
                 <div>
                   <p className="text-[8px] font-black text-brand-orange uppercase tracking-wider leading-none">Nota de analítica</p>
                   <p className="text-[9px] text-neutral-500 font-semibold leading-relaxed mt-1">
                     Datos retrospectivos correspondientes a un ciclo diario.
                   </p>
                 </div>
              </div>
            </div>

          </div>

        </div>

        {/* STEP 1: Modal emergente (Vehicle Selection Dialog overlay) */}
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
                    <Info className="text-brand-orange" size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-black leading-none">Seleccionar vehículo</h3>
                    <p className="text-neutral-500 text-xs font-semibold mt-1 leading-relaxed">
                      Para visualizar el historial de actividad y reconstruir la trayectoria del recorrido de un vehículo, por favor seleccione la unidad de su flota que desea consultar.
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
                        loading={loadingRoute && vehSel?.id === v.id}
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

      <AnimatePresence>
        {errorModal && (
          <ModalNoService 
            message={errorModal} 
            onClose={() => setErrorModal(null)} 
            onSolicitar={() => {
              setErrorModal(null);
              window.location.href = `${env.FRONTEND_URL}/pricing`;
            }}
          />
        )}
      </AnimatePresence>

      <style>{`
        .leaflet-popup-content-wrapper {
          background: white !important;
          border-radius: 16px !important;
          padding: 4px !important;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1) !important;
          border: 1px solid rgba(0,0,0,0.05);
        }
        .leaflet-popup-tip {
          background: white !important;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1) !important;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
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
