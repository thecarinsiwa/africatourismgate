import {
  isHrefAllowed,
  type RouteAccessContext,
} from '../../config/admin-route-permissions';
import {
  ADMIN_SEARCH_API_MIN_QUERY_LENGTH,
  ADMIN_SEARCH_DEFAULT_RESULT_LIMIT,
  type AdminSearchGroupId,
  type AdminSearchSourceDefinition,
  type AdminSearchSourceId,
} from './types';

/**
 * Ordre d’affichage des groupes dans le navigateur.
 * Les groupes sans résultats sont masqués côté UI.
 */
export const ADMIN_SEARCH_GROUP_ORDER: readonly AdminSearchGroupId[] = [
  'pages',
  'help',
  'users',
  'organizations',
  'bookings',
  'properties',
  'payments',
  'support',
  'catalog',
  'content',
] as const;

/**
 * Catalogue des sources v1.
 * Les adapters `search` seront branchés dans les tâches suivantes.
 */
export const ADMIN_SEARCH_SOURCE_DEFINITIONS: readonly AdminSearchSourceDefinition[] =
  [
    {
      id: 'pages',
      group: 'pages',
      labelKey: 'pages',
      listHref: '/dashboard',
      kind: 'local',
      minQueryLength: 0,
      resultLimit: 20,
      enabled: true,
    },
    {
      id: 'help',
      group: 'help',
      labelKey: 'help',
      listHref: '/aide',
      kind: 'local',
      minQueryLength: 0,
      resultLimit: 8,
      enabled: true,
    },
    {
      id: 'users',
      group: 'users',
      labelKey: 'users',
      listHref: '/utilisateurs',
      kind: 'api',
      minQueryLength: ADMIN_SEARCH_API_MIN_QUERY_LENGTH,
      resultLimit: ADMIN_SEARCH_DEFAULT_RESULT_LIMIT,
      enabled: true,
    },
    {
      id: 'organizations',
      group: 'organizations',
      labelKey: 'organizations',
      listHref: '/organisations',
      kind: 'api',
      minQueryLength: ADMIN_SEARCH_API_MIN_QUERY_LENGTH,
      resultLimit: ADMIN_SEARCH_DEFAULT_RESULT_LIMIT,
      enabled: true,
    },
    {
      id: 'bookings',
      group: 'bookings',
      labelKey: 'bookings',
      listHref: '/reservations',
      kind: 'api',
      minQueryLength: ADMIN_SEARCH_API_MIN_QUERY_LENGTH,
      resultLimit: ADMIN_SEARCH_DEFAULT_RESULT_LIMIT,
      enabled: true,
    },
    {
      id: 'properties',
      group: 'properties',
      labelKey: 'properties',
      listHref: '/hebergements',
      kind: 'api',
      minQueryLength: ADMIN_SEARCH_API_MIN_QUERY_LENGTH,
      resultLimit: ADMIN_SEARCH_DEFAULT_RESULT_LIMIT,
      enabled: true,
    },
    {
      id: 'payments',
      group: 'payments',
      labelKey: 'payments',
      listHref: '/paiements',
      kind: 'api',
      minQueryLength: ADMIN_SEARCH_API_MIN_QUERY_LENGTH,
      resultLimit: ADMIN_SEARCH_DEFAULT_RESULT_LIMIT,
      enabled: true,
    },
    {
      id: 'supportTickets',
      group: 'support',
      labelKey: 'supportTickets',
      listHref: '/contenu/tickets',
      kind: 'api',
      minQueryLength: ADMIN_SEARCH_API_MIN_QUERY_LENGTH,
      resultLimit: ADMIN_SEARCH_DEFAULT_RESULT_LIMIT,
      enabled: true,
    },
    {
      id: 'activities',
      group: 'catalog',
      labelKey: 'activities',
      listHref: '/produits/activites',
      kind: 'api',
      minQueryLength: ADMIN_SEARCH_API_MIN_QUERY_LENGTH,
      resultLimit: ADMIN_SEARCH_DEFAULT_RESULT_LIMIT,
      enabled: true,
    },
    {
      id: 'flights',
      group: 'catalog',
      labelKey: 'flights',
      listHref: '/produits/vols',
      kind: 'api',
      minQueryLength: ADMIN_SEARCH_API_MIN_QUERY_LENGTH,
      resultLimit: ADMIN_SEARCH_DEFAULT_RESULT_LIMIT,
      enabled: true,
    },
    {
      id: 'vehicles',
      group: 'catalog',
      labelKey: 'vehicles',
      listHref: '/produits/locations',
      kind: 'api',
      minQueryLength: ADMIN_SEARCH_API_MIN_QUERY_LENGTH,
      resultLimit: ADMIN_SEARCH_DEFAULT_RESULT_LIMIT,
      enabled: true,
    },
    {
      id: 'packages',
      group: 'catalog',
      labelKey: 'packages',
      listHref: '/produits/forfaits',
      kind: 'api',
      minQueryLength: ADMIN_SEARCH_API_MIN_QUERY_LENGTH,
      resultLimit: ADMIN_SEARCH_DEFAULT_RESULT_LIMIT,
      enabled: true,
    },
    {
      id: 'sailings',
      group: 'catalog',
      labelKey: 'sailings',
      listHref: '/produits/croisieres',
      kind: 'api',
      minQueryLength: ADMIN_SEARCH_API_MIN_QUERY_LENGTH,
      resultLimit: ADMIN_SEARCH_DEFAULT_RESULT_LIMIT,
      enabled: true,
    },
    {
      id: 'blogPosts',
      group: 'content',
      labelKey: 'blogPosts',
      listHref: '/contenu/blog',
      kind: 'api',
      minQueryLength: ADMIN_SEARCH_API_MIN_QUERY_LENGTH,
      resultLimit: ADMIN_SEARCH_DEFAULT_RESULT_LIMIT,
      enabled: true,
    },
    {
      id: 'destinations',
      group: 'content',
      labelKey: 'destinations',
      listHref: '/produits/destinations',
      kind: 'api',
      minQueryLength: ADMIN_SEARCH_API_MIN_QUERY_LENGTH,
      resultLimit: ADMIN_SEARCH_DEFAULT_RESULT_LIMIT,
      enabled: true,
    },
    {
      id: 'employees',
      group: 'content',
      labelKey: 'employees',
      listHref: '/utilisateurs/employes',
      kind: 'api',
      minQueryLength: ADMIN_SEARCH_API_MIN_QUERY_LENGTH,
      resultLimit: ADMIN_SEARCH_DEFAULT_RESULT_LIMIT,
      enabled: true,
    },
  ] as const;

