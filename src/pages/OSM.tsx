import { useState, useCallback } from 'react';
import { 
  MapPin, 
  Navigation, 
  Map as MapIcon, 
  Info, 
  Globe, 
  Compass, 
  Loader2,
  Maximize2
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';

// --- Tactical Marker Icon ---
const customIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Or a better tactical one
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
      const response = await fetch('http://127.0.0.1:8000/api/v1/osm/reverse', {
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
      // Fallback for demo if local API isn't up
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
    <div className="relative h-[calc(100vh-100px)] w-full overflow-hidden rounded-[40px] border border-white/5 bg-black shadow-3xl flex flex-col">
      
      {/* --- Tactical Background Map --- */}
      <div className="absolute inset-0 z-0 silver-map-container">
        <MapContainer
          center={[-16.5, -68.15]}
          zoom={13}
          style={{ height: '100%', width: '100%', background: '#0a0a0a' }}
          zoomControl={false}
        >
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Visión Táctica">
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
                attribution='&copy; OpenStreetMap'
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

      {/* --- Floating Header --- */}
      <div className="absolute top-8 left-8 z-10 flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-orange/10 flex items-center justify-center border border-brand-orange/20 backdrop-blur-md">
            <MapIcon className="text-brand-orange" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase leading-none">Prueba de ubicación</h1>
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] mt-1">Intelligence API Testing</p>
          </div>
        </div>
      </div>

      {/* --- Results Overlay (Crystal Glassmorphism) --- */}
      <AnimatePresence>
        {locationData && (
          <motion.div
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            className="absolute left-8 bottom-8 w-96 z-10 pointer-events-auto"
          >
            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] p-6 shadow-2xl flex flex-col gap-6">
              
              {/* Main Address */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-brand-orange">
                  <MapPin size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Dirección Detallada</span>
                </div>
                <h3 className="text-lg font-black text-white/90 leading-tight">
                  {locationData.direccion_completa}
                </h3>
              </div>

              {/* Geo Grid Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 text-neutral-500 mb-1">
                    <Globe size={12} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Región</span>
                  </div>
                  <p className="text-xs font-black text-white">{locationData.ciudad || 'N/A'}</p>
                </div>
                <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 text-neutral-500 mb-1">
                    <Compass size={12} />
                    <span className="text-[9px] font-black uppercase tracking-widest">País</span>
                  </div>
                  <p className="text-xs font-black text-white">{locationData.pais || 'N/A'}</p>
                </div>
              </div>

              {/* Technical Coordinates Section */}
              <div className="bg-brand-orange/5 border border-brand-orange/10 rounded-2xl p-4 overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Maximize2 size={40} className="text-brand-orange" />
                </div>
                
                <div className="flex items-center justify-between mb-3 border-b border-brand-orange/10 pb-2">
                    <span className="text-[10px] font-black text-brand-orange uppercase tracking-wider">Telemetría de Punto</span>
                    {loading && <Loader2 size={12} className="animate-spin text-brand-orange" />}
                </div>

                <div className="flex items-center justify-around gap-4 font-mono">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-neutral-500 uppercase mb-1">Latitud</span>
                    <span className="text-xs font-black text-white/80 tabular-nums">
                      {position?.lat.toFixed(8)}
                    </span>
                  </div>
                  <div className="w-px h-6 bg-white/10" />
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-neutral-500 uppercase mb-1">Longitud</span>
                    <span className="text-xs font-black text-white/80 tabular-nums">
                      {position?.lng.toFixed(8)}
                    </span>
                  </div>
                </div>
              </div>

              {/* OSN Data Attribution */}
              <div className="flex items-center gap-2 px-2">
                <Info size={10} className="text-neutral-500" />
                <span className="text-[8px] text-neutral-600 font-bold uppercase tracking-tight">
                    {locationData.osm_info || "Data © OpenStreetMap Contributors"}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Empty State Prompt --- */}
      <AnimatePresence>
        {!locationData && !loading && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-black/60 backdrop-blur-md px-8 py-5 rounded-full border border-white/5 flex items-center gap-4 text-center">
              <Navigation className="text-brand-orange animate-pulse" size={18} />
              <p className="text-xs font-black text-white/60 uppercase tracking-[0.2em]">
                Clic en el mapa para reverse-geocoding
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .silver-map-container .leaflet-tile-pane {
          filter: grayscale(100%) brightness(0.45) contrast(1.55);
        }
        .silver-map-container .leaflet-container {
          background: #0a0a0a !important;
        }
        .leaflet-control-layers { 
          background: rgba(0,0,0,0.85) !important; 
          border: 1px solid rgba(255,255,255,0.1) !important; 
          color: white !important; 
          border-radius: 12px !important; 
          backdrop-filter: blur(12px);
          font-family: inherit;
        }
        .leaflet-control-layers-list { padding: 8px; font-weight: 900; text-transform: uppercase; font-size: 8px; letter-spacing: 0.1em; }
      `}</style>
    </div>
  );
}
