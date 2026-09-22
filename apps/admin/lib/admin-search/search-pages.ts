import {
  adminBreadcrumbExtraRoutes,
  buildAdminDashboardNav,
} from '../../config/dashboard-nav';
import { isHrefAllowed } from '../../config/admin-route-permissions';
import type {
  AdminSearchContext,
  AdminSearchNavItem,
} from './types';

export type BuildAdminNavSearchItemsOptions = {
  /**
   * Pendant le chargement des permissions, on expose toute la nav
   * (comportement historique de la CommandPalette).
   */
  permissionsLoading?: boolean;
};

export { matchesAdminNavSearchItem } from './nav-match';
export {
  searchAdminPages,
  type SearchAdminPagesOptions,
} from './search-pages-query';

/**
 * Construit la liste dedupliquée / triée des pages admin recherchables.
 * `translateNav` reçoit les clés `nav.*` (ex. `links.users`).
 */
export function buildAdminNavSearchItems(
  translateNav: (key: string) => string,
  context: Pick<AdminSearchContext, 'permissions' | 'isSuperAdmin'>,
  options?: BuildAdminNavSearchItemsOptions,
): AdminSearchNavItem[] {
  const navItems = buildAdminDashboardNav((key) => translateNav(key));
  const fromNav: AdminSearchNavItem[] = [];
  for (const entry of navItems) {
    if (entry.type === 'link') {
      fromNav.push({ href: entry.href, label: entry.label });
    } else {
      for (const child of entry.children) {
        fromNav.push({ href: child.href, label: child.label });
      }
    }
  }

  const fromExtra = adminBreadcrumbExtraRoutes.map((route) => ({
    href: route.href,
    label: translateNav(`links.${route.labelKey}`),
  }));

  const byHref = new Map<string, AdminSearchNavItem>();
  for (const item of [...fromNav, ...fromExtra]) {
    if (!byHref.has(item.href)) {
      byHref.set(item.href, item);
    }
  }

  const items = Array.from(byHref.values());
  const filtered = options?.permissionsLoading
    ? items
    : items.filter((item) => isHrefAllowed(item.href, context));

  return filtered.sort((a, b) => a.label.localeCompare(b.label));
}
