import { searchAccommodations } from '../api/public';
import { siteSearchDeepLinks } from './deep-links';
import { normalizeSiteSearchText } from './nav-match';
import { buildSiteSearchResultId, getSiteSearchSourceDefinition } from './sources';
import type { SiteSearchContext, SiteSearchResultItem } from './types';

export type SearchSiteHotelsOptions = {
  resultLimit?: number;
};

export type SiteSearchHotelMatchable = {
  name: string;
  destinationName: string;
  slug: string;
};

/**
 * Re-filtre client pour écarter le bruit de `searchAccommodations` :
 * conserve les biens dont le nom, la destination ou le slug matche.
 */
export function matchesSiteHotel(
  property: SiteSearchHotelMatchable,
  normalizedQuery: string,
): boolean {
  if (!normalizedQuery) {
    return false;
  }

  return (
    normalizeSiteSearchText(property.name).includes(normalizedQuery) ||
    normalizeSiteSearchText(property.destinationName).includes(
      normalizedQuery,
    ) ||
    normalizeSiteSearchText(property.slug).includes(normalizedQuery)
  );
}

/**
 * Source API `hotels` :
 * `searchAccommodations({ destination: query })` puis re-filtre name/destination.
 */
export async function searchSiteHotels(
  query: string,
  _context?: SiteSearchContext,
  options?: SearchSiteHotelsOptions,
): Promise<SiteSearchResultItem[]> {
  const definitionLimit =
    getSiteSearchSourceDefinition('hotels')?.resultLimit;
  const limit = options?.resultLimit ?? definitionLimit ?? 5;
  const normalized = normalizeSiteSearchText(query);

  if (!normalized) {
    return [];
  }

  const response = await searchAccommodations({
    destination: query.trim(),
    page: 1,
    limit: Math.min(limit * 3, 30),
  });

  const matched = response.data.filter((property) =>
    matchesSiteHotel(property, normalized),
  );

  return matched.slice(0, limit).map((property) => ({
    id: buildSiteSearchResultId('hotels', property.id),
    sourceId: 'hotels' as const,
    group: 'hotels' as const,
    title: property.name,
    subtitle: property.destinationName
      ? `${property.destinationName} · ${property.countryCode}`
      : property.countryCode,
    href: siteSearchDeepLinks.hotel(property.id),
    kind: 'entity' as const,
  }));
}
