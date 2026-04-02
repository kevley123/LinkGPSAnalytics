import {
  LayoutDashboard,
  Bell,
  Map,
  Activity,
  ShieldAlert,
  Car,
  Brain,
  BarChart3,
  Truck,
  AlertTriangle,
  Repeat,
  Smartphone,
  Zap,
  History,
  Hexagon,
  MapPin,
  Settings,
  LogOut,
  type LucideIcon,
} from 'lucide-react';

export interface SidebarLink {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  section?: string;
  isSpecial?: boolean; // For transmission animation
}

/** Links shown in the dashboard sidebar */
export const SIDEBAR_LINKS: SidebarLink[] = [
  // Principal
  { label: 'Dashboard',      href: '/dashboard',            icon: LayoutDashboard, section: 'Principal' },
  { label: 'Notificaciones', href: '/dashboard/notifications', icon: Bell,          section: 'Principal' },
  { label: 'Mapa en vivo',   href: '/dashboard/mapa_vivo',   icon: Map,             section: 'Principal', isSpecial: true },
  { label: 'Mi actividad',   href: '/dashboard/actividad_mapa', icon: Activity,      section: 'Principal' },

  // Alertas
  { label: 'Alertas IA',     href: '/dashboard/alertas_ia',  icon: ShieldAlert,     section: 'Alertas' },
  { label: 'Alertas Vehiculares', href: '/dashboard/alertas_vehiculares', icon: Car, section: 'Alertas' },

  // Analíticas
  { label: 'Modelo IA',      href: '/dashboard/modelo_ia',   icon: Brain,           section: 'Analíticas' },
  { label: 'Estadísticas',   href: '/dashboard/estadisticas',icon: BarChart3,       section: 'Analíticas' },
  { label: 'Logística',      href: '/dashboard/logistica',   icon: Truck,           section: 'Analíticas' },
  { label: 'Mapa anomalías', href: '/dashboard/mapa_anomalia',icon: AlertTriangle,   section: 'Analíticas' },
  { label: 'Rutas frecuentes',href: '/dashboard/rutas_frecuentes', icon: Repeat,     section: 'Analíticas' },

  // Dispositivo
  { label: 'Mi dispositivo', href: '/dashboard/mi_dispositivo', icon: Smartphone,   section: 'Dispositivo', isSpecial: true },
  { label: 'Estado dispositivo', href: '/dashboard/mi_dispositivo_status', icon: Zap, section: 'Dispositivo' },
  { label: 'Eventos dispositivo', href: '/dashboard/mi_dispositivo_eventos', icon: History, section: 'Dispositivo' },

  // Geocercas
  { label: 'Mis geocercas',  href: '/dashboard/gecercas',    icon: Hexagon,         section: 'Geocercas' },
  { label: 'Eventos geocerca', href: '/dashboard/geocercas_eventos', icon: MapPin,  section: 'Geocercas' },

  // Sistema
  { label: 'Configuración',  href: '/dashboard/configuracion', icon: Settings,      section: 'Sistema' },
  { label: 'Prueba de ubicación', href: '/dashboard/osm',   icon: MapPin,        section: 'Sistema' },
  { label: 'Salir a inicio', href: '/home',                 icon: LogOut,          section: 'Sistema' },
];
