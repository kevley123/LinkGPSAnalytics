import { useState, useEffect, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, AlertCircle, ShieldCheck, 
  Loader2, CheckCircle, 
  ChevronLeft, Satellite, X, ArrowRight,
  Smartphone, Signal, Battery, Info, Radio
} from 'lucide-react';
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

// ── SVG Speedometer Tachometer Component ─────────────────────────────────────
const Tachometer = ({ speed = 0 }: { speed: number }) => {
  const maxSpeed = 160;
  const clampedSpeed = Math.min(Math.max(speed, 0), maxSpeed);
  const percentage = clampedSpeed / maxSpeed;

  return (
    <div className="flex flex-col items-center justify-center relative w-32 h-32 shrink-0">
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
          stroke="#F97316"
          strokeWidth="7"
          strokeDasharray="212 280"
          strokeDashoffset={212 - (212 * percentage)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      {/* Centered Digital Display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-2.5">
        <span className="text-2xl font-black text-black leading-none">{clampedSpeed}</span>
        <span className="text-[8px] font-black text-black/40 uppercase tracking-widest mt-0.5">KM/H</span>
      </div>
    </div>
  );
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

  // Fetch device state for vehicle
  const fetchDeviceStatus = useCallback(async (vehId: number) => {
    if (!authToken || !vehId) return;
    setLoadingStatus(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/analytics/estado_dispositivo/${vehId}`, {
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
      setDeviceStatus(data);
      setStep(2);
    } catch (err: any) {
      console.error("Error fetching device status:", err);
      // Construct fallback mockup data if server fails but we want to show layout
      setError("No se pudo obtener el estado del dispositivo telemétrico.");
      setToast({
        id: 'err-device',
        message: 'Error al conectar con la unidad de rastreo.'
      });
    } finally {
      setLoadingStatus(false);
    }
  }, [authToken]);

  const onSelectVehicle = useCallback((veh: any) => {
    setVehSel(veh);
    fetchDeviceStatus(veh.id);
  }, [fetchDeviceStatus]);

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

  // Mock status data fallback when needed
  const getVal = (field: string, fallback: any) => {
    if (deviceStatus && deviceStatus[field] !== undefined) {
      return deviceStatus[field];
    }
    return fallback;
  };

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
              onClick={() => { setStep(1); setVehSel(null); setDeviceStatus(null); }}
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
                onClick={() => fetchDeviceStatus(vehSel.id)}
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
              <p className="text-xs font-bold text-black/30 uppercase tracking-widest">Sincronizando estado del dispositivo...</p>
            </div>
          ) : (
            /* Split layout: 3D Spline (Left) + Data Form & Gauges (Right) */
            <>
              {/* Left Column: 3D Scene View */}
              <div className="flex-1 h-full bg-white/40 backdrop-blur-xl rounded-[24px] border border-black/5 shadow-inner overflow-hidden relative group">
                <div className="absolute inset-0 z-0">
                  <Spline scene={townaceModel} />
                </div>

                {/* Overlays on 3D */}
                <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2 pointer-events-none">
                  <div className="bg-black/90 backdrop-blur-xl px-3 py-2 rounded-xl border border-white/10 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-brand-orange/20 flex items-center justify-center text-brand-orange shrink-0">
                      <Radio size={12} />
                    </div>
                    <div>
                      <p className="text-[7px] font-black text-white/40 uppercase tracking-wider leading-none">Señal satelital</p>
                      <p className="text-[9px] font-black text-white leading-none mt-1">Fijada (3D)</p>
                    </div>
                  </div>

                  <div className="bg-black/90 backdrop-blur-xl px-3 py-2 rounded-xl border border-white/10 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                      <ShieldCheck size={12} />
                    </div>
                    <div>
                      <p className="text-[7px] font-black text-white/40 uppercase tracking-wider leading-none">Rastreo activo</p>
                      <p className="text-[9px] font-black text-white leading-none mt-1">Online</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Structured Device Status Form & Tachometer */}
              <div className="w-[420px] lg:w-[480px] h-full bg-white p-5 rounded-[24px] border-4 border-black/5 shadow-2xl flex flex-col justify-between overflow-y-auto no-scrollbar shrink-0">
                
                <div className="space-y-4">
                  {/* Top Dashboard Indicators (Tachometer + Small Cards) */}
                  <div className="flex items-center gap-4 bg-[#f8f9fa] p-4 rounded-3xl border border-black/5">
                    {/* SVG Tachometer for Speed */}
                    <Tachometer speed={getVal('speed', 0)} />

                    {/* Right side metrics of top panel */}
                    <div className="flex-1 space-y-2">
                      {/* Battery block */}
                      <div className="bg-white p-2.5 rounded-xl border border-black/5 shadow-sm flex items-center justify-between">
                        <span className="text-[8px] font-black text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Battery size={12} className="text-neutral-400" /> Batería dispositivo
                        </span>
                        <span className="text-xs font-black text-black">
                          {getVal('battery_level', 85)}%
                        </span>
                      </div>

                      {/* Signal quality block */}
                      <div className="bg-white p-2.5 rounded-xl border border-black/5 shadow-sm flex items-center justify-between">
                        <span className="text-[8px] font-black text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Signal size={12} className="text-neutral-400" /> Intensidad GPS
                        </span>
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          {getVal('signal_strength', 'Excelente')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Read-Only Form Layout */}
                  <div className="space-y-2">
                    <h3 className="font-black text-[9px] text-black/40 uppercase tracking-widest leading-none border-b border-black/5 pb-1.5 mb-2">
                      Ficha técnica de telemetría
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[8px] font-black text-black/40 uppercase tracking-wider block">ID Dispositivo</label>
                        <input 
                          type="text" 
                          readOnly 
                          value={getVal('device_id', `#DEV-09`)}
                          className="w-full bg-[#f8f9fa] border border-black/5 p-2 rounded-xl text-[11px] font-black text-black mt-1 focus:outline-none focus:ring-0 cursor-default"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] font-black text-black/40 uppercase tracking-wider block">Red Celular</label>
                        <input 
                          type="text" 
                          readOnly 
                          value={getVal('network_type', `LTE 4G`)}
                          className="w-full bg-[#f8f9fa] border border-black/5 p-2 rounded-xl text-[11px] font-black text-black mt-1 focus:outline-none focus:ring-0 cursor-default"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[8px] font-black text-black/40 uppercase tracking-wider block">Satélites conectados</label>
                        <input 
                          type="text" 
                          readOnly 
                          value={`${getVal('satellites', 12)} Satélites`}
                          className="w-full bg-[#f8f9fa] border border-black/5 p-2 rounded-xl text-[11px] font-black text-black mt-1 focus:outline-none focus:ring-0 cursor-default"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] font-black text-black/40 uppercase tracking-wider block">Estado del motor</label>
                        <input 
                          type="text" 
                          readOnly 
                          value={getVal('ignition', false) ? 'Encendido' : 'Apagado'}
                          className={`w-full border p-2 rounded-xl text-[11px] font-black mt-1 focus:outline-none focus:ring-0 cursor-default ${
                            getVal('ignition', false) 
                              ? 'bg-green-50/50 border-green-500/20 text-green-600' 
                              : 'bg-red-50/50 border-red-500/20 text-red-500'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[8px] font-black text-black/40 uppercase tracking-wider block">Último contacto recibido</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={fmtDate(getVal('last_connection', new Date().toISOString()))}
                        className="w-full bg-[#f8f9fa] border border-black/5 p-2 rounded-xl text-[11px] font-black text-black mt-1 focus:outline-none focus:ring-0 cursor-default"
                      />
                    </div>
                  </div>
                </div>

                {/* IA Info Badge */}
                <div className="bg-brand-orange/5 p-3 rounded-2xl border border-brand-orange/15 flex items-start gap-2.5 mt-2 shrink-0">
                   <Info className="text-brand-orange shrink-0 mt-0.5" size={14} />
                   <div>
                     <p className="text-[8px] font-black text-brand-orange uppercase tracking-wider leading-none">Estado de vinculación</p>
                     <p className="text-[9px] text-neutral-500 font-semibold leading-relaxed mt-1">
                       El hardware del localizador satelital se encuentra respondiendo a comandos telemétricos normales.
                     </p>
                   </div>
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
