import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, AlertCircle, 
  Loader2, CheckCircle, 
  ChevronLeft, Satellite, X, ArrowRight,
  Smartphone, Signal, Battery, Info, Radio,
  TrendingUp, Gauge, Ruler, Zap
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import Spline from '@splinetool/react-spline';
// @ts-ignore
import townaceModel from '../assets/models/animacion_townace.spline?url';
import { useAppContext } from '../context/AppContext';
import { env } from '../config/env';

const API_BASE = env.API_BASE_URL;

interface Toast {
  id: string;
  message: string;
}

// ── SVG RPM Digital Gauge Component ──────────────────────────────────────────
const RpmGauge = ({ rpm = 1000 }: { rpm: number }) => {
  const maxRpm = 8000;
  const clampedRpm = Math.min(Math.max(rpm, 0), maxRpm);
  const percentage = clampedRpm / maxRpm;

  return (
    <div className="flex flex-col items-center justify-center relative w-28 h-28 shrink-0">
      <svg className="w-full h-full transform -rotate-[135deg]" viewBox="0 0 120 120">
        {/* Background Arc */}
        <circle
          cx="60"
          cy="60"
          r="45"
          fill="transparent"
          stroke="#f1f3f5"
          strokeWidth="7"
          strokeDasharray="212 280"
          strokeLinecap="round"
        />
        {/* Active Arc */}
        <circle
          cx="60"
          cy="60"
          r="45"
          fill="transparent"
          stroke={clampedRpm > 6000 ? '#EF4444' : '#F97316'}
          strokeWidth="7"
          strokeDasharray="212 280"
          strokeDashoffset={212 - (212 * percentage)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      {/* Centered Digital Display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-3">
        <span className="text-xl font-black text-black leading-none">{clampedRpm}</span>
        <span className="text-[8px] font-black text-black/40 uppercase tracking-widest mt-0.5">RPM</span>
      </div>
    </div>
  );
};

// ── Switch/Toggle Switch Component ────────────────────────────────────────────
const ToggleSwitch = memo(({ label, checked }: { label: string; checked: boolean }) => (
  <div className="flex items-center justify-between p-2.5 bg-[#f8f9fa] rounded-xl border border-black/5">
    <span className="text-[10px] font-black text-neutral-600 uppercase tracking-wider">{label}</span>
    <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-default flex items-center ${checked ? 'bg-brand-orange' : 'bg-neutral-200'}`}>
      <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </div>
  </div>
));

// ── Custom Tooltip for Charts ───────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2.5 rounded-xl border border-black/5 shadow-xl text-[10px] font-sans">
        <p className="font-black text-black/40 uppercase tracking-wider mb-1">Día {label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-1.5 font-bold text-black">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
            <span>{parseFloat(entry.value).toFixed(1)} km</span>
          </div>
        ))}
      </div>
    );
  }
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

export default function MiDispositivo() {
  const { authToken } = useAppContext();
  
  const [step, setStep] = useState(1);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [vehSel, setVehSel] = useState<any>(null);
  
  const [deviceStatus, setDeviceStatus] = useState<any>(null);
  const [stats, setStats] = useState<any[]>([]);
  
  const [loadingVeh, setLoadingVeh] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [toast, setToast] = useState<Toast | null>(null);
  const [errorModal, setErrorModal] = useState<string | null>(null);

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

  // Combined fetch function: Wait for both device status and monthly stats
  const fetchDeviceData = useCallback(async (vehId: number) => {
    if (!authToken || !vehId) return;
    setLoadingStatus(true);
    setError(null);
    try {
      const [resStatus, resStats] = await Promise.all([
        fetch(`${API_BASE}/api/analytics/estado_dispositivo/${vehId}`, {
          headers: { 
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json'
          }
        }),
        fetch(`${API_BASE}/api/analytics/rutas-mensual-estadistica/${vehId}`, {
          headers: { 
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json'
          }
        })
      ]);

      if (resStatus.status === 403 || resStats.status === 403) {
        setErrorModal('No tienes permiso para usar Analytics o no tienes un servicio activo.');
        return;
      }

      if (!resStatus.ok) throw new Error(`Error de estado de dispositivo: ${resStatus.status}`);
      if (!resStats.ok) throw new Error(`Error de estadísticas de flota: ${resStats.status}`);

      const dataStatus = await resStatus.json();
      const dataStats = await resStats.json();

      setDeviceStatus(dataStatus);
      setStats(Array.isArray(dataStats) ? dataStats : []);
      setStep(2);
    } catch (err: any) {
      console.error("Error fetching device status & stats:", err);
      setError("No se pudo obtener el diagnóstico del hardware telemétrico.");
      setToast({
        id: 'err-device-fetch',
        message: 'Error al conectar con la unidad de rastreo y estadísticas.'
      });
    } finally {
      setLoadingStatus(false);
    }
  }, [authToken]);

  const onSelectVehicle = useCallback((veh: any) => {
    setVehSel(veh);
    fetchDeviceData(veh.id);
  }, [fetchDeviceData]);

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
      if (!dateStr) return '—';
      return new Date(dateStr).toLocaleString('es-BO', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
    } catch {
      return '—';
    }
  };

  // Safe JSON extraction
  const getVal = (field: string, fallback: any) => {
    if (deviceStatus && deviceStatus[field] !== undefined) {
      return deviceStatus[field];
    }
    return fallback;
  };

  const getMetadataVal = (field: string, fallback: any) => {
    if (deviceStatus && deviceStatus.metadata && deviceStatus.metadata[field] !== undefined) {
      return deviceStatus.metadata[field];
    }
    return fallback;
  };

  // Stats Derived Values
  const totals = useMemo(() => {
    if (!stats.length) return { dist: 0, speed: 0, points: 0 };
    const dist = stats.reduce((acc, curr) => acc + (curr.distance || 0), 0) / 1000;
    const speed = stats.reduce((acc, curr) => acc + (curr.avg_speed || 0), 0) / stats.length;
    const points = stats.reduce((acc, curr) => acc + (curr.point_count || 0), 0);
    return { dist, speed, points };
  }, [stats]);

  const chartData = useMemo(() => {
    return [...stats].reverse().map(s => ({
      ...s,
      distance_km: parseFloat((s.distance / 1000).toFixed(2)),
      name: s.date?.split('-').slice(1).join('/') // mm/dd format
    }));
  }, [stats]);

  // Extract vehicle image metadata
  const vehicleImage = getMetadataVal('vehiculo', null)?.image;
  const vehicleModel = getMetadataVal('vehiculo', null)?.modelo ?? vehSel?.modelo ?? 'Toyota';

  return (
    <div className="text-black h-[calc(100vh-172px)] flex flex-col gap-4 overflow-hidden p-2 relative">
      
      {/* Toast Notification */}
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
            <Smartphone className="text-brand-orange" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-black tracking-tight leading-none">Mi dispositivo</h1>
            <p className="text-xs font-semibold text-black/40 mt-1.5 flex items-center gap-1.5">
              {vehSel ? (
                <>
                  Diagnóstico y estado del hardware telemétrico de <span className="text-brand-orange font-bold uppercase">{vehSel.modelo} ({vehSel.placa})</span>
                </>
              ) : (
                'Información técnica, telemetría de hardware y vinculación del rastreador satelital'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {vehSel && (
            <button
              onClick={() => { setStep(1); setVehSel(null); setDeviceStatus(null); setStats([]); }}
              className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm shrink-0"
            >
              <ChevronLeft size={14} />
              Cambiar vehículo
            </button>
          )}
        </div>
      </div>

      {/* Step 2 Content Workspace */}
      <div className="flex-1 min-h-0 relative rounded-[32px] overflow-hidden border border-black/5 bg-[#f8f9fa] shadow-2xl flex flex-col">
        
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
                onClick={() => fetchDeviceData(vehSel.id)}
                className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Reintentar
              </button>
            </div>
          ) : !vehSel ? (
            // Background Placeholder
            <div className="w-full h-full bg-[#f1f3f5] flex items-center justify-center relative rounded-[24px]">
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `radial-gradient(circle, #000 10%, transparent 11%), radial-gradient(circle, #000 10%, transparent 11%)`,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 10px 10px'
              }} />
              <div className="flex flex-col items-center gap-2 text-center z-10 px-4">
                <Smartphone size={42} className="text-black/15 animate-pulse" />
                <p className="text-xs font-bold text-black/30 uppercase tracking-wider">Esperando selección de vehículo...</p>
              </div>
            </div>
          ) : loadingStatus ? (
            <div className="w-full h-full bg-[#f8f9fa] border border-black/5 rounded-[24px] flex flex-col items-center justify-center gap-3 shadow-inner">
              <Loader2 className="text-brand-orange animate-spin" size={32} />
              <p className="text-xs font-bold text-black/30 uppercase tracking-widest">Sincronizando estado y estadísticas del hardware...</p>
            </div>
          ) : (
            /* Split layout: 
               1. Left Column: 3D Scene View
               2. Middle Column: Datos Vehiculares details (switches + tachometer)
               3. Right Column: Estadísticas details */
            <>
              {/* Card 1: Left Column Stack (Vehicle Info Top, 3D Spline Bottom) */}
              <div className="w-[300px] h-full flex flex-col gap-4 shrink-0 min-h-0">
                
                {/* 1.1 Ficha del Vehículo Superior */}
                <div className="bg-white p-4.5 rounded-[24px] border border-black/5 shadow-sm flex flex-col gap-3 shrink-0">
                  <div className="flex items-center gap-2 border-b border-black/5 pb-2">
                    <Car className="text-brand-orange" size={15} />
                    <span className="text-[10px] font-black text-black uppercase tracking-wider">Unidad Vinculada</span>
                  </div>

                  <div className="flex flex-col gap-2 text-center items-center">
                    {vehicleImage ? (
                      <div className="w-full h-28 rounded-2xl overflow-hidden border border-black/5 bg-white flex items-center justify-center shadow-inner">
                        <img 
                          src={`${API_BASE}/uploads/vehiculos/${vehicleImage}`} 
                          alt={vehicleModel} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-28 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400">
                        <Car size={32} />
                      </div>
                    )}
                    <div className="mt-1">
                      <h4 className="text-xs font-black text-black uppercase leading-tight">{vehicleModel}</h4>
                      <p className="text-[9px] font-bold text-brand-orange bg-brand-orange/5 px-2 py-0.5 rounded border border-brand-orange/10 inline-block mt-1">
                        Placa: {vehSel?.placa}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 1.2 Elemento 3D Inferior (Reduced height & width) */}
                <div className="flex-1 bg-white border border-black/5 rounded-[24px] shadow-sm overflow-hidden relative min-h-[180px]">
                  <div className="absolute inset-0 z-0">
                    <Spline scene={townaceModel} />
                  </div>

                  {/* Overlays on 3D */}
                  <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5 pointer-events-none">
                    <div className="bg-black/90 backdrop-blur-xl px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
                      <Radio size={10} className="text-brand-orange shrink-0" />
                      <span className="text-[7px] font-black text-white uppercase tracking-wider">3D Live</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Middle Column - Datos Vehiculares details (now flex-1 with larger controls) */}
              <div className="flex-1 h-full bg-white p-5 rounded-[24px] border border-black/5 shadow-sm flex flex-col justify-between overflow-y-auto no-scrollbar">
                <div className="space-y-4">
                  
                  {/* RPM Digital Tachometer & Battery Level (Spacious layout) */}
                  <div className="flex items-center gap-5 bg-[#f8f9fa] p-4.5 rounded-2xl border border-black/5">
                    <RpmGauge rpm={getMetadataVal('rpm', 1000)} />

                    <div className="flex-1 space-y-3">
                      {/* Battery gauge */}
                      <div className="bg-white p-3 rounded-xl border border-black/5 shadow-sm">
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                          <Battery size={12} className="text-neutral-400" /> Batería Dispositivo
                        </span>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 h-2.5 bg-neutral-100 rounded-full border border-black/5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                getVal('battery', 85) < 30 ? 'bg-red-500' : 'bg-brand-orange'
                              }`} 
                              style={{ width: `${getVal('battery', 85)}%` }} 
                            />
                          </div>
                          <span className="text-xs font-black text-black">{getVal('battery', 85)}%</span>
                        </div>
                      </div>

                      {/* GSM Quality */}
                      <div className="bg-white p-3 rounded-xl border border-black/5 shadow-sm flex items-center justify-between">
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                          <Signal size={12} className="text-neutral-400" /> Intensidad de Señal
                        </span>
                        <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded tracking-wide">
                          {getVal('gsm_signal', null) !== null ? `${getVal('gsm_signal', 0)} dBm` : 'Excelente'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Technical data inputs (Larger typography and paddings) */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-black/40 uppercase tracking-widest block leading-none border-b border-black/5 pb-2">
                      Ficha de Parámetros Técnicos
                    </span>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-[9px] font-black text-black/40 uppercase tracking-wider block">ID Vehículo</label>
                        <input 
                          type="text" 
                          readOnly 
                          value={`#VEH-${getVal('vehicle_id', vehSel?.id)}`}
                          className="w-full bg-[#f8f9fa] border border-black/5 p-2.5 rounded-xl text-[11px] font-black text-black mt-1 focus:outline-none cursor-default"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-black/40 uppercase tracking-wider block">ID Dispositivo</label>
                        <input 
                          type="text" 
                          readOnly 
                          value={`#DEV-${getVal('device_id', 9)}`}
                          className="w-full bg-[#f8f9fa] border border-black/5 p-2.5 rounded-xl text-[11px] font-black text-black mt-1 focus:outline-none cursor-default"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-black/40 uppercase tracking-wider block">Último Reporte Telemétrico</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={fmtDate(getVal('last_connection', new Date().toISOString()))}
                        className="w-full bg-[#f8f9fa] border border-black/5 p-2.5 rounded-xl text-[11px] font-black text-black mt-1 focus:outline-none cursor-default"
                      />
                    </div>
                  </div>

                  {/* Toggle switches for Boolean attributes */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-black/40 uppercase tracking-widest block leading-none border-b border-black/5 pb-2">
                      Indicadores de Hardware
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <ToggleSwitch label="Online" checked={getVal('online', true)} />
                      <ToggleSwitch label="Ignición" checked={getVal('ignition', true)} />
                      <ToggleSwitch label="Botón Pánico" checked={getVal('panic_button', false)} />
                      <ToggleSwitch label="Alarma Activa" checked={getMetadataVal('alarma', false)} />
                      <ToggleSwitch label="Anomalía" checked={getMetadataVal('anomalia', false)} />
                      <ToggleSwitch label="Bloqueado" checked={getMetadataVal('bloqueado', false)} />
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="bg-brand-orange/5 p-3.5 rounded-2xl border border-brand-orange/10 flex items-start gap-3 shrink-0 mt-4">
                   <Info className="text-brand-orange shrink-0 mt-0.5" size={14} />
                   <div>
                     <p className="text-[9.5px] font-black text-brand-orange uppercase tracking-wider leading-none">Vinculación Localizadora</p>
                     <p className="text-[10px] text-neutral-500 font-semibold leading-relaxed mt-1">
                       El rastreador se encuentra enviando tramas correctas a través de los canales GPRS.
                     </p>
                   </div>
                </div>
              </div>

              {/* Card 3: Right Column - Estadísticas details (KPI cards + Recharts Area Chart) */}
              <div className="w-[380px] h-full bg-white p-4.5 rounded-[24px] border border-black/5 shadow-sm flex flex-col justify-between overflow-y-auto no-scrollbar shrink-0">
                <div className="space-y-4 flex-1 flex flex-col">
                  <div>
                    <h3 className="font-black text-[9px] text-black/40 uppercase tracking-widest leading-none border-b border-black/5 pb-1.5 mb-3">
                      Rendimiento Mensual
                    </h3>

                    {/* KPI metrics row */}
                    <div className="grid grid-cols-3 gap-2.5 mb-4">
                      <div className="bg-[#f8f9fa] border border-black/5 p-2.5 rounded-2xl flex flex-col items-center text-center">
                        <Ruler className="text-brand-orange mb-1" size={14} />
                        <span className="text-[7.5px] font-black text-neutral-400 uppercase tracking-wider">Recorrido</span>
                        <span className="text-xs font-black text-black mt-0.5">{totals.dist.toFixed(1)} km</span>
                      </div>

                      <div className="bg-[#f8f9fa] border border-black/5 p-2.5 rounded-2xl flex flex-col items-center text-center">
                        <Gauge className="text-blue-500 mb-1" size={14} />
                        <span className="text-[7.5px] font-black text-neutral-400 uppercase tracking-wider">Velocidad</span>
                        <span className="text-xs font-black text-black mt-0.5">{totals.speed.toFixed(1)} km/h</span>
                      </div>

                      <div className="bg-[#f8f9fa] border border-black/5 p-2.5 rounded-2xl flex flex-col items-center text-center">
                        <Zap className="text-emerald-500 mb-1" size={14} />
                        <span className="text-[7.5px] font-black text-neutral-400 uppercase tracking-wider">Muestras</span>
                        <span className="text-xs font-black text-black mt-0.5">{totals.points.toLocaleString()} pts</span>
                      </div>
                    </div>
                  </div>

                  {/* Recharts Area Chart */}
                  <div className="flex-1 bg-[#f8f9fa] border border-black/5 rounded-2xl p-3 flex flex-col justify-between min-h-[220px]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[8px] font-black text-black/50 uppercase tracking-wider">Kilometraje por Día</span>
                      <span className="text-[8px] font-bold text-brand-orange bg-brand-orange/5 px-2 py-0.5 rounded border border-brand-orange/10 uppercase">
                        Tendencia
                      </span>
                    </div>

                    <div className="flex-1 w-full relative min-h-0">
                      {chartData.length === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                          <TrendingUp size={24} className="text-neutral-300 mb-1 animate-pulse" />
                          <p className="text-[9px] font-bold text-neutral-400 uppercase">Sin registros históricos suficientes</p>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                            <defs>
                              <linearGradient id="colorDistance" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#F97316" stopOpacity={0.25}/>
                                <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                            <XAxis dataKey="name" tick={{ fontSize: 7, fontWeight: 'bold', fill: '#999' }} />
                            <YAxis tick={{ fontSize: 7, fontWeight: 'bold', fill: '#999' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area 
                              type="monotone" 
                              dataKey="distance_km" 
                              stroke="#F97316" 
                              strokeWidth={2} 
                              fillOpacity={1} 
                              fill="url(#colorDistance)" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Info Box */}
                <div className="bg-[#f8f9fa] border border-black/5 p-3 rounded-2xl flex gap-2 shrink-0 mt-3">
                  <TrendingUp className="text-neutral-400 shrink-0 mt-0.5" size={14} />
                  <p className="text-[9px] text-neutral-500 font-semibold leading-relaxed">
                    Las estadísticas muestran el comportamiento y actividad mensual. Estos datos ayudan al algoritmo de IA a predecir hábitos y alertar anomalías.
                  </p>
                </div>
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
                    <Smartphone className="text-brand-orange" size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-black leading-none">Seleccionar vehículo</h3>
                    <p className="text-neutral-500 text-xs font-semibold mt-1 leading-relaxed">
                      Para consultar el diagnóstico de hardware y la telemetría en tiempo real de su localizador satelital, por favor seleccione la unidad de su flota.
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
                        loading={loadingStatus && vehSel?.id === v.id}
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
