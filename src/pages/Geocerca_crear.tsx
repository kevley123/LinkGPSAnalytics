import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Circle, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  ChevronLeft, MapPin, Plus, 
  Loader2, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { env } from '../config/env';

const API_BASE = env.API_BASE_URL;

interface GeocercaCrearProps {
  vehiculoId: number;
  onBack: () => void;
  onSuccess: () => void;
}

export default function Geocerca_crear({ vehiculoId, onBack, onSuccess }: GeocercaCrearProps) {
  const { authToken } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    vehiculo_id: vehiculoId,
    nombre: '',
    lat: -16.5000, // Default center
    lon: -68.1500,
    radio: 500,
    tipo: 'salida'
  });

  // Component to handle map clicks
  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setFormData(prev => ({ ...prev, lat: e.latlng.lat, lon: e.latlng.lng }));
      },
    });
    return null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/analytics/geocercas`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Error al crear la geocerca');
      setSuccess(true);
      setTimeout(onSuccess, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 rounded-2xl bg-black/5 hover:bg-black hover:text-white transition-all">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-black">Nueva Geocerca</h2>
            <p className="text-xs font-bold text-black/40 uppercase tracking-widest">Define un nuevo perímetro de seguridad</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-8">
        {/* Form Column */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/40 backdrop-blur-xl p-8 rounded-[40px] border border-black/5 shadow-xl space-y-6"
        >
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-black/40 uppercase tracking-widest px-1">Nombre de Zona</label>
              <input 
                type="text" 
                value={formData.nombre}
                onChange={e => setFormData({...formData, nombre: e.target.value})}
                className="w-full bg-white border border-black/5 rounded-2xl px-6 py-4 text-sm font-bold focus:border-brand-orange outline-none transition-all"
                placeholder="Ej: Entrada Principal"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-black/40 uppercase tracking-widest px-1">Radio (metros)</label>
                <input 
                  type="number" 
                  value={formData.radio}
                  onChange={e => setFormData({...formData, radio: parseInt(e.target.value)})}
                  className="w-full bg-white border border-black/5 rounded-2xl px-6 py-4 text-sm font-bold focus:border-brand-orange outline-none transition-all"
                  min="50"
                  max="5000"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-black/40 uppercase tracking-widest px-1">Tipo de Control</label>
                <select 
                  value={formData.tipo}
                  onChange={e => setFormData({...formData, tipo: e.target.value})}
                  className="w-full bg-white border border-black/5 rounded-2xl px-6 py-4 text-sm font-bold focus:border-brand-orange outline-none transition-all appearance-none"
                >
                  <option value="salida">SALIDA (GEOFENCE OUT)</option>
                  <option value="entrada">ENTRADA (GEOFENCE IN)</option>
                </select>
              </div>
            </div>

            <div className="bg-black/5 p-6 rounded-3xl space-y-4">
               <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-brand-orange" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Punto Central</span>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="text-[11px] font-bold text-black/60 bg-white px-4 py-2 rounded-xl border border-black/5">{formData.lat.toFixed(6)}</div>
                  <div className="text-[11px] font-bold text-black/60 bg-white px-4 py-2 rounded-xl border border-black/5">{formData.lon.toFixed(6)}</div>
               </div>
               <p className="text-[9px] text-black/30 font-medium">Haz click en el mapa para ubicar el centro de la geocerca.</p>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 rounded-[22px] bg-brand-orange hover:bg-brand-orange-light text-white font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-brand-orange/20"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : success ? <CheckCircle2 size={18} /> : <Plus size={18} />}
              {loading ? 'Creando...' : success ? 'Geocerca Creada' : 'Crear Geocerca'}
            </button>

            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-xs font-bold uppercase tracking-tight">
                <AlertCircle size={16} /> {error}
              </div>
            )}
          </form>
        </motion.div>

        {/* Map Column */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="h-[600px] bg-white rounded-[40px] overflow-hidden border border-black/5 shadow-2xl relative"
        >
          <MapContainer
            center={[formData.lat, formData.lon]}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            <MapEvents />
            <Circle 
              center={[formData.lat, formData.lon]}
              radius={formData.radio}
              pathOptions={{
                color: formData.tipo === 'entrada' ? '#10b981' : '#F97316',
                fillColor: formData.tipo === 'entrada' ? '#10b981' : '#F97316',
                fillOpacity: 0.2,
                weight: 3,
                dashArray: '10, 10'
              }}
            />
            <Marker position={[formData.lat, formData.lon]} />
          </MapContainer>

          <div className="absolute top-6 left-6 z-[1000]">
            <div className="bg-black/90 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/10 flex items-center gap-3 shadow-2xl">
              <div className="w-8 h-8 rounded-xl bg-brand-orange flex items-center justify-center text-white">
                <MapPin size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">Interacción</p>
                <p className="text-[11px] font-black text-white uppercase mt-1">Click para posicionar</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
