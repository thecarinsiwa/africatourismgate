import {
  SITE_SEARCH_GROUP_ORDER,
  shouldRunSiteSearchSource,
} from './sources';
import type {
  SiteSearchContext,
  SiteSearchGroupId,
  SiteSearchGroupResult,
  SiteSearchResultItem,
  SiteSearchSource,
} from './types';

export type SiteSearchSourceRun = {
  source: SiteSearchSource;
  result: PromiseSettledResult<SiteSearchResultItem[]>;
};

function errorMessage(reason: unknown): string {
  if (reason instanceof Error && reason.message.trim()) {
    return reason.message;
  }
  return 'search_failed';
}

/**
 * Filtre les sources activées et éligibles pour la requête courante.
 * Pas de filtre RBAC côté site public.
 */
export function selectRunnableSiteSearchSources(
  sources: readonly SiteSearchSource[],
  query: string,
): SiteSearchSource[] {
  return sources.filter(
    (source) =>
      source.enabled && shouldRunSiteSearchSource(source, query),
  );
}

/**
 * Agrège les résultats `Promise.allSettled` par groupe (ordre UI).
 * Les groupes sans items ni erreur sont omis.
 */
export function aggregateSiteSearchResults(
  runs: readonly SiteSearchSourceRun[],
): SiteSearchGroupResult[] {
  const bucket = new Map<
    SiteSearchGroupId,
    { items: SiteSearchResultItem[]; errors: string[] }
  >();

  for (const group of SITE_SEARCH_GROUP_ORDER) {
    bucket.set(group, { items: [], errors: [] });
  }

  for (const { source, result } of runs) {
    const entry = bucket.get(source.group);
    if (!entry) continue;

    if (result.status === 'fulfilled') {
      entry.items.push(...result.value);
    } else {
      entry.errors.push(errorMessage(result.reason));
    }
  }

  return SITE_SEARCH_GROUP_ORDER.flatMap((group) => {
    const entry = bucket.get(group);
    if (!entry) return [];
    if (entry.items.length === 0 && entry.errors.length === 0) return [];

    return [
      {
        group,
        items: entry.items,
        error: entry.errors.length > 0 ? entry.errors[0] : null,
      } satisfies SiteSearchGroupResult,
    ];
  });
}

export function flattenSiteSearchGroups(
  groups: readonly SiteSearchGroupResult[],
): SiteSearchResultItem[] {
  return groups.flatMap((group) => group.items);
}

export async function runSiteSearchFanOut(
  sources: readonly SiteSearchSource[],
  query: string,
  context: SiteSearchContext = {},
): Promise<SiteSearchSourceRun[]> {
  const runnable = selectRunnableSiteSearchSources(sources, query);
  const settled = await Promise.allSettled(
    runnable.map((source) => source.search(query, context)),
  );

  return runnable.map((source, index) => ({
    source,
    result: settled[index]!,
  }));
}
