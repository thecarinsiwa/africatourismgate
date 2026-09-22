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

const CATALOG_SEARCHERS: Record<CatalogSourceId, AdminSearchSourceSearcher> = {
  activities: async (query) => {
    const definition = getAdminSearchSourceDefinition('activities');
    return searchAdminActivities(query, {
      resultLimit: definition?.resultLimit,
    });
  },
  flights: async (query) => {
    const definition = getAdminSearchSourceDefinition('flights');
    return searchAdminFlights(query, {
      resultLimit: definition?.resultLimit,
    });
  },
  vehicles: async (query) => {
    const definition = getAdminSearchSourceDefinition('vehicles');
    return searchAdminVehicles(query, {
      resultLimit: definition?.resultLimit,
    });
  },
  packages: async (query) => {
    const definition = getAdminSearchSourceDefinition('packages');
    return searchAdminPackages(query, {
      resultLimit: definition?.resultLimit,
    });
  },
  sailings: async (query) => {
    const definition = getAdminSearchSourceDefinition('sailings');
    return searchAdminSailings(query, {
      resultLimit: definition?.resultLimit,
    });
  },
  blogPosts: async (query) => {
    const definition = getAdminSearchSourceDefinition('blogPosts');
    return searchAdminBlogPosts(query, {
      resultLimit: definition?.resultLimit,
    });
  },
  destinations: async (query) => {
    const definition = getAdminSearchSourceDefinition('destinations');
    return searchAdminDestinations(query, {
      resultLimit: definition?.resultLimit,
    });
  },
  employees: async (query) => {
    const definition = getAdminSearchSourceDefinition('employees');
    return searchAdminEmployees(query, {
      resultLimit: definition?.resultLimit,
    });
  },
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
