import { normalizeSiteSearchText } from './nav-match';
import { searchSiteCatalogType } from './search-catalog';
import type { SiteSearchContext, SiteSearchResultItem } from './types';

export type SearchSiteActivitiesOptions = {
  resultLimit?: number;
};

export type SiteSearchActivityMatchable = {
  title: string;
  destination: string;
};

/**
 * Re-filtre client (tests / utilitaires) pour title / destination.
 */
export function matchesSiteActivity(
  activity: SiteSearchActivityMatchable,
  normalizedQuery: string,
): boolean {
  if (!normalizedQuery) {
    return false;
  }

  return (
    normalizeSiteSearchText(activity.title).includes(normalizedQuery) ||
    normalizeSiteSearchText(activity.destination).includes(normalizedQuery)
  );
}

/**
 * Source API `activities` via `GET /public/site-search` (catalogue unifié).
 */
export async function searchSiteActivities(
  query: string,
  context: SiteSearchContext = {},
  options?: SearchSiteActivitiesOptions,
): Promise<SiteSearchResultItem[]> {
  return searchSiteCatalogType('activities', query, context, options);
}
