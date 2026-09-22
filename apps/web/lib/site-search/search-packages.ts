import { searchSiteCatalogType } from './search-catalog';
import type { SiteSearchContext, SiteSearchResultItem } from './types';

export type SearchSitePackagesOptions = {
  resultLimit?: number;
};

/**
 * Source API `packages` via `GET /public/site-search` (catalogue unifié).
 */
export async function searchSitePackages(
  query: string,
  context: SiteSearchContext = {},
  options?: SearchSitePackagesOptions,
): Promise<SiteSearchResultItem[]> {
  return searchSiteCatalogType('packages', query, context, options);
}
