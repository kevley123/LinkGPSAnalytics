import { useState, useEffect, useContext, useCallback } from 'react';
import {
  Bell, BellOff, Check, CheckCheck, RefreshCw, Filter,
  ChevronDown, X, Calendar, AlertCircle, Info,
  MessageSquare, Car, Cpu, Clock, Star, Loader2,
  BellRing, Search, Inbox
} from 'lucide-react';
import { AppContext } from '../../../Context/AppContext';

const API = import.meta.env.VITE_API_URL;

// ── Helpers ───────────────────────────────────────────────────────────────────
const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return 'Hace unos segundos';
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `Hace ${Math.floor(diff / 86400)} dia${Math.floor(diff / 86400) === 1 ? '' : 's'}`;
  return new Date(dateStr).toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' });
};

// ── Configuración por tipo ────────────────────────────────────────────────────
const TIPOS = {
  aprobacion_cita: {
    label: 'Cita aprobada',
    Icon: Calendar,
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
    dot: 'bg-emerald-500',
    accent: 'border-l-emerald-500',
  },
  rechazo_cita: {
    label: 'Cita rechazada',
    Icon: X,
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
    badge: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    dot: 'bg-red-500',
    accent: 'border-l-red-500',
  },
  alerta: {
    label: 'Alerta',
    Icon: AlertCircle,
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
    dot: 'bg-amber-500',
    accent: 'border-l-amber-500',
  },
  mensaje: {
    label: 'Mensaje',
    Icon: MessageSquare,
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    dot: 'bg-blue-500',
    accent: 'border-l-blue-500',
  },
  vehiculo: {
    label: 'Vehículo',
    Icon: Car,
    iconBg: 'bg-purple-100 dark:bg-purple-900/40',
    iconColor: 'text-purple-600 dark:text-purple-400',
    badge: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
    dot: 'bg-purple-500',
    accent: 'border-l-purple-500',
  },
  dispositivo: {
    label: 'Dispositivo',
    Icon: Cpu,
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    badge: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
    dot: 'bg-indigo-500',
    accent: 'border-l-indigo-500',
  },
  sistema: {
    label: 'Sistema',
    Icon: Star,
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    iconColor: 'text-orange-600 dark:text-orange-400',
    badge: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
    dot: 'bg-orange-500',
    accent: 'border-l-orange-500',
  },
  default: {
    label: 'Notificación',
    Icon: Info,
    iconBg: 'bg-purple-100 dark:bg-purple-900/40',
    iconColor: 'text-purple-500 dark:text-purple-400',
    badge: 'bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
    dot: 'bg-purple-400',
    accent: 'border-l-purple-400',
  },
};

const tipoInfo = (tipo) => TIPOS[tipo] || TIPOS.default;

