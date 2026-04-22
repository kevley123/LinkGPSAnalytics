import { motion } from 'framer-motion';
import { Smartphone, Signal, Battery, Wifi } from 'lucide-react';

export default function MiDispositivo() {
  return (
    <div className="p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-3xl border border-white/10"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-orange/20 flex items-center justify-center border border-brand-orange/30">
            <Smartphone className="text-brand-orange w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Mi dispositivo</h1>
            <p className="text-neutral-400">Información técnica y vinculación del hardware rastreador.</p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8 items-center bg-brand-dark-3 p-8 rounded-2xl border border-white/5">
           <div className="relative">
              <div className="w-32 h-32 rounded-3xl bg-brand-orange/5 border border-brand-orange/20 flex items-center justify-center relative">
                 <Smartphone className="w-16 h-16 text-brand-orange/40" />
                 <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-3xl bg-brand-orange/30"
                 />
              </div>
           </div>
           <div className="flex-1 space-y-4 w-full">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                 <span className="text-neutral-500 text-sm flex items-center gap-2"><Signal className="w-4 h-4" /> Señal GPS</span>
                 <span className="text-emerald-400 text-sm font-bold">Excelente</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                 <span className="text-neutral-500 text-sm flex items-center gap-2"><Battery className="w-4 h-4" /> Batería</span>
                 <span className="text-white text-sm font-bold">85%</span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-neutral-500 text-sm flex items-center gap-2"><Wifi className="w-4 h-4" /> Red Celular</span>
                 <span className="text-white text-sm font-bold">LTE 4G</span>
              </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
