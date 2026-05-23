import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    Car, MapPin, RefreshCw, Loader2, X,
    ChevronLeft, AlertCircle, Satellite,
    Signal, ArrowRight, Info
} from 'lucide-react';
import {
    MapContainer, TileLayer, Marker, Popup,
    Circle, useMap
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { env } from '../config/env';

const API_BASE = env.API_BASE_URL;

// ── Custom SVG Icon for the marker (Circular White Badge with Orange Border) ──────────────────
const createVehicleIcon = (color = '#F97316') => new L.DivIcon({
    className: '',
    html: `
    <div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.15))">
      <div class="animate-ping" style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:0.2"></div>
      <div style="position:absolute;width:32px;height:32px;border-radius:50%;background:white;border:3px solid ${color};display:flex;align-items:center;justify-content:center;box-shadow:0 2px 5px rgba(0,0,0,0.1)">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1 .4-1 1v7c0 .6.4 1 1 1h1" />
          <circle cx="7" cy="17" r="2" />
          <path d="M9 17h6" />
          <circle cx="17" cy="17" r="2" />
        </svg>
      </div>
    </div>
  `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
});

// ── Update View component ─────────────────────────────────────────────────────
const ViewUpdater = ({ lat, lng }: { lat: number; lng: number }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.flyTo([lat, lng], 16, { duration: 1.5 });
        }
    }, [lat, lng, map]);
    return null;
};

