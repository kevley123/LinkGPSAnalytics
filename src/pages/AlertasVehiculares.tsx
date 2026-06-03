import { useState, useEffect, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, AlertCircle, ShieldCheck, 
  Loader2, Bell, CheckCircle, 
  ChevronLeft, ChevronRight, Satellite, X, ArrowRight
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { env } from '../config/env';

const API_BASE = env.API_BASE_URL;

interface Toast {
  id: string;
  message: string;
}

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

export default function AlertasVehiculares() {
  const { authToken } = useAppContext();
  
  const [step, setStep] = useState(1);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [vehSel, setVehSel] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [loadingVeh, setLoadingVeh] = useState(true);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [resolvingIds, setResolvingIds] = useState<number[]>([]);
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

  // Fetch alerts for selected vehicle
  const fetchVehicleAlerts = useCallback(async (vehId: number) => {
    if (!authToken || !vehId) return;
    setLoadingAlerts(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/analytics/alertas/${vehId}`, {
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
      setAlerts(Array.isArray(data) ? data : (data.alerts ?? data.results ?? []));
      setCurrentPage(1);
      setStep(2);
    } catch (err: any) {
      console.error("Error fetching vehicle alerts:", err);
      setError("No se pudieron cargar las alertas de esta unidad.");
    } finally {
      setLoadingAlerts(false);
    }
  }, [authToken]);

  // Trigger when a vehicle is chosen
  const onSelectVehicle = useCallback((veh: any) => {
    setVehSel(veh);
    fetchVehicleAlerts(veh.id);
  }, [fetchVehicleAlerts]);

  // Toast auto closure timer
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Resolve alert
  const handleResolveAlert = async (alertId: number) => {
    if (!authToken || resolvingIds.includes(alertId)) return;
    
    setResolvingIds(prev => [...prev, alertId]);
    try {
      const res = await fetch(`${API_BASE}/api/analytics/alertas/${alertId}/resolve`, {
        headers: { 
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json'
        }
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data = await res.json();

      if (data.resolved === true || data.success === true) {
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId ? { ...alert, resolved: true } : alert
        ));
        
        setToast({
          id: String(alertId),
          message: `Alerta #${alertId} resuelta satisfactoriamente.`
        });
      } else {
        throw new Error("Operación no completada.");
      }
    } catch (err: any) {
      console.error("Resolve alert error:", err);
      setToast({
        id: `err-${alertId}`,
        message: "No se pudo resolver la alerta. Inténtalo más tarde."
      });
    } finally {
      setResolvingIds(prev => prev.filter(id => id !== alertId));
    }
  };

  const fmtDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('es-BO', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return '—';
    }
  };

  const cleanMessage = (msg: string) => {
    if (!msg) return '';
    return msg.replace(/Anomal\?\?a/g, 'Anomalía').replace(/anomal\?\?a/g, 'anomalía');
  };

  const unresolvedCount = alerts.filter(a => !a.resolved).length;
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(alerts.length / ITEMS_PER_PAGE);
  const paginatedAlerts = alerts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="text-black h-[calc(100vh-172px)] flex flex-col gap-4 overflow-hidden p-2 relative">
      
      {/* Top Floating Toast Notification */}
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
            <Bell className="text-brand-orange" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-black tracking-tight leading-none">Alertas vehiculares</h1>
            <p className="text-xs font-semibold text-black/40 mt-1.5 flex items-center gap-1.5">
              {vehSel ? (
                <>
                  Historial de alertas activas para <span className="text-brand-orange font-bold uppercase">{vehSel.modelo} ({vehSel.placa})</span>
                </>
              ) : (
                'Monitoreo y respuesta de eventos de seguridad en tiempo real'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {vehSel && alerts.length > 0 && (
            <div className="bg-white border border-black/5 px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm text-xs font-bold shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
              <span className="text-[10px] font-black text-black uppercase tracking-wider">
                {unresolvedCount} Activas
              </span>
            </div>
          )}

          {vehSel && (
            <button
              onClick={() => { setStep(1); setVehSel(null); setAlerts([]); }}
              className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm shrink-0"
            >
              <ChevronLeft size={14} />
              Cambiar vehículo
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive view area */}
      <div className="flex-1 min-h-0 relative rounded-[32px] overflow-hidden border border-black/5 bg-[#f8f9fa] shadow-2xl flex flex-col">
        
        {/* Step 2 Content: Alert Cards or Placeholders */}
        <div className="w-full h-full p-4 relative flex-1">
          {error ? (
            <div className="w-full h-full bg-white border-4 border-black/5 rounded-[24px] flex flex-col items-center justify-center gap-4 p-8 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
                <AlertCircle className="text-red-500" size={28} />
              </div>
              <div className="text-center max-w-sm">
                <h3 className="text-sm font-black text-black">Ocurrió un error</h3>
                <p className="text-neutral-500 text-xs mt-1 leading-relaxed">{error}</p>
              </div>
              <button 
                onClick={() => fetchVehicleAlerts(vehSel.id)}
                className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Reintentar
              </button>
            </div>
          ) : !vehSel ? (
            // Background empty state waiting for vehicle selection
            <div className="w-full h-full bg-[#f1f3f5] flex items-center justify-center relative rounded-[24px]">
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `radial-gradient(circle, #000 10%, transparent 11%), radial-gradient(circle, #000 10%, transparent 11%)`,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 10px 10px'
              }} />
              <div className="flex flex-col items-center gap-2 text-center z-10 px-4">
                <Bell size={42} className="text-black/15 animate-bounce" />
                <p className="text-xs font-bold text-black/30 uppercase tracking-wider">Esperando selección de vehículo...</p>
              </div>
            </div>
          ) : loadingAlerts ? (
            <div className="w-full h-full bg-[#f8f9fa] border border-black/5 rounded-[24px] flex flex-col items-center justify-center gap-3 shadow-inner">
              <Loader2 className="text-brand-orange animate-spin" size={32} />
              <p className="text-xs font-bold text-black/30 uppercase tracking-widest">Cargando incidencias de la unidad...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="w-full h-full bg-white border border-black/5 rounded-[24px] flex flex-col items-center justify-center gap-4 p-8 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-brand-orange/5 border border-brand-orange/10 flex items-center justify-center">
                <ShieldCheck className="text-brand-orange" size={28} />
              </div>
              <div className="text-center max-w-sm">
                <h3 className="text-sm font-black text-black">Sin alertas activas</h3>
                <p className="text-neutral-500 text-xs mt-1 leading-relaxed">
                  Excelente. Esta unidad de tu flota se encuentra operando con normalidad y sin reportes de vulnerabilidad activos.
                </p>
              </div>
            </div>
          ) : (
            /* Cards Grid */
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-1 no-scrollbar h-full pb-4">
                {paginatedAlerts.map((alert) => {
                const isGeofence = alert.alert_type === 'geocerca';
                const isResolved = alert.resolved;
                const isResolving = resolvingIds.includes(alert.id);
                
                // Image path format
                const imgUrl = alert.vehiculo?.image
                  ? `${API_BASE}/uploads/vehiculos/${alert.vehiculo.image}`
                  : (vehSel?.image ? `${API_BASE}/uploads/vehiculos/${vehSel.image}` : null);

                return (
                  <div 
                    key={alert.id}
                    className={`bg-white border-4 p-4 rounded-[28px] shadow-sm flex flex-col justify-between h-[230px] transition-all hover:shadow-md hover:border-black/10 ${
                      isResolved ? 'opacity-70 border-black/5 bg-[#fafafa]' : 'border-black/5'
                    }`}
                  >
                    {/* Top Section */}
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl border border-black/5 shadow-sm bg-[#f8f9fa] flex items-center justify-center shrink-0 overflow-hidden">
                        {imgUrl ? (
                          <img 
                            src={imgUrl} 
                            alt="Vehículo" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Car className="text-neutral-400" size={18} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            isGeofence 
                              ? 'bg-blue-500/10 text-blue-500' 
                              : 'bg-brand-orange/10 text-brand-orange'
                          }`}>
                            {isGeofence ? 'Geocerca' : 'Analítica'}
                          </span>
                          <span className="text-[8px] font-black uppercase tracking-wider bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded">
                            Alta
                          </span>
                        </div>

                        <h3 className="text-xs font-black text-black truncate uppercase tracking-tight mt-1">
                          {alert.vehiculo?.modelo || vehSel?.modelo || 'Unidad de flota'}
                        </h3>
                        <p className="text-[9px] text-neutral-500 font-semibold leading-none mt-0.5">
                          {fmtDate(alert.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Alert Message */}
                    <div className="my-2 flex-1 flex items-center">
                      <p className="text-xs text-neutral-700 font-semibold leading-relaxed line-clamp-3">
                        {cleanMessage(alert.mensaje)}
                      </p>
                    </div>

                    {/* Bottom Section */}
                    <div className="border-t border-black/5 pt-3 flex items-center justify-between shrink-0">
                      <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider leading-none">
                        ID: #{alert.id}
                      </span>

                      {isResolved ? (
                        <div className="flex items-center gap-1 text-green-500">
                          <ShieldCheck size={14} />
                          <span className="text-[10px] font-black uppercase tracking-wider leading-none">Resuelto</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleResolveAlert(alert.id)}
                          disabled={isResolving}
                          className="bg-black hover:bg-neutral-800 text-white rounded-xl py-2 px-4.5 text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-95 shadow-sm"
                        >
                          {isResolving ? (
                            <>
                              <Loader2 size={10} className="animate-spin" />
                              <span>Procesando</span>
                            </>
                          ) : (
                            <span>Resolver</span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
              
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-black/5 mt-4 pt-4 shrink-0">
                  <span className="text-[10px] font-bold text-black/40 uppercase tracking-wider">
                    Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, alerts.length)} de {alerts.length}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-lg border border-black/5 bg-white text-black/50 hover:bg-neutral-50 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <span className="text-[10px] font-black flex items-center justify-center w-8 text-black">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-lg border border-black/5 bg-white text-black/50 hover:bg-neutral-50 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
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
                    <AlertCircle className="text-brand-orange" size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-black leading-none">Seleccionar vehículo</h3>
                    <p className="text-neutral-500 text-xs font-semibold mt-1 leading-relaxed">
                      Para consultar el historial de alertas e incidencias detectadas por nuestro motor de analíticas, por favor seleccione la unidad de su flota que desea monitorear.
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
                        loading={loadingAlerts && vehSel?.id === v.id}
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
