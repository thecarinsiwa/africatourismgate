import {
  ADMIN_SEARCH_GROUP_ORDER,
  isAdminSearchSourceAllowed,
  shouldRunAdminSearchSource,
} from './sources';
import type {
  AdminSearchContext,
  AdminSearchGroupId,
  AdminSearchGroupResult,
  AdminSearchResultItem,
  AdminSearchSource,
} from './types';

export type AdminSearchSourceRun = {
  source: AdminSearchSource;
  result: PromiseSettledResult<AdminSearchResultItem[]>;
};

function errorMessage(reason: unknown): string {
  if (reason instanceof Error && reason.message.trim()) {
    return reason.message;
  }
  return 'search_failed';
}

/**
 * Filtre les sources autorisées et éligibles pour la requête courante.
 */
export function selectRunnableAdminSearchSources(
  sources: readonly AdminSearchSource[],
  query: string,
  context: AdminSearchContext,
): AdminSearchSource[] {
  return sources.filter(
    (source) =>
      source.enabled &&
      isAdminSearchSourceAllowed(source, context) &&
      shouldRunAdminSearchSource(source, query),
  );
}

/**
 * Agrège les résultats `Promise.allSettled` par groupe (ordre UI).
 * Les groupes sans items ni erreur sont omis.
 */
export function aggregateAdminSearchResults(
  runs: readonly AdminSearchSourceRun[],
): AdminSearchGroupResult[] {
  const bucket = new Map<
    AdminSearchGroupId,
    { items: AdminSearchResultItem[]; errors: string[] }
  >();

  for (const group of ADMIN_SEARCH_GROUP_ORDER) {
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

  return ADMIN_SEARCH_GROUP_ORDER.flatMap((group) => {
    const entry = bucket.get(group);
    if (!entry) return [];
    if (entry.items.length === 0 && entry.errors.length === 0) return [];

    return [
      {
        group,
        items: entry.items,
        error: entry.errors.length > 0 ? entry.errors[0] : null,
      } satisfies AdminSearchGroupResult,
    ];
  });
}

export function flattenAdminSearchGroups(
  groups: readonly AdminSearchGroupResult[],
): AdminSearchResultItem[] {
  return groups.flatMap((group) => group.items);
}

export async function runAdminSearchFanOut(
  sources: readonly AdminSearchSource[],
  query: string,
  context: AdminSearchContext,
): Promise<AdminSearchSourceRun[]> {
  const runnable = selectRunnableAdminSearchSources(sources, query, context);
  const settled = await Promise.allSettled(
    runnable.map((source) => source.search(query, context)),
  );

  return runnable.map((source, index) => ({
    source,
    result: settled[index]!,
  }));
}
