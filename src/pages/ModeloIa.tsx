import { motion } from 'framer-motion';
import { Brain, Sparkles, Cpu } from 'lucide-react';

export default function ModeloIA() {
  return (
    <div className="p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-3xl border border-white/10"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-orange/20 flex items-center justify-center border border-brand-orange/30">
            <Brain className="text-brand-orange w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Modelo IA</h1>
            <p className="text-neutral-400">Configuración y estado del motor de inteligencia artificial.</p>
          </div>
        </div>
        
        <div className="bg-brand-dark-3 p-8 rounded-2xl border border-white/5 text-center">
          <Sparkles className="w-12 h-12 text-brand-orange/40 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Entrenamiento en Curso</h3>
          <p className="text-neutral-500 max-w-md mx-auto mb-6 text-sm">
            Estamos optimizando los modelos de detección de fraude y robo basándonos en los últimos 30 días de datos recolectados.
          </p>
          <div className="flex items-center justify-center gap-4">
             <div className="px-4 py-2 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs font-bold flex items-center gap-2">
               <Cpu className="w-3 h-3" /> v2.4.1 Active
             </div>
             <div className="px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
               Precision: 98.4%
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
