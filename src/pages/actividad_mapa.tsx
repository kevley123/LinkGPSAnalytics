import { motion } from 'framer-motion';
import { Activity, Clock, MapPin } from 'lucide-react';

export default function ActividadMapa() {
  return (
    <div className="p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-3xl border border-white/10"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-orange/20 flex items-center justify-center border border-brand-orange/30">
            <Activity className="text-brand-orange w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Mi actividad</h1>
            <p className="text-neutral-400">Registro histórico de movimientos y paradas del sistema.</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-brand-dark-3 p-4 rounded-xl border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                  <MapPin className="text-neutral-400 w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Trayecto Zona Sur - Centro</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Hace {i * 2} horas
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded">Completado</span>
                  </div>
                </div>
              </div>
              <p className="text-sm font-black text-white">{12 + i * 5}.4 km</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
