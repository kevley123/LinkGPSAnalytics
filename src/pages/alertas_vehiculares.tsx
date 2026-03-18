import { motion } from 'framer-motion';
import { Car, AlertCircle, Shield } from 'lucide-react';

export default function AlertasVehiculares() {
  return (
    <div className="p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-3xl border border-white/10"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-orange/20 flex items-center justify-center border border-brand-orange/30">
            <Car className="text-brand-orange w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Alertas Vehiculares</h1>
            <p className="text-neutral-400">Seguridad mecánica y eventos de hardware del vehículo.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 flex items-center gap-4">
            <AlertCircle className="text-amber-500 w-5 h-5" />
            <div>
              <p className="text-sm font-bold text-white">Batería Baja Detectada</p>
              <p className="text-xs text-neutral-400 italic">Unidad 042 - 12.1V</p>
            </div>
          </div>
           <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 flex items-center gap-4 opacity-50">
            <Shield className="text-emerald-500 w-5 h-5" />
            <div>
              <p className="text-sm font-bold text-white">Cierre Centralizado Asegurado</p>
              <p className="text-xs text-neutral-400 italic">Estado verificado hace 10 min</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
