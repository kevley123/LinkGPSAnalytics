import { motion } from 'framer-motion';
import { Repeat, Navigation, Milestone } from 'lucide-react';

export default function RutasFrecuentes() {
  return (
    <div className="p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-3xl border border-white/10"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-orange/20 flex items-center justify-center border border-brand-orange/30">
            <Repeat className="text-brand-orange w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Rutas frecuentes</h1>
            <p className="text-neutral-400">Análisis de recorridos recurrentes y tiempos promedio.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-white/5 bg-brand-dark-3 hover:border-brand-orange/30 transition-colors">
             <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-neutral-500 uppercase">Ruta Matutina</span>
                <Navigation className="w-4 h-4 text-brand-orange" />
             </div>
             <p className="text-white font-medium">Casa - Oficina Principal</p>
             <p className="text-[10px] text-neutral-500 mt-1">Recorrido diario promedio: 45 min</p>
          </div>
          <div className="p-4 rounded-xl border border-white/5 bg-brand-dark-3 opacity-60">
             <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-neutral-500 uppercase">Alternativa B</span>
                <Milestone className="w-4 h-4 text-neutral-700" />
             </div>
             <p className="text-neutral-400 font-medium font-italic">Esperando recolección de datos...</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
