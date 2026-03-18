import { motion } from 'framer-motion';
import { MapPin, Info, AlertTriangle } from 'lucide-react';

export default function GeocercasEventos() {
  return (
    <div className="p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-3xl border border-white/10"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-orange/20 flex items-center justify-center border border-brand-orange/30">
            <MapPin className="text-brand-orange w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Eventos geocerca</h1>
            <p className="text-neutral-400">Registros de entrada y salida de las zonas delimitadas.</p>
          </div>
        </div>
        
        <div className="bg-red-500/10 p-6 rounded-2xl border border-red-500/20 flex items-start gap-4 mb-6">
           <AlertTriangle className="text-red-500 w-6 h-6 mt-1" />
           <div>
              <p className="text-white font-bold uppercase tracking-tight">Violación de Perímetro</p>
              <p className="text-sm text-neutral-400">Unidad 10 dejó la zona 'Garage Principal' a las 02:15 AM sin autorización.</p>
           </div>
        </div>

        <div className="flex items-center gap-2 text-neutral-600 text-[10px] italic">
           <Info className="w-3 h-3" /> Solo se conservan eventos de los últimos 7 días.
        </div>
      </motion.div>
    </div>
  );
}
