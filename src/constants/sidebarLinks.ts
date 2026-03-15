import {
  LayoutDashboard,
  MapPin,
  Activity,
  ShieldAlert,
  BarChart3,
  Brain,
  Settings,
  Bell,
  type LucideIcon,
} from 'lucide-react';

export interface SidebarLink {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  section?: string;
}

/** Links shown in the dashboard sidebar */
export const SIDEBAR_LINKS: SidebarLink[] = [
  // Main
  { label: 'Dashboard',      href: '/dashboard',            icon: LayoutDashboard, section: 'Principal' },
  { label: 'Mapa en vivo',   href: '/dashboard/map',        icon: MapPin,          section: 'Principal' },
  { label: 'Actividad',      href: '/dashboard/activity',   icon: Activity,        section: 'Principal' },

  // Analytics
  { label: 'Alertas ML',     href: '/dashboard/alerts',     icon: ShieldAlert,     section: 'Analíticas', badge: 3 },
  { label: 'Estadísticas',   href: '/dashboard/stats',      icon: BarChart3,       section: 'Analíticas' },
  { label: 'Modelos IA',     href: '/dashboard/models',     icon: Brain,           section: 'Analíticas' },

  // System
  { label: 'Notificaciones', href: '/dashboard/notifications', icon: Bell,         section: 'Sistema', badge: 5 },
  { label: 'Configuración',  href: '/dashboard/settings',   icon: Settings,        section: 'Sistema' },
];
