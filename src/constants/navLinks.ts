export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

/** Links shown in the public Home page navigation bar */
export const NAV_LINKS: NavLink[] = [
  { label: 'Inicio',         href: '/home' },
  { label: 'Funcionalidades',href: '/home#features' },
  { label: 'Cómo funciona',  href: '/home#how-it-works' },
  { label: 'Acerca de',      href: '/home#about' },
];
