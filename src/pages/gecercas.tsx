import { motion } from 'framer-motion';
import { Hexagon, Plus, Settings } from 'lucide-react';

export default function Geocercas() {
  return (
    <div className="p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-3xl border border-white/10"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-orange/20 flex items-center justify-center border border-brand-orange/30">
            <Hexagon className="text-brand-orange w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Mis geocercas</h1>
            <p className="text-neutral-400">Perímetros virtuales de seguridad definidos por el usuario.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="bg-brand-dark-3 p-4 rounded-xl border border-white/5 flex items-center justify-between">
              <div>
                 <p className="text-white font-bold">Zona Segura - Casa</p>
                 <p className="text-[10px] text-emerald-400 mt-1">SISTEMA ARMADO</p>
              </div>
              <Settings className="w-4 h-4 text-neutral-600 cursor-pointer" />
           </div>
           <button className="border-2 border-dashed border-white/10 p-4 rounded-xl flex items-center justify-center gap-2 text-neutral-500 hover:border-brand-orange/40 hover:text-brand-orange transition-all">
              <Plus className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Añadir Geocerca</span>
           </button>
        </div>
      </motion.div>
    </div>
  );
}
