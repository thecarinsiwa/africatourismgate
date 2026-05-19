export const dashboardKpis = [
  { key: 'users', label: 'Utilisateurs', href: '/utilisateurs' },
  { key: 'bookings', label: 'Réservations', href: '/reservations' },
  { key: 'revenue', label: 'Revenus' },
  { key: 'properties', label: 'Hébergements', href: '/hebergements' },
] as const;

export type DashboardKpiKey = (typeof dashboardKpis)[number]['key'];
