import { browseActivities } from '../api/public';
import { siteSearchDeepLinks } from './deep-links';
import { normalizeSiteSearchText } from './nav-match';
import { buildSiteSearchResultId, getSiteSearchSourceDefinition } from './sources';
import type { SiteSearchContext, SiteSearchResultItem } from './types';

export type SearchSiteActivitiesOptions = {
  resultLimit?: number;
};

export type SiteSearchActivityMatchable = {
  title: string;
  destination: string;
};

/**
 * Re-filtre client pour écarter le bruit de `browseActivities` :
 * conserve les activités dont le titre ou la destination matche.
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
 * Source API `activities` :
 * `browseActivities({ destination: query })` puis re-filtre title/destination.
 */
export async function searchSiteActivities(
  query: string,
  _context?: SiteSearchContext,
  options?: SearchSiteActivitiesOptions,
): Promise<SiteSearchResultItem[]> {
  const definitionLimit =
    getSiteSearchSourceDefinition('activities')?.resultLimit;
  const limit = options?.resultLimit ?? definitionLimit ?? 5;
  const normalized = normalizeSiteSearchText(query);

  if (!normalized) {
    return [];
  }

  const response = await browseActivities({
    destination: query.trim(),
    page: 1,
    limit: Math.min(limit * 3, 30),
  });

  const matched = response.data.filter((activity) =>
    matchesSiteActivity(activity, normalized),
  );

  return matched.slice(0, limit).map((activity) => ({
    id: buildSiteSearchResultId('activities', activity.id),
    sourceId: 'activities' as const,
    group: 'activities' as const,
    title: activity.title,
    subtitle: activity.destination || activity.providerName,
    href: siteSearchDeepLinks.activity(activity.id),
    kind: 'entity' as const,
  }));
}
