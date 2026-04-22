import { motion } from 'framer-motion';
import { Hexagon } from 'lucide-react';

interface LoadingProps {
  message?: string;
  subMessage?: string;
}

export default function Loading({ 
  message = "Conectando con el servidor", 
  subMessage = "Sincronizando núcleo de analítica" 
}: LoadingProps) {
  return (
    <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-6">
      <motion.div 
        animate={{ scale: [1, 1.1, 1], rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="w-20 h-20 rounded-[32px] bg-black flex items-center justify-center shadow-2xl"
      >
        <Hexagon className="text-white" size={32} />
      </motion.div>
      <div className="text-center space-y-2">
        <p className="text-sm font-black text-black uppercase tracking-[0.4em] animate-pulse">
          {message}
        </p>
        <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest">
          {subMessage}
        </p>
      </div>
    </div>
  );
}
