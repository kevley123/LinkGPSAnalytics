import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Calendar,
  X,
  AlertCircle,
  MessageSquare,
  Car,
  Cpu,
  Star,
  Info,
  Clock,
  Inbox,
  Check,
  CheckSquare,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { env } from '../config/env';

const API_BASE = env.API_BASE_URL;

interface NotifAPIResponse {
  id: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  leido: string;
  created_at: string;
}

const TIPOS: Record<string, any> = {
  aprobacion_cita: { Icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200/30', label: 'Cita Aprobada' },
  rechazo_cita: { Icon: X, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200/30', label: 'Cita Rechazada' },
  alerta: { Icon: AlertCircle, color: 'text-brand-orange', bg: 'bg-orange-50', border: 'border-orange-200/30', label: 'Alerta' },
  mensaje: { Icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200/30', label: 'Mensaje' },
  vehiculo: { Icon: Car, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-200/30', label: 'Vehículo' },
  dispositivo: { Icon: Cpu, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200/30', label: 'Dispositivo' },
  sistema: { Icon: Star, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200/30', label: 'Sistema' },
  default: { Icon: Info, color: 'text-neutral-500', bg: 'bg-neutral-50', border: 'border-neutral-200/30', label: 'Info' },
};

const getTipoInfo = (tipo: string) => TIPOS[tipo] || TIPOS.default;

const timeAgo = (dateStr: string) => {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'Hace unos seg';
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `Hace ${Math.floor(diff / 86400)}d`;
  return new Date(dateStr).toLocaleDateString('es-BO', { day: 'numeric', month: 'short' });
};

export default function Notifications() {
  const { authToken, setNotifsCount } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [notifs, setNotifs] = useState<NotifAPIResponse[]>([]);
  const [filter, setFilter] = useState<'todas' | 'noleidas' | 'alertas' | 'citas'>('todas');

  const fetchNotifs = async () => {
    if (!authToken) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/analytics/notificaciones`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json'
        }
      });
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      const arr = Array.isArray(data) ? data : (data?.notificaciones ?? data?.data ?? []);
      setNotifs(arr.slice(0, 50));
      setNotifsCount(arr.filter((n: any) => n.leido === 'noleido').length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [authToken]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await fetch(`${API_BASE}/api/analytics/notificaciones/${id}/leer`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
    } catch (e) {
      console.error(e);
    }
    setNotifs(prev => {
      const next = prev.map(n => n.id === id ? { ...n, leido: 'leido' } : n);
      setNotifsCount(next.filter(n => n.leido === 'noleido').length);
      return next;
    });
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch(`${API_BASE}/api/analytics/notificaciones/marcar-leidas`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
    } catch (e) {
      console.error(e);
    }
    setNotifs(prev => {
      const next = prev.map(n => ({ ...n, leido: 'leido' }));
      setNotifsCount(0);
      return next;
    });
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`${API_BASE}/api/analytics/notificaciones/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
    } catch (e) {
      console.error(e);
    }
    setNotifs(prev => {
      const next = prev.filter(n => n.id !== id);
      setNotifsCount(next.filter(n => n.leido === 'noleido').length);
      return next;
    });
  };

  const filteredNotifs = notifs.filter(n => {
    if (filter === 'noleidas') return n.leido === 'noleido';
    if (filter === 'alertas') return n.tipo === 'alerta';
    if (filter === 'citas') return n.tipo === 'aprobacion_cita' || n.tipo === 'rechazo_cita';
    return true;
  });

  const unreadCount = notifs.filter(n => n.leido === 'noleido').length;

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6 text-black min-h-screen">
      
      {/* Header Info Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-[16px] bg-brand-orange/10 text-brand-orange border border-brand-orange/20 flex items-center justify-center shadow-lg">
            <Bell size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black text-black tracking-tight leading-none">Notificaciones</h1>
            <p className="text-[10px] font-bold text-black/40 uppercase tracking-[0.25em] mt-1.5">Bandeja de Eventos y Citas del Sistema</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white font-black text-[9px] uppercase tracking-widest transition-all shadow-sm"
            >
              <CheckSquare size={12} /> Marcar todo leído
            </button>
          )}

          <a
            href={`${env.FRONTEND_URL}/user/dashboard/notificaciones`}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-brand-orange text-white text-[9px] font-black uppercase tracking-widest shadow-md hover:bg-brand-orange/90 transition-all"
          >
            Ver más <ExternalLink size={11} />
          </a>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setFilter('todas')}
          className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border ${
            filter === 'todas'
              ? 'bg-black text-white border-black'
              : 'bg-white text-black/60 border-black/5 hover:border-black/15 hover:text-black'
          }`}
        >
          Todas ({notifs.length})
        </button>
        <button
          onClick={() => setFilter('noleidas')}
          className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border ${
            filter === 'noleidas'
              ? 'bg-black text-white border-black'
              : 'bg-white text-black/60 border-black/5 hover:border-black/15 hover:text-black'
          }`}
        >
          Sin leer ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('alertas')}
          className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border ${
            filter === 'alertas'
              ? 'bg-black text-white border-black'
              : 'bg-white text-black/60 border-black/5 hover:border-black/15 hover:text-black'
          }`}
        >
          Alertas ({notifs.filter(n => n.tipo === 'alerta').length})
        </button>
        <button
          onClick={() => setFilter('citas')}
          className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border ${
            filter === 'citas'
              ? 'bg-black text-white border-black'
              : 'bg-white text-black/60 border-black/5 hover:border-black/15 hover:text-black'
          }`}
        >
          Citas ({notifs.filter(n => n.tipo.includes('cita')).length})
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-[32px] border-4 border-black/5 p-4 md:p-6 shadow-sm">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex gap-3 animate-pulse p-3 bg-[#f8f9fa] rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-black/5 shrink-0" />
                <div className="flex-1 py-1 space-y-1.5">
                  <div className="h-2.5 w-1/5 bg-black/5 rounded" />
                  <div className="h-3 w-3/4 bg-black/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-black/40">
            <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center mb-3">
              <Inbox className="w-6 h-6 text-black/30" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest mb-1">Bandeja Vacía</p>
            <p className="text-[9px] font-bold uppercase tracking-tighter">No hay notificaciones en este filtro</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            <AnimatePresence>
              {filteredNotifs.map((n, i) => {
                const info = getTipoInfo(n.tipo);
                const isUnread = n.leido === 'noleido';
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.15, delay: i * 0.015 }}
                    key={n.id}
                    className={`group relative p-3.5 rounded-2xl border transition-all flex gap-4 items-start
                      ${isUnread 
                        ? 'bg-white border-brand-orange/20 shadow-sm' 
                        : 'bg-[#f8f9fa] border-black/5 hover:border-black/10'
                      }`}
                  >
                    {/* Unread Indicator Bar */}
                    {isUnread && (
                      <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r-md bg-brand-orange shadow-[0_0_8px_rgba(249,115,22,0.3)]" />
                    )}

                    {/* Icon Badge */}
                    <div className={`shrink-0 w-8.5 h-8.5 rounded-xl flex items-center justify-center border transition-all duration-300 group-hover:scale-105 ${info.bg} ${info.border}`}>
                      <info.Icon className={`w-4 h-4 ${info.color}`} />
                    </div>

                    {/* Text Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <span className={`text-[8px] font-black uppercase tracking-widest ${info.color}`}>
                          {info.label}
                        </span>
                        <span className="text-[8px] text-black/30 font-bold flex items-center gap-1 shrink-0 uppercase tracking-tighter">
                          <Clock className="w-2.5 h-2.5" />
                          {timeAgo(n.created_at)}
                        </span>
                      </div>
                      
                      <h4 className={`text-[12px] mt-1 leading-snug ${isUnread ? 'text-black font-extrabold' : 'text-black/70 font-semibold'}`}>
                        {n.titulo}
                      </h4>
                      
                      <p className="text-[10px] text-black/50 font-medium leading-relaxed mt-0.5 italic">
                        {n.mensaje}
                      </p>
                    </div>

                    {/* Actions Panel */}
                    <div className="flex items-center gap-1 shrink-0">
                      {isUnread && (
                        <button
                          onClick={() => handleMarkAsRead(n.id)}
                          className="p-1.5 rounded-lg bg-white hover:bg-emerald-50 hover:text-emerald-500 text-black/30 transition-all border border-black/5 hover:border-emerald-200/50"
                          title="Marcar como leído"
                        >
                          <Check size={11} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(n.id)}
                        className="p-1.5 rounded-lg bg-white hover:bg-red-50 hover:text-red-500 text-black/30 transition-all border border-black/5 hover:border-red-200/50"
                        title="Eliminar evento"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

    </div>
  );
}
