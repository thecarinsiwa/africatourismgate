import { buildAdminSearchResultId } from './sources';
import { matchesAdminNavSearchItem } from './nav-match';
import type {
  AdminSearchContext,
  AdminSearchResultItem,
} from './types';

export type SearchAdminPagesOptions = {
  resultLimit?: number;
};

/**
 * Source locale `pages` : filtre la nav admin (et aliases « aide/help »).
 * Ne dépend pas du shell UI — `navItems` fournis via le contexte.
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
    sourceId: 'pages' as const,
    group: 'pages' as const,
    title: item.label,
    subtitle: item.href,
    href: item.href,
  }));
}
