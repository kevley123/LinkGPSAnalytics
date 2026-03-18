import { motion } from 'framer-motion';
import { History, List, Download } from 'lucide-react';

export default function MiDispositivoEventos() {
  return (
    <div className="p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-3xl border border-white/10"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-orange/20 flex items-center justify-center border border-brand-orange/30">
            <History className="text-brand-orange w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Eventos dispositivo</h1>
            <p className="text-neutral-400">Log detallado de encendido, apagado y desconexiones.</p>
          </div>
        </div>
        
        <div className="bg-brand-dark-3 rounded-2xl border border-white/5 overflow-hidden">
           <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
               <h3 className="text-xs font-bold text-white flex items-center gap-2">
                 <List className="w-4 h-4" /> Historial Reciente
              </h3>
              <button className="text-[10px] text-brand-orange font-bold flex items-center gap-1 hover:text-white transition-colors">
                 <Download className="w-3 h-3" /> Exportar CSV
              </button>
           </div>
           <div className="p-0">
              <table className="w-full text-left text-xs border-collapse">
                 <thead>
                    <tr className="bg-brand-dark-2 text-neutral-500 border-b border-white/5">
                       <th className="p-4">Evento</th>
                       <th className="p-4">Fecha/Hora</th>
                       <th className="p-4">Ubicación</th>
                    </tr>
                 </thead>
                 <tbody className="text-white">
                    <tr className="border-b border-white/5">
                       <td className="p-4 font-bold">Motor Encendido</td>
                       <td className="p-4 text-neutral-400">18 Mar - 08:32</td>
                       <td className="p-4 text-neutral-400">-16.51, -68.12</td>
                    </tr>
                 </tbody>
              </table>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
