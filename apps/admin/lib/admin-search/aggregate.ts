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

export type AdminSearchFanOutPhase = 'local' | 'core' | 'catalog';

export const ADMIN_SEARCH_FANOUT_PHASES = [
  'local',
  'core',
  'catalog',
] as const satisfies readonly AdminSearchFanOutPhase[];

function abortError(): Error {
  if (typeof DOMException !== 'undefined') {
    return new DOMException('Aborted', 'AbortError');
  }
  return Object.assign(new Error('Aborted'), { name: 'AbortError' });
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw abortError();
  }
}

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
  options?: { signal?: AbortSignal },
): Promise<AdminSearchSourceRun[]> {
  const signal = options?.signal;
  throwIfAborted(signal);

  const runnable = selectRunnableAdminSearchSources(sources, query, context);
  const settled = await Promise.allSettled(
    runnable.map((source) => source.search(query, context, { signal })),
  );

  throwIfAborted(signal);

  return runnable.map((source, index) => ({
    source,
    result: settled[index]!,
  }));
}

export type AdminSearchPhasedFanOutOptions = {
  signal?: AbortSignal;
  /**
   * Appelé après chaque phase avec les runs cumulés
   * (permet un merge progressif côté UI).
   */
  onPhaseComplete?: (
    phase: AdminSearchFanOutPhase,
    phaseRuns: readonly AdminSearchSourceRun[],
    allRuns: readonly AdminSearchSourceRun[],
  ) => void;
};

/**
 * Fan-out séquentiel local → core → catalog.
 * Chaque phase réutilise `runAdminSearchFanOut` (filtre minLength + RBAC).
 */
export async function runAdminSearchPhasedFanOut(
  phases: Readonly<Record<AdminSearchFanOutPhase, readonly AdminSearchSource[]>>,
  query: string,
  context: AdminSearchContext,
  options?: AdminSearchPhasedFanOutOptions,
): Promise<AdminSearchSourceRun[]> {
  const allRuns: AdminSearchSourceRun[] = [];

  for (const phase of ADMIN_SEARCH_FANOUT_PHASES) {
    throwIfAborted(options?.signal);
    const phaseRuns = await runAdminSearchFanOut(
      phases[phase],
      query,
      context,
      { signal: options?.signal },
    );
    allRuns.push(...phaseRuns);
    options?.onPhaseComplete?.(phase, phaseRuns, allRuns);
  }

  return allRuns;
}
