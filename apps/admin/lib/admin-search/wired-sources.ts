import { listCatalogAdminSearchSources } from './catalog-sources';
import { listCoreAdminSearchSources } from './core-sources';
import { listLocalAdminSearchSources } from './local-sources';
import { listAdminSearchSourceDefinitions } from './sources';
import type { AdminSearchFanOutPhase } from './aggregate';
import type { AdminSearchSource, AdminSearchSourceDefinition } from './types';

/**
 * Toutes les sources v1 avec adapters branchés (local + cœur + catalogue).
 */
export function listWiredAdminSearchSources(
  definitions: readonly AdminSearchSourceDefinition[] = listAdminSearchSourceDefinitions(),
): AdminSearchSource[] {
  const byPhase = listWiredAdminSearchSourcesByPhase(definitions);
  return [...byPhase.local, ...byPhase.core, ...byPhase.catalog];
}

/**
 * Sources groupées par phase de fan-out (local → core → catalog).
 */
export function listWiredAdminSearchSourcesByPhase(
  definitions: readonly AdminSearchSourceDefinition[] = listAdminSearchSourceDefinitions(),
): Record<AdminSearchFanOutPhase, AdminSearchSource[]> {
  return {
    local: listLocalAdminSearchSources(definitions),
    core: listCoreAdminSearchSources(definitions),
    catalog: listCatalogAdminSearchSources(definitions),
  };
}
