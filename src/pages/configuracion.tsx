import { motion } from 'framer-motion';
import { Settings, User, Bell, Shield } from 'lucide-react';

export default function Configuracion() {
  return (
    <div className="p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-3xl border border-white/10"
      >
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-brand-orange/20 flex items-center justify-center border border-brand-orange/30">
            <Settings className="text-brand-orange w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Configuración</h1>
            <p className="text-neutral-400">Gestión de cuenta, preferencias de sistema y seguridad.</p>
          </div>
        </div>
        
        <div className="space-y-6 max-w-2xl">
           <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-orange/30 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                 <User className="text-neutral-500" />
                 <span className="text-white font-medium">Perfil de Usuario</span>
              </div>
              <span className="text-xs text-brand-orange font-bold uppercase">Editar</span>
           </div>
           <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-4">
                 <Bell className="text-neutral-500" />
                 <span className="text-white font-medium">Notificaciones Push</span>
              </div>
              <div className="w-10 h-5 bg-brand-orange rounded-full relative">
                 <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
              </div>
           </div>
           <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-4">
                 <Shield className="text-neutral-500" />
                 <span className="text-white font-medium">Seguridad de la Cuenta</span>
              </div>
              <span className="text-xs text-neutral-500">MFA no activo</span>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
