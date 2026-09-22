import { CRUISE_PORT_OPTIONS } from '../cruises/ports';
import { siteSearchDeepLinks } from './deep-links';
import { normalizeSiteSearchText } from './nav-match';
import { buildSiteSearchResultId, getSiteSearchSourceDefinition } from './sources';
import type { SiteSearchContext, SiteSearchResultItem } from './types';

export type SearchSiteCruisesOptions = {
  resultLimit?: number;
};

export type SiteSearchCruisePort = {
  code: string;
  name: string;
};

export function matchesSiteCruisePort(
  port: SiteSearchCruisePort,
  normalizedQuery: string,
): boolean {
  if (!normalizedQuery) {
    return false;
  }

  const code = normalizeSiteSearchText(port.code);
  const name = normalizeSiteSearchText(port.name);

  return code.includes(normalizedQuery) || name.includes(normalizedQuery);
}

/**
 * Source référence `cruises` :
 * filtre les ports connus (`CRUISE_PORT_OPTIONS`) et produit un listing
 * pré-rempli via `buildSearchRoute('cruises', { sailFrom })`.
 */
export async function searchSiteCruises(
  query: string,
  _context?: SiteSearchContext,
  options?: SearchSiteCruisesOptions,
): Promise<SiteSearchResultItem[]> {
  const definitionLimit =
    getSiteSearchSourceDefinition('cruises')?.resultLimit;
  const limit = options?.resultLimit ?? definitionLimit ?? 5;
  const normalized = normalizeSiteSearchText(query);

  if (!normalized) {
    return [];
  }

  const matched = CRUISE_PORT_OPTIONS.filter((port) =>
    matchesSiteCruisePort(port, normalized),
  );

  return matched.slice(0, limit).map((port) => ({
    id: buildSiteSearchResultId('cruises', port.code),
    sourceId: 'cruises' as const,
    group: 'cruises' as const,
    title: port.name,
    subtitle: port.code,
    href: siteSearchDeepLinks.cruisesFrom(port.code),
    kind: 'prefilled' as const,
  }));
}
