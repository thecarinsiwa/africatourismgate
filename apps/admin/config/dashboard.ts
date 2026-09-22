import { ADMIN_HELP_BASE_PATH } from '../lib/admin-help/routes';
import { adminDashboardNavConfig, flattenAdminNavHrefs } from './dashboard-nav.config';

export const adminDashboardConfig = {
  logo: {
    name: 'ATG Admin',
    href: '/dashboard',
  },
} as const;

/**
 * Routes hors menu latéral mais protégées (auth login uniquement).
 * Le centre d’aide admin n’a pas de permission RBAC dédiée.
 */
export const adminExtraProtectedPaths = [ADMIN_HELP_BASE_PATH] as const;

/** Chemins protégés par le middleware (nav + routes hors menu). */
export const adminProtectedPaths = [
  ...flattenAdminNavHrefs(adminDashboardNavConfig),
  ...adminExtraProtectedPaths,
];
