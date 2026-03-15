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
  const { authToken } = useAppContext();
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
    <div className="p-6 md:p-10 text-white min-h-full">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-orange/10 flex items-center justify-center border border-brand-orange/20">
                <Bell className="text-brand-orange w-6 h-6" />
              </div>
              Notificaciones
            </h1>
            <p className="text-neutral-400 mt-2">
              Visor de eventos y alertas. {unreadCount > 0 ? `Tienes ${unreadCount} alertas nuevas.` : 'Todo al día.'}
            </p>
          </div>
          <a
            href="https://link-gps-frontend.vercel.app/user/dashboard/notificaciones"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-orange text-white font-bold shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:bg-brand-orange/90 transition-colors"
          >
            Gestión Completa
            <ExternalLink className="w-4 h-4 text-white" />
          </a>
        </div>

        {/* Content */}
        <div className="glass rounded-3xl border border-brand-dark-4 overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-6">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="w-12 h-12 rounded-xl bg-brand-dark-3 shrink-0" />
                  <div className="flex-1 py-1 space-y-3">
                    <div className="h-4 w-1/4 bg-brand-dark-3 rounded" />
                    <div className="h-4 w-3/4 bg-brand-dark-3 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-center text-neutral-400">
              <div className="w-16 h-16 rounded-full bg-brand-dark-3 flex items-center justify-center mb-4">
                <Inbox className="w-8 h-8 text-neutral-500" />
              </div>
              <p className="text-lg font-bold text-white mb-2">Bandeja vacía</p>
              <p className="text-sm">No existen eventos recientes para mostrar.</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-brand-dark-4 relative">
              {notifs.map((n, i) => {
                const info = getTipoInfo(n.tipo);
                const isUnread = n.leido === 'noleido';
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={n.id} 
                    className={`p-6 flex gap-5 hover:bg-white/5 transition-colors cursor-default relative overflow-hidden group
                      ${isUnread ? 'bg-brand-orange/[0.03]' : ''}`}
                  >
                    {isUnread && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-orange shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                    )}
                    
                    <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border ${info.bg} ${info.border}`}>
                      <info.Icon className={`w-6 h-6 ${info.color}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <span className={`text-xs font-bold uppercase tracking-wider ${info.color}`}>
                          {n.tipo.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-neutral-500 flex items-center gap-1 shrink-0">
                          <Clock className="w-3.5 h-3.5" />
                          {timeAgo(n.created_at)}
                        </span>
                      </div>
                      <p className={`text-base mb-2 ${isUnread ? 'text-white font-bold' : 'text-neutral-300 font-medium'}`}>
                        {n.titulo}
                      </p>
                      <p className="text-sm text-neutral-400 leading-relaxed">
                        {n.mensaje}
                      </p>
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
