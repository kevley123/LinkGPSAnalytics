import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { SIDEBAR_LINKS } from '../constants/sidebarLinks';
import logo from '../assets/logo_home.png';
import { clsx } from 'clsx';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const SIDEBAR_WIDTH_OPEN   = 240;
const SIDEBAR_WIDTH_CLOSED = 64;

export default function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();

  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(href + '/');

  // Group links by section
  const sections = SIDEBAR_LINKS.reduce<Record<string, typeof SIDEBAR_LINKS>>((acc, link) => {
    const sec = link.section ?? 'General';
    if (!acc[sec]) acc[sec] = [];
    acc[sec].push(link);
    return acc;
  }, {});

  const sidebarContent = (
    <motion.aside
      className="flex flex-col h-full bg-brand-dark-2 border-r border-brand-dark-4 overflow-hidden"
      animate={{ width: open ? SIDEBAR_WIDTH_OPEN : SIDEBAR_WIDTH_CLOSED }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Logo row */}
      <div className="h-16 flex items-center px-4 border-b border-brand-dark-4 shrink-0 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.img
              key="logo-full"
              src={logo}
              alt="LinkGPS"
              className="h-6 shrink-0"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
            />
          ) : (
            <motion.div
              key="logo-icon"
              className="w-8 h-8 bg-brand-orange/10 border border-brand-orange/20 rounded-lg
                         flex items-center justify-center shrink-0"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <span className="text-brand-orange font-black text-xs">L</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse button */}
        <AnimatePresence>
          {open && (
            <motion.button
              onClick={onClose}
              className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center
                         text-neutral-500 hover:text-brand-orange hover:bg-brand-orange/10 transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 flex flex-col gap-6">
        {Object.entries(sections).map(([section, links]) => (
          <div key={section}>
            {/* Section label */}
            <AnimatePresence>
              {open && (
                <motion.p
                  className="px-4 mb-2 text-[10px] font-semibold text-neutral-600 uppercase tracking-widest"
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  {section}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-0.5 px-2">
              {links.map((link) => {
                const active = isActive(link.href);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={clsx(
                      'relative flex items-center gap-3 px-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                      active
                        ? 'bg-brand-orange/15 text-brand-orange'
                        : 'text-neutral-400 hover:text-white hover:bg-brand-dark-3',
                    )}
                    title={!open ? link.label : undefined}
                  >
                    {/* Active indicator */}
                    {active && (
                      <motion.span
                        layoutId="active-sidebar"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r bg-brand-orange"
                        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                      />
                    )}
                    <div className="relative shrink-0">
                      <Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
                      {link.isSpecial && (
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-orange"></span>
                        </span>
                      )}
                    </div>

                    <AnimatePresence>
                      {open && (
                        <motion.span
                          className="truncate"
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -4 }}
                          transition={{ duration: 0.15 }}
                        >
                          {link.label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* Badge */}
                    {link.badge && (
                      <AnimatePresence>
                        {open ? (
                          <motion.span
                            key="badge-full"
                            className="ml-auto shrink-0 min-w-[20px] h-5 px-1.5 rounded-full
                                       bg-brand-orange text-white text-[10px] font-bold flex items-center justify-center"
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.6 }}
                          >
                            {link.badge}
                          </motion.span>
                        ) : (
                          <motion.span
                            key="badge-dot"
                            className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-orange"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          />
                        )}
                      </AnimatePresence>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer version */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="px-4 py-3 border-t border-brand-dark-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-[10px] text-neutral-600">LinkGPS Analytics v0.1.0</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex h-full shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile drawer overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.div
              className="fixed left-0 top-0 bottom-0 z-50 md:hidden"
              style={{ width: SIDEBAR_WIDTH_OPEN }}
              initial={{ x: -SIDEBAR_WIDTH_OPEN }}
              animate={{ x: 0 }}
              exit={{ x: -SIDEBAR_WIDTH_OPEN }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
