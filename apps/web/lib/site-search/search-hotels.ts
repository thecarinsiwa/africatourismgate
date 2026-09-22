import { normalizeSiteSearchText } from './nav-match';
import { searchSiteCatalogType } from './search-catalog';
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
 * Re-filtre client (tests / utilitaires) pour name / destination / slug.
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
 * Source API `hotels` via `GET /public/site-search` (catalogue unifié).
 */
export async function searchSiteHotels(
  query: string,
  context: SiteSearchContext = {},
  options?: SearchSiteHotelsOptions,
): Promise<SiteSearchResultItem[]> {
  return searchSiteCatalogType('hotels', query, context, options);
}
