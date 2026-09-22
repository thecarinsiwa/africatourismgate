import { browsePackages } from '../api/public';
import { siteSearchDeepLinks } from './deep-links';
import { normalizeSiteSearchText } from './nav-match';
import { buildSiteSearchResultId, getSiteSearchSourceDefinition } from './sources';
import type { SiteSearchContext, SiteSearchResultItem } from './types';

export type SearchSitePackagesOptions = {
  resultLimit?: number;
};

/**
 * Source API `packages` — recherche plein texte native via `browsePackages({ search })`.
 */
export async function searchSitePackages(
  query: string,
  _context?: SiteSearchContext,
  options?: SearchSitePackagesOptions,
): Promise<SiteSearchResultItem[]> {
  const definitionLimit =
    getSiteSearchSourceDefinition('packages')?.resultLimit;
  const limit = options?.resultLimit ?? definitionLimit ?? 5;
  const normalized = normalizeSiteSearchText(query);

  if (!normalized) {
    return [];
  }

  const response = await browsePackages({
    search: query.trim(),
    page: 1,
    limit,
  });

  return response.data.slice(0, limit).map((pkg) => ({
    id: buildSiteSearchResultId('packages', pkg.id),
    sourceId: 'packages' as const,
    group: 'packages' as const,
    title: pkg.name,
    subtitle: pkg.description?.trim() || undefined,
    href: siteSearchDeepLinks.packageItem(pkg.id),
    kind: 'entity' as const,
  }));
}
