import { motion } from 'framer-motion';
import { Zap, Info, ShieldCheck } from 'lucide-react';

export default function MiDispositivoStatus() {
  return (
    <div className="p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-3xl border border-white/10"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-orange/20 flex items-center justify-center border border-brand-orange/30">
            <Zap className="text-brand-orange w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Estado dispositivo</h1>
            <p className="text-neutral-400">Diagnóstico en tiempo real de componentes internos.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-4">
              <ShieldCheck className="text-emerald-500 w-5 h-5 mt-1" />
              <div>
                 <p className="text-white font-bold">Firmware Actualizado</p>
                 <p className="text-sm text-neutral-500">Versión 1.9.0 estable.</p>
              </div>
           </div>
           <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-4">
              <Info className="text-blue-500 w-5 h-5 mt-1" />
              <div>
                 <p className="text-white font-bold">Tiempo de Actividad</p>
                 <p className="text-sm text-neutral-500">12 días, 4 horas sin interrupciones.</p>
              </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
