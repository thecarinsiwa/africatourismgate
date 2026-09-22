import { getAdminSearchSourceDefinition } from './sources';
import {
  searchAdminBookings,
  searchAdminOrganizations,
  searchAdminPayments,
  searchAdminProperties,
  searchAdminSupportTickets,
  searchAdminUsers,
} from './search-api-core';
import type {
  AdminSearchSource,
  AdminSearchSourceDefinition,
  AdminSearchSourceId,
  AdminSearchSourceSearcher,
} from './types';

const CORE_SOURCE_IDS = [
  'users',
  'organizations',
  'bookings',
  'properties',
  'payments',
  'supportTickets',
] as const satisfies readonly AdminSearchSourceId[];

type CoreSourceId = (typeof CORE_SOURCE_IDS)[number];

const CORE_SEARCHERS: Record<CoreSourceId, AdminSearchSourceSearcher> = {
  users: async (query) => {
    const definition = getAdminSearchSourceDefinition('users');
    return searchAdminUsers(query, { resultLimit: definition?.resultLimit });
  },
  organizations: async (query) => {
    const definition = getAdminSearchSourceDefinition('organizations');
    return searchAdminOrganizations(query, {
      resultLimit: definition?.resultLimit,
    });
  },
  bookings: async (query) => {
    const definition = getAdminSearchSourceDefinition('bookings');
    return searchAdminBookings(query, {
      resultLimit: definition?.resultLimit,
    });
  },
  properties: async (query) => {
    const definition = getAdminSearchSourceDefinition('properties');
    return searchAdminProperties(query, {
      resultLimit: definition?.resultLimit,
    });
  },
  payments: async (query) => {
    const definition = getAdminSearchSourceDefinition('payments');
    return searchAdminPayments(query, {
      resultLimit: definition?.resultLimit,
    });
  },
  supportTickets: async (query) => {
    const definition = getAdminSearchSourceDefinition('supportTickets');
    return searchAdminSupportTickets(query, {
      resultLimit: definition?.resultLimit,
    });
  },
};

function isCoreSourceId(id: AdminSearchSourceId): id is CoreSourceId {
  return (CORE_SOURCE_IDS as readonly string[]).includes(id);
}

function attachCoreSearcher(
  definition: AdminSearchSourceDefinition,
): AdminSearchSource | null {
  if (!isCoreSourceId(definition.id)) {
    return null;
  }
  return {
    ...definition,
    search: CORE_SEARCHERS[definition.id],
  };
}

/**
 * Sources API cœur prêtes pour le fan-out (users → tickets).
 */
export function listCoreAdminSearchSources(
  definitions: readonly AdminSearchSourceDefinition[],
): AdminSearchSource[] {
  return definitions
    .filter(
      (definition) =>
        definition.kind === 'api' &&
        definition.enabled &&
        isCoreSourceId(definition.id),
    )
    .map(attachCoreSearcher)
    .filter((source): source is AdminSearchSource => source !== null);
}
