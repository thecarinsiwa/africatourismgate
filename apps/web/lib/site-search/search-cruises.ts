import { CRUISE_PORT_OPTIONS } from '../cruises/ports';
import { siteSearchDeepLinks } from './deep-links';
import { normalizeSiteSearchText } from './nav-match';
import { searchSiteCatalogType } from './search-catalog';
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

async function searchSiteCruisesPrefilled(
  query: string,
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
    id: buildSiteSearchResultId('cruises', `prefill:${port.code}`),
    sourceId: 'cruises' as const,
    group: 'cruises' as const,
    title: port.name,
    subtitle: port.code,
    href: siteSearchDeepLinks.cruisesFrom(port.code),
    kind: 'prefilled' as const,
  }));
}

/**
 * Source `cruises` : sailings catalogue d’abord, raccourcis ports en secondaire.
 */
export async function searchSiteCruises(
  query: string,
  context: SiteSearchContext = {},
  options?: SearchSiteCruisesOptions,
): Promise<SiteSearchResultItem[]> {
  const definitionLimit =
    getSiteSearchSourceDefinition('cruises')?.resultLimit;
  const limit = options?.resultLimit ?? definitionLimit ?? 5;

  let entities: SiteSearchResultItem[] = [];
  try {
    entities = await searchSiteCatalogType('cruises', query, context, {
      resultLimit: limit,
    });
  } catch {
    entities = [];
  }

  if (entities.length >= limit) {
    return entities.slice(0, limit);
  }

  const prefilled = await searchSiteCruisesPrefilled(query, {
    ...options,
    resultLimit: limit - entities.length,
  });

  return [...entities, ...prefilled];
}
