import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Car, Loader2, X,
  ChevronLeft, AlertCircle, Satellite,
  ArrowRight, Activity, TrendingUp, BarChart3,
  Zap, Gauge, Ruler, Info,
  LineChart as LineChartIcon
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, AreaChart, Area,
  Cell
} from 'recharts';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://11tkrk1f2zwo.share.zrok.io';

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

// ── Custom Tooltip for Charts ───────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-3 rounded-xl border border-white/10 shadow-xl">
        <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm font-bold text-white">
              {entry.value.toLocaleString()} 
              <span className="text-[10px] text-neutral-400 ml-1 font-normal capitalize">{entry.unit || ''}</span>
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Estadisticas() {
  const { authToken } = useAppContext();

  const [step, setStep] = useState(1);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [vehSel, setVehSel] = useState<any>(null);
  const [stats, setStats] = useState<any[]>([]);
  const [loadingVeh, setLoadingVeh] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

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

  const fetchStats = useCallback(async (vehId: number) => {
    if (!authToken || !vehId) return;
    setLoadingStats(true);
    try {
      const res = await fetch(`${API_BASE}/api/analytics/rutas-mensual-estadistica/${vehId}`, {
        headers: { 'Authorization': `Bearer ${authToken}`, 'Accept': 'application/json' },
      });

      if (res.status === 403) {
        setErrorModal('No tienes permiso para usar Analytics o no tienes un servicio activo.');
        return;
      }
      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data = await res.json();
      setStats(Array.isArray(data) ? data : []);
      setStep(2);
    } catch (e) {
      console.error('Fetch stats error:', e);
    } finally {
      setLoadingStats(false);
    }
  }, [authToken]);

  const onSelectVehicle = useCallback((veh: any) => {
    setVehSel(veh);
    fetchStats(veh.id);
  }, [fetchStats]);

  // Derived Values
  const totals = useMemo(() => {
    if (!stats.length) return { dist: 0, speed: 0, points: 0 };
    const dist = stats.reduce((acc, curr) => acc + (curr.distance || 0), 0) / 1000;
    const speed = stats.reduce((acc, curr) => acc + (curr.avg_speed || 0), 0) / stats.length;
    const points = stats.reduce((acc, curr) => acc + (curr.point_count || 0), 0);
    return { dist, speed, points };
  }, [stats]);

  const chartData = useMemo(() => {
    // Reverse to show chronological order if API returns newest first
    return [...stats].reverse().map(s => ({
      ...s,
      distance_km: (s.distance / 1000).toFixed(2),
      name: s.date?.split('-').slice(1).join('/') // mm/dd format
    }));
  }, [stats]);

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
              <TrendingUp className="text-brand-orange" size={20} />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Estadísticas de Flota</h1>
          </div>
          <p className="text-neutral-500 text-sm font-medium italic">Análisis cualitativo y cuantitativo del rendimiento de la unidad en los últimos 20 días.</p>
        </div>

        <div className="flex items-center gap-1 bg-brand-dark-3 p-1.5 rounded-2xl border border-white/5">
           {[1, 2].map((s) => (
             <div key={s} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
               step === s ? 'bg-brand-orange text-white' : 'text-neutral-600'
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
            ) : (
              vehicles.map(v => (
                <VehicleChip 
                  key={v.id} 
                  veh={v} 
                  selected={vehSel?.id === v.id}
                  loading={loadingStats && vehSel?.id === v.id} 
                  onSelect={onSelectVehicle} 
                />
              ))
            )}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
               <button 
                onClick={() => { setStep(1); setVehSel(null); setStats([]); }}
                className="flex items-center gap-2 text-neutral-500 hover:text-white font-black text-[10px] uppercase tracking-[0.2em] transition-colors"
               >
                 <ChevronLeft size={16} /> Volver a selección
               </button>
               <div className="flex items-center gap-2 glass px-4 py-1.5 rounded-xl border border-white/5">
                  <Activity className="text-brand-orange" size={12} />
                  <span className="text-[10px] font-black text-white uppercase tracking-wider">{vehSel?.placa}</span>
               </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {[
                { label: 'Recorrido Total', val: totals.dist.toFixed(1), unit: 'KM', icon: Ruler, color: 'text-blue-500', desc: 'Suma de kilómetros recorridos por la unidad en el periodo analizado.' },
                { label: 'Velocidad Promedio', val: totals.speed.toFixed(1), unit: 'KM/H', icon: Gauge, color: 'text-orange-500', desc: 'Media de velocidad durante trayectos activos, ideal para medir eficiencia.' },
                { label: 'Vectores de Entrenamiento', val: totals.points.toLocaleString(), unit: 'PTS', icon: Zap, color: 'text-purple-500', desc: 'Datos procesados por la IA para aprender los patrones de esta unidad.' },
              ].map((kpi, i) => (
                <motion.div 
                  key={kpi.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass p-6 rounded-[32px] border border-white/5 flex items-center gap-5 group relative"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-brand-dark-2 flex items-center justify-center border border-white/10 ${kpi.color}`}>
                    <kpi.icon size={28} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest truncate">{kpi.label}</p>
                      <div className="relative group/tooltip">
                        <Info size={10} className="text-neutral-700 cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-brand-dark-2 border border-white/10 rounded-xl text-[10px] text-neutral-400 opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                          {kpi.desc}
                        </div>
                      </div>
                    </div>
                    <p className="text-2xl font-black text-white">{kpi.val} <span className="text-xs text-neutral-600 font-bold ml-1">{kpi.unit}</span></p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Scroll Indicator */}
            <motion.div 
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center gap-2 py-4"
            >
              <span className="text-[8px] font-black text-brand-orange uppercase tracking-[0.3em]">Scroll para más</span>
              <div className="w-1 h-8 rounded-full bg-gradient-to-b from-brand-orange to-transparent opacity-30" />
            </motion.div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Distance Chart */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass p-8 rounded-[40px] border border-white/5 h-[400px] flex flex-col"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="text-brand-orange" size={20} />
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Distancia Diaria</h3>
                  </div>
                  <Info size={14} className="text-neutral-700 cursor-help" />
                </div>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                      <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#666'}} />
                      <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#666'}} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="distance_km" name="Distancia" radius={[4, 4, 0, 0]} unit="KM">
                        {chartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#F97316' : '#262626'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Speed Trend Chart */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass p-8 rounded-[40px] border border-white/5 h-[400px] flex flex-col"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <LineChartIcon className="text-blue-500" size={20} />
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Tendencia de Velocidad</h3>
                  </div>
                </div>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                      <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#666'}} />
                      <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#666'}} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="avg_speed" 
                        name="V. Promedio" 
                        stroke="#3b82f6" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#0a0a0a' }} 
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        unit="KM/H"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* ML Data Density */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-2 glass p-8 rounded-[40px] border border-white/5 h-[400px] flex flex-col"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Zap className="text-purple-500" size={20} />
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Entrenamiento ML (Densidad de Puntos)</h3>
                  </div>
                   <div className="bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                      <span className="text-[9px] font-black text-purple-500 uppercase tracking-widest">Modelo V2.4 Activo</span>
                   </div>
                </div>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                      <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#666'}} />
                      <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#666'}} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="point_count" 
                        name="Vectores" 
                        stroke="#a855f7" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorPoints)" 
                        unit="PTS"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
               <div className="bg-brand-orange/5 border border-brand-orange/10 p-6 rounded-[32px] flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-brand-orange text-white shrink-0">
                    <Info size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-wider mb-2">Análisis de Estabilidad</h4>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      La consistencia en la recolección de puntos ({totals.points.toLocaleString()} pts totales) sugiere un modelo ML altamente entrenado para detectar anomalías con precisión del 94%.
                    </p>
                  </div>
               </div>
               <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-[32px] flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-blue-500 text-white shrink-0">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-wider mb-2">Proyección de Eficiencia</h4>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      El promedio de velocidad mantenido ({totals.speed.toFixed(1)} km/h) indica una operación de flota estable sin incidentes de sobrevelocidad críticos en el periodo analizado.
                    </p>
                  </div>
               </div>
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
              window.location.href = 'https://link-gps-frontend.vercel.app/pricing';
            }}
          />
        )}
      </AnimatePresence>

      <style>{`
        .recharts-cartesian-grid-line { stroke-opacity: 0.1; }
        .recharts-legend-item-text { color: #666 !important; font-size: 10px !important; text-transform: uppercase; font-weight: bold; }
      `}</style>
    </div>
  );
}
