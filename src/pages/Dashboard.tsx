import { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Send
} from 'lucide-react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { useAppContext } from '../context/AppContext';
import assistantIcon from '../assets/asistente.png';
import agenteAlertaIcon from '../assets/agente_alerta.png';
//import { env } from '../config/env';

// const API_BASE = env.API_BASE_URL;
const API_BASE = "https://11tkrk1f2zwo.share.zrok.io";

// --- Heatmap Layer Component ---
const HeatmapLayer = memo(({ points }: { points: any[] }) => {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;

    // @ts-ignore
    const heat = L.heatLayer(
      points.map(p => [p.lat, p.lon, (p.intensity || 0.5) * 6]),
      {
        radius: 55,
        blur: 45,
        maxOpacity: 0.85,
        minOpacity: 0.2,
        gradient: {
          0.25: '#22c55e', // Green
          0.5: '#eab308',  // Yellow
          0.75: '#f97316', // Orange
          1.0: '#ef4444'   // Red
        }
      }
    ).addTo(map);

    return () => { map.removeLayer(heat); };
  }, [map, points]);

  return null;
});

// --- Digital Clock Component ---
const DigitalClock = ({ light }: { light?: boolean }) => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-3">
      <div className={`text-base font-black tracking-tighter tabular-nums flex items-baseline gap-0.5 ${light ? 'text-white' : 'text-black'}`}>
        {time.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', hour12: false })}
        <span className="text-brand-orange text-[9px] animate-pulse">
          :{time.getSeconds().toString().padStart(2, '0')}
        </span>
      </div>
      <div className={`w-px h-4 ${light ? 'bg-white/20' : 'bg-black/10'}`} />
      <div className={`text-[8px] font-black uppercase tracking-widest leading-none ${light ? 'text-white/40' : 'text-black/40'}`}>
        LInk<br />GPS
      </div>
    </div>
  );
};

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  isAnimating?: boolean;
}

// --- Typewriter Text Component ---
const TypewriterText = ({ text, onComplete }: { text: string; onComplete: () => void }) => {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    let idx = 0;
    setDisplayed('');
    const timer = setInterval(() => {
      if (idx < text.length) {
        setDisplayed((prev) => prev + text.charAt(idx));
        idx++;
      } else {
        clearInterval(timer);
        onComplete();
      }
    }, 12);
    return () => clearInterval(timer);
  }, [text]);

  return (
    <span>
      {displayed}
      {displayed.length < text.length && (
        <span className="inline-block w-1.5 h-3.5 ml-1 bg-brand-orange animate-pulse align-middle" />
      )}
    </span>
  );
};