const fmtFullDate = (date: string | null) => {
    if (!date) return '—';
    return new Date(date).toLocaleString('es-BO', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
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

// ── Map Info Panel ───────────────────────────────────────────────────────────
const InfoPanel = memo(({ veh, location, onRefresh, loading }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-4 border-black/5 p-4 rounded-[28px] space-y-3 shadow-2xl"
    >
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-orange/10 flex items-center justify-center border border-brand-orange/20">
                <Signal className="text-brand-orange animate-pulse" size={14} />
            </div>
            <div className="flex-1">
                <p className="text-[8px] text-black/40 uppercase font-black tracking-widest leading-none">Sistema en vivo</p>
                <p className="text-xs font-black text-black uppercase tracking-tight leading-none mt-1">{veh?.modelo}</p>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
            {[
                { label: 'Latitud', val: location?.latitud ? parseFloat(location.latitud).toFixed(5) : '—' },
                { label: 'Longitud', val: location?.longitud ? parseFloat(location.longitud).toFixed(5) : '—' },
            ].map(({ label, val }) => (
                <div key={label} className="bg-[#f8f9fa] rounded-xl px-3 py-1.5 border border-black/5">
                    <p className="text-[8px] font-black text-black/40 uppercase tracking-widest mb-0.5">{label}</p>
                    <p className="text-[10px] font-mono font-bold text-black">{val}</p>
                </div>
            ))}
        </div>

        <div className="pt-2 border-t border-black/5 flex items-center justify-between gap-4">
            <div className="flex flex-col">
                <span className="text-[8px] text-black/40 uppercase font-black tracking-tighter">Último contacto</span>
                <span className="text-[9px] text-black/60 font-semibold">{fmtFullDate(location?.fecha)}</span>
            </div>
            <button
                onClick={onRefresh}
                disabled={loading}
                className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center hover:bg-neutral-800 transition-all shadow-lg active:scale-95"
            >
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            </button>
        </div>
    </motion.div>
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

export default function MapaVivo() {
    const { authToken } = useAppContext();

    const [step, setStep] = useState(1);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [vehSel, setVehSel] = useState<any>(null);
    const [location, setLocation] = useState<any>(null);
    const [loadingVeh, setLoadingVeh] = useState(true);
    const [loadingLoc, setLoadingLoc] = useState(false);
    const [errorModal, setErrorModal] = useState<string | null>(null);

    const iconRef = useRef(createVehicleIcon());

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

    const fetchLocation = useCallback(async (vehId: number) => {
        if (!authToken || !vehId) return;
        setLoadingLoc(true);
        try {
            const res = await fetch(`${API_BASE}/api/analytics/mi_ubicacion/${vehId}`, {
                headers: { 'Authorization': `Bearer ${authToken}`, 'Accept': 'application/json' },
            });

            if (res.status === 403) {
                setErrorModal('No tienes permiso para usar Analytics o no tienes un servicio activo.');
                return;
            }
            if (!res.ok) throw new Error(`Error ${res.status}`);

            const data = await res.json();
            setLocation(data);
            setStep(2);
        } catch (e) {
            console.error('Fetch location error:', e);
        } finally {
            setLoadingLoc(false);
        }
    }, [authToken]);

    const onSelectVehicle = useCallback((veh: any) => {
        setVehSel(veh);
        fetchLocation(veh.id);
    }, [fetchLocation]);

    const lat = location?.latitud ? parseFloat(location.latitud) : null;
    const lng = location?.longitud ? parseFloat(location.longitud) : null;
    const hasCoords = lat !== null && lng !== null;

    return (
        <div className="text-black h-[calc(100vh-172px)] flex flex-col gap-4 overflow-hidden p-2">
            
            {/* Header Layout */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-4 px-2 shrink-0"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center border border-brand-orange/20">
                        <MapPin className="text-brand-orange" size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-black tracking-tight leading-none">Mapa en vivo</h1>
                        <p className="text-xs font-semibold text-black/40 mt-1.5">Seguimiento geoespacial de flotas en tiempo real</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {vehSel && (
                        <button
                            onClick={() => { setStep(1); setVehSel(null); setLocation(null); }}
                            className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
                        >
                            <ChevronLeft size={14} />
                            Cambiar vehículo
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Main Interactive Map / Selection Panel */}
            <div className="flex-1 min-h-0 relative rounded-[32px] overflow-hidden border border-black/5 bg-[#f8f9fa] shadow-2xl flex flex-col">
                
                {/* Always Render Map (renders placeholder or maps once coords loaded) */}
                <div className="w-full h-full relative flex-1">
                    {hasCoords ? (
                        <MapContainer
                            center={[lat, lng]}
                            zoom={16}
                            style={{ width: '100%', height: '100%' }}
                            zoomControl={false}
                            className="map-main-instance"
                        >
                            {/* Standard Colored OSM Street Tile Layer */}
                            <TileLayer 
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; OpenStreetMap contributors'
                            />

                            <ViewUpdater lat={lat} lng={lng} />

                            <Circle
                                center={[lat, lng]}
                                radius={80}
                                pathOptions={{ color: '#F97316', fillColor: '#F97316', fillOpacity: 0.1, weight: 1.5 }}
                            />

                            <Marker position={[lat, lng]} icon={iconRef.current}>
                                <Popup>
                                    <div className="text-center font-bold text-black p-1">
                                        <div className="text-sm font-black border-b border-black/5 pb-1 mb-1">{vehSel?.modelo}</div>
                                        <div className="text-[10px] text-brand-orange font-black uppercase tracking-widest">{vehSel?.placa}</div>
                                        <div className="mt-2 pt-2 border-t border-black/5 flex flex-col gap-0.5">
                                            <div className="text-[9px] font-mono text-neutral-500">Latitud: {lat.toFixed(6)}</div>
                                            <div className="text-[9px] font-mono text-neutral-500">Longitud: {lng.toFixed(6)}</div>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        </MapContainer>
                    ) : (
                        // Map placeholder background when no vehicle is active
                        <div className="w-full h-full bg-[#f1f3f5] flex items-center justify-center relative">
                            <div className="absolute inset-0 opacity-10" style={{
                                backgroundImage: `radial-gradient(circle, #000 10%, transparent 11%), radial-gradient(circle, #000 10%, transparent 11%)`,
                                backgroundSize: '20px 20px',
                                backgroundPosition: '0 0, 10px 10px'
                            }} />
                            <div className="flex flex-col items-center gap-2 text-center z-10 px-4">
                                <MapPin size={42} className="text-black/15 animate-bounce" />
                                <p className="text-xs font-bold text-black/30 uppercase tracking-wider">Esperando conexión satelital...</p>
                            </div>
                        </div>
                    )}

                    {/* Live Info Panel Overlay (Only in Step 2) */}
                    {hasCoords && step === 2 && (
                        <div className="absolute bottom-4 left-4 z-[1000] w-64 max-w-[90%]">
                            <InfoPanel
                                veh={vehSel}
                                location={location}
                                loading={loadingLoc}
                                onRefresh={() => fetchLocation(vehSel.id)}
                            />
                        </div>
                    )}

                    {/* Live Status Badge Overlay (Only in Step 2) */}
                    {hasCoords && step === 2 && (
                        <div className="absolute top-4 right-4 z-[1000]">
                            <div className="bg-white border border-black/5 text-black text-[9px] font-black px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
                                En vivo
                            </div>
                        </div>
                    )}
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
                                            Para comenzar con el rastreo satelital en tiempo real, por favor seleccione el vehículo de su flota que desea monitorear. Esto nos permitirá establecer una conexión telemétrica directa con la unidad.
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
                                                loading={loadingLoc && vehSel?.id === v.id}
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

            {/* Inactive analysis service modal */}
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
