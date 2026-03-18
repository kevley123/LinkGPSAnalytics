import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users } from 'lucide-react';

export default function Estadisticas() {
  return (
    <div className="p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-3xl border border-white/10"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-orange/20 flex items-center justify-center border border-brand-orange/30">
            <BarChart3 className="text-brand-orange w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Estadísticas</h1>
            <p className="text-neutral-400">Análisis cuantitativo de la flota y rendimiento operativo.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-brand-dark-3 p-6 rounded-2xl border border-white/5">
             <TrendingUp className="text-emerald-400 w-8 h-8 mb-4" />
             <p className="text-xs text-neutral-500 font-bold uppercase mb-1">Crecimiento Mensual</p>
             <p className="text-3xl font-black text-white">+14.2%</p>
          </div>
          <div className="bg-brand-dark-3 p-6 rounded-2xl border border-white/5">
             <Users className="text-blue-400 w-8 h-8 mb-4" />
             <p className="text-xs text-neutral-500 font-bold uppercase mb-1">Usuarios Activos</p>
             <p className="text-3xl font-black text-white">1,204</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