export default function Dashboard() {
  const { user, authToken } = useAppContext();
  const [riskData, setRiskData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats] = useState({
    alerts: 142,
    anomalies: 28,
    riskScore: 6.4
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [isTypingResponse, setIsTypingResponse] = useState(true);
  const [isWaitingForAPI, setIsWaitingForAPI] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Initialize compact greeting message on load
  useEffect(() => {
    if (messages.length === 0) {
      const name = user?.name?.split(' ')[0] ?? 'Operador';
      setMessages([
        {
          sender: 'assistant',
          text: `¡Hola, ${name}! ¿En qué te puedo ayudar hoy? ¿Deseas consultar sobre alguna zona de riesgo o la zona roja para hoy?, o deseas conocer las alertas de tus vehiculos, rutas, dímelo`,
          isAnimating: true
        }
      ]);
    }
  }, [user, messages.length]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTypingResponse || isWaitingForAPI) return;

    const userText = inputValue;
    setInputValue('');

    // Add user bubble
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setIsWaitingForAPI(true);

    let replyText = '';
    try {
      // POST "message" to /chatbot/ask
      let res = await fetch(`${API_BASE}/api/analytics/chatbot/ask`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: userText })
      });

      // Try root endpoint fallback
      if (!res.ok) {
        res = await fetch(`${API_BASE}/chatbot/ask`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message: userText })
        });
      }

      if (res.ok) {
        const json = await res.json();
        const responseMsg = json.response || '';
        const recommendationsMsg = json.recommendations || '';
        const riskScoreVal = json.risk_score;

        let parts: string[] = [];
        if (responseMsg) {
          parts.push(responseMsg);
        }
        if (recommendationsMsg) {
          parts.push(`\n**Recomendaciones:**\n${recommendationsMsg}`);
        }
        if (riskScoreVal !== undefined && riskScoreVal !== null && parseFloat(riskScoreVal) > 0.0) {
          parts.push(`\n**Nivel de Riesgo:** ${riskScoreVal} / 10`);
        }
        replyText = parts.join('\n');
      }
    } catch (err) {
      console.warn("API Chatbot ask endpoint error:", err);
    }

    // Error handling requirement
    if (!replyText) {
      replyText = "En estos momentos no estoy disponible. Por favor, intentalo más tarde.";
    }

    // Wait simulated network delay
    setTimeout(() => {
      setIsWaitingForAPI(false);
      setIsTypingResponse(true);
      setMessages((prev) => [
        ...prev,
        { sender: 'assistant', text: replyText, isAnimating: true }
      ]);
    }, 1000);
  };

  useEffect(() => {
    if (!authToken) return;
    const fetchGlobalRisk = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/analytics/mapa-principal`, {
          headers: { 'Authorization': `Bearer ${authToken}`, 'Accept': 'application/json' },
        });
        if (!res.ok) throw new Error('Error fetching risk data');
        const json = await res.json();
        if (json.success) setRiskData(json.data);
      } catch (e) {
        console.error('Fetch dashboard data error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchGlobalRisk();
  }, [authToken]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.9fr] gap-4 h-[calc(100vh-172px)] w-full text-black overflow-hidden">
      {/* Left Column (Info Panel + Chatbot) - Added padding to let the RGB shadow breathe */}
      <div className="flex flex-col gap-4 h-full overflow-hidden px-3.5 py-2">

        {/* Left Top Card: White & Compact with larger text */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-4 border-black/5 p-3.5 rounded-[28px] shadow-sm flex flex-col justify-between shrink-0 h-[122px]"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-black leading-none">
                Bienvenido, {user?.name?.split(' ')[0] ?? 'Operador'}
              </h2>
              <p className="text-[9px] font-black text-brand-orange uppercase tracking-widest mt-1.5 leading-none">
                DASHBOARD DE LINK ANALYTICS
              </p>
            </div>
            <div className="bg-black/5 rounded-xl px-2.5 py-1 border border-black/5 shrink-0">
              <DigitalClock light={false} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-black/5">
            <div className="bg-[#f8f9fa] p-1.5 rounded-lg border border-black/5 flex flex-col justify-between">
              <span className="text-[8px] font-black text-black/40 uppercase tracking-wider block leading-none">Alertas Inteligentes</span>
              <span className="text-xs font-black text-brand-orange mt-0.5 leading-none">{stats.alerts}</span>
            </div>
            <div className="bg-[#f8f9fa] p-1.5 rounded-lg border border-black/5 flex flex-col justify-between">
              <span className="text-[8px] font-black text-black/40 uppercase tracking-wider block leading-none">Anomalías</span>
              <span className="text-xs font-black text-black mt-0.5 leading-none">{stats.anomalies}</span>
            </div>
            <div className="bg-[#f8f9fa] p-1.5 rounded-lg border border-black/5 flex flex-col justify-between">
              <span className="text-[8px] font-black text-black/40 uppercase tracking-wider block leading-none">Riesgo</span>
              <span className="text-xs font-black text-brand-orange mt-0.5 leading-none">{stats.riskScore}</span>
            </div>
          </div>
        </motion.div>

        {/* Left Bottom Card: Chatbot with dynamic RGB box shadow glow */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-1 bg-white rounded-[28px] border-4 p-4 flex flex-col justify-between overflow-hidden rgb-glow-card"
        >
          <div className="flex flex-col h-full gap-3 overflow-hidden">
            {/* Chat Header */}
            <div className="flex items-center gap-3 border-b border-black/5 pb-3 shrink-0">
              <img src={assistantIcon} className="w-8 h-8 rounded-full border-2 border-brand-orange object-cover shadow-sm" alt="Asistente" />
              <div>
                <h3 className="text-sm font-black text-black leading-none">Agente Conversacional LINK</h3>
                <span className="text-[9px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1.5 mt-1 leading-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Activo
                </span>
              </div>
            </div>

            {/* Chat Message Stream - Font size changed from 10px to 12px (text-xs) */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-none">
              {messages.map((msg, index) => {
                const isUser = msg.sender === 'user';
                return (
                  <div key={index} className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
                    {isUser ? (
                      <div className="w-6 h-6 rounded-full bg-brand-orange text-white flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    ) : (
                      <img src={assistantIcon} className="w-6 h-6 rounded-full border border-black/5 object-cover mt-0.5 shrink-0" />
                    )}

                    <div className={`p-3 rounded-2xl text-xs leading-relaxed font-semibold whitespace-pre-line max-w-[85%] ${isUser
                      ? 'bg-black text-white rounded-tr-none'
                      : 'bg-[#f8f9fa] border border-[#eef0f2] text-black rounded-tl-none'
                      }`}>
                      {msg.isAnimating ? (
                        <TypewriterText
                          text={msg.text}
                          onComplete={() => {
                            setMessages(prev => prev.map((m, i) => i === index ? { ...m, isAnimating: false } : m));
                            setIsTypingResponse(false);
                          }}
                        />
                      ) : (
                        msg.text
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Waiting for API response */}
              {isWaitingForAPI && (
                <div className="flex items-start gap-2.5">
                  <img src={assistantIcon} className="w-6 h-6 rounded-full border border-black/5 object-cover mt-0.5 shrink-0" />
                  <div className="bg-[#f8f9fa] border border-[#eef0f2] p-3 rounded-2xl rounded-tl-none text-xs text-black/40 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-black/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-black/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-black/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 border-t border-black/5 pt-2.5 shrink-0">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  isTypingResponse
                    ? "Escribiendo..."
                    : isWaitingForAPI
                      ? "Buscando..."
                      : "Consultar zona de riesgo..."
                }
                className="flex-1 bg-[#f8f9fa] border border-black/5 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-brand-orange text-black disabled:opacity-50"
                disabled={isTypingResponse || isWaitingForAPI}
              />
              <button
                type="submit"
                className="p-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl transition-all disabled:opacity-30"
                disabled={!inputValue.trim() || isTypingResponse || isWaitingForAPI}
              >
                <Send size={12} />
              </button>
            </form>
          </div>
        </motion.div>

      </div>

      {/* Right Column (Leaflet Map) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-[28px] border-4 border-black/5 overflow-hidden shadow-2xl relative h-full flex flex-col"
      >
        <div className="flex-1 z-0 relative">
          <MapContainer
            center={[-16.5, -66.0]}
            zoom={7}
            zoomControl={false}
            className="h-full w-full"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            {!loading && <HeatmapLayer points={riskData} />}
          </MapContainer>

          {/* Floating Live Tag */}
          <div className="absolute top-4 left-4 z-[1000]">
            <div className="bg-white/95 backdrop-blur-xl px-4 py-2.5 rounded-xl border border-black/5 flex items-center gap-2.5 shadow-xl">
              <div className="w-7 h-7 rounded-lg bg-brand-orange flex items-center justify-center text-white">
                <ShieldCheck size={16} />
              </div>
              <div>
                <p className="text-[8px] font-black text-black/40 uppercase tracking-widest leading-none">Monitoreo Nacional</p>
                <p className="text-[10px] font-black text-black uppercase mt-1 leading-none">Zonas Rojas Bolivia</p>
              </div>
            </div>
          </div>

          {/* Agent Alerta Floating in bottom-right corner with Monospace bubble (Larger avatar) */}
          <div className="absolute bottom-4 right-4 z-[1000] flex items-end gap-3 pointer-events-none">
            {/* Robot Speech Bubble */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/95 backdrop-blur-md border border-black/5 rounded-2xl p-3.5 shadow-xl max-w-[280px] pointer-events-auto relative shrink-0"
            >
              <div className="absolute right-[-5px] bottom-10 w-2.5 h-2.5 bg-white rotate-45 border-r border-t border-black/5" />
              <p className="font-mono text-[8px] font-black text-brand-orange uppercase tracking-widest leading-none">
                Agente Alerta [IA]
              </p>
              <p className="font-mono text-[9px] text-neutral-800 leading-relaxed font-bold mt-2">
                Este mapa térmico representa el índice nacional de anomalías y vulnerabilidades de vehículos en Bolivia en tiempo real.
                <br /><br />
                Las zonas rojas indican un alto índice de incidentes de sustracción y eventos de SOS monitoreadas por LinkGPS.
              </p>
            </motion.div>

            {/* Floating Agent Image - MUCH LARGER */}
            <motion.img
              src={agenteAlertaIcon}
              alt="Agente Alerta"
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-28 h-28 rounded-full border-4 border-brand-orange/60 object-cover shadow-2xl pointer-events-auto bg-white shrink-0"
            />
          </div>
        </div>
      </motion.div>

      {/* Dynamic CSS styles for RGB shadows */}
      <style>{`
        @keyframes rgbGlow {
          0% { box-shadow: 0 0 25px 6px rgba(239, 68, 68, 0.6); border-color: rgba(239, 68, 68, 0.15); }
          33% { box-shadow: 0 0 25px 6px rgba(34, 197, 94, 0.6); border-color: rgba(34, 197, 94, 0.15); }
          66% { box-shadow: 0 0 25px 6px rgba(59, 130, 246, 0.6); border-color: rgba(59, 130, 246, 0.15); }
          100% { box-shadow: 0 0 25px 6px rgba(239, 68, 68, 0.6); border-color: rgba(239, 68, 68, 0.15); }
        }
        .rgb-glow-card {
          animation: rgbGlow 6s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
