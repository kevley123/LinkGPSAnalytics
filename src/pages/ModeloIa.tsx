import { useState, useEffect, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Sparkles, Cpu, Satellite, ChevronLeft, 
  Loader2, CheckCircle, AlertCircle, X, ArrowRight, 
  Database, Play, Car
} from 'lucide-react';
import agenteAlertaIcon from '../assets/agente_alerta.png';
import { useAppContext } from '../context/AppContext';
import { env } from '../config/env';

const API_BASE = env.API_BASE_URL;

interface Toast {
  id: string;
  message: string;
}

// ── Typewriter Text Component ───────────────────────────────────────────────
const TypewriterText = memo(({ text, speed = 25 }: { text: string; speed?: number }) => {
  const [displayed, setDisplayed] = useState('');
  
  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return <>{displayed}</>;
});

// ── Vehicle Selection Chip ───────────────────────────────────────────────────
const VehicleChip = memo(({ veh, selected, onSelect, loading }: any) => (
  <button
    onClick={() => !loading && onSelect(veh)}
    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left
      ${selected 
        ? 'bg-brand-orange/10 border-brand-orange shadow-md' 
        : 'bg-white hover:bg-black/[0.02] border-black/5'
      }`}
  >
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

// ── Training Progress Modal ──────────────────────────────────────────────────
const ModalTraining = memo(({ status, taskId, successResult, onClose }: any) => {
  const isSuccess = status === 'SUCCESS';
  
  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Non-clickable background mask */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />

      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-md bg-white rounded-[32px] overflow-hidden border border-black/5 shadow-[0_32px_80px_rgba(0,0,0,0.3)] z-10"
      >
        {isSuccess ? (
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 flex flex-col items-center text-center gap-4 text-white">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border border-white/30 relative">
              <CheckCircle size={36} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/80 uppercase tracking-[0.15em] mb-1">Algoritmo Optimizado</p>
              <h3 className="text-xl font-black">¡Entrenamiento Completado!</h3>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-brand-orange to-amber-600 p-8 flex flex-col items-center text-center gap-4 text-white">
            <div className="w-16 h-16 rounded-full bg-white/25 flex items-center justify-center border border-white/30 relative">
              <Loader2 size={32} className="text-white animate-spin" />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/80 uppercase tracking-[0.15em] mb-1">Machine Learning Pipeline</p>
              <h3 className="text-xl font-black">Entrenando Modelo IA...</h3>
            </div>
          </div>
        )}

        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="bg-[#f8f9fa] border border-black/5 p-3 rounded-xl">
              <span className="text-[7.5px] font-black text-neutral-400 uppercase tracking-wider block">ID de Tarea (Task)</span>
              <span className="text-[10.5px] font-mono font-bold text-black select-all break-all">{taskId || '—'}</span>
            </div>

            <div className="bg-[#f8f9fa] border border-black/5 p-3 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[7.5px] font-black text-neutral-400 uppercase tracking-wider block">Estado del Proceso</span>
                <span className="text-[11px] font-black text-black uppercase mt-0.5 block">{status}</span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[8.5px] font-black uppercase tracking-wider ${
                isSuccess 
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                  : 'bg-amber-100 text-amber-700 border border-amber-200 animate-pulse'
              }`}>
                {isSuccess ? 'Completado' : 'Procesando'}
              </span>
            </div>

            {isSuccess && successResult && (
              <div className="bg-[#f8f9fa] border border-black/5 p-3 rounded-xl space-y-2">
                <div>
                  <span className="text-[7.5px] font-black text-neutral-400 uppercase tracking-wider block">Ruta del Archivo (.pkl)</span>
                  <span className="text-[9.5px] font-mono text-neutral-600 break-all select-all block mt-0.5">{successResult.model_path}</span>
                </div>
                <div>
                  <span className="text-[7.5px] font-black text-neutral-400 uppercase tracking-wider block">Dispositivo Asociado</span>
                  <span className="text-[10px] font-bold text-neutral-800 block">ID #{successResult.device_id}</span>
                </div>
              </div>
            )}
          </div>

          {isSuccess ? (
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-black hover:bg-neutral-800 text-white font-black text-xs transition-all shadow-md mt-2"
            >
              Cerrar y Actualizar
            </button>
          ) : (
            <p className="text-center text-[9px] font-bold text-neutral-400 uppercase tracking-widest py-1">
              No cierre la ventana. La IA está procesando la telemetría...
            </p>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
});

export default function ModeloIA() {
  const { authToken } = useAppContext();
  
  const [step, setStep] = useState(1);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [vehSel, setVehSel] = useState<any>(null);

  // GET responses
  const [summaryData, setSummaryData] = useState<any>(null);
  const [deviceData, setDeviceData] = useState<any>(null);

  const [loadingVeh, setLoadingVeh] = useState(true);
  const [loadingML, setLoadingML] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [toast, setToast] = useState<Toast | null>(null);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  // Training Task States
  const [trainingActive, setTrainingActive] = useState(false);
  const [trainingStatus, setTrainingStatus] = useState<string>('PENDING');
  const [trainingTaskId, setTrainingTaskId] = useState<string | null>(null);
  const [trainingResult, setTrainingResult] = useState<any>(null);

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
        const dataVeh = await res.json();
        setVehicles(Array.isArray(dataVeh) ? dataVeh : (dataVeh.vehiculos ?? []));
      } catch (e) {
        console.error('Fetch vehicles error:', e);
      } finally {
        setLoadingVeh(false);
      }
    };
    fetchVehicles();
  }, [authToken]);

  // Fetch Summary data & Device Technical state (2 GET requests)
  const fetchVehicleDetails = useCallback(async (vehId: number) => {
    if (!authToken || !vehId) return;
    setLoadingML(true);
    setError(null);
    try {
      // Execute 2 GET requests concurrently
      const [summaryRes, deviceRes] = await Promise.all([
        fetch(`${API_BASE}/api/analytics/ml/vehicles/${vehId}/summary`, {
          headers: { 'Authorization': `Bearer ${authToken}`, 'Accept': 'application/json' }
        }),
        fetch(`${API_BASE}/api/analytics/estado_dispositivo/${vehId}`, {
          headers: { 'Authorization': `Bearer ${authToken}`, 'Accept': 'application/json' }
        })
      ]);

      if (summaryRes.status === 403 || deviceRes.status === 403) {
        setErrorModal('No tienes permiso para usar Analytics o no tienes un servicio activo.');
        return;
      }

      if (!summaryRes.ok) throw new Error(`Error Summary: ${summaryRes.status}`);
      if (!deviceRes.ok) throw new Error(`Error Device Status: ${deviceRes.status}`);

      const summaryVal = await summaryRes.json();
      const deviceVal = await deviceRes.json();

      setSummaryData(summaryVal);
      setDeviceData(deviceVal);
      setStep(2);
    } catch (err: any) {
      console.error("Error fetching vehicle details:", err);
      setError("No se pudieron cargar los datos de inteligencia artificial del vehículo.");
      setToast({
        id: 'err-get',
        message: 'Fallo al sincronizar datos del servidor de IA.'
      });
    } finally {
      setLoadingML(false);
    }
  }, [authToken]);

  const onSelectVehicle = useCallback((veh: any) => {
    setVehSel(veh);
    fetchVehicleDetails(veh.id);
  }, [fetchVehicleDetails]);

  // Handle Training submission (POST)
  const handleTrainModel = async (days: number) => {
    if (!authToken || !vehSel) return;
    
    setTrainingStatus('queued');
    setTrainingTaskId(null);
    setTrainingResult(null);
    setTrainingActive(true);

    try {
      const res = await fetch(`${API_BASE}/api/analytics/ml/vehicles/${vehSel.id}/train?days=${days}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ days })
      });

      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const dataTask = await res.json();
      
      if (dataTask.task_id) {
        setTrainingTaskId(dataTask.task_id);
        setTrainingStatus(dataTask.status || 'PENDING');
      } else {
        throw new Error("No se obtuvo el ID de la tarea de entrenamiento.");
      }
    } catch (err) {
      console.error("Training trigger error:", err);
      setTrainingActive(false);
      setToast({
        id: 'train-err',
        message: 'No se pudo iniciar el entrenamiento del modelo.'
      });
    }
  };

  // Poll status every 3 seconds while training is active
  useEffect(() => {
    if (!trainingActive || !trainingTaskId || !authToken) return;

    let timer: any;
    const checkStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/analytics/ml/tasks/${trainingTaskId}/status`, {
          headers: { 
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json'
          }
        });
        if (!res.ok) throw new Error(`Status check error: ${res.status}`);
        const dataStatus = await res.json();

        setTrainingStatus(dataStatus.status);

        if (dataStatus.status === 'SUCCESS') {
          setTrainingResult(dataStatus.result);
          setToast({
            id: 'train-ok',
            message: '¡Modelo de Inteligencia Artificial entrenado correctamente!'
          });
          // Note: we keep trainingActive true until they click "Cerrar" to read the output
        } else if (dataStatus.status === 'FAILURE') {
          setTrainingActive(false);
          setToast({
            id: 'train-fail',
            message: 'El entrenamiento falló en el servidor.'
          });
        } else {
          // Re-trigger loop
          timer = setTimeout(checkStatus, 3000);
        }
      } catch (err) {
        console.error("Polling error:", err);
        // Retry anyway
        timer = setTimeout(checkStatus, 3000);
      }
    };

    timer = setTimeout(checkStatus, 3000);

    return () => clearTimeout(timer);
  }, [trainingActive, trainingTaskId, authToken]);

  // Clean-up and refresh after training finished
  const handleCloseTrainingModal = () => {
    setTrainingActive(false);
    setTrainingTaskId(null);
    setTrainingResult(null);
    if (vehSel) {
      fetchVehicleDetails(vehSel.id);
    }
  };

  // Auto closing toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Utility date formatting
  const fmtDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleString('es-BO', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
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
              <CheckCircle className="text-emerald-400 shrink-0" size={18} />
              <p className="text-xs font-bold leading-normal">{toast.message}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Header Panel */}
      <div className="flex items-center justify-between gap-4 px-2 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center border border-brand-orange/20">
            <Brain className="text-brand-orange" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-black tracking-tight leading-none">Motor de IA</h1>
            <p className="text-xs font-semibold text-black/40 mt-1.5 flex items-center gap-1.5">
              {vehSel ? (
                <>
                  Entrenamiento y estadísticas de Machine Learning para <span className="text-brand-orange font-bold uppercase">{vehSel.modelo} ({vehSel.placa})</span>
                </>
              ) : (
                'Entrenamiento del algoritmo de detección de anomalías y optimización del IsolationForest'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {vehSel && (
            <button
              onClick={() => { setStep(1); setVehSel(null); setSummaryData(null); setDeviceData(null); }}
              className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm shrink-0"
            >
              <ChevronLeft size={14} />
              Cambiar vehículo
            </button>
          )}
        </div>
      </div>

      {/* Workspace Panel */}
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
                onClick={() => fetchVehicleDetails(vehSel.id)}
                className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Reintentar
              </button>
            </div>
          ) : !vehSel ? (
            // Step 1: waiting select placeholder
            <div className="w-full h-full bg-[#f1f3f5] flex items-center justify-center relative rounded-[24px]">
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `radial-gradient(circle, #000 10%, transparent 11%), radial-gradient(circle, #000 10%, transparent 11%)`,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 10px 10px'
              }} />
              <div className="flex flex-col items-center gap-2 text-center z-10 px-4">
                <Brain size={42} className="text-black/15 animate-pulse" />
                <p className="text-xs font-bold text-black/30 uppercase tracking-wider">Esperando selección de vehículo...</p>
              </div>
            </div>
          ) : loadingML ? (
            <div className="w-full h-full bg-[#f8f9fa] border border-black/5 rounded-[24px] flex flex-col items-center justify-center gap-3 shadow-inner">
              <Loader2 className="text-brand-orange animate-spin" size={32} />
              <p className="text-xs font-bold text-black/30 uppercase tracking-widest">Sincronizando modelos de IA del dispositivo...</p>
            </div>
          ) : (
            /* Step 2 layout: 3 Cards */
            <>
              {/* Card 1: AI Summary (Left) */}
              <div className="w-[360px] h-full bg-white p-5 rounded-[24px] border border-black/5 shadow-sm flex flex-col justify-between overflow-y-auto no-scrollbar shrink-0">
                <div className="space-y-5">
                  {/* Large Brain Icon */}
                  <div className="flex flex-col items-center text-center p-4 bg-brand-orange/5 rounded-2xl border border-brand-orange/10 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-brand-orange/10 rounded-full blur-xl pointer-events-none" />
                    <motion.div 
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md text-brand-orange border border-brand-orange/20"
                    >
                      <Brain size={30} />
                    </motion.div>
                    <h3 className="text-sm font-black text-black uppercase tracking-tight mt-3">Resumen de Diagnóstico</h3>
                    <p className="text-[10px] font-black text-brand-orange uppercase tracking-wider mt-1">Dispositivo ID: #{summaryData?.device_id || '—'}</p>
                  </div>

                  {/* Summary lists */}
                  <div className="space-y-3.5">
                    <span className="text-[9.5px] font-black text-black/40 uppercase tracking-widest block leading-none border-b border-black/5 pb-2">
                      Estadísticas de IA
                    </span>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center bg-[#f8f9fa] p-2.5 rounded-xl border border-black/5">
                        <span className="text-[10px] font-black text-neutral-500 uppercase">Horas Analizadas</span>
                        <span className="text-xs font-black text-black">{summaryData?.period_hours ?? 0} hrs</span>
                      </div>
                      <div className="flex justify-between items-center bg-[#f8f9fa] p-2.5 rounded-xl border border-black/5">
                        <span className="text-[10px] font-black text-neutral-500 uppercase">Puntos Totales</span>
                        <span className="text-xs font-black text-black">{summaryData?.total_points ?? 0}</span>
                      </div>
                      <div className="flex justify-between items-center bg-[#f8f9fa] p-2.5 rounded-xl border border-black/5">
                        <span className="text-[10px] font-black text-neutral-500 uppercase">Anomalías Detectadas</span>
                        <span className="text-xs font-black text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">{summaryData?.anomaly_count ?? 0}</span>
                      </div>
                      <div className="flex justify-between items-center bg-[#f8f9fa] p-2.5 rounded-xl border border-black/5">
                        <span className="text-[10px] font-black text-neutral-500 uppercase">Tasa de Anomalías</span>
                        <span className="text-xs font-black text-black">{summaryData?.anomaly_rate ? `${(summaryData.anomaly_rate * 100).toFixed(2)}%` : '0%'}</span>
                      </div>
                    </div>

                    <span className="text-[9.5px] font-black text-black/40 uppercase tracking-widest block leading-none border-b border-black/5 pb-2">
                      Perfil del Modelo
                    </span>
                    {summaryData?.model ? (
                      <div className="space-y-2 bg-neutral-50 border border-black/5 p-3.5 rounded-xl">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-neutral-400 uppercase">Tipo Algoritmo</span>
                          <span className="text-[10px] font-black text-brand-orange">{summaryData.model.type}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-neutral-400 uppercase">Entrenado desde</span>
                          <span className="text-[10px] font-bold text-neutral-700">{summaryData.model.trained_from}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-neutral-400 uppercase">Hasta</span>
                          <span className="text-[10px] font-bold text-neutral-700">{summaryData.model.trained_to}</span>
                        </div>
                        <div className="w-full h-px bg-black/5 my-1" />
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-neutral-400 uppercase">Creado en</span>
                          <span className="text-[9px] font-bold text-neutral-500 mt-0.5">{fmtDate(summaryData.model.created_at)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center rounded-xl bg-neutral-50 border border-dashed border-neutral-200">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase">Sin modelo entrenado</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Risk Distribution block */}
                {summaryData?.risk_distribution && (
                  <div className="bg-[#f8f9fa] border border-black/5 p-3.5 rounded-2xl space-y-2 shrink-0 mt-3">
                    <span className="text-[8.5px] font-black text-neutral-400 uppercase tracking-wider block">Distribución del Riesgo</span>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-1.5 rounded-lg bg-emerald-50 border border-emerald-100/50">
                        <span className="text-[8px] font-black text-emerald-700 uppercase block">Bajo</span>
                        <span className="text-[11px] font-black text-emerald-600 mt-0.5 block">{summaryData.risk_distribution.low ?? 0}</span>
                      </div>
                      <div className="text-center p-1.5 rounded-lg bg-amber-50 border border-amber-100/50">
                        <span className="text-[8px] font-black text-amber-700 uppercase block">Medio</span>
                        <span className="text-[11px] font-black text-amber-600 mt-0.5 block">{summaryData.risk_distribution.medium ?? 0}</span>
                      </div>
                      <div className="text-center p-1.5 rounded-lg bg-red-50 border border-red-100/50">
                        <span className="text-[8px] font-black text-red-700 uppercase block">Alto</span>
                        <span className="text-[11px] font-black text-red-600 mt-0.5 block">{summaryData.risk_distribution.high ?? 0}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Card 2: Chatbot explanation (Middle) */}
              <div className="flex-1 h-full bg-white p-5 rounded-[24px] border border-black/5 shadow-sm flex flex-col justify-between overflow-y-auto no-scrollbar min-w-[280px]">
                <div className="flex flex-col gap-3.5 items-center justify-between min-h-0 h-full">
                  <div className="flex items-center gap-3 w-full border-b border-black/5 pb-3 shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-brand-orange/20 bg-white flex items-center justify-center shadow-md relative shrink-0">
                      <img src={agenteAlertaIcon} alt="Agente Alerta" className="w-9 h-9 object-contain" />
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse animate-duration-1000"></span>
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-black text-black tracking-tight leading-none">Agente Alerta [IA]</h3>
                      <span className="text-[8px] font-black text-brand-orange uppercase tracking-wider block mt-1.5">Soporte Operacional</span>
                    </div>
                  </div>

                  {/* Speech Bubble Container */}
                  <div className="w-full flex-1 flex flex-col justify-center min-h-0">
                    <div className="relative bg-brand-orange/5 border border-brand-orange/10 p-5 rounded-2xl shadow-sm flex flex-col gap-2.5 overflow-y-auto no-scrollbar max-h-full">
                      {/* Speech bubble pointer */}
                      <div className="absolute top-[-6px] left-[32px] w-3 h-3 bg-[#fef6f0] border-t border-l border-brand-orange/10 rotate-45"></div>

                      <p className="text-sm font-bold text-neutral-800 leading-relaxed italic text-left">
                        <TypewriterText text="El entrenamiento automatizado optimiza los límites de detección del algoritmo Isolation Forest. Este algoritmo analiza el dataset histórico (parámetros como latitud, longitud, velocidad, horas de reporte y tiempos de inactividad) para identificar desvíos de la conducta rutinaria que representen posibles anomalías o situaciones críticas." />
                      </p>
                    </div>
                  </div>

                  {/* Bottom Static Badge */}
                  <div className="bg-[#f8f9fa] border border-black/5 p-3 rounded-2xl flex items-center gap-2.5 w-full shrink-0">
                    <div className="w-8 h-8 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange shrink-0">
                      <Cpu size={14} />
                    </div>
                    <div>
                      <p className="text-[8.5px] font-black text-black uppercase tracking-wider leading-none">Isolation Forest Engine</p>
                      <p className="text-[9.5px] text-neutral-500 font-semibold mt-1">Supervisión no supervisada de anomalías de movimiento.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Training actions/buttons (Right) */}
              <div className="w-[360px] h-full bg-white p-5 rounded-[24px] border border-black/5 shadow-sm flex flex-col justify-between overflow-y-auto no-scrollbar shrink-0">
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-black/40 uppercase tracking-widest block leading-none border-b border-black/5 pb-2">
                    Acciones de Modelado
                  </span>

                  <div className="bg-brand-orange/5 p-4 rounded-2xl border border-brand-orange/10 space-y-2">
                    <h4 className="text-xs font-black text-brand-orange uppercase leading-none">Dataset Histórico</h4>
                    <p className="text-[10px] font-semibold text-neutral-600 leading-relaxed">
                      Selecciona el período de recolección de telemetría GPS para recalibrar el Isolation Forest. Períodos mayores capturan más hábitos semanales.
                    </p>
                  </div>

                  {/* Period buttons */}
                  <div className="space-y-3 pt-2">
                    {/* Button 1: 30 days */}
                    <button
                      onClick={() => handleTrainModel(30)}
                      className="w-full bg-black hover:bg-neutral-800 text-white p-4.5 rounded-2xl font-black text-xs transition-all shadow-md flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-brand-orange group-hover:scale-105 transition-transform">
                          <Play size={14} />
                        </div>
                        <div className="text-left">
                          <p className="text-[8px] font-black text-white/50 uppercase tracking-wider leading-none">Optimización Básica</p>
                          <p className="text-[11px] font-black mt-1 uppercase">Entrenar (30 Días)</p>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </button>

                    {/* Button 2: 60 days */}
                    <button
                      onClick={() => handleTrainModel(60)}
                      className="w-full bg-gradient-to-r from-brand-orange to-amber-600 text-white p-4.5 rounded-2xl font-black text-xs transition-all shadow-md flex items-center justify-between group border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                          <Cpu size={14} />
                        </div>
                        <div className="text-left">
                          <p className="text-[8px] font-black text-white/70 uppercase tracking-wider leading-none">Entrenamiento Medio</p>
                          <p className="text-[11px] font-black mt-1 uppercase">Entrenar (60 Días)</p>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-white/75 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </button>

                    {/* Button 3: 90 days */}
                    <button
                      onClick={() => handleTrainModel(90)}
                      className="w-full bg-gradient-to-r from-brand-orange/90 to-red-600 text-white p-4.5 rounded-2xl font-black text-xs transition-all shadow-md flex items-center justify-between group border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-red-200 group-hover:scale-105 transition-transform">
                          <Sparkles size={14} />
                        </div>
                        <div className="text-left">
                          <p className="text-[8px] font-black text-white/70 uppercase tracking-wider leading-none">Entrenamiento Extendido</p>
                          <p className="text-[11px] font-black mt-1 uppercase">Entrenar (90 Días)</p>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-white/75 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </button>
                  </div>
                </div>

                {/* Status indicator bottom */}
                <div className="space-y-2 mt-4 shrink-0">
                  <div className="bg-[#f8f9fa] border border-black/5 p-3 rounded-xl flex items-center gap-3">
                    <Database className="text-neutral-400" size={15} />
                    <div>
                      <span className="text-[7.5px] font-black text-neutral-400 uppercase tracking-wider block">Último Entrenamiento</span>
                      <span className="text-[9.5px] font-bold text-neutral-800 block">
                        {summaryData?.model?.created_at ? new Date(summaryData.model.created_at).toLocaleDateString() : 'Ninguno registrado'}
                      </span>
                    </div>
                  </div>

                  {deviceData && (
                    <div className="bg-[#f8f9fa] border border-black/5 p-3 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Cpu className="text-neutral-400" size={15} />
                        <div>
                          <span className="text-[7.5px] font-black text-neutral-400 uppercase tracking-wider block">Telemetría Online</span>
                          <span className="text-[9.5px] font-bold text-neutral-800 block">
                            {deviceData.online ? '🟢 En Línea' : '🔴 Fuera de Línea'}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                        deviceData.ignition ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                      }`}>
                        {deviceData.ignition ? 'Ignición' : 'Apagado'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* STEP 1: Vehicle Selection Dialog overlay with Agent speech bubble */}
        <AnimatePresence>
          {step === 1 && (
            <div className="absolute inset-0 z-[1001] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                className="bg-white border-4 border-black/5 rounded-[32px] p-6 max-w-3xl w-full shadow-2xl flex flex-col md:flex-row gap-6 overflow-hidden max-h-[90%]"
              >
                {/* Left Side: Agent Alerta with styled bubble explaining the logic */}
                <div className="md:w-[320px] flex flex-col items-center justify-center text-center gap-4 bg-brand-orange/5 p-6 rounded-2xl border border-brand-orange/10 shrink-0">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-brand-orange/20 bg-white flex items-center justify-center shadow-md relative">
                    <img src={agenteAlertaIcon} alt="Agente Alerta" className="w-16 h-16 object-contain" />
                    <span className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full animate-pulse"></span>
                  </div>
                  
                  {/* Styled speech bubble with Typewriter Text animation */}
                  <div className="relative bg-white border border-black/5 p-5 rounded-2xl shadow-sm">
                    {/* speech bubble triangle */}
                    <div className="absolute top-[-6px] left-[50%] translate-x-[-50%] w-3.5 h-3.5 bg-white border-t border-l border-black/5 rotate-45"></div>
                    <span className="text-[10px] font-black text-brand-orange uppercase tracking-wider block leading-none mb-2.5">Agente Alerta [IA]</span>
                    <p className="text-sm font-bold text-neutral-800 leading-normal italic text-center">
                      <TypewriterText text="Hola. Desde este panel del motor de IA podrás reentrenar y parametrizar los modelos matemáticos que detectan desvíos operativos, robos o anomalías en la telemetría." />
                    </p>
                  </div>
                </div>

                {/* Right Side: Vehicle List Selection */}
                <div className="flex-1 flex flex-col gap-3 min-w-0">
                  <div>
                    <h3 className="text-base font-black text-black leading-none">Seleccionar vehículo</h3>
                    <p className="text-neutral-400 text-[10px] font-semibold mt-1">
                      Escoja la unidad de su flota que desea programar y reentrenar a continuación.
                    </p>
                  </div>

                  <div className="border-t border-black/5 pt-3 flex-1 overflow-y-auto no-scrollbar space-y-2 max-h-[300px]">
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
                           loading={loadingML && vehSel?.id === v.id}
                           onSelect={onSelectVehicle}
                        />
                      ))
                    )}
                  </div>
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

      {/* Non-closable Training Progress Overlay Modal */}
      <AnimatePresence>
        {trainingActive && (
          <ModalTraining
            status={trainingStatus}
            taskId={trainingTaskId}
            successResult={trainingResult}
            onClose={handleCloseTrainingModal}
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
