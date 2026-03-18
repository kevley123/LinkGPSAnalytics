import { motion } from 'framer-motion';
import { Truck, Package, Clock } from 'lucide-react';

export default function Logistica() {
  return (
    <div className="p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-3xl border border-white/10"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-orange/20 flex items-center justify-center border border-brand-orange/30">
            <Truck className="text-brand-orange w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Logística</h1>
            <p className="text-neutral-400">Optimización de entregas y gestión de cadena de suministro.</p>
          </div>
        </div>
        
        <div className="bg-brand-dark-3 rounded-2xl border border-white/5 overflow-hidden">
           <div className="p-4 border-b border-white/5 bg-white/5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                 <Package className="w-4 h-4" /> Despachos Pendientes
              </h3>
           </div>
           <div className="p-4 space-y-3">
              {[1,2].map(i => (
                <div key={i} className="flex items-center justify-between text-xs p-3 rounded-lg bg-black/20">
                   <span className="text-neutral-400">Orden #LF-00{i}82</span>
                   <span className="text-brand-orange font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> En camino
                   </span>
                </div>
              ))}
           </div>
        </div>
      </motion.div>
    </div>
  );
}
