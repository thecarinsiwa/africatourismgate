import {
  searchPublicSiteCatalog,
  type PublicSiteSearchHit,
  type PublicSiteSearchResponse,
  type SiteSearchHitType,
} from '../api/public';
import { normalizeSiteSearchText } from './nav-match';
import { buildSiteSearchResultId, getSiteSearchSourceDefinition } from './sources';
import {
  SITE_SEARCH_DEFAULT_RESULT_LIMIT,
  type SiteSearchContext,
  type SiteSearchResultItem,
  type SiteSearchSourceId,
} from './types';

export type SearchSiteCatalogOptions = {
  resultLimit?: number;
};

/** In-flight dedupe so fan-out sources share one HTTP call per query. */
const catalogInflight = new Map<string, Promise<PublicSiteSearchResponse>>();

function catalogCacheKey(
  query: string,
  locale: string,
  limit: number,
): string {
  return `${query}\0${locale}\0${limit}`;
}

/**
 * Fetches the unified catalogue endpoint once per query/locale/limit.
 * Parallel site-search sources reuse the same promise.
 */
export async function fetchSharedSiteSearchCatalog(
  query: string,
  context: SiteSearchContext = {},
  limit: number = SITE_SEARCH_DEFAULT_RESULT_LIMIT,
): Promise<PublicSiteSearchResponse> {
  const q = query.trim();
  const locale = context.locale?.trim() || '';
  const key = catalogCacheKey(q, locale, limit);

  const existing = catalogInflight.get(key);
  if (existing) {
    return existing;
  }

  const request = searchPublicSiteCatalog({
    q,
    locale: locale || undefined,
    limit,
  }).finally(() => {
    catalogInflight.delete(key);
  });

  catalogInflight.set(key, request);
  return request;
}

/** @internal test helper */
export function clearSiteSearchCatalogInflightCache(): void {
  catalogInflight.clear();
}

export function mapSiteSearchCatalogHitToResultItem(
  hit: PublicSiteSearchHit,
): SiteSearchResultItem {
  const sourceId = hit.type as SiteSearchSourceId;
  return {
    id: buildSiteSearchResultId(sourceId, hit.id),
    sourceId,
    group: sourceId,
    title: hit.title,
    subtitle: hit.subtitle?.trim() || undefined,
    href: hit.href,
    kind: 'entity',
  };
}

/**
 * Catalogue entity hits for one vertical via `GET /public/site-search`.
 */
export async function searchSiteCatalogType(
  type: SiteSearchHitType,
  query: string,
  context: SiteSearchContext = {},
  options?: SearchSiteCatalogOptions,
): Promise<SiteSearchResultItem[]> {
  const definitionLimit = getSiteSearchSourceDefinition(
    type as SiteSearchSourceId,
  )?.resultLimit;
  const limit =
    options?.resultLimit ?? definitionLimit ?? SITE_SEARCH_DEFAULT_RESULT_LIMIT;

  if (!normalizeSiteSearchText(query)) {
    return [];
  }

  const response = await fetchSharedSiteSearchCatalog(query, context, limit);
  const group = response.groups.find((entry) => entry.type === type);

  if (group?.error) {
    throw new Error(group.error);
  }

  return (group?.hits ?? [])
    .slice(0, limit)
    .map(mapSiteSearchCatalogHitToResultItem);
}
