import { motion } from 'framer-motion';
import { AlertTriangle, Map, Info } from 'lucide-react';

export default function MapaAnomalia() {
  return (
    <div className="p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-3xl border border-white/10"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-orange/20 flex items-center justify-center border border-brand-orange/30">
            <AlertTriangle className="text-brand-orange w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Mapa anomalías</h1>
            <p className="text-neutral-400">Visualización de zonas críticas y eventos inusuales.</p>
          </div>
        </div>
        
        <div className="relative aspect-video rounded-2xl border border-white/10 overflow-hidden bg-brand-dark-3 flex items-center justify-center">
           <div className="absolute inset-0 bg-red-500/5 active:bg-red-500/10 transition-colors cursor-crosshair"></div>
           <div className="relative z-10 text-center space-y-4">
              <Map className="w-12 h-12 text-neutral-600 mx-auto" />
              <p className="text-sm text-neutral-500">Haz clic en el mapa para analizar una zona específica.</p>
              <div className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 inline-flex items-center gap-2 text-red-500 text-xs font-bold">
                 <Info className="w-3 h-3" /> 5 Anomolías detectadas hoy
              </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
