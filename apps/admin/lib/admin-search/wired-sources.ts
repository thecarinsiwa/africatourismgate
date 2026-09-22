import { listCatalogAdminSearchSources } from './catalog-sources';
import { listCoreAdminSearchSources } from './core-sources';
import { listLocalAdminSearchSources } from './local-sources';
import { listAdminSearchSourceDefinitions } from './sources';
import type { AdminSearchSource, AdminSearchSourceDefinition } from './types';

/**
 * Toutes les sources v1 avec adapters branchés (local + cœur + catalogue).
 */
export function listWiredAdminSearchSources(
  definitions: readonly AdminSearchSourceDefinition[] = listAdminSearchSourceDefinitions(),
): AdminSearchSource[] {
  return [
    ...listLocalAdminSearchSources(definitions),
    ...listCoreAdminSearchSources(definitions),
    ...listCatalogAdminSearchSources(definitions),
  ];
}
