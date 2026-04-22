import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import Spline from '@splinetool/react-spline';
// @ts-ignore
import splineScene from '../assets/models/scene.splinecode?url';
import { useAppContext } from '../context/AppContext';
import { NAV_LINKS } from '../constants/navLinks';
import logo from '../assets/logo_home.png';
import { env } from '../config/env';
// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.5,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] as any } 
  }
};

const footerItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] as any } 
  }
};

export default function Home() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppContext();

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden font-inter">
      
      {/* ─── 3D IMMERSIVE BACKGROUND (SPLINE) ─── */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <Spline 
          scene={splineScene} 
        />
      </div>

      {/* ─── ULTRA CRYSTAL OVERLAY (GLASS VEIL) ─── */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-white/5 via-transparent to-black/20 pointer-events-none" />

      {/* ─── NAVBAR (Ultra Crystal Design) ─── */}
      <motion.header
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-6xl z-50 rounded-[32px] bg-white/10 backdrop-blur-[60px] border border-white/20 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] px-4 h-20 flex items-center justify-between pointer-events-auto overflow-hidden group"
      >
        {/* Subtle Shine Reflection */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        <div className="w-full flex items-center justify-between px-6 relative z-10">
          <motion.div variants={itemVariants} className="flex items-center">
             <img src={logo} alt="LinkGPS Analytics" className="h-10 md:h-12" />
          </motion.div>
          
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <motion.a
                key={link.label}
                variants={itemVariants}
                href={link.href}
                className="text-black/70 hover:text-black text-xs font-black uppercase tracking-[0.2em] transition-all relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-all hover:after:w-full"
              >
                {link.label}
              </motion.a>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            {isAuthenticated && user && (
              <motion.div variants={itemVariants} className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-black/5 border border-black/5 backdrop-blur-md">
                <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center font-black text-[10px]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-black text-black tracking-tight hidden sm:block">
                  {user.name.split(' ')[0]}
                </span>
              </motion.div>
            )}
            
            <motion.div variants={itemVariants}>
                {isAuthenticated ? (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-8 py-3.5 rounded-2xl bg-black text-white font-black text-[10px] uppercase tracking-widest hover:bg-neutral-800 active:scale-95 transition-all shadow-xl flex items-center gap-2"
                  >
                    Dashboard
                    <ChevronRight className="w-3 h-3" />
                  </button>
                ) : (
                  <a
                    href={`${env.FRONTEND_URL}/login`}
                    className="px-8 py-3.5 rounded-2xl bg-black text-white font-black text-[10px] uppercase tracking-widest hover:bg-neutral-800 active:scale-95 transition-all shadow-xl flex items-center gap-2"
                  >
                    Iniciar Sesión
                    <ChevronRight className="w-3 h-3" />
                  </a>
                )}
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* ─── BOTTOM AMBIENCE (Staggered Intro) ─── */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-6 opacity-40 pointer-events-none"
      >
        <motion.div variants={footerItemVariants} className="w-px h-16 bg-gradient-to-b from-white/80 to-transparent" />
        <motion.div variants={footerItemVariants} className="flex flex-col items-center gap-2">
            <span className="text-[9px] font-black text-white uppercase tracking-[0.6em] ml-[0.6em]">Premium Intelligence</span>
            <div className="flex gap-4 items-center">
                <div className="w-1 h-1 rounded-full bg-white/40 animate-pulse" />
                <div className="w-1 h-1 rounded-full bg-white animate-pulse delay-75" />
                <div className="w-1 h-1 rounded-full bg-white/40 animate-pulse delay-150" />
            </div>
        </motion.div>
      </motion.div>

    </div>
  );
}
