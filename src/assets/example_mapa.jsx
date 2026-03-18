import { useState, useEffect, useContext, useCallback, memo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Car, MapPin, RefreshCw, Loader2, XCircle, X,
  Clock, ChevronLeft, AlertCircle, Satellite,
  Navigation, Signal, Check, ArrowRight
} from 'lucide-react';
import {
  MapContainer, TileLayer, Marker, Popup, Tooltip,
  LayersControl, Circle, useMap
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../../Context/AppContext';

const API = import.meta.env.VITE_API_URL;
const IMG_VEH = `${import.meta.env.VITE_BACKEND_URL}/uploads/vehiculos/`;

// ── Icono SVG personalizado para el marcador ──────────────────────────────────
const crearIconoVehiculo = (color = '#7c3aed') => new L.DivIcon({
  className: '',
  html: `
    <div style="position:relative;width:42px;height:52px;filter:drop-shadow(0 4px 6px rgba(0,0,0,0.35))">
      <svg viewBox="0 0 42 52" fill="none" xmlns="http://www.w3.org/2000/svg" width="42" height="52">
        <ellipse cx="21" cy="49" rx="8" ry="3" fill="rgba(0,0,0,0.18)"/>
        <path d="M21 2C12.163 2 5 9.163 5 18c0 10.5 16 32 16 32S37 28.5 37 18C37 9.163 29.837 2 21 2z"
          fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="21" cy="18" r="7" fill="white" fill-opacity="0.95"/>
        <g transform="translate(15,12)">
          <path d="M5 1L5 5L1 5a1 1 0 0 0 0 2L5 7L5 11a1 1 0 0 0 2 0L7 7L11 7a1 1 0 0 0 0-2L7 5L7 1a1 1 0 0 0-2 0z" fill="${color}"/>
        </g>
      </svg>
      <div style="position:absolute;top:6px;left:50%;transform:translateX(-50%);width:10px;height:10px;border-radius:50%;background:white;border:2px solid ${color}"></div>
    </div>
  `,
  iconSize: [42, 52],
  iconAnchor: [21, 50],
  popupAnchor: [0, -52],
});

// ── Componente para actualizar la vista del mapa cuando cambian coords ─────────
const ActualizadorVista = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 16, { duration: 1.2 });
    }
  }, [lat, lng, map]);
  return null;
};

