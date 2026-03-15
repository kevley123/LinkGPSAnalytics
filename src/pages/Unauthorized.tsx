import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';
import logo from '../assets/logo_home.png';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center px-6">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 50% 35% at 50% 50%, rgba(239,68,68,0.06) 0%, transparent 70%)',
        }}
      />
      <motion.div
        className="relative z-10 flex flex-col items-center gap-6 max-w-md w-full text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <img src={logo} alt="LinkGPS" className="w-32 mb-2" />

        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20">
          <XCircle className="w-8 h-8 text-red-400" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Sesión no autorizada</h1>
          <p className="text-neutral-400 text-sm leading-relaxed">
            No se encontró un token de sesión válido. Esta plataforma solo es accesible
            desde la aplicación principal de LinkGPS. Por favor, inicia sesión desde la
            app y vuelve a intentarlo.
          </p>
        </div>

        <a
          href="https://linkgps.com"
          className="btn-primary"
          rel="noopener noreferrer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a LinkGPS
        </a>

        <p className="text-neutral-600 text-xs">
          ¿Problema persistente? Contacta a soporte técnico.
        </p>
      </motion.div>
    </div>
  );
}
