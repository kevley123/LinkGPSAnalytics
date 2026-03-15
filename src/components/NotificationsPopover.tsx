import { useState, useEffect, useRef } from 'react';
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
  ExternalLink,
  Inbox
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

// Types and config
interface NotifAPIResponse {
  id: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  leido: string;
  created_at: string;
}

const TIPOS: Record<string, any> = {
  aprobacion_cita: {
    Icon: Calendar,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-500/20'
  },
  rechazo_cita: {
    Icon: X,
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-500/20'
  },
  alerta: {
    Icon: AlertCircle,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-500/20'
  },
  mensaje: {
    Icon: MessageSquare,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-500/20'
  },
  vehiculo: {
    Icon: Car,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'border-purple-500/20'
  },
  dispositivo: {
    Icon: Cpu,
    color: 'text-indigo-400',
    bg: 'bg-indigo-400/10',
    border: 'border-indigo-500/20'
  },
  sistema: {
    Icon: Star,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-500/20'
  },
  default: {
    Icon: Info,
    color: 'text-brand-orange',
    bg: 'bg-brand-orange/10',
    border: 'border-brand-orange/20'
  },
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

// --- API Service mapping to useHandshakeAuth structure ---
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://11tkrk1f2zwo.share.zrok.io';

export default function NotificationsPopover() {
  const { authToken } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifs, setNotifs] = useState<NotifAPIResponse[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Fetch logic
  useEffect(() => {
    if (!isOpen || !authToken) return;
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
        if (!res.ok) throw new Error('Error status');
        const data = await res.json();
        
        if (isMounted) {
          // Flatten / extract array data
          const arr = Array.isArray(data) ? data : (data?.notificaciones ?? data?.data ?? []);
          // Limit to 10 for the paginated view per instructions
          setNotifs(arr.slice(0, 10));
        }
      } catch (err) {
        console.error("Failed to fetch notifs", err);
        // Fallback or mockup if API entirely fails locally? 
        // We'll leave it empty to show the Empty State.
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchNotifs();
    return () => { isMounted = false; };
  }, [isOpen, authToken]);

  const unreadCount = notifs.filter(n => n.leido === 'noleido').length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors
          ${isOpen ? 'bg-brand-orange/20 text-brand-orange' : 'text-neutral-400 hover:text-brand-orange hover:bg-brand-orange/10'}`}
        whileTap={{ scale: 0.9 }}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {/* Unread dot simulation - if closed, optionally show fixed dot */}
        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-brand-orange border-2 border-brand-dark" />
      </motion.button>

      {/* Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-14 w-80 sm:w-96 rounded-2xl glass border border-brand-dark-4 shadow-2xl overflow-hidden z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-brand-dark-4 bg-black/40 relative overflow-hidden">
              {/* Subtle tech background gradient */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-orange/50 to-transparent" />
              <div className="absolute inset-0 bg-brand-orange/5 mix-blend-overlay pointer-events-none" />
              
              <div className="relative z-10">
                <h3 className="text-white font-bold text-sm tracking-wide">Notificaciones</h3>
                <p className="text-neutral-400 text-xs mt-0.5">Últimos {notifs.length} registros</p>
              </div>
              
              {unreadCount > 0 && (
                <span className="relative z-10 px-2.5 py-1 rounded-full bg-brand-orange/20 text-brand-orange text-[10px] font-bold border border-brand-orange/30 shadow-[0_0_10px_rgba(249,115,22,0.2)]">
                  {unreadCount} nuevas
                </span>
              )}
            </div>

            {/* List Body */}
            <div className="max-h-[380px] overflow-y-auto no-scrollbar bg-brand-dark/95">
              {loading ? (
                // Skeleton
                <div className="p-4 space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-4 animate-pulse">
                      <div className="w-10 h-10 rounded-xl bg-brand-dark-3 shrink-0" />
                      <div className="flex-1 py-1 space-y-2">
                        <div className="h-3 w-3/4 bg-brand-dark-3 rounded" />
                        <div className="h-3 w-1/2 bg-brand-dark-3 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifs.length === 0 ? (
                // Empty State
                <div className="flex flex-col items-center justify-center p-8 text-center text-neutral-400">
                  <div className="w-12 h-12 rounded-full bg-brand-dark-3 flex items-center justify-center mb-3">
                    <Inbox className="w-5 h-5 text-neutral-500" />
                  </div>
                  <p className="text-sm font-medium text-white mb-1">Sin notificaciones</p>
                  <p className="text-xs">Por el momento, no hay alertas recientes.</p>
                </div>
              ) : (
                // Items
                <div className="flex flex-col">
                  {notifs.map((n) => {
                    const info = getTipoInfo(n.tipo);
                    const isUnread = n.leido === 'noleido';
                    return (
                      <div 
                        key={n.id} 
                        className={`group p-4 flex gap-4 border-b border-brand-dark-4 hover:bg-white/5 transition-colors cursor-default relative
                          ${isUnread ? 'bg-brand-orange/[0.02]' : ''}`}
                      >
                        {isUnread && (
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand-orange rounded-r-full" />
                        )}
                        
                        <div className={`mt-0.5 shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border ${info.bg} ${info.border}`}>
                          <info.Icon className={`w-5 h-5 ${info.color}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${info.color}`}>
                              {n.tipo.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {timeAgo(n.created_at)}
                            </span>
                          </div>
                          <p className={`text-sm mb-1 line-clamp-1 ${isUnread ? 'text-white font-semibold' : 'text-neutral-300'}`}>
                            {n.titulo}
                          </p>
                          <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                            {n.mensaje}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <a
              href="https://link-gps-frontend.vercel.app/user/dashboard/notificaciones"
              className="p-3 bg-black/40 border-t border-brand-dark-4 hover:bg-black/60 transition-colors flex items-center justify-center gap-2 group"
            >
              <span className="text-xs font-semibold text-brand-orange group-hover:text-amber-400 transition-colors">
                Ver historial completo
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-brand-orange group-hover:text-amber-400 transition-colors" />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
