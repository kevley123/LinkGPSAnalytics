import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { SIDEBAR_LINKS } from '../constants/sidebarLinks';
import logo from '../assets/logo_home.png';
import { clsx } from 'clsx';
import { useAppContext } from '../context/AppContext';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const SIDEBAR_WIDTH_OPEN   = 240;
const SIDEBAR_WIDTH_CLOSED = 64;

export default function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
  const { notifsCount, alertsCount } = useAppContext();
  
  // Accordion state: track which sections are expanded
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Principal']));

  const isActive = (href: string) => {
    // If it's the root dashboard link, use exact match to avoid staying active on subpages
    if (href === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  // Group links by section
  const sections = SIDEBAR_LINKS.reduce<Record<string, typeof SIDEBAR_LINKS>>((acc, link) => {
    const sec = link.section ?? 'General';
    if (!acc[sec]) acc[sec] = [];
    
    const linkWithBadge = { ...link };
    if (link.label === 'Notificaciones') linkWithBadge.badge = notifsCount;
    if (link.label === 'Alertas IA') linkWithBadge.badge = alertsCount;
    
    acc[sec].push(linkWithBadge);
    return acc;
  }, {});

  // Update expanded sections when location changes to ensure the current path's section is open
  useEffect(() => {
    const activeLink = SIDEBAR_LINKS.find(l => isActive(l.href));
    if (activeLink?.section) {
      setExpandedSections(prev => new Set(prev).add(activeLink.section!));
    }
  }, [location.pathname]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const sidebarContent = (
    <motion.aside
      className="flex flex-col h-full bg-black border-r border-white/5 overflow-hidden"
      animate={{ width: open ? SIDEBAR_WIDTH_OPEN : SIDEBAR_WIDTH_CLOSED }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Logo row */}
      <div className="h-16 flex items-center px-4 border-b border-white/5 shrink-0 overflow-hidden">
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
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 flex flex-col gap-2 scrollbar-none">
        {Object.entries(sections).map(([section, links]) => {
          const isExpanded = expandedSections.has(section);
          return (
            <div key={section} className="flex flex-col">
              {/* Section Header */}
              {open && (
                <button
                  onClick={() => toggleSection(section)}
                  className="px-4 py-2 flex items-center justify-between text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em] hover:text-neutral-400 transition-colors group"
                >
                  <span>{section}</span>
                  <motion.div
                    animate={{ rotate: isExpanded ? 0 : -90 }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft size={10} className="rotate-270" />
                  </motion.div>
                </button>
              )}

              <AnimatePresence initial={false}>
                {(isExpanded || !open) && (
                  <motion.div
                    initial={open ? { height: 0, opacity: 0 } : false}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-0.5 px-2 py-1">
                      {links.map((link) => {
                        const active = isActive(link.href);
                        const Icon = link.icon;
                        return (
                          <Link
                            key={link.href}
                            to={link.href}
                            className={clsx(
                              'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 group',
                              active
                                ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/10'
                                : 'text-neutral-500 hover:text-white hover:bg-white/5',
                            )}
                            title={!open ? link.label : undefined}
                          >
                            <div className="relative shrink-0">
                              <Icon size={16} />
                              {link.isSpecial && (
                                <span className="absolute -top-1 -right-1 flex h-1.5 w-1.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-orange"></span>
                                </span>
                              )}
                            </div>

                            {open && (
                              <motion.span
                                className="truncate"
                                initial={{ opacity: 0, x: -4 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.15 }}
                              >
                                {link.label}
                              </motion.span>
                            )}

                            {/* Badge */}
                            {link.badge && (
                              <AnimatePresence>
                                {open ? (
                                  <motion.span
                                    key="badge-full"
                                    className="ml-auto shrink-0 min-w-[18px] h-4 px-1 rounded-md
                                               bg-white/10 text-white text-[9px] font-black flex items-center justify-center border border-white/5"
                                    initial={{ opacity: 0, scale: 0.6 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.6 }}
                                  >
                                    {link.badge}
                                  </motion.span>
                                ) : (
                                  <motion.span
                                    key="badge-dot"
                                    className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-brand-orange"
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Footer version */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="px-4 py-4 border-t border-white/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-[9px] font-black text-neutral-700 uppercase tracking-widest leading-relaxed">
              LinkGPS<br />Intelligence Unit
            </p>
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
