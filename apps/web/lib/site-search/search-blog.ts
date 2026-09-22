import { searchSiteCatalogType } from './search-catalog';
import type { SiteSearchContext, SiteSearchResultItem } from './types';

export type SearchSiteBlogOptions = {
  resultLimit?: number;
};

/**
 * Source API `blog` via `GET /public/site-search` (catalogue unifié, locale).
 */
export async function searchSiteBlog(
  query: string,
  context: SiteSearchContext = {},
  options?: SearchSiteBlogOptions,
): Promise<SiteSearchResultItem[]> {
  return searchSiteCatalogType('blog', query, context, options);
}
