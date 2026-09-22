import type { PublicAirport } from '../flights/types';
import { siteSearchDeepLinks } from './deep-links';
import { normalizeSiteSearchText } from './nav-match';
import { formatSiteSearchPrefilledSubtitle } from './prefilled';
import { getCachedAirports } from './reference-data';
import { searchSiteCatalogType } from './search-catalog';
import { buildSiteSearchResultId, getSiteSearchSourceDefinition } from './sources';
import type { SiteSearchContext, SiteSearchResultItem } from './types';

export type SearchSiteFlightsOptions = {
  resultLimit?: number;
  /** Sous-titre i18n (défaut : « Recherche pré-remplie »). */
  prefilledHint?: string;
};

export function matchesSiteAirport(
  airport: Pick<PublicAirport, 'name' | 'iataCode' | 'city'>,
  normalizedQuery: string,
): boolean {
  if (!normalizedQuery) {
    return false;
  }

  const name = normalizeSiteSearchText(airport.name);
  const iata = normalizeSiteSearchText(airport.iataCode);
  const city = normalizeSiteSearchText(airport.city);

  return (
    name.includes(normalizedQuery) ||
    iata.includes(normalizedQuery) ||
    city.includes(normalizedQuery)
  );
}

async function searchSiteFlightsPrefilled(
  query: string,
  options?: SearchSiteFlightsOptions,
): Promise<SiteSearchResultItem[]> {
  const definitionLimit =
    getSiteSearchSourceDefinition('flights')?.resultLimit;
  const limit = options?.resultLimit ?? definitionLimit ?? 5;
  const normalized = normalizeSiteSearchText(query);

  if (!normalized) {
    return [];
  }

  const airports = await getCachedAirports();
  const matched = airports.filter((airport) =>
    matchesSiteAirport(airport, normalized),
  );

  return matched.slice(0, limit).map((airport) => ({
    id: buildSiteSearchResultId('flights', `prefill:${airport.iataCode}`),
    sourceId: 'flights' as const,
    group: 'flights' as const,
    title: airport.name,
    subtitle: formatSiteSearchPrefilledSubtitle(
      airport.iataCode,
      options?.prefilledHint,
    ),
    href: siteSearchDeepLinks.flightsFrom(airport.iataCode),
    kind: 'prefilled' as const,
  }));
}

/**
 * Source `flights` : fiches catalogue d’abord, raccourcis aéroports en secondaire.
 */
export async function searchSiteFlights(
  query: string,
  context: SiteSearchContext = {},
  options?: SearchSiteFlightsOptions,
): Promise<SiteSearchResultItem[]> {
  const definitionLimit =
    getSiteSearchSourceDefinition('flights')?.resultLimit;
  const limit = options?.resultLimit ?? definitionLimit ?? 5;

  let entities: SiteSearchResultItem[] = [];
  try {
    entities = await searchSiteCatalogType('flights', query, context, {
      resultLimit: limit,
    });
  } catch {
    entities = [];
  }

  if (entities.length >= limit) {
    return entities.slice(0, limit);
  }

  const prefilled = await searchSiteFlightsPrefilled(query, {
    ...options,
    resultLimit: limit - entities.length,
  });

  return [...entities, ...prefilled];
}
