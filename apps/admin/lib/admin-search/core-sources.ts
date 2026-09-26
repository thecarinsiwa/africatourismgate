import { getAdminSearchSourceDefinition } from './sources';
import {
  searchAdminBookings,
  searchAdminEmployees,
  searchAdminOrganizations,
  searchAdminPayments,
  searchAdminPromoCodes,
  searchAdminPromotions,
  searchAdminProperties,
  searchAdminRoles,
  searchAdminSupportTickets,
  searchAdminUsers,
} from './search-api-core';
import type {
  AdminSearchRunOptions,
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
  'promotions',
  'promoCodes',
  'supportTickets',
  'employees',
  'roles',
] as const satisfies readonly AdminSearchSourceId[];

type CoreSourceId = (typeof CORE_SOURCE_IDS)[number];

function withLimitAndSignal(
  sourceId: CoreSourceId,
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

const CORE_SEARCHERS: Record<CoreSourceId, AdminSearchSourceSearcher> = {
  users: withLimitAndSignal('users', searchAdminUsers),
  organizations: withLimitAndSignal('organizations', searchAdminOrganizations),
  bookings: withLimitAndSignal('bookings', searchAdminBookings),
  properties: withLimitAndSignal('properties', searchAdminProperties),
  payments: withLimitAndSignal('payments', searchAdminPayments),
  promotions: withLimitAndSignal('promotions', searchAdminPromotions),
  promoCodes: withLimitAndSignal('promoCodes', searchAdminPromoCodes),
  supportTickets: withLimitAndSignal('supportTickets', searchAdminSupportTickets),
  employees: withLimitAndSignal('employees', searchAdminEmployees),
  roles: withLimitAndSignal('roles', searchAdminRoles),
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
 * Sources API cœur prêtes pour le fan-out (users → tickets / promos / rôles).
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
