import { adminDashboardNavConfig, flattenAdminNavHrefs } from './dashboard-nav.config';

export const adminDashboardConfig = {
  logo: {
    name: 'ATG Admin',
    href: '/dashboard',
  },
} as const;

/** Chemins protégés par le middleware (dérivés de la nav). */
export const adminProtectedPaths = flattenAdminNavHrefs(adminDashboardNavConfig);