const SOURCE_BY_ID = new Map<AdminSearchSourceId, AdminSearchSourceDefinition>(
  ADMIN_SEARCH_SOURCE_DEFINITIONS.map((source) => [source.id, source]),
);

export function getAdminSearchSourceDefinition(
  id: AdminSearchSourceId,
): AdminSearchSourceDefinition | undefined {
  return SOURCE_BY_ID.get(id);
}

export function listAdminSearchSourceDefinitions(
  options?: { includeDisabled?: boolean },
): AdminSearchSourceDefinition[] {
  const includeDisabled = options?.includeDisabled ?? false;
  return ADMIN_SEARCH_SOURCE_DEFINITIONS.filter(
    (source) => includeDisabled || source.enabled,
  );
}

export function isAdminSearchSourceAllowed(
  source: Pick<AdminSearchSourceDefinition, 'listHref'>,
  context: RouteAccessContext,
): boolean {
  return isHrefAllowed(source.listHref, context);
}

/**
 * Sources activées et autorisées pour le contexte RBAC courant.
 */
export function listAllowedAdminSearchSources(
  context: RouteAccessContext,
  options?: { includeDisabled?: boolean },
): AdminSearchSourceDefinition[] {
  return listAdminSearchSourceDefinitions(options).filter((source) =>
    isAdminSearchSourceAllowed(source, context),
  );
}

export function shouldRunAdminSearchSource(
  source: Pick<AdminSearchSourceDefinition, 'minQueryLength'>,
  query: string,
): boolean {
  const normalized = query.trim();
  return normalized.length >= source.minQueryLength;
}

export function buildAdminSearchResultId(
  sourceId: AdminSearchSourceId,
  entityId: string,
): string {
  return `${sourceId}:${entityId}`;
}