// ── Helper tiempo relativo ────────────────────────────────────────────────────
const tiempoRelativo = (fecha) => {
  if (!fecha) return '—';
  const diff = Math.floor((Date.now() - new Date(fecha)) / 1000);
  if (diff < 60) return `hace ${diff}s`;
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}min`;
  return `hace ${Math.floor(diff / 3600)}h`;
};

const fmtFechaCompleta = (fecha) => {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleString('es-BO', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

// ── Chip/card rápida de vehículo ──────────────────────────────────────────────
const VehiculoChip = memo(({ veh, selected, onSelect, loading }) => {
  const imgSrc = veh.image ? `${IMG_VEH}${veh.image}` : null;
  return (
    <button
      type="button"
      onClick={() => !loading && onSelect(veh)}
      disabled={loading}
      className={`group relative w-full text-left flex items-center gap-3 px-3.5 py-3 rounded-2xl border-2 transition-colors duration-150 focus:outline-none
        ${selected
          ? 'border-purple-600 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/30'
          : 'border-purple-100 dark:border-purple-800/50 bg-white dark:bg-purple-950/60 hover:border-purple-300 dark:hover:border-purple-600'
        } ${loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {/* Avatar */}
      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
        {imgSrc
          ? <img src={imgSrc} alt={veh.modelo} loading="lazy" className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
          : <Car size={20} className="text-purple-400 dark:text-purple-600" />
        }
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="font-extrabold text-sm text-purple-900 dark:text-white truncate">{veh.modelo}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded">{veh.placa}</span>
          {veh.color && <span className="text-[10px] text-purple-400 dark:text-purple-600 capitalize">{veh.color}</span>}
          {veh.year && <span className="text-[10px] text-purple-400 dark:text-purple-600">{veh.year}</span>}
        </div>
      </div>

      {/* Check / Loading */}
      <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center transition-colors
        ${selected ? 'bg-purple-700 text-white' : 'bg-purple-100 dark:bg-purple-900/40 text-purple-300 dark:text-purple-700'}`}>
        {selected && loading
          ? <Loader2 size={13} className="animate-spin" />
          : selected
            ? <Check size={13} />
            : <ArrowRight size={13} />
        }
      </div>
    </button>
  );
});

// ── Panel de info sobre el mapa ───────────────────────────────────────────────
const PanelInfo = memo(({ veh, ubicacion, onRefresh, loading }) => (
  <div className="bg-white/95 dark:bg-purple-950/95 backdrop-blur-sm border border-purple-100 dark:border-purple-800/50 rounded-2xl p-4 space-y-3 shadow-lg">
    {/* Vehículo */}
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center shrink-0">
        <Car size={15} className="text-purple-600 dark:text-purple-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-purple-400 dark:text-purple-500 uppercase font-bold tracking-wide">Vehículo</p>
        <p className="text-sm font-extrabold text-purple-900 dark:text-white truncate">{veh?.modelo}</p>
      </div>
      <span className="text-[10px] font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded shrink-0">{veh?.placa}</span>
    </div>

    {/* Coordenadas */}
    <div className="grid grid-cols-2 gap-2">
      {[
        { label: 'Latitud', val: ubicacion?.latitud ? parseFloat(ubicacion.latitud).toFixed(6) : '—' },
        { label: 'Longitud', val: ubicacion?.longitud ? parseFloat(ubicacion.longitud).toFixed(6) : '—' },
      ].map(({ label, val }) => (
        <div key={label} className="bg-purple-50 dark:bg-purple-900/30 rounded-xl px-3 py-2">
          <p className="text-[9px] font-bold text-purple-400 dark:text-purple-500 uppercase tracking-wide">{label}</p>
          <p className="text-xs font-extrabold text-purple-900 dark:text-purple-100 font-mono">{val}</p>
        </div>
      ))}
    </div>

    {/* Última actualización */}
    <div className="flex items-center justify-between pt-1 border-t border-purple-100 dark:border-purple-800/40">
      <div className="flex items-center gap-1.5 text-[11px] text-purple-500 dark:text-purple-400">
        <Clock size={11} />
        <span>{ubicacion?.fecha ? tiempoRelativo(ubicacion.fecha) : '—'}</span>
        {ubicacion?.fecha && (
          <span className="text-purple-300 dark:text-purple-700">· {fmtFechaCompleta(ubicacion.fecha)}</span>
        )}
      </div>
      <button
        onClick={onRefresh}
        disabled={loading}
        className="flex items-center gap-1.5 text-[11px] font-bold text-orange-500 hover:text-orange-700 dark:hover:text-orange-300 disabled:opacity-50 transition-colors"
      >
        <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
        Actualizar
      </button>
    </div>
  </div>
));

// ── Modal error (sin servicio activo) — via Portal para escapar del layout ────
const ModalSinServicio = memo(({ mensaje, onClose, onSolicitar }) =>
  createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'rgba(15,10,30,0.82)',
      }}
      onMouseDown={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-purple-950 rounded-2xl overflow-hidden"
        style={{
          animation: 'fadeInUp 0.25s ease both',
          boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
          border: '1px solid rgba(220,38,38,0.35)',
        }}
      >
        {/* Cabecera roja sólida */}
        <div className="relative bg-red-600 dark:bg-red-700 px-6 pt-7 pb-6 flex flex-col items-center gap-3">
          {/* Cerrar */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center bg-red-500 hover:bg-red-400 text-white transition-colors"
          >
            <X size={14} />
          </button>

          {/* Icono con pulso */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center" style={{ boxShadow: '0 0 0 8px rgba(248,113,113,0.2)' }}>
              <XCircle size={34} className="text-white" />
            </div>
            <span className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: 'rgba(248,113,113,0.25)' }} />
          </div>

          <div className="text-center">
            <p className="text-[10px] font-bold text-red-200 uppercase tracking-widest mb-1">Acceso restringido</p>
            <h3 className="text-xl font-extrabold text-white">Sin servicio activo</h3>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="px-6 py-5">
          <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/40 rounded-xl p-3.5 mb-5">
            <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">{mensaje}</p>
          </div>

          <div className="flex flex-col gap-2">
            <button onClick={onSolicitar}
              className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm transition-colors flex items-center justify-center gap-2">
              <Satellite size={15} /> Solicitar servicio GPS
            </button>
            <button onClick={onClose}
              className="w-full py-2 rounded-xl border border-purple-200 dark:border-purple-800/50 text-purple-500 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-800/40 text-sm font-semibold transition-colors">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
);

// ── Página principal ──────────────────────────────────────────────────────────
export default function Localizador() {
  const { token } = useContext(AppContext);
  const navigate = useNavigate();

  const [paso, setPaso] = useState(1); // 1 = selección, 2 = mapa
  const [vehiculos, setVehiculos] = useState([]);
  const [vehSel, setVehSel] = useState(null);
  const [ubicacion, setUbicacion] = useState(null);
  const [loadingVeh, setLoadingVeh] = useState(true);
  const [loadingUbi, setLoadingUbi] = useState(false);
  const [errorModal, setErrorModal] = useState(null);

  const iconoRef = useRef(crearIconoVehiculo());

  // ── Fetch vehículos ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchVehiculos = async () => {
      try {
        setLoadingVeh(true);
        const res = await fetch(`${API}/mis_vehiculos`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        setVehiculos(Array.isArray(data) ? data : (data.vehiculos ?? []));
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingVeh(false);
      }
    };
    fetchVehiculos();
  }, [token]);

  // ── Obtener ubicación ───────────────────────────────────────────────────────
  const obtenerUbicacion = useCallback(async (vehiculoId) => {
    if (!vehiculoId) return;
    setLoadingUbi(true);
    try {
      const res = await fetch(`${API}/mi_ubicacion?vehiculo_id=${vehiculoId}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });

      if (res.status === 403) {
        setErrorModal('Tu vehículo no cuenta con un servicio activo. Solicita un servicio primero 😎.');
        return;
      }
      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data = await res.json();
      setUbicacion(data);
      setPaso(2);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUbi(false);
    }
  }, [token]);

  // Al seleccionar un vehículo: guardar y pedir coordenadas de inmediato
  const seleccionar = useCallback((veh) => {
    setVehSel(veh);
    obtenerUbicacion(veh.id);
  }, [obtenerUbicacion]);

  const lat = ubicacion?.latitud ? parseFloat(ubicacion.latitud) : null;
  const lng = ubicacion?.longitud ? parseFloat(ubicacion.longitud) : null;
  const hasCoords = lat !== null && lng !== null;

  // ── PASO 1: Selección de vehículo ───────────────────────────────────────────
  const paso1 = (
    <div className="space-y-4" style={{ animation: 'fadeInUp 0.2s ease both' }}>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
          <Car size={14} className="text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="font-extrabold text-purple-900 dark:text-white">Selecciona tu vehículo</h2>
        <span className="ml-auto text-xs text-purple-400 dark:text-purple-600">Toca para localizar</span>
      </div>

      {loadingVeh ? (
        <div className="flex flex-col items-center py-16 gap-3">
          <Loader2 size={28} className="animate-spin text-purple-500" />
          <p className="text-sm text-purple-400 dark:text-purple-600">Cargando vehículos…</p>
        </div>
      ) : vehiculos.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center mb-3">
            <Car size={28} className="text-purple-300 dark:text-purple-700" />
          </div>
          <h3 className="font-bold text-purple-900 dark:text-white mb-1">Sin vehículos registrados</h3>
          <p className="text-sm text-purple-400 dark:text-purple-600">Registra un vehículo para poder usar el localizador.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {vehiculos.map(v => (
            <VehiculoChip
              key={v.id}
              veh={v}
              selected={vehSel?.id === v.id}
              loading={loadingUbi && vehSel?.id === v.id}
              onSelect={seleccionar}
            />
          ))}
        </div>
      )}

      {loadingUbi && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-purple-500 dark:text-purple-400">
          <Loader2 size={16} className="animate-spin" />
          Obteniendo ubicación…
        </div>
      )}
    </div>
  );

  // ── PASO 2: Mapa ────────────────────────────────────────────────────────────
  const paso2 = (
    <div className="space-y-4" style={{ animation: 'fadeInUp 0.2s ease both' }}>

      {/* Barra superior */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
            <Navigation size={14} className="text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="font-extrabold text-purple-900 dark:text-white">Ubicación en tiempo real</h2>
        </div>
        <button
          onClick={() => { setVehSel(null); setUbicacion(null); setPaso(1); }}
          className="flex items-center gap-1.5 text-xs font-bold text-purple-500 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-200 transition-colors px-3 py-1.5 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-800/40">
          <ChevronLeft size={14} /> Cambiar vehículo
        </button>
      </div>

      {/* Chips de vehículos — selección rápida encima del mapa */}
      <div className="flex gap-2 flex-wrap">
        {vehiculos.map(v => (
          <button
            key={v.id}
            onClick={() => seleccionar(v)}
            disabled={loadingUbi}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-colors duration-150 focus:outline-none
              ${vehSel?.id === v.id
                ? 'bg-purple-700 border-purple-700 text-white'
                : 'bg-white dark:bg-purple-950/60 border-purple-200 dark:border-purple-800/50 text-purple-600 dark:text-purple-300 hover:border-purple-500 dark:hover:border-purple-500'
              } disabled:opacity-50`}
          >
            {loadingUbi && vehSel?.id === v.id
              ? <Loader2 size={10} className="animate-spin" />
              : <Car size={10} />
            }
            {v.placa}
          </button>
        ))}
      </div>

      {/* Mapa + panel info lateral */}
      <div className="relative rounded-2xl overflow-hidden border border-purple-100 dark:border-purple-800/50"
        style={{ height: '480px' }}>

        {hasCoords ? (
          <MapContainer
            center={[lat, lng]}
            zoom={16}
            style={{ width: '100%', height: '100%' }}
            zoomControl={true}
          >
            {/* Control de capas */}
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="Mapa estándar">
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Dark mode">
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
                  attribution='&copy; CartoDB'
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Satélite">
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution='&copy; Esri'
                />
              </LayersControl.BaseLayer>
            </LayersControl>

            {/* Actualizar vista cuando cambian coords */}
            <ActualizadorVista lat={lat} lng={lng} />

            {/* Círculo de precisión */}
            <Circle
              center={[lat, lng]}
              radius={80}
              pathOptions={{ color: '#7c3aed', fillColor: '#7c3aed', fillOpacity: 0.12, weight: 1.5 }}
            />

            {/* Marcador del vehículo */}
            <Marker position={[lat, lng]} icon={iconoRef.current}>
              <Popup>
                <div className="text-center text-sm">
                  <strong>{vehSel?.modelo}</strong>
                  <br />
                  <span className="text-gray-500">Placa: {vehSel?.placa}</span>
                  {ubicacion?.fecha && (
                    <>
                      <br />
                      <span className="text-gray-400 text-xs">{fmtFechaCompleta(ubicacion.fecha)}</span>
                    </>
                  )}
                </div>
              </Popup>
              <Tooltip direction="top" offset={[0, -52]} permanent>
                <span className="text-xs font-bold">{vehSel?.placa}</span>
              </Tooltip>
            </Marker>
          </MapContainer>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-purple-50 dark:bg-purple-900/20 gap-3">
            <Loader2 size={32} className="animate-spin text-purple-500" />
            <p className="text-sm text-purple-500 dark:text-purple-400">Obteniendo coordenadas…</p>
          </div>
        )}

        {/* Panel flotante de info — esquina inferior izquierda */}
        {hasCoords && (
          <div className="absolute bottom-4 left-4 z-[1000] w-72 max-w-[calc(100%-2rem)]">
            <PanelInfo
              veh={vehSel}
              ubicacion={ubicacion}
              loading={loadingUbi}
              onRefresh={() => obtenerUbicacion(vehSel?.id)}
            />
          </div>
        )}

        {/* Indicador de carga sobre el mapa */}
        {loadingUbi && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 px-4 py-2 bg-white/95 dark:bg-purple-950/95 border border-purple-200 dark:border-purple-700 rounded-full shadow-lg text-sm font-semibold text-purple-700 dark:text-purple-300">
            <RefreshCw size={14} className="animate-spin" /> Actualizando ubicación…
          </div>
        )}
      </div>

      {/* Estado de señal */}
      <div className="flex items-center gap-2 text-xs text-purple-400 dark:text-purple-600">
        <Signal size={12} className={hasCoords ? 'text-emerald-500' : 'text-amber-400'} />
        {hasCoords
          ? <span>Última señal GPS: <strong className="text-purple-700 dark:text-purple-300">{tiempoRelativo(ubicacion?.fecha)}</strong></span>
          : <span>Sin señal GPS disponible</span>
        }
      </div>
    </div>
  );

  return (
    <div className="space-y-5" style={{ animation: 'fadeInUp 0.3s ease both' }}>

      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-purple-900 dark:text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
              <MapPin size={18} className="text-purple-600 dark:text-purple-400" />
            </div>
            Localizador GPS
          </h1>
          <p className="text-sm text-purple-500 dark:text-purple-400 mt-0.5">
            Consulta la ubicación en tiempo real de tus vehículos
          </p>
        </div>

        {/* Mini stepper */}
        <div className="flex items-center gap-2">
          {[
            { n: 1, label: 'Vehículo' },
            { n: 2, label: 'Ubicación' },
          ].map(({ n, label }, i) => (
            <div key={n} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors
                ${paso === n
                  ? 'bg-purple-700 border-purple-700 text-white dark:bg-purple-600 dark:border-purple-600'
                  : paso > n
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400'
                    : 'bg-white dark:bg-purple-950/60 border-purple-200 dark:border-purple-800/50 text-purple-400 dark:text-purple-600'
                }`}>
                {paso > n ? <Check size={10} /> : n}
                <span>{label}</span>
              </div>
              {i === 0 && (
                <div className={`w-6 h-0.5 rounded ${paso > 1 ? 'bg-emerald-400' : 'bg-purple-100 dark:bg-purple-800/50'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contenido del paso actual */}
      <div className="bg-white dark:bg-purple-950/60 border border-purple-100 dark:border-purple-800/50 rounded-2xl p-5">
        {paso === 1 ? paso1 : paso2}
      </div>

      {/* Modal sin servicio activo */}
      {errorModal && (
        <ModalSinServicio
          mensaje={errorModal}
          onClose={() => setErrorModal(null)}
          onSolicitar={() => {
            setErrorModal(null);
            navigate('/user/dashboard/servicios');
          }}
        />
      )}

      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        .leaflet-tooltip { background:rgba(255,255,255,0.95); border:1px solid #e9d5ff; border-radius:8px; padding:2px 8px; font-size:11px; font-weight:700; color:#581c87; }
        .leaflet-tooltip::before { display:none; }
      `}</style>
    </div>
  );
}