import { motion } from 'framer-motion';
import { ShieldAlert, Brain, Zap } from 'lucide-react';

export default function AlertasIA() {
  return (
    <div className="p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-3xl border border-white/10"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-orange/20 flex items-center justify-center border border-brand-orange/30">
            <ShieldAlert className="text-brand-orange w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Alertas IA</h1>
            <p className="text-neutral-400">Detección de comportamientos anómalos mediante modelos predictivos.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-brand-dark-3 p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4">
               <Brain className="w-12 h-12 text-brand-orange/10 group-hover:text-brand-orange/20 transition-colors" />
            </div>
            <h3 className="text-white font-bold mb-2">Motor de Análisis Activo</h3>
            <p className="text-sm text-neutral-400 mb-4">El modelo está procesando patrones de conducción en tiempo real.</p>
            <div className="w-full bg-brand-dark-2 h-1 rounded-full overflow-hidden">
               <motion.div 
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-1/2 h-full bg-brand-orange" 
               />
            </div>
          </div>
          <div className="bg-brand-dark-3 p-6 rounded-2xl border border-white/5 flex items-center justify-center text-neutral-500 italic text-sm">
            Esperando eventos críticos para análisis...
          </div>
        </div>
      </motion.div>
    </div>
  );
}
