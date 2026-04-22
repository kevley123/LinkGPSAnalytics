import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hexagon, Plus, Settings, Car, ArrowRight, Loader2,
  Map as MapIcon, Trash2, Eye, Edit3, ChevronLeft,
  Shield, MapPin, Radio, Clock
} from 'lucide-react';
import { MapContainer, TileLayer, Circle, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppContext } from '../context/AppContext';
import { env } from '../config/env';

const API_BASE = env.API_BASE_URL;

// --- Helper Component to Update Map Center ---
const ChangeView = ({ center }: { center: L.LatLngExpression }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
};

// --- Vehicle Selection Chip ---
const VehicleChip = memo(({ veh, selected, onSelect, loading }: any) => (
  <button
    type="button"
    onClick={() => !loading && onSelect(veh)}
    disabled={loading}
    className={`group relative w-full text-left flex items-center gap-4 px-5 py-4 rounded-3xl border transition-all duration-300
      ${selected
        ? 'border-brand-orange bg-brand-orange/5 shadow-[0_20px_40px_-15px_rgba(249,115,22,0.15)]'
        : 'border-black/5 bg-black/[0.03] hover:border-black/10 hover:bg-black/[0.05]'
      } ${loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors
      ${selected ? 'bg-brand-orange/20 border-brand-orange/30' : 'bg-black/5 border-black/5'}`}>
      <Car className={selected ? 'text-brand-orange' : 'text-black/40'} size={20} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-black text-black truncate uppercase tracking-tight">{veh.modelo}</p>
      <div className="flex items-center gap-2 mt-0.5">
        <span className="text-[10px] font-black text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded-lg uppercase tracking-widest">{veh.placa}</span>
      </div>
    </div>
    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all
      ${selected ? 'bg-black text-white' : 'bg-black/5 text-black/20'}`}>
      {loading ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
    </div>
  </button>
));

export default function Geocercas() {
  const { authToken } = useAppContext();
  const [step, setStep] = useState(1); // 1: Vehículos, 2: Lista, 3: Detalle
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [vehSel, setVehSel] = useState<any>(null);
  const [geocercas, setGeocercas] = useState<any[]>([]);
  const [geoSel, setGeoSel] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch Vehicles
  useEffect(() => {
    if (!authToken) return;
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/analytics/mis_vehiculos`, {
          headers: { 'Authorization': `Bearer ${authToken}` },
        });
        const data = await res.json();
        setVehicles(Array.isArray(data) ? data : (data.vehiculos ?? []));
      } catch (e) {
        console.error('Fetch vehicles error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, [authToken]);

  // Fetch Geofences for selected vehicle
  const fetchGeocercas = useCallback(async (vehId: number) => {
    if (!authToken) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/analytics/geocercas/vehiculo/${vehId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      const data = await res.json();
      setGeocercas(data.geocercas || []);
      setStep(2);
    } catch (e) {
      console.error('Fetch geofences error:', e);
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  const handleSelectVehicle = (veh: any) => {
    setVehSel(veh);
    fetchGeocercas(veh.id);
  };

  const handleViewDetail = (geo: any) => {
    setGeoSel(geo);
    setStep(3);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 min-h-screen">
      {/* Header Secction */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-[22px] bg-black text-white flex items-center justify-center shadow-2xl shadow-black/20">
            <Hexagon size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-black tracking-tight leading-none">Gestión de Geocercas</h1>
            <p className="text-xs font-bold text-black/40 uppercase tracking-[0.3em] mt-2">Seguridad Perimetral Inteligente</p>
          </div>
        </div>

        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border border-black/5 text-black font-black text-[11px] uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm"
          >
            <ChevronLeft size={16} /> Volver
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: VEHICLE SELECTION */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-28 rounded-[32px] bg-black/5 animate-pulse" />)
            ) : (
              vehicles.map(v => (
                <VehicleChip
                  key={v.id}
                  veh={v}
                  selected={vehSel?.id === v.id}
                  onSelect={handleSelectVehicle}
                />
              ))
            )}
            <button className="h-28 border-2 border-dashed border-black/10 rounded-[32px] flex flex-col items-center justify-center gap-2 text-black/30 hover:border-brand-orange/40 hover:text-brand-orange transition-all group">
              <Plus size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest">Vincular Vehículo</span>
            </button>
          </motion.div>
        )}

        {/* STEP 2: GEOCERCAS LIST */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 px-4">
              <div className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
              <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">Mostrando geocercas para: {vehSel?.placa}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {geocercas.map((geo) => (
                <div key={geo.id} className="group bg-white/40 backdrop-blur-xl rounded-[32px] p-6 border border-black/5 shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all duration-300 relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${geo.tipo === 'entrada' ? 'bg-emerald-500' : 'bg-brand-orange'}`} />

                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-black tracking-tight">{geo.nombre}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${geo.tipo === 'entrada' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-brand-orange/10 text-brand-orange'
                          }`}>
                          Control {geo.tipo}
                        </span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center text-black/20 group-hover:text-black transition-colors">
                      <Shield size={18} />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-8">
                    <div className="flex-1 space-y-1">
                      <p className="text-[9px] font-black text-black/30 uppercase tracking-widest">Radio</p>
                      <p className="text-sm font-black text-black">{geo.radio} <span className="text-xs text-black/40">mts</span></p>
                    </div>
                    <div className="flex-1 space-y-1 text-right">
                      <p className="text-[9px] font-black text-black/30 uppercase tracking-widest">Estado</p>
                      <p className="text-sm font-black text-emerald-500 uppercase tracking-tighter">{geo.estado}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-black/5">
                    <button onClick={() => handleViewDetail(geo)} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all">
                      <Eye size={12} /> Ver
                    </button>
                    <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-black/5 text-black/60 text-[10px] font-black uppercase tracking-widest hover:bg-black/10 transition-all">
                      <Edit3 size={12} /> Edit
                    </button>
                    <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
              <button className="h-[280px] border-2 border-dashed border-black/10 rounded-[32px] flex flex-col items-center justify-center gap-3 text-black/20 hover:border-brand-orange hover:text-brand-orange hover:bg-brand-orange/5 transition-all">
                <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center">
                  <Plus size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Nueva Geocerca</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: GEOCERCA DETAIL (Layout 3 Cards) */}
        {step === 3 && geoSel && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Card 1: Map (Big Left) */}
            <div className="lg:col-span-2 h-[600px] bg-black rounded-[40px] overflow-hidden border border-black/10 shadow-2xl relative">
              <MapContainer
                center={[parseFloat(geoSel.lat_centro), parseFloat(geoSel.long_centro)]}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; CARTO'
                />
                <ChangeView center={[parseFloat(geoSel.lat_centro), parseFloat(geoSel.long_centro)]} />
                <Circle
                  center={[parseFloat(geoSel.lat_centro), parseFloat(geoSel.long_centro)]}
                  radius={geoSel.radio}
                  pathOptions={{
                    color: geoSel.tipo === 'entrada' ? '#10b981' : '#F97316',
                    fillColor: geoSel.tipo === 'entrada' ? '#10b981' : '#F97316',
                    fillOpacity: 0.15,
                    weight: 3,
                    dashArray: '10, 10'
                  }}
                />
                <Marker position={[parseFloat(geoSel.lat_centro), parseFloat(geoSel.long_centro)]} />
              </MapContainer>

              <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-3">
                <div className="bg-white/90 backdrop-blur-xl px-5 py-3 rounded-2xl border border-black/5 flex items-center gap-3">
                  <MapIcon size={18} className="text-brand-orange" />
                  <div>
                    <p className="text-[10px] font-black text-black/40 uppercase tracking-widest leading-none">Visualización</p>
                    <p className="text-[12px] font-black text-black uppercase mt-1">{geoSel.nombre}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side Cards */}
            <div className="flex flex-col gap-6">
              {/* Card 2: Technical Info */}
              <div className="bg-white/40 backdrop-blur-xl rounded-[40px] p-8 border border-black/5 shadow-xl space-y-8 flex-1">
                <div className="flex items-center gap-4 border-b border-black/5 pb-6">
                  <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center">
                    <Settings size={20} />
                  </div>
                  <h3 className="text-xl font-black text-black tracking-tight">Parámetros</h3>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center text-brand-orange"><Radio size={18} /></div>
                    <div>
                      <p className="text-[9px] font-black text-black/30 uppercase tracking-widest">Radio de Control</p>
                      <p className="text-base font-black text-black">{geoSel.radio} metros</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center text-emerald-500"><MapPin size={18} /></div>
                    <div>
                      <p className="text-[9px] font-black text-black/30 uppercase tracking-widest">Coordenadas</p>
                      <p className="text-[11px] font-black text-black">{geoSel.lat_centro}, {geoSel.long_centro}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center text-blue-500"><Clock size={18} /></div>
                    <div>
                      <p className="text-[9px] font-black text-black/30 uppercase tracking-widest">Creado el</p>
                      <p className="text-base font-black text-black">{new Date(geoSel.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Status & Action */}
              <div className="bg-black rounded-[40px] p-8 text-white space-y-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/10 rounded-full blur-3xl -mr-16 -mt-16" />

                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Status IA</span>
                    <div className="flex items-center gap-2 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Activo</span>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-white/60 leading-relaxed italic">
                    "Este perímetro está siendo monitoreado por el núcleo de analítica en tiempo real para detectar anomalías de trayectoria."
                  </p>

                  <button className="w-full py-4 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3">
                    <Edit3 size={16} /> Modificar Perímetro
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .leaflet-container { background: #000 !important; border-radius: 40px; }
      `}</style>
    </div>
  );
}
