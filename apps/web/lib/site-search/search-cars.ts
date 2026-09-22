import type { PublicDestination } from '@africatourismgate/types';
import { siteSearchDeepLinks } from './deep-links';
import { normalizeSiteSearchText } from './nav-match';
import { formatSiteSearchPrefilledSubtitle } from './prefilled';
import { getCachedPickupLocations } from './reference-data';
import { searchSiteCatalogType } from './search-catalog';
import { buildSiteSearchResultId, getSiteSearchSourceDefinition } from './sources';
import type { SiteSearchContext, SiteSearchResultItem } from './types';

export type SearchSiteCarsOptions = {
  resultLimit?: number;
  /** Sous-titre i18n (défaut : « Recherche pré-remplie »). */
  prefilledHint?: string;
};

export function matchesSitePickupLocation(
  location: Pick<PublicDestination, 'name' | 'countryCode'>,
  normalizedQuery: string,
): boolean {
  if (!normalizedQuery) {
    return false;
  }

  const name = normalizeSiteSearchText(location.name);
  const country = normalizeSiteSearchText(location.countryCode);

  return name.includes(normalizedQuery) || country.includes(normalizedQuery);
}

async function searchSiteCarsPrefilled(
  query: string,
  options?: SearchSiteCarsOptions,
): Promise<SiteSearchResultItem[]> {
  const definitionLimit = getSiteSearchSourceDefinition('cars')?.resultLimit;
  const limit = options?.resultLimit ?? definitionLimit ?? 5;
  const normalized = normalizeSiteSearchText(query);

  if (!normalized) {
    return [];
  }

  const locations = await getCachedPickupLocations();
  const matched = locations.filter((location) =>
    matchesSitePickupLocation(location, normalized),
  );

  return matched.slice(0, limit).map((location) => ({
    id: buildSiteSearchResultId('cars', `prefill:${location.id}`),
    sourceId: 'cars' as const,
    group: 'cars' as const,
    title: location.name,
    subtitle: formatSiteSearchPrefilledSubtitle(
      location.countryCode,
      options?.prefilledHint,
    ),
    href: siteSearchDeepLinks.carsByPickup(location.name),
    kind: 'prefilled' as const,
  }));
}

/**
 * Source `cars` : fiches catalogue d’abord, raccourcis pickup en secondaire.
 */
export async function searchSiteCars(
  query: string,
  context: SiteSearchContext = {},
  options?: SearchSiteCarsOptions,
): Promise<SiteSearchResultItem[]> {
  const definitionLimit = getSiteSearchSourceDefinition('cars')?.resultLimit;
  const limit = options?.resultLimit ?? definitionLimit ?? 5;
  const prefilledHint = options?.prefilledHint ?? context.prefilledHint;

  let entities: SiteSearchResultItem[] = [];
  try {
    entities = await searchSiteCatalogType('cars', query, context, {
      resultLimit: limit,
    });
  } catch {
    entities = [];
  }

  if (entities.length >= limit) {
    return entities.slice(0, limit);
  }

  const prefilled = await searchSiteCarsPrefilled(query, {
    ...options,
    prefilledHint,
    resultLimit: limit - entities.length,
  });

  return [...entities, ...prefilled];
}
