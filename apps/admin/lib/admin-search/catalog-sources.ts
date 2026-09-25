import { getAdminSearchSourceDefinition } from './sources';
import {
  searchAdminActivities,
  searchAdminBlogPosts,
  searchAdminDestinations,
  searchAdminEmployees,
  searchAdminFlights,
  searchAdminPackages,
  searchAdminSailings,
  searchAdminVehicles,
} from './search-api-catalog';
import type {
  AdminSearchRunOptions,
  AdminSearchSource,
  AdminSearchSourceDefinition,
  AdminSearchSourceId,
  AdminSearchSourceSearcher,
} from './types';

const CATALOG_SOURCE_IDS = [
  'activities',
  'flights',
  'vehicles',
  'packages',
  'sailings',
  'blogPosts',
  'destinations',
  'employees',
] as const satisfies readonly AdminSearchSourceId[];

type CatalogSourceId = (typeof CATALOG_SOURCE_IDS)[number];

function withLimitAndSignal(
  sourceId: CatalogSourceId,
  search: (
    query: string,
    options?: { resultLimit?: number; signal?: AbortSignal },
  ) => ReturnType<AdminSearchSourceSearcher>,
): AdminSearchSourceSearcher {
  return async (query, _context, runOptions?: AdminSearchRunOptions) => {
    const definition = getAdminSearchSourceDefinition(sourceId);
    return search(query, {
      resultLimit: definition?.resultLimit,
      signal: runOptions?.signal,
    });
  };
}

const CATALOG_SEARCHERS: Record<CatalogSourceId, AdminSearchSourceSearcher> = {
  activities: withLimitAndSignal('activities', searchAdminActivities),
  flights: withLimitAndSignal('flights', searchAdminFlights),
  vehicles: withLimitAndSignal('vehicles', searchAdminVehicles),
  packages: withLimitAndSignal('packages', searchAdminPackages),
  sailings: withLimitAndSignal('sailings', searchAdminSailings),
  blogPosts: withLimitAndSignal('blogPosts', searchAdminBlogPosts),
  destinations: withLimitAndSignal('destinations', searchAdminDestinations),
  employees: withLimitAndSignal('employees', searchAdminEmployees),
};

function isCatalogSourceId(id: AdminSearchSourceId): id is CatalogSourceId {
  return (CATALOG_SOURCE_IDS as readonly string[]).includes(id);
}

function attachCatalogSearcher(
  definition: AdminSearchSourceDefinition,
): AdminSearchSource | null {
  if (!isCatalogSourceId(definition.id)) {
    return null;
  }
  return {
    ...definition,
    search: CATALOG_SEARCHERS[definition.id],
  };
}

/**
 * Sources API catalogue & contenu prêtes pour le fan-out.
 */
export function listCatalogAdminSearchSources(
  definitions: readonly AdminSearchSourceDefinition[],
): AdminSearchSource[] {
  return definitions
    .filter(
      (definition) =>
        definition.kind === 'api' &&
        definition.enabled &&
        isCatalogSourceId(definition.id),
    )
    .map(attachCatalogSearcher)
    .filter((source): source is AdminSearchSource => source !== null);
}
