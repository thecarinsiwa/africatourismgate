import { siteSearchDeepLinks } from './deep-links';
import { normalizeSiteSearchText } from './nav-match';
import { formatSiteSearchPrefilledSubtitle } from './prefilled';
import { getCachedVehicleRouteOptions } from './reference-data';
import { searchSiteCatalogType } from './search-catalog';
import { buildSiteSearchResultId, getSiteSearchSourceDefinition } from './sources';
import type { SiteSearchContext, SiteSearchResultItem } from './types';
import {
  matchesSiteVehicleRouteCity,
  matchesSiteVehicleRoutePair,
  vehicleRouteCityKey,
} from './vehicle-route-match';

export type SearchSiteCarsOptions = {
  resultLimit?: number;
  /** Sous-titre i18n (défaut : « Recherche pré-remplie »). */
  prefilledHint?: string;
};

export {
  matchesSiteVehicleRouteCity,
  matchesSiteVehicleRoutePair,
} from './vehicle-route-match';

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

  const pairs = await getCachedVehicleRouteOptions();
  const results: SiteSearchResultItem[] = [];
  const seen = new Set<string>();

  for (const pair of pairs) {
    if (!matchesSiteVehicleRoutePair(pair, normalized)) {
      continue;
    }
    const key = `route:${vehicleRouteCityKey(pair.departureCity)}|${vehicleRouteCityKey(pair.arrivalCity)}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    results.push({
      id: buildSiteSearchResultId('cars', `prefill:${key}`),
      sourceId: 'cars' as const,
      group: 'cars' as const,
      title: `${pair.departureCity} → ${pair.arrivalCity}`,
      subtitle: formatSiteSearchPrefilledSubtitle('', options?.prefilledHint),
      href: siteSearchDeepLinks.carsByRoute(
        pair.departureCity,
        pair.arrivalCity,
      ),
      kind: 'prefilled' as const,
    });
    if (results.length >= limit) {
      return results;
    }
  }

  for (const pair of pairs) {
    if (!matchesSiteVehicleRouteCity(pair.departureCity, normalized)) {
      continue;
    }
    const key = `dep:${vehicleRouteCityKey(pair.departureCity)}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    results.push({
      id: buildSiteSearchResultId('cars', `prefill:${key}`),
      sourceId: 'cars' as const,
      group: 'cars' as const,
      title: pair.departureCity,
      subtitle: formatSiteSearchPrefilledSubtitle('', options?.prefilledHint),
      href: siteSearchDeepLinks.carsByDeparture(pair.departureCity),
      kind: 'prefilled' as const,
    });
    if (results.length >= limit) {
      break;
    }
  }

  return results;
}

/**
 * Source `cars` : fiches catalogue d’abord, raccourcis tronçon (départ / paire) en secondaire.
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
