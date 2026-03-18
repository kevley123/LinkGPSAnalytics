import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    Car, MapPin, RefreshCw, Loader2, X,
    ChevronLeft, AlertCircle, Satellite,
    Signal, ArrowRight
} from 'lucide-react';
import {
    MapContainer, TileLayer, Marker, Popup,
    LayersControl, Circle, useMap
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://11tkrk1f2zwo.share.zrok.io';

// ── Custom SVG Icon for the marker (Deep Tech Orange) ──────────────────────────
const createVehicleIcon = (color = '#F97316') => new L.DivIcon({
    className: '',
    html: `
    <div style="position:relative;width:42px;height:52px;filter:drop-shadow(0 4px 6px rgba(0,0,0,0.5))">
      <svg viewBox="0 0 42 52" fill="none" xmlns="http://www.w3.org/2000/svg" width="42" height="52">
        <ellipse cx="21" cy="49" rx="8" ry="3" fill="rgba(0,0,0,0.3)"/>
        <path d="M21 2C12.163 2 5 9.163 5 18c0 10.5 16 32 16 32S37 28.5 37 18C37 9.163 29.837 2 21 2z"
          fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="21" cy="18" r="7" fill="black" fill-opacity="0.8"/>
        <g transform="translate(15,12)">
           <path d="M5 1L5 5L1 5a1 1 0 0 0 0 2L5 7L5 11a1 1 0 0 0 2 0L7 7L11 7a1 1 0 0 0 0-2L7 5L7 1a1 1 0 0 0-2 0z" fill="white"/>
        </g>
      </svg>
      <div class="animate-ping" style="position:absolute;top:6px;left:50%;transform:translateX(-50%);width:10px;height:10px;border-radius:50%;background:white;opacity:0.6"></div>
    </div>
  `,
    iconSize: [42, 52],
    iconAnchor: [21, 50],
    popupAnchor: [0, -52],
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
    return new Date(date).toLocaleString('es-ES', {
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

// ── Map Info Panel ───────────────────────────────────────────────────────────
const InfoPanel = memo(({ veh, location, onRefresh, loading }: any) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass p-5 rounded-3xl border border-white/10 space-y-4 shadow-2xl"
    >
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-orange/20 flex items-center justify-center border border-brand-orange/30">
                <Signal className="text-brand-orange animate-pulse" size={18} />
            </div>
            <div className="flex-1">
                <p className="text-[10px] text-neutral-500 uppercase font-black tracking-widest">Estado de Unidad</p>
                <p className="text-base font-bold text-white">{veh?.modelo} <span className="text-brand-orange ml-1 text-sm">[{veh?.placa}]</span></p>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
            {[
                { label: 'Latitud', val: location?.latitud ? parseFloat(location.latitud).toFixed(6) : '—' },
                { label: 'Longitud', val: location?.longitud ? parseFloat(location.longitud).toFixed(6) : '—' },
            ].map(({ label, val }) => (
                <div key={label} className="bg-brand-dark-2 rounded-2xl px-4 py-3 border border-white/5">
                    <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-sm font-mono font-bold text-white">{val}</p>
                </div>
            ))}
        </div>

        <div className="pt-3 border-t border-white/5 flex items-center justify-between">
            <div className="flex flex-col">
                <span className="text-[9px] text-neutral-500 uppercase font-bold">Último contacto</span>
                <span className="text-xs text-white/80 font-medium">{fmtFullDate(location?.fecha)}</span>
            </div>
            <button
                onClick={onRefresh}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-brand-orange/10 text-brand-orange text-xs font-black uppercase tracking-widest hover:bg-brand-orange/20 transition-all flex items-center gap-2"
            >
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                Sync
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

export default function MapaVivo() {
    const { authToken } = useAppContext();
    // const navigate = useNavigate();

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
                const res = await fetch(`${API_BASE}/analytics/mis_vehiculos`, {
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
            const res = await fetch(`${API_BASE}/analytics/mi_ubicacion/${vehId}`, {
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
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-end justify-between gap-4"
            >
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-brand-orange/10 flex items-center justify-center border border-brand-orange/20">
                            <MapPin className="text-brand-orange" size={20} />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Mapa en vivo</h1>
                    </div>
                    <p className="text-neutral-500 text-sm font-medium">Seguimiento geoespacial de flotas con analíticas integradas.</p>
                </div>

                <div className="flex items-center gap-1 bg-brand-dark-3 p-1.5 rounded-2xl border border-white/5">
                    {[1, 2].map((s) => (
                        <div key={s} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${step === s ? 'bg-brand-orange text-white' : 'text-neutral-600'
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
                        ) : vehicles.length === 0 ? (
                            <div className="col-span-full py-20 text-center glass rounded-[40px] border-white/5">
                                <Car className="mx-auto text-neutral-800 mb-4" size={60} />
                                <h3 className="text-xl font-bold text-white mb-2">Sin Unidades Disponibles</h3>
                                <p className="text-neutral-500 text-sm">No hemos detectado vehículos vinculados a tu cuenta de Analytics.</p>
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
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col gap-4"
                    >
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => { setStep(1); setVehSel(null); setLocation(null); }}
                                className="flex items-center gap-2 text-neutral-500 hover:text-white font-black text-[10px] uppercase tracking-[0.2em] transition-colors"
                            >
                                <ChevronLeft size={16} /> Volver a selección
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="flex -space-x-2">
                                    {vehicles.slice(0, 3).map(v => (
                                        <button
                                            key={v.id}
                                            onClick={() => onSelectVehicle(v)}
                                            className={`w-8 h-8 rounded-full border-2 border-brand-dark flex items-center justify-center transition-transform hover:scale-110 ${vehSel?.id === v.id ? 'bg-brand-orange text-white' : 'bg-brand-dark-3 text-neutral-500'
                                                }`}
                                        >
                                            <Car size={12} />
                                        </button>
                                    ))}
                                </div>
                                {vehicles.length > 3 && <span className="text-[10px] text-neutral-600 font-bold">+{vehicles.length - 3}</span>}
                            </div>
                        </div>

                        <div className="relative rounded-[40px] overflow-hidden border border-white/10 shadow-2xl h-[600px] bg-brand-dark-2">
                            {hasCoords ? (
                                <MapContainer
                                    center={[lat, lng]}
                                    zoom={16}
                                    style={{ width: '100%', height: '100%' }}
                                    zoomControl={false}
                                >
                                    <TileLayer
                                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                    />

                                    <LayersControl position="topright">
                                        <LayersControl.BaseLayer checked name="Deep Dark">
                                            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                                        </LayersControl.BaseLayer>
                                        <LayersControl.BaseLayer name="High Quality Satellite">
                                            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                                        </LayersControl.BaseLayer>
                                    </LayersControl>

                                    <ViewUpdater lat={lat} lng={lng} />

                                    <Circle
                                        center={[lat, lng]}
                                        radius={100}
                                        pathOptions={{ color: '#F97316', fillColor: '#F97316', fillOpacity: 0.1, weight: 1 }}
                                    />

                                    <Marker position={[lat, lng]} icon={iconRef.current}>
                                        <Popup>
                                            <div className="text-center font-bold text-brand-dark">
                                                {vehSel?.modelo}<br />
                                                <span className="text-xs text-brand-orange">{vehSel?.placa}</span>
                                            </div>
                                        </Popup>
                                    </Marker>
                                </MapContainer>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                                    <Loader2 size={40} className="animate-spin text-brand-orange" />
                                    <p className="text-neutral-500 font-black text-xs uppercase tracking-widest">Calculando Vectores de Posición...</p>
                                </div>
                            )}

                            {/* Float UI */}
                            <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-2">
                                <div className="bg-brand-orange text-white text-[10px] font-black px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                    LIVE STREAMING
                                </div>
                            </div>

                            {hasCoords && (
                                <div className="absolute bottom-6 left-6 z-[1000] w-full max-w-xs">
                                    <InfoPanel
                                        veh={vehSel}
                                        location={location}
                                        loading={loadingLoc}
                                        onRefresh={() => fetchLocation(vehSel.id)}
                                    />
                                </div>
                            )}
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
                            // Simplified URL as per user instruction "luego yo lo configuro"
                            window.location.href = 'https://link-gps-frontend.vercel.app/pricing';
                        }}
                    />
                )}
            </AnimatePresence>

            <style>{`
        .leaflet-container { background: #0a0a0a !important; }
        .leaflet-popup-content-wrapper { background: white; border-radius: 12px; font-family: inherit; }
        .leaflet-popup-tip { background: white; }
        .leaflet-control-layers { background: #121212 !important; border: 1px solid rgba(255,255,255,0.1) !important; color: white !important; border-radius: 12px !important; }
        .leaflet-control-layers-list { padding: 8px; }
      `}</style>
        </div>
    );
}
