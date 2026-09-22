import {
  adminBreadcrumbExtraRoutes,
  buildAdminDashboardNav,
} from '../../config/dashboard-nav';
import { isHrefAllowed } from '../../config/admin-route-permissions';
import { ADMIN_HELP_BASE_PATH } from '../admin-help/routes';
import { buildAdminSearchResultId } from './sources';
import type {
  AdminSearchContext,
  AdminSearchNavItem,
  AdminSearchResultItem,
} from './types';

const ADMIN_HELP_SEARCH_ALIASES = [
  'aide',
  'help',
  'ayuda',
  'docs',
  'documentation',
] as const;

export type BuildAdminNavSearchItemsOptions = {
  /**
   * Pendant le chargement des permissions, on expose toute la nav
   * (comportement historique de la CommandPalette).
   */
  permissionsLoading?: boolean;
};

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

export function matchesAdminNavSearchItem(
  item: AdminSearchNavItem,
  normalizedQuery: string,
): boolean {
  if (!normalizedQuery) {
    return true;
  }

  if (
    item.label.toLowerCase().includes(normalizedQuery) ||
    item.href.toLowerCase().includes(normalizedQuery)
  ) {
    return true;
  }

  if (item.href !== ADMIN_HELP_BASE_PATH || normalizedQuery.length < 2) {
    return false;
  }

  return ADMIN_HELP_SEARCH_ALIASES.some(
    (alias) =>
      alias.includes(normalizedQuery) || normalizedQuery.includes(alias),
  );
}

export type SearchAdminPagesOptions = {
  resultLimit?: number;
};

/**
 * Source locale `pages` : filtre la nav admin (et aliases « aide/help »).
 */
export async function searchAdminPages(
  query: string,
  context: AdminSearchContext,
  options?: SearchAdminPagesOptions,
): Promise<AdminSearchResultItem[]> {
  const navItems = context.navItems ?? [];
  const normalized = query.trim().toLowerCase();
  const matched = normalized
    ? navItems.filter((item) => matchesAdminNavSearchItem(item, normalized))
    : [...navItems];

  const limit = options?.resultLimit ?? matched.length;
  return matched.slice(0, limit).map((item) => ({
    id: buildAdminSearchResultId('pages', item.href),
    sourceId: 'pages',
    group: 'pages',
    title: item.label,
    subtitle: item.href,
    href: item.href,
  }));
}
