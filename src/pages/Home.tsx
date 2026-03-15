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
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { NAV_LINKS } from '../constants/navLinks';
import logo from '../assets/logo_home.png';
import Plasma from '../assets/example';

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
  const { user, isAuthenticated } = useAppContext();

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* ─── NAVBAR ─── */}
      <motion.header
        className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-6xl z-50 rounded-full glass border border-white/10 shadow-lg px-2 h-20 flex items-center justify-between"
        initial={{ y: -60, opacity: 0, x: '-50%' }}
        animate={{ y: 0, opacity: 1, x: '-50%' }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full flex items-center justify-between px-4 sm:px-6">
          <img src={logo} alt="LinkGPS Analytics" className="h-8 sm:h-10" />
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
          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-dark-3/50 border border-brand-dark-4">
                <div className="w-6 h-6 rounded-full bg-brand-orange/20 flex items-center justify-center">
                  <span className="text-brand-orange text-[10px] font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-white hidden sm:block">
                  Hola, {user.name.split(' ')[0]}
                </span>
              </div>
            ) : null}
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-primary text-xs py-2 px-4"
              >
                Dashboard
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <a
                href="https://link-gps-frontend.vercel.app/login"
                className="btn-primary text-xs py-2 px-4"
              >
                Iniciar Sesión
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </motion.header>

      <div className="min-h-screen bg-brand-dark overflow-x-hidden">

        {/* ─── HERO WITH PLASMA ─── */}
        <section className="relative h-screen w-full flex flex-col justify-center items-center overflow-hidden">
          {/* DarkVeil Background */}
          <div className="absolute inset-0 z-0 pointer-events-auto">
            <Plasma
              hueShift={207} /* Shifts blue to a vibrant orange/red */
              noiseIntensity={0.05}
              scanlineIntensity={0.51}
              speed={2.5}
              scanlineFrequency={2.1}
              warpAmount={2.5}
              resolutionScale={1.0}
            />
          </div>

          {/* Hero Content Overlay */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
            <motion.img
              src={logo}
              alt="LinkGPS Analytics"
              className="w-64 sm:w-80 md:w-96 mb-8 drop-shadow-2xl"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
            />
            <motion.p
              className="max-w-xl mx-auto text-neutral-300 text-lg sm:text-xl drop-shadow mb-10"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
            >
              Potencia tu seguridad vehicular con machine learning en tiempo real.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
            >
              {isAuthenticated ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-8 py-3.5 rounded-full bg-white text-black font-bold text-base hover:bg-neutral-200 transition-colors shadow-lg"
                >
                  Comenzar
                </button>
              ) : (
                <a
                  href="https://link-gps-frontend.vercel.app/login"
                  className="px-8 py-3.5 rounded-full bg-white text-black font-bold text-base hover:bg-neutral-200 transition-colors shadow-lg inline-flex items-center justify-center"
                >
                  Iniciar Sesión
                </a>
              )}
              <button
                onClick={scrollToFeatures}
                className="px-8 py-3.5 rounded-full bg-transparent border border-white/30 text-white font-medium text-base hover:bg-white/10 transition-colors backdrop-blur-sm"
              >
                Más información
              </button>
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
    </>
  );
}