// ── Card de Notificación ──────────────────────────────────────────────────────
const NotifCard = ({ notif, onMarcarLeido, marking }) => {
  const { iconBg, iconColor, Icon, badge, dot, accent } = tipoInfo(notif.tipo);
  const esLeida = notif.leido !== 'noleido';
  const [saliendo, setSaliendo] = useState(false);

  const handleMarcar = () => {
    setSaliendo(true);
    setTimeout(() => onMarcarLeido(notif.id), 300);
  };

  return (
    <div className={`group relative flex gap-4 p-4 sm:p-5 rounded-2xl border-l-4 border border-purple-100 dark:border-purple-800/50 transition-all duration-300
            ${accent}
            ${saliendo ? 'opacity-0 scale-95 translate-x-6' : 'opacity-100 scale-100 translate-x-0'}
            ${esLeida
        ? 'bg-white/50 dark:bg-purple-950/30 backdrop-blur-sm'
        : 'bg-white dark:bg-purple-950/60 backdrop-blur-md shadow-sm hover:shadow-lg hover:shadow-purple-900/8 dark:hover:shadow-purple-950/40 hover:-translate-y-0.5'
      }`}>

      {/* Punto indicador no leída */}
      {!esLeida && (
        <span className={`absolute top-3.5 right-3.5 w-2 h-2 rounded-full ${dot}`}
          style={{ animation: 'pulseDot 2s ease-in-out infinite' }} />
      )}

      {/* Ícono tipo */}
      <div className={`shrink-0 w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center transition-transform duration-300 group-hover:scale-105`}>
        <Icon size={18} className={iconColor} />
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0 pr-7">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${badge}`}>
            {tipoInfo(notif.tipo).label}
          </span>
          {esLeida && (
            <span className="text-[10px] text-purple-300 dark:text-purple-600 flex items-center gap-1">
              <CheckCheck size={10} /> Leído
            </span>
          )}
        </div>

        <h4 className={`font-bold text-sm leading-snug mb-0.5 ${esLeida ? 'text-purple-400 dark:text-purple-500' : 'text-purple-900 dark:text-white'}`}>
          {notif.titulo}
        </h4>
        <p className={`text-sm leading-relaxed ${esLeida ? 'text-purple-400 dark:text-purple-600' : 'text-purple-600 dark:text-purple-300'}`}>
          {notif.mensaje}
        </p>
        <div className="flex items-center gap-1.5 mt-2 text-[11px] text-purple-400 dark:text-purple-600">
          <Clock size={10} />
          {timeAgo(notif.created_at)}
        </div>
      </div>

      {/* Botón marcar leída (aparece en hover) */}
      {!esLeida && (
        <button onClick={handleMarcar} disabled={marking === notif.id}
          title="Marcar como leída"
          className="absolute top-3 right-6 w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-900/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 flex items-center justify-center text-purple-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-sm">
          {marking === notif.id
            ? <Loader2 size={13} className="animate-spin" />
            : <Check size={13} />}
        </button>
      )}
    </div>
  );
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
const NotifSkeleton = ({ delay = 0 }) => (
  <div className="flex gap-4 p-5 rounded-2xl border border-l-4 border-purple-100 dark:border-purple-800/40 border-l-purple-200 dark:border-l-purple-700 bg-white dark:bg-purple-950/60 animate-pulse"
    style={{ animationDelay: `${delay}ms` }}>
    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-800/50 shrink-0" />
    <div className="flex-1 space-y-2 py-1">
      <div className="h-3 bg-purple-100 dark:bg-purple-800/50 rounded w-20" />
      <div className="h-4 bg-purple-100 dark:bg-purple-800/50 rounded w-52" />
      <div className="h-3 bg-purple-100 dark:bg-purple-800/50 rounded w-full" />
      <div className="h-3 bg-purple-100 dark:bg-purple-800/50 rounded w-2/3" />
      <div className="h-2.5 bg-purple-100 dark:bg-purple-800/50 rounded w-20 mt-1" />
    </div>
  </div>
);

// ── Página principal ───────────────────────────────────────────────────────────
const Notificaciones = () => {
  const { token, cantidadNoLeidas, setCantidadNoLeidas } = useContext(AppContext);
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Set de IDs actualmente en proceso → bloquea doble click de forma segura
  const [markingIds, setMarkingIds] = useState(new Set());
  const [markingAll, setMarkingAll] = useState(false);
  const [filtroLeido, setFiltroLeido] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [search, setSearch] = useState('');

  // ── Fetch ──────────────────────────────────────────────────────────
  const fetchNotifs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/notificaciones`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setNotifs(Array.isArray(data) ? data : (data.data ?? []));
    } catch (e) {
      setError(e.message || 'Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  // ── Marcar una leída ──────────────────────────────────────────────
  // Seguridad: bloquea si ya está en proceso (anti-doble-click)
  // Verifica que la notif exista y sea realmente 'noleido' ANTES de hacer fetch
  // Solo descuenta el contador global si la petición fue exitosa
  const marcarLeido = async (id) => {
    // 1. Bloqueo inmediato: si ya está procesando este id, salir
    if (markingIds.has(id)) return;

    // 2. Verificar que existe y que realmente es no leída
    const notif = notifs.find(n => n.id === id);
    if (!notif || notif.leido !== 'noleido') return;

    // 3. Agregar al Set de en-proceso
    setMarkingIds(prev => new Set([...prev, id]));
    try {
      const res = await fetch(`${API}/notificaciones/marcar_leido`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);

      // 4. Todo bien: actualizar estado local
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, leido: 'leido' } : n));

      // 5. Decrementar contador global con guardia Math.max(0) → nunca negativo
      setCantidadNoLeidas(prev => Math.max(0, prev - 1));
    } catch {/* silencioso: la card no cambia si el server falla */ }
    finally {
      // 6. Siempre liberar el bloqueo aunque haya error
      setMarkingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    }
  };

  // ── Marcar todas leídas ───────────────────────────────────────────
  const marcarTodasLeidas = async () => {
    if (markingAll) return; // bloqueo anti-doble-click
    setMarkingAll(true);

    // Capturar ANTES de cualquier cambio cuántas son realmente no leídas
    const noLeidas = notifs.filter(n => n.leido === 'noleido');
    if (noLeidas.length === 0) { setMarkingAll(false); return; }

    try {
      const resultados = await Promise.allSettled(
        noLeidas.map(n =>
          fetch(`${API}/notificaciones/marcar_leido`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: n.id }),
          }).then(r => { if (!r.ok) throw new Error(); return n.id; })
        )
      );

      // Solo marcar localmente las que tuvieron éxito en el servidor
      const exitosas = new Set(
        resultados
          .filter(r => r.status === 'fulfilled')
          .map(r => r.value)
      );
      const cantExitosas = exitosas.size;

      if (cantExitosas > 0) {
        setNotifs(prev =>
          prev.map(n => exitosas.has(n.id) ? { ...n, leido: 'leido' } : n)
        );
        // Restar exactamente cuántas se marcaron exitosamente, con guardia
        setCantidadNoLeidas(prev => Math.max(0, prev - cantExitosas));
      }
    } finally {
      setMarkingAll(false);
    }
  };

  // ── Filtrado ───────────────────────────────────────────────────────
  const filtradas = notifs.filter(n => {
    const matchLeido = filtroLeido === 'todos' ? true
      : filtroLeido === 'leidas' ? n.leido !== 'noleido'
        : n.leido === 'noleido';
    const matchTipo = filtroTipo === 'todos' || n.tipo === filtroTipo;
    const q = search.toLowerCase();
    const matchSearch = !q || n.titulo?.toLowerCase().includes(q) || n.mensaje?.toLowerCase().includes(q);
    return matchLeido && matchTipo && matchSearch;
  });

  const noLeidas = notifs.filter(n => n.leido === 'noleido').length;
  const tiposPresentes = [...new Set(notifs.map(n => n.tipo).filter(Boolean))];

  const noLeidasFiltradas = filtradas.filter(n => n.leido === 'noleido');
  const leidasFiltradas = filtradas.filter(n => n.leido !== 'noleido');

  // Helper para pasar al card: está bloqueado si su id está en proceso
  const isMarking = (id) => markingIds.has(id);

  return (
    <div className="space-y-6">

      {/* ── ENCABEZADO ──────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-purple-900 dark:text-white flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                <BellRing size={18} className="text-purple-600 dark:text-purple-400" />
              </div>
              {noLeidas > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center px-1 shadow-sm"
                  style={{ animation: 'pulseDot 2s ease-in-out infinite' }}>
                  {noLeidas > 99 ? '99+' : noLeidas}
                </span>
              )}
            </div>
            Notificaciones
          </h1>
          <p className="text-sm text-purple-500 dark:text-purple-400 mt-0.5">
            {noLeidas > 0 ? `${noLeidas} sin leer · ` : ''}{notifs.length} en total
          </p>
        </div>

        <div className="flex gap-2">
          {noLeidas > 0 && (
            <button onClick={marcarTodasLeidas} disabled={markingAll}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold shadow-sm shadow-emerald-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-60">
              {markingAll ? <Loader2 size={13} className="animate-spin" /> : <CheckCheck size={13} />}
              Marcar todas leídas
            </button>
          )}
          <button onClick={fetchNotifs}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/40 text-purple-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-800/50 text-sm font-medium shadow-sm transition-all">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Actualizar
          </button>
        </div>
      </div>

      {/* ── STATS ─────────────────────────────────────────────────── */}
      {!loading && !error && notifs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', val: notifs.length, Icon: Bell, iconCls: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400' },
            { label: 'Sin leer', val: noLeidas, Icon: BellRing, iconCls: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' },
            { label: 'Leídas', val: notifs.length - noLeidas, Icon: CheckCheck, iconCls: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
            { label: 'Tipos', val: tiposPresentes.length, Icon: Filter, iconCls: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
          ].map(({ label, val, Icon, iconCls }) => (
            <div key={label} className="bg-white dark:bg-purple-950/60 border border-purple-100 dark:border-purple-800/40 rounded-2xl p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconCls}`}>
                <Icon size={16} />
              </div>
              <div>
                <p className="text-xl font-extrabold text-purple-900 dark:text-white leading-none">{val}</p>
                <p className="text-xs text-purple-500 dark:text-purple-400 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── FILTROS ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Búsqueda */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar en notificaciones..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl text-sm bg-white dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/40 focus:outline-none focus:ring-2 focus:ring-orange-500 text-purple-900 dark:text-purple-100 placeholder-purple-300 dark:placeholder-purple-600 transition-all" />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-700 dark:hover:text-purple-200">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Toggle leídas */}
        <div className="flex rounded-xl border border-purple-200 dark:border-purple-800/40 overflow-hidden bg-white dark:bg-purple-950/60 text-xs font-bold shrink-0">
          {[
            { val: 'todos', label: 'Todas' },
            { val: 'noleidas', label: 'Sin leer' },
            { val: 'leidas', label: 'Leídas' },
          ].map(({ val, label }) => (
            <button key={val} onClick={() => setFiltroLeido(val)}
              className={`px-4 py-2.5 transition-all ${filtroLeido === val
                ? 'bg-purple-700 dark:bg-purple-700 text-white'
                : 'text-purple-500 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-800/40'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Filtro tipo */}
        <div className="relative shrink-0">
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none" />
          <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
            className="pl-8 pr-8 py-2.5 rounded-xl text-sm bg-white dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/40 focus:outline-none focus:ring-2 focus:ring-orange-500 text-purple-900 dark:text-purple-100 appearance-none cursor-pointer transition-all">
            <option value="todos">Todos los tipos</option>
            {tiposPresentes.map(t => (
              <option key={t} value={t}>{tipoInfo(t).label}</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none" />
        </div>
      </div>

      {/* ── CONTENIDO ─────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {[0, 80, 160, 240, 320].map(d => <NotifSkeleton key={d} delay={d} />)}
        </div>

      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <AlertCircle size={28} className="text-red-500" />
          </div>
          <h3 className="font-bold text-purple-900 dark:text-white mb-1">Error al cargar</h3>
          <p className="text-sm text-purple-500 dark:text-purple-400 mb-4">{error}</p>
          <button onClick={fetchNotifs}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold shadow-sm transition-all hover:-translate-y-0.5">
            <RefreshCw size={14} /> Reintentar
          </button>
        </div>

      ) : filtradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center mb-4">
            <Inbox size={28} className="text-purple-300 dark:text-purple-600" />
          </div>
          <h3 className="font-bold text-purple-900 dark:text-white mb-1">
            {search || filtroLeido !== 'todos' || filtroTipo !== 'todos' ? 'Sin resultados' : 'Sin notificaciones'}
          </h3>
          <p className="text-sm text-purple-500 dark:text-purple-400 max-w-xs">
            {search || filtroLeido !== 'todos' || filtroTipo !== 'todos'
              ? 'Ajusta los filtros para ver más resultados.'
              : 'No tienes notificaciones pendientes. Todo al día.'}
          </p>
        </div>

      ) : (
        <div className="space-y-5">
          <p className="text-xs text-purple-400 dark:text-purple-500">
            {filtradas.length} notificacion{filtradas.length !== 1 ? 'es' : ''}
            {noLeidas > 0 && filtroLeido === 'todos' && ` · ${noLeidas} sin leer`}
          </p>

          {/* Sin leer primero */}
          {filtroLeido !== 'leidas' && noLeidasFiltradas.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0"
                  style={{ animation: 'pulseDot 2s ease-in-out infinite' }} />
                <p className="text-xs font-bold text-orange-500 dark:text-orange-400 uppercase tracking-widest">Sin leer</p>
              </div>
              {noLeidasFiltradas.map((n, i) => (
                <div key={n.id} style={{ animation: `fadeInUp 0.35s ease ${i * 45}ms both` }}>
                  <NotifCard notif={n} onMarcarLeido={marcarLeido} marking={isMarking(n.id) ? n.id : null} />
                </div>
              ))}
            </div>
          )}

          {/* Divisor */}
          {filtroLeido === 'todos' && noLeidasFiltradas.length > 0 && leidasFiltradas.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-purple-100 dark:bg-purple-800/40" />
              <span className="flex items-center gap-1.5 text-xs text-purple-400 dark:text-purple-600 font-semibold whitespace-nowrap">
                <CheckCheck size={11} /> Leídas anteriormente
              </span>
              <div className="flex-1 h-px bg-purple-100 dark:bg-purple-800/40" />
            </div>
          )}

          {/* Leídas */}
          {filtroLeido !== 'noleidas' && leidasFiltradas.length > 0 && (
            <div className="space-y-2.5">
              {leidasFiltradas.map((n, i) => (
                <div key={n.id} style={{ animation: `fadeInUp 0.35s ease ${i * 35}ms both` }}>
                  <NotifCard notif={n} onMarcarLeido={marcarLeido} marking={isMarking(n.id) ? n.id : null} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulseDot {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50%       { opacity: 0.5; transform: scale(0.7); }
                }
            `}</style>
    </div>
  );
};

export default Notificaciones;
