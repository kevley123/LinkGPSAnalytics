import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut } from 'lucide-react';
import { NAV_LINKS } from '../constants/navLinks';
import { useAppContext } from '../context/AppContext';
import logo from '../assets/logo_home.png';
import NotificationsPopover from '../components/NotificationsPopover';

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export default function Header({ onToggleSidebar, sidebarOpen }: HeaderProps) {
  const { user, logout } = useAppContext();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();

  const isDashboard = location.pathname.startsWith('/dashboard') || 
                      location.pathname.startsWith('/analytics') ||
                      location.pathname === '/mapa-vivo' ||
                      location.pathname === '/notificaciones';
  const isActive = (href: string) => location.pathname === href;

  return (
    <header className="bg-white/5 backdrop-blur-2xl border-b border-white/10 h-16 flex items-center px-6 gap-4 sticky top-0 z-40 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      {/* Sidebar toggle */}
      <motion.button
        onClick={onToggleSidebar}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-400
                   hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
        whileTap={{ scale: 0.9 }}
        aria-label="Toggle sidebar"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={sidebarOpen ? 'close' : 'open'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      {/* Logo (Hidden on Dashboard to avoid duplication with Sidebar) */}
      {!isDashboard && (
        <Link to="/home" className="shrink-0 ml-2">
          <img src={logo} alt="LinkGPS" className="h-6" />
        </Link>
      )}

      {/* Nav links (Crystal Style) */}
      <nav className="hidden lg:flex items-center gap-3 ml-4">
        {NAV_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className={`px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border
              ${isActive(link.href)
                ? 'bg-brand-orange text-white border-brand-orange shadow-lg shadow-brand-orange/20'
                : 'bg-white/5 text-neutral-400 border-white/5 hover:border-white/20 hover:text-white backdrop-blur-xl'
              }`}
          >
            {link.label}
          </a>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Notifications Popover */}
      <NotificationsPopover />

      {/* User menu (Crystal Style) */}
      <div className="relative">
        <motion.button
          onClick={() => setUserMenuOpen((v) => !v)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10
                     text-neutral-300 hover:text-white hover:border-white/20 transition-all shadow-xl"
          whileTap={{ scale: 0.97 }}
        >
          <div className="w-7 h-7 rounded-lg bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center">
            <User className="w-4 h-4 text-brand-orange" />
          </div>
          <span className="hidden sm:block text-[11px] font-black uppercase tracking-widest truncate max-w-[100px]">
            {user?.name ?? 'Usuario'}
          </span>
        </motion.button>

        <AnimatePresence>
          {userMenuOpen && (
            <motion.div
              className="absolute right-0 top-12 w-52 glass rounded-xl border border-brand-dark-4
                         shadow-2xl overflow-hidden z-50"
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <div className="px-4 py-3 border-b border-brand-dark-4">
                <p className="text-white text-sm font-medium truncate">{user?.name}</p>
                <p className="text-neutral-500 text-xs truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => { logout(); setUserMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-400
                           hover:bg-red-500/10 transition-colors text-xs font-medium"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
