
import { motion } from 'framer-motion';
import logo from '../assets/logo_home.png';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-brand-dark flex flex-col items-center justify-center overflow-hidden">
      {/* Subtle radial glow background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(249,115,22,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Animated ring + logo */}
      <div className="relative flex items-center justify-center">
        {/* Outer spin ring */}
        <motion.div
          className="absolute rounded-full border-2 border-transparent"
          style={{
            width: 160,
            height: 160,
            borderTopColor: '#F97316',
            borderRightColor: 'rgba(249,115,22,0.2)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
        />

        {/* Middle ring (counter spin) */}
        <motion.div
          className="absolute rounded-full border border-brand-orange/20"
          style={{ width: 190, height: 190, borderTopColor: 'rgba(249,115,22,0.5)' }}
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />

        {/* Logo */}
        <motion.img
          src={logo}
          alt="LinkGPS Analytics"
          className="relative z-10 w-24 select-none"
          animate={{ opacity: [0.7, 1, 0.7], scale: [0.97, 1.03, 0.97] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Label */}
      <motion.p
        className="mt-12 text-neutral-400 text-sm tracking-widest uppercase font-medium"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        Verificando sesión…
      </motion.p>

      {/* Progress dots */}
      <motion.div className="flex gap-2 mt-4">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-brand-orange"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>
    </div>
  );
}
