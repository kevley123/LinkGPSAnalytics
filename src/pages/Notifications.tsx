import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  ExternalLink,
  Inbox
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface NotifAPIResponse {
  id: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  leido: string;
  created_at: string;
}

const TIPOS: Record<string, any> = {
  aprobacion_cita: { Icon: Calendar, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-500/20' },
  rechazo_cita: { Icon: X, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-500/20' },
  alerta: { Icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-500/20' },
  mensaje: { Icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-500/20' },
  vehiculo: { Icon: Car, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-500/20' },
  dispositivo: { Icon: Cpu, color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-500/20' },
  sistema: { Icon: Star, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-500/20' },
  default: { Icon: Info, color: 'text-brand-orange', bg: 'bg-brand-orange/10', border: 'border-brand-orange/20' },
};

const getTipoInfo = (tipo: string) => TIPOS[tipo] || TIPOS.default;

const timeAgo = (dateStr: string) => {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'Hace unos seg';
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `Hace ${Math.floor(diff / 86400)} dia(s)`;
  return new Date(dateStr).toLocaleDateString('es-BO', { day: 'numeric', month: 'short' });
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://11tkrk1f2zwo.share.zrok.io';

export default function Notifications() {
  const { authToken, setNotifsCount } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [notifs, setNotifs] = useState<NotifAPIResponse[]>([]);

  useEffect(() => {
    if (!authToken) return;
    let isMounted = true;

    const fetchNotifs = async () => {
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

        if (isMounted) {
          const arr = Array.isArray(data) ? data : (data?.notificaciones ?? data?.data ?? []);
          setNotifsCount(data?.meta?.total_items || arr.length);
          setNotifs(arr.slice(0, 50)); // Showing up to 50 on the full viewer
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchNotifs();
    return () => { isMounted = false; };
  }, [authToken]);

  const unreadCount = notifs.filter(n => n.leido === 'noleido').length;

  return (
    <div className="p-4 md:p-6 text-white min-h-full">
      <div className="max-w-7xl mx-auto">
        {/* Header (Minimal Style) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 px-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center border border-brand-orange/20">
              <Bell className="text-brand-orange w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight leading-none">Notificaciones</h1>
              <p className="text-xs font-medium text-neutral-500 mt-1.5">
                {unreadCount > 0 ? `Tienes ${unreadCount} alertas nuevas sin revisar.` : 'Bandeja de eventos al día.'}
              </p>
            </div>
          </motion.div>

          <motion.a
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            href="https://link-gps-frontend.vercel.app/user/dashboard/notificaciones"
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-brand-orange text-white text-xs font-bold shadow-lg hover:bg-brand-orange/90 transition-all active:scale-95"
          >
            Ver más
            <ExternalLink className="w-3.5 h-3.5" />
          </motion.a>
        </div>

        {/* Content (High Density) */}
        <div className="bg-white/[0.02] backdrop-blur-sm rounded-3xl border border-white/5 overflow-hidden shadow-3xl">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-lg bg-white/5 shrink-0" />
                  <div className="flex-1 py-1 space-y-2">
                    <div className="h-3 w-1/6 bg-white/5 rounded" />
                    <div className="h-3 w-3/4 bg-white/5 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-center text-neutral-500">
              <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Inbox className="w-6 h-6 text-neutral-600" />
              </div>
              <p className="text-base font-black text-white uppercase tracking-widest mb-1">Bandeja vacía</p>
              <p className="text-xs uppercase tracking-tighter">No hay eventos recientes registrados</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-white/5 relative">
              {notifs.map((n, i) => {
                const info = getTipoInfo(n.tipo);
                const isUnread = n.leido === 'noleido';
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    key={n.id}
                    className={`p-3 px-6 flex gap-4 hover:bg-white/5 transition-all cursor-default relative overflow-hidden group
                      ${isUnread ? 'bg-brand-orange/[0.02]' : ''}`}
                  >
                    {isUnread && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-orange shadow-[0_0_15px_rgba(249,115,22,0.6)]" />
                    )}

                    <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border ${info.bg} ${info.border} transition-transform group-hover:scale-110`}>
                      <info.Icon className={`w-5 h-5 ${info.color}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${info.color}`}>
                          {n.tipo.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-bold flex items-center gap-1 shrink-0 uppercase tracking-tighter">
                          <Clock className="w-3 h-3" />
                          {timeAgo(n.created_at)}
                        </span>
                      </div>
                      <h4 className={`text-sm truncate ${isUnread ? 'text-white font-black' : 'text-neutral-300 font-bold'}`}>
                        {n.titulo}
                      </h4>
                      <p className="text-[11px] text-neutral-500 line-clamp-1 italic mt-0.5">
                        {n.mensaje}
                      </p>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-opacity">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
