/** Navigation du shell dashboard admin. */
export const adminDashboardNav = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/organisations', label: 'Organisations' },
  { href: '/utilisateurs', label: 'Utilisateurs' },
  { href: '/hebergements', label: 'Hébergements' },
  { href: '/reservations', label: 'Réservations' },
  { href: '/parametres', label: 'Paramètres' },
] as const;

export const adminDashboardConfig = {
  logo: {
    name: 'Africa Tourism Gate',
    href: '/dashboard',
  },
} as const;

/** Chemins protégés par le middleware (dérivés de la nav). */
export const adminProtectedPaths = adminDashboardNav.map((item) => item.href);
