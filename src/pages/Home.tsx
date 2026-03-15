import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain,
  MapPin,
  ShieldCheck,
  Bell,
  BarChart3,
  Zap,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { NAV_LINKS } from '../constants/navLinks';
import logo from '../assets/logo_home.png';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fadeUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
};

const features = [
  {
    icon: Brain,
    title: 'Inteligencia Artificial Predictiva',
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nuestros modelos de ML analizan patrones de comportamiento vehicular para anticipar eventos de riesgo antes de que ocurran.',
  },
  {
    icon: MapPin,
    title: 'Geolocalización en Tiempo Real',
    desc: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Rastreo GPS de alta precisión con actualización continua y alertas de zona.',
  },
  {
    icon: ShieldCheck,
    title: 'Detección de Anomalías',
    desc: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco. Identificamos desviaciones de ruta, comportamientos inusuales y accesos no autorizados.',
  },
  {
    icon: Bell,
    title: 'Alertas Inteligentes',
    desc: 'Duis aute irure dolor in reprehenderit in voluptate velit esse. Notificaciones contextualmente relevantes que priorizan los eventos más críticos.',
  },
  {
    icon: BarChart3,
    title: 'Analíticas Avanzadas',
    desc: 'Excepteur sint occaecat cupidatat non proident. Dashboards interactivos con visualizaciones de datos históricos y en tiempo real.',
  },
  {
    icon: Zap,
    title: 'Respuesta Automática',
    desc: 'Sunt in culpa qui officia deserunt mollit anim id est laborum. Acciones preventivas automáticas configurables según el nivel de riesgo detectado.',
  },
];

const steps = [
  { num: '01', title: 'Conexión segura', desc: 'Tu sesión de LinkGPS se transfiere a esta plataforma mediante un token temporal cifrado, sin necesidad de segundo login.' },
  { num: '02', title: 'Análisis continuo', desc: 'Los modelos de IA procesan miles de señales por segundo: GPS, acelerómetros, patrones históricos y contexto de zona.' },
  { num: '03', title: 'Alertas y acciones', desc: 'Cuando se detecta un riesgo, recibes notificaciones inmediatas y puedes activar respuestas automáticas o manuales.' },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-dark overflow-x-hidden">
      {/* ─── NAVBAR ─── */}
      <motion.header
        className="fixed top-0 inset-x-0 z-50 glass border-b border-brand-dark-4/60"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <img src={logo} alt="LinkGPS Analytics" className="h-7" />
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-neutral-400 hover:text-brand-orange text-sm font-medium transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary text-xs py-2 px-4"
          >
            Dashboard
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.header>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center pt-16 bg-grid">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 30%, rgba(249,115,22,0.10) 0%, transparent 65%)',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-6 py-24 text-center">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs font-semibold mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Activity className="w-3.5 h-3.5" />
            Plataforma de analíticas ML antirrobo
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-black tracking-tight mb-6"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            Protección Vehicular
            <br />
            <span className="text-gradient">Impulsada por IA</span>
          </motion.h1>

          <motion.p
            className="max-w-2xl mx-auto text-neutral-400 text-lg leading-relaxed mb-10"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. LinkGPS Analytics
            combina machine learning de última generación con datos GPS en tiempo real
            para ofrecerte la protección más avanzada para tu flota vehicular.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
          >
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary text-base px-8 py-4 shadow-orange-glow"
            >
              Ir al Dashboard
              <ChevronRight className="w-5 h-5" />
            </button>
            <a href="#features" className="btn-ghost text-base px-8 py-4">
              Ver funcionalidades
            </a>
          </motion.div>

          {/* Floating stats */}
          <motion.div
            className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={5}
          >
            {[
              { value: '98.7%', label: 'Precisión de detección' },
              { value: '<2s',   label: 'Tiempo de respuesta' },
              { value: '24/7',  label: 'Monitoreo continuo' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="card border-brand-orange/20 text-center"
              >
                <p className="text-3xl font-black text-brand-orange mb-1">{stat.value}</p>
                <p className="text-neutral-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <p className="text-brand-orange text-sm font-semibold uppercase tracking-widest mb-3">
              Funcionalidades
            </p>
            <h2 className="text-4xl font-black text-white">
              Todo lo que necesitas para
              <br />
              <span className="text-gradient">proteger tu flota</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  className="card group cursor-default"
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center mb-4 group-hover:bg-brand-orange/20 transition-colors">
                    <Icon className="w-6 h-6 text-brand-orange" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-24 px-6 bg-brand-dark-2">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <p className="text-brand-orange text-sm font-semibold uppercase tracking-widest mb-3">
              Cómo funciona
            </p>
            <h2 className="text-4xl font-black text-white">
              Tres pasos hacia la{' '}
              <span className="text-gradient">protección total</span>
            </h2>
          </motion.div>

          <div className="flex flex-col gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                className="flex gap-6 items-start p-6 rounded-2xl bg-brand-dark-3 border border-brand-dark-4 hover:border-brand-orange/30 transition-colors"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
              >
                <span className="text-5xl font-black text-brand-orange/20 leading-none select-none">
                  {step.num}
                </span>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">{step.title}</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section id="about" className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-black text-white mb-4">
              ¿Listo para explorar el{' '}
              <span className="text-gradient">dashboard?</span>
            </h2>
            <p className="text-neutral-400 mb-8 leading-relaxed">
              Accede a todos los datos de tu flota, alertas ML, reportes y
              configuraciones desde un único panel de control diseñado para la
              máxima eficiencia.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary text-base px-10 py-4 shadow-orange-glow"
            >
              Abrir Dashboard
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-brand-dark-4 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <img src={logo} alt="LinkGPS" className="h-5 opacity-60" />
          <p className="text-neutral-600 text-xs">
            © {new Date().getFullYear()} LinkGPS Analytics. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
