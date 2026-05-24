import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, AlertCircle, ShieldCheck, 
  Loader2, CheckCircle, 
  ChevronLeft, Satellite, X, ArrowRight,
  History, MapPin, ShieldAlert, Cpu
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppContext } from '../context/AppContext';
import { env } from '../config/env';

const API_BASE = env.API_BASE_URL;

interface Toast {
  id: string;
  message: string;
}

// ── Custom DivIcon for Event Location Marker ──────────────────────────────────
const createEventIcon = (color = '#F97316') => new L.DivIcon({
  className: '',
  html: `
    <div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.15))">
      <div class="animate-ping" style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:0.25"></div>
      <div style="position:absolute;width:30px;height:30px;border-radius:50%;background:white;border:3px solid ${color};display:flex;align-items:center;justify-content:center;box-shadow:0 2px 5px rgba(0,0,0,0.1)">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

// ── Map View updater ──────────────────────────────────────────────────────────
const ViewUpdater = ({ lat, lng }: { lat: number | null; lng: number | null }) => {
  const map = useMap();
  useEffect(() => {
    if (lat !== null && lng !== null) {
      map.flyTo([lat, lng], 15, { duration: 1.2 });
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

export default function MiDispositivoEventos() {
  const { authToken } = useAppContext();
  
  const [step, setStep] = useState(1);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [vehSel, setVehSel] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  
  const [loadingVeh, setLoadingVeh] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [toast, setToast] = useState<Toast | null>(null);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  const mapMarkerIcon = useRef(createEventIcon());

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

  // Fetch events for selected vehicle
  const fetchVehicleEvents = useCallback(async (vehId: number) => {
    if (!authToken || !vehId) return;
    setLoadingEvents(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/analytics/eventos_dispositivo/${vehId}`, {
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
      
      const data = await res.json();
      
      // Parse events list (can be object with string keys or array)
      let parsedEvents: any[] = [];
      if (data.events) {
        if (Array.isArray(data.events)) {
          parsedEvents = data.events;
        } else if (typeof data.events === 'object') {
          parsedEvents = Object.values(data.events);
        }
      }
      
      // Sort events by date descending
      parsedEvents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setEvents(parsedEvents);
      
      // Select the first event by default to center the map
      if (parsedEvents.length > 0) {
        setSelectedEvent(parsedEvents[0]);
      } else {
        setSelectedEvent(null);
      }
      
      setStep(2);
    } catch (err: any) {
      console.error("Error fetching device events:", err);
      setError("No se pudieron cargar los eventos de dispositivo para este vehículo.");
      setToast({
        id: 'err-fetch',
        message: 'Error al conectar con el servidor telemétrico.'
      });
    } finally {
      setLoadingEvents(false);
    }
  }, [authToken]);

  const onSelectVehicle = useCallback((veh: any) => {
    setVehSel(veh);
    fetchVehicleEvents(veh.id);
  }, [fetchVehicleEvents]);

  // Toast automatic timer
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fmtDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('es-BO', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return '—';
    }
  };

  const cleanMessage = (msg: string) => {
    if (!msg) return '';
    return msg.replace(/Veh\?\?culo/g, 'Vehículo').replace(/veh\?\?culo/g, 'vehículo');
  };

  // Coords extraction helpers
  const getEventCoords = (evt: any) => {
    const lat = evt?.metadata?.last_location?.lat ?? evt?.metadata?.lat;
    const lon = evt?.metadata?.last_location?.lon ?? evt?.metadata?.lon;
    if (lat !== undefined && lon !== undefined) {
      return { lat: parseFloat(lat), lon: parseFloat(lon) };
    }
    return null;
  };

  const activeCoords = selectedEvent ? getEventCoords(selectedEvent) : null;

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
            <History className="text-brand-orange" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-black tracking-tight leading-none">Eventos de dispositivo</h1>
            <p className="text-xs font-semibold text-black/40 mt-1.5 flex items-center gap-1.5">
              {vehSel ? (
                <>
                  Historial de telemetría y bloqueos para <span className="text-brand-orange font-bold uppercase">{vehSel.modelo} ({vehSel.placa})</span>
                </>
              ) : (
                'Historial completo de comandos, modos de bloqueo y eventos de hardware'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {vehSel && (
            <button
              onClick={() => { setStep(1); setVehSel(null); setEvents([]); setSelectedEvent(null); }}
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
        
        {/* Step 2 view: Grid split (Cards list + Map) */}
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
                onClick={() => fetchVehicleEvents(vehSel.id)}
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
                <Cpu size={42} className="text-black/15 animate-bounce" />
                <p className="text-xs font-bold text-black/30 uppercase tracking-wider">Esperando selección de vehículo...</p>
              </div>
            </div>
          ) : loadingEvents ? (
            <div className="w-full h-full bg-[#f8f9fa] border border-black/5 rounded-[24px] flex flex-col items-center justify-center gap-3 shadow-inner">
              <Loader2 className="text-brand-orange animate-spin" size={32} />
              <p className="text-xs font-bold text-black/30 uppercase tracking-widest">Cargando eventos telemétricos...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="w-full h-full bg-white border border-black/5 rounded-[24px] flex flex-col items-center justify-center gap-4 p-8 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-brand-orange/5 border border-brand-orange/10 flex items-center justify-center">
                <ShieldCheck className="text-brand-orange" size={28} />
              </div>
              <div className="text-center max-w-sm">
                <h3 className="text-sm font-black text-black">Sin eventos registrados</h3>
                <p className="text-neutral-500 text-xs mt-1 leading-relaxed">
                  No se encontraron eventos o registros de comandos de bloqueo recientes en el dispositivo de esta unidad.
                </p>
              </div>
            </div>
          ) : (
            /* Split layout step 2 */
            <>
              {/* Left Column: Big Event Cards List */}
              <div className="flex-1 h-full flex flex-col gap-3 overflow-y-auto pr-1 no-scrollbar">
                {events.map((evt) => {
                  const isSelected = selectedEvent?.id === evt.id;
                  const isLock = evt.event_type === 'bloqueo';
                  const newMode = evt.metadata?.new_mode;
                  const oldMode = evt.metadata?.old_mode;
                  const coords = getEventCoords(evt);

                  // Highlight Mode changes: new mode 0 is typically red (locked), mode 1 or others is green (unlocked/custom)
                  const isRedAlert = newMode === 0;

                  return (
                    <button
                      key={evt.id}
                      onClick={() => setSelectedEvent(evt)}
                      className={`text-left bg-white border-4 p-4 rounded-[28px] shadow-sm flex flex-col gap-3 transition-all hover:border-black/10 shrink-0 ${
                        isSelected ? 'border-brand-orange' : 'border-black/5'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 w-full">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${
                            isLock 
                              ? 'bg-brand-orange/10 border-brand-orange/20 text-brand-orange' 
                              : 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                          }`}>
                            {isLock ? <ShieldAlert size={14} /> : <Cpu size={14} />}
                          </div>
                          <div>
                            <span className="text-[8px] font-black uppercase tracking-widest text-neutral-400 block leading-none">Tipo de evento</span>
                            <span className="text-xs font-black text-black mt-0.5 block leading-none uppercase">{evt.event_type}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {newMode !== undefined && (
                            <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                              isRedAlert ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                            }`}>
                              Modo {newMode}
                            </span>
                          )}
                          <span className="text-[9px] text-neutral-500 font-bold">
                            {fmtDate(evt.created_at)}
                          </span>
                        </div>
                      </div>

                      {/* Event description message */}
                      <p className="text-xs text-neutral-700 font-semibold leading-relaxed">
                        {cleanMessage(evt.metadata?.message || evt.metadata?.mensaje || '')}
                      </p>

                      {/* Transition telemetry block (Highlighted red and green) */}
                      {oldMode !== undefined && newMode !== undefined && (
                        <div className="flex items-center gap-3 bg-[#f8f9fa] border border-black/5 p-2 rounded-xl text-[10px] font-bold">
                          <span className="text-neutral-400">Transición de modo:</span>
                          <span className="text-red-500 bg-red-50 px-1.5 py-0.5 rounded">Modo {oldMode}</span>
                          <span className="text-neutral-400">→</span>
                          <span className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Modo {newMode}</span>
                        </div>
                      )}

                      {/* Coordinates trigger indicator */}
                      {coords && (
                        <div className="flex items-center justify-between text-[8.5px] font-semibold text-neutral-400 pt-1.5 border-t border-black/5 w-full">
                          <span className="flex items-center gap-1">
                            <MapPin size={10} className="text-neutral-400" />
                            Lat: {coords.lat.toFixed(5)}, Lon: {coords.lon.toFixed(5)}
                          </span>
                          <span className="text-brand-orange uppercase tracking-wider font-black text-[7.5px]">
                            Hacer clic para centrar mapa
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Live Event Leaflet Map (Fixed width) */}
              <div className="w-[420px] lg:w-[480px] h-full rounded-[24px] overflow-hidden border border-black/5 shadow-2xl relative shrink-0 bg-[#f1f3f5]">
                {activeCoords ? (
                  <MapContainer
                    center={[activeCoords.lat, activeCoords.lon]}
                    zoom={15}
                    style={{ width: '100%', height: '100%' }}
                    zoomControl={false}
                  >
                    <TileLayer 
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; OpenStreetMap contributors'
                    />

                    <ViewUpdater lat={activeCoords.lat} lng={activeCoords.lon} />

                    <Marker position={[activeCoords.lat, activeCoords.lon]} icon={mapMarkerIcon.current}>
                      <Popup>
                        <div className="text-center font-bold text-black p-0.5">
                          <div className="text-xs font-black uppercase text-brand-orange tracking-wider leading-none">
                            {selectedEvent?.event_type}
                          </div>
                          <div className="text-[10px] text-neutral-700 leading-normal mt-1 max-w-[180px]">
                            {cleanMessage(selectedEvent?.metadata?.message || selectedEvent?.metadata?.mensaje || '')}
                          </div>
                          <div className="text-[8px] text-neutral-400 font-mono mt-1.5">
                            {selectedEvent?.metadata?.last_location?.recorded_at 
                              ? fmtDate(selectedEvent.metadata.last_location.recorded_at) 
                              : fmtDate(selectedEvent?.created_at)}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-center p-6 bg-white/40">
                    <MapPin size={32} className="text-neutral-300 animate-pulse" />
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none">Ubicación no disponible</p>
                    <p className="text-neutral-500 text-[10px] max-w-xs mt-0.5">Este evento telemétrico no contiene coordenadas geoespaciales válidas.</p>
                  </div>
                )}

                {/* Event Details Badge */}
                {selectedEvent && (
                  <div className="absolute top-4 left-4 z-[1000] max-w-[85%] pointer-events-none">
                    <div className="bg-white/95 backdrop-blur-md border border-black/5 p-3 rounded-xl shadow-xl flex items-start gap-2.5">
                      <div className="p-1 bg-brand-orange/10 text-brand-orange rounded border border-brand-orange/15 shrink-0 mt-0.5">
                        <MapPin size={12} />
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-black/40 uppercase tracking-wider leading-none">Geolocalización del evento</p>
                        <p className="text-[10px] font-black text-black uppercase mt-1 leading-none">
                          {selectedEvent?.event_type} - ID: #{selectedEvent?.id}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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
                    <Cpu className="text-brand-orange" size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-black leading-none">Seleccionar vehículo</h3>
                    <p className="text-neutral-500 text-xs font-semibold mt-1 leading-relaxed">
                      Para consultar el log de eventos de hardware y modo de bloqueo de un dispositivo, por favor seleccione la unidad de su flota que desea monitorear.
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
                        loading={loadingEvents && vehSel?.id === v.id}
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
      `}</style>
    </div>
  );
}
