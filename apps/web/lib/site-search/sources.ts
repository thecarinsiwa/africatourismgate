import {
  SITE_SEARCH_API_MIN_QUERY_LENGTH,
  SITE_SEARCH_DEFAULT_RESULT_LIMIT,
  type SiteSearchGroupId,
  type SiteSearchSourceDefinition,
  type SiteSearchSourceId,
} from './types';

/**
 * Ordre d’affichage des groupes dans le navigateur.
 * Les groupes sans résultats sont masqués côté UI.
 */
export const SITE_SEARCH_GROUP_ORDER: readonly SiteSearchGroupId[] = [
  'pages',
  'destinations',
  'hotels',
  'activities',
  'packages',
  'cruises',
  'flights',
  'cars',
  'blog',
  'help',
] as const;

/**
 * Catalogue des sources v1.
 * Les adapters `search` seront branchés dans les tâches suivantes.
 */
export const SITE_SEARCH_SOURCE_DEFINITIONS: readonly SiteSearchSourceDefinition[] =
  [
    {
      id: 'pages',
      group: 'pages',
      labelKey: 'pages',
      kind: 'local',
      minQueryLength: 0,
      resultLimit: 12,
      enabled: true,
    },
    {
      id: 'help',
      group: 'help',
      labelKey: 'help',
      kind: 'local',
      minQueryLength: 0,
      resultLimit: 8,
      enabled: true,
    },
    {
      id: 'destinations',
      group: 'destinations',
      labelKey: 'destinations',
      kind: 'reference',
      minQueryLength: 0,
      resultLimit: SITE_SEARCH_DEFAULT_RESULT_LIMIT,
      enabled: true,
    },
    {
      id: 'hotels',
      group: 'hotels',
      labelKey: 'hotels',
      kind: 'api',
      minQueryLength: SITE_SEARCH_API_MIN_QUERY_LENGTH,
      resultLimit: SITE_SEARCH_DEFAULT_RESULT_LIMIT,
      enabled: true,
    },
    {
      id: 'activities',
      group: 'activities',
      labelKey: 'activities',
      kind: 'api',
      minQueryLength: SITE_SEARCH_API_MIN_QUERY_LENGTH,
      resultLimit: SITE_SEARCH_DEFAULT_RESULT_LIMIT,
      enabled: true,
    },
    {
      id: 'packages',
      group: 'packages',
      labelKey: 'packages',
      kind: 'api',
      minQueryLength: SITE_SEARCH_API_MIN_QUERY_LENGTH,
      resultLimit: SITE_SEARCH_DEFAULT_RESULT_LIMIT,
      enabled: true,
    },
    {
      id: 'cruises',
      group: 'cruises',
      labelKey: 'cruises',
      kind: 'api',
      minQueryLength: SITE_SEARCH_API_MIN_QUERY_LENGTH,
      resultLimit: SITE_SEARCH_DEFAULT_RESULT_LIMIT,
      enabled: true,
    },
    {
      id: 'flights',
      group: 'flights',
      labelKey: 'flights',
      kind: 'api',
      minQueryLength: SITE_SEARCH_API_MIN_QUERY_LENGTH,
      resultLimit: SITE_SEARCH_DEFAULT_RESULT_LIMIT,
      enabled: true,
    },
    {
      id: 'cars',
      group: 'cars',
      labelKey: 'cars',
      kind: 'api',
      minQueryLength: SITE_SEARCH_API_MIN_QUERY_LENGTH,
      resultLimit: SITE_SEARCH_DEFAULT_RESULT_LIMIT,
      enabled: true,
    },
    {
      id: 'blog',
      group: 'blog',
      labelKey: 'blog',
      kind: 'api',
      minQueryLength: SITE_SEARCH_API_MIN_QUERY_LENGTH,
      resultLimit: SITE_SEARCH_DEFAULT_RESULT_LIMIT,
      enabled: true,
    },
  ] as const;

const SOURCE_BY_ID = new Map<SiteSearchSourceId, SiteSearchSourceDefinition>(
  SITE_SEARCH_SOURCE_DEFINITIONS.map((source) => [source.id, source]),
);

export function getSiteSearchSourceDefinition(
  id: SiteSearchSourceId,
): SiteSearchSourceDefinition | undefined {
  return SOURCE_BY_ID.get(id);
}

export function listSiteSearchSourceDefinitions(options?: {
  includeDisabled?: boolean;
}): SiteSearchSourceDefinition[] {
  const includeDisabled = options?.includeDisabled ?? false;
  return SITE_SEARCH_SOURCE_DEFINITIONS.filter(
    (source) => includeDisabled || source.enabled,
  );
}

export function shouldRunSiteSearchSource(
  source: Pick<SiteSearchSourceDefinition, 'minQueryLength'>,
  query: string,
): boolean {
  const normalized = query.trim();
  return normalized.length >= source.minQueryLength;
}

export function buildSiteSearchResultId(
  sourceId: SiteSearchSourceId,
  entityId: string,
): string {
  return `${sourceId}:${entityId}`;
}
