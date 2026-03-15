import { motion } from 'framer-motion';
import { TrendingUp, MapPin, ShieldAlert, Activity } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const statCards = [
  { label: 'Alertas activas',    value: '—',  icon: ShieldAlert, color: 'text-red-400',   bg: 'bg-red-500/10',    border: 'border-red-500/20' },
  { label: 'Vehículos en ruta',  value: '—',  icon: MapPin,      color: 'text-blue-400',  bg: 'bg-blue-500/10',   border: 'border-blue-500/20' },
  { label: 'Eventos hoy',        value: '—',  icon: Activity,    color: 'text-green-400', bg: 'bg-green-500/10',  border: 'border-green-500/20' },
  { label: 'Score de riesgo',    value: '—',  icon: TrendingUp,  color: 'text-brand-orange', bg: 'bg-brand-orange/10', border: 'border-brand-orange/20' },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fadeUp: any = {
  hidden:   { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function Dashboard() {
  const { user } = useAppContext();

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome banner */}
      <motion.div
        className="rounded-2xl p-8 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #2A2A2A 0%, #222 60%, rgba(249,115,22,0.08) 100%)',
          border: '1px solid rgba(249,115,22,0.15)',
        }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* glow blob */}
        <div
          className="absolute -right-16 -top-16 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)' }}
        />
        <p className="text-neutral-400 text-sm mb-1">Bienvenido de vuelta,</p>
        <h1 className="text-2xl font-bold text-white mb-3">
          {user?.name ?? 'Usuario'}
        </h1>
        <p className="text-neutral-500 text-sm max-w-lg">
          Tu panel de analíticas ML está listo. Los datos en tiempo real y los
          modelos de detección de anomalías se conectarán próximamente.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Sesión activa
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              className={`card ${card.border}`}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={i}
            >
              <div className={`w-10 h-10 rounded-xl ${card.bg} border ${card.border} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className="text-2xl font-bold text-white mb-0.5">{card.value}</p>
              <p className="text-neutral-500 text-xs">{card.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Placeholder content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          className="lg:col-span-2 card h-64 flex flex-col items-center justify-center gap-3"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={4}
        >
          <Activity className="w-10 h-10 text-brand-orange/30" />
          <p className="text-neutral-500 text-sm">
            Gráfico de actividad — próximamente
          </p>
        </motion.div>
        <motion.div
          className="card h-64 flex flex-col items-center justify-center gap-3"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={5}
        >
          <ShieldAlert className="w-10 h-10 text-brand-orange/30" />
          <p className="text-neutral-500 text-sm text-center">
            Feed de alertas ML — próximamente
          </p>
        </motion.div>
      </div>
    </div>
  );
}
