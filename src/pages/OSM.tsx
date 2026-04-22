import { useState, useCallback } from 'react';
import {
    Navigation,
    Map as MapIcon,
    Globe,
    Compass
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { env } from '../config/env';
// --- Tactical Marker Icon ---
const customIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', 
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

// --- Click Handler Component ---
const MapClickHandler = ({ onClick }: { onClick: (e: L.LeafletMouseEvent) => void }) => {
    useMapEvents({
        click: onClick,
    });
    return null;
};

export default function OSM() {
    const [position, setPosition] = useState<L.LatLng | null>(null);
    const [locationData, setLocationData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleMapClick = useCallback(async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setPosition(e.latlng);
        setLoading(true);

        try {
            const response = await fetch(env.OSM_REVERSE_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    latitude: lat,
                    longitude: lng,
                    zoom: 18
                })
            });

            if (!response.ok) throw new Error('API Error');
            const data = await response.json();
            setLocationData(data);
        } catch (err) {
            console.error('Reverse Geocode Error:', err);
            setLocationData({
                direccion_completa: "Error al conectar con la API de OSM local",
                ciudad: "N/A",
                pais: "N/A",
                raw_data: { lat, lon: lng }
            });
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <div className="relative h-[calc(100vh-100px)] w-full overflow-hidden rounded-[40px] border border-white/5 bg-[#0a0a0a] shadow-3xl flex flex-col">

            {/* --- Tactical Background Map (Deep Tactical - High Detail) --- */}
            <div className="absolute inset-0 z-0 tactical-map-container">
                <MapContainer
                    center={[-16.5, -68.15]}
                    zoom={13}
                    style={{ height: '100%', width: '100%', background: '#080808' }}
                    zoomControl={false}
                >
                    <LayersControl position="topright">
                        <LayersControl.BaseLayer checked name="Visión Nocturna">
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                            />
                        </LayersControl.BaseLayer>
                        <LayersControl.BaseLayer name="Satélite Real">
                            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                        </LayersControl.BaseLayer>
                    </LayersControl>

                    <MapClickHandler onClick={handleMapClick} />

                    {position && (
                        <Marker position={position} icon={customIcon} />
                    )}
                </MapContainer>
                
                {/* Subtle Vignette Overlay */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-black/40 via-transparent to-black/20" />
            </div>

            {/* --- Premium Floating Header (Dark Crystal) --- */}
            <div className="absolute top-8 left-8 z-20">
                <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-black/70 backdrop-blur-2xl border border-white/10 px-6 py-4 rounded-[24px] shadow-3xl flex items-center gap-4"
                >
                    <div className="w-12 h-12 rounded-2xl bg-brand-orange/20 flex items-center justify-center border border-brand-orange/30 shadow-lg shadow-brand-orange/10">
                        <MapIcon className="text-brand-orange" size={24} />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-black text-white tracking-tight uppercase leading-none">Prueba de ubicación</h1>
                        <p className="text-[10px] font-black text-brand-orange/60 uppercase tracking-[0.4em] mt-1.5 ml-0.5">Módulo de Geolocalización Inversa</p>
                    </div>
                </motion.div>
            </div>

            {/* --- Results Overlay (Premium Dark Crystal - Vertical Right) --- */}
            <AnimatePresence mode="wait">
                {locationData && (
                    <motion.div
                        key={locationData.raw_data?.place_id || 'result'}
                        initial={{ scale: 0.95, opacity: 0, x: 40 }}
                        animate={{ scale: 1, opacity: 1, x: 0 }}
                        exit={{ scale: 0.95, opacity: 0, x: 40 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="absolute right-8 bottom-8 w-[320px] z-20 pointer-events-auto"
                    >
                        <div className="bg-black/80 backdrop-blur-3xl border border-white/10 rounded-[32px] p-7 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] flex flex-col gap-5 relative overflow-hidden group min-h-[480px]">
                            
                            {/* Dark Gloss Effect */}
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />

                            {/* Header: Refined Location */}
                            <div className="space-y-1.5 relative z-10">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 text-brand-orange">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Data Source: OSM</span>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-white leading-tight tracking-tight drop-shadow-2xl">
                                    {locationData.raw_data?.address?.road || "Vía Detectada"}
                                </h3>
                                <div className="flex items-center gap-2 py-1">
                                    <div className="bg-brand-orange/10 px-2.5 py-0.5 rounded-md border border-brand-orange/20 text-[9px] font-black text-brand-orange uppercase">
                                        VERIFICADO
                                    </div>
                                    <p className="text-[11px] font-bold text-neutral-400 truncate">
                                        {locationData.raw_data?.address?.suburb || locationData.raw_data?.address?.district || "Zona Urbana"}
                                    </p>
                                </div>
                            </div>

                            {/* Tactical Matrix (Vertical Orientation) */}
                            <div className="flex flex-col gap-3 relative z-10">
                                <div className="bg-white/5 rounded-[20px] p-4 border border-white/5 flex flex-col gap-1 transition-colors hover:bg-white/10">
                                    <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                        <Globe size={10} className="text-brand-orange" /> Ciudad / Región
                                    </span>
                                    <p className="text-sm font-black text-white drop-shadow-sm">{locationData.ciudad || "La Paz"}</p>
                                </div>
                                <div className="bg-white/5 rounded-[20px] p-4 border border-white/5 flex flex-col gap-1 transition-colors hover:bg-white/10">
                                    <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                        <Compass size={10} className="text-brand-orange" /> Territorio
                                    </span>
                                    <p className="text-sm font-black text-white drop-shadow-sm">{locationData.pais || "Bolivia"}</p>
                                </div>
                            </div>

                            {/* Technical Details (Taller) */}
                            <div className="bg-black/40 rounded-2xl p-5 border border-white/5 relative z-10 flex-grow flex flex-col gap-3">
                                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                    <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest italic">Mapeo Inverso</span>
                                    <Navigation size={10} className="text-neutral-500" />
                                </div>
                                <p className="text-[11px] text-neutral-400 font-medium leading-relaxed italic">
                                    {locationData.direccion_completa}
                                </p>
                                <div className="mt-auto pt-4 flex items-center gap-2 opacity-30">
                                    <div className="h-px flex-grow bg-white/10" />
                                    <span className="text-[7px] font-black text-white uppercase tracking-widest whitespace-nowrap">LinkGPS Intranet</span>
                                    <div className="h-px flex-grow bg-white/10" />
                                </div>
                            </div>

                            {/* Loading / Processing State Overlay */}
                            <AnimatePresence>
                                {loading && (
                                    <motion.div 
                                        initial={{ opacity: 0 }} 
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 bg-neutral-900/80 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-8 text-center gap-6"
                                    >
                                        <div className="relative">
                                            <div className="w-24 h-24 rounded-full border-2 border-brand-orange/20 flex items-center justify-center">
                                                <div className="w-16 h-16 rounded-full border-4 border-t-brand-orange border-r-transparent border-b-brand-orange/20 border-l-transparent animate-spin" />
                                            </div>
                                            <motion.div 
                                                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                className="absolute inset-0 bg-brand-orange/20 rounded-full"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm font-black text-white uppercase tracking-[0.2em] animate-pulse">
                                                Estableciendo conexión...
                                            </p>
                                            <p className="text-[9px] font-bold text-brand-orange uppercase tracking-widest opacity-60">
                                                Consultando Servicio de Geocoding LinkGPS
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- Prompt State --- */}
            <AnimatePresence>
                {!locationData && !loading && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                        <div className="bg-black/70 backdrop-blur-2xl px-12 py-8 rounded-[36px] border border-white/10 flex items-center gap-6 shadow-[0_32px_64px_rgba(0,0,0,0.8)]">
                             <div className="relative">
                                <div className="w-16 h-16 rounded-2xl bg-brand-orange/10 flex items-center justify-center border border-brand-orange/20">
                                    <Navigation className="text-brand-orange" size={32} />
                                </div>
                                <motion.div 
                                    animate={{ scale: [1, 2, 1], opacity: [0.4, 0, 0.4] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="absolute inset-0 bg-brand-orange/30 rounded-full blur-xl"
                                />
                             </div>
                            <div className="flex flex-col">
                                <p className="text-lg font-black text-white uppercase tracking-[0.1em]">Análisis de Ubicación</p>
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.3em] mt-1">Haz clic en el mapa para iniciar proceso</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .tactical-map-container .leaflet-tile-pane {
                    filter: invert(90%) grayscale(100%) brightness(1.1) contrast(1.1);
                }
                .tactical-map-container .leaflet-container {
                    background: #d1d1d1 !important;
                }
                .leaflet-control-layers { 
                    background: rgba(0,0,0,0.8) !important; 
                    border: 1px solid rgba(255,255,255,0.1) !important; 
                    color: white !important; 
                    border-radius: 16px !important; 
                    backdrop-filter: blur(24px);
                    font-family: inherit;
                    box-shadow: 0 15px 45px rgba(0,0,0,0.9);
                    padding: 4px;
                }
                .leaflet-control-layers-list { padding: 4px; font-weight: 800; text-transform: uppercase; font-size: 8px; letter-spacing: 0.15em; }
                .leaflet-control-layers-base label { cursor: pointer; padding: 4px 10px; border-radius: 8px; transition: all 0.2s; }
                .leaflet-control-layers-base label:hover { background: rgba(255,255,255,0.1); color: #ff6b00; }
                .leaflet-div-icon { background: transparent; border: none; }
            `}</style>
        </div>
    );
}
