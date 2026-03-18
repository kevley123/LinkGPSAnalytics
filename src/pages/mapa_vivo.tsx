import { motion } from 'framer-motion';
import { Map, Activity, Layers, Signal } from 'lucide-react';

export default function MapaVivo() {
  return (
    <div className="p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-3xl border border-white/10"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-orange/20 flex items-center justify-center border border-brand-orange/30">
            <Map className="text-brand-orange w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Mapa en vivo</h1>
            <p className="text-neutral-400">Seguimiento en tiempo real con alertas de transmisión activa.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-brand-dark-3 p-6 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 text-brand-orange mb-2">
              <Signal className="w-4 h-4 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider">Estado de Conexión</span>
            </div>
            <p className="text-2xl font-black text-white">Activo</p>
          </div>
          <div className="bg-brand-dark-3 p-6 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <Layers className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Capas Activas</span>
            </div>
            <p className="text-2xl font-black text-white">Satélite + Tráfico</p>
          </div>
          <div className="bg-brand-dark-3 p-6 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <Activity className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Unidades Monitoreadas</span>
            </div>
            <p className="text-2xl font-black text-white">12 Vehículos</p>
          </div>
        </div>

        <div className="aspect-video w-full rounded-2xl bg-brand-dark-2 border border-white/5 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/-68.11,16.48,5/800x450?access_token=pk.eyJ1IjoibGF6YXJvMTIzIiwiYSI6ImNreHd6enZ6MjA0OHkybm13enZ6enZ6enYifQ.v-v-v-v-v-v-v-v-v-v-v-v')] bg-cover bg-center opacity-40 grayscale"></div>
          <div className="relative z-10 text-center">
            <div className="w-16 h-16 rounded-full border-4 border-brand-orange border-t-transparent animate-spin mx-auto mb-4"></div>
            <p className="text-neutral-400 font-medium">Inicializando motor de renderizado geográfico...</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
