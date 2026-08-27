import type { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

/**
 * Catalogue multi-tenant : produits partagés (organization_id NULL)
 * + produits exclusifs de l’org demandée.
 */
export function applyCatalogOrganizationScope<Entity extends ObjectLiteral>(
  qb: SelectQueryBuilder<Entity>,
  alias: string,
  organizationId: string | undefined,
): void {
  if (!organizationId) {
    return;
  }
  qb.andWhere(
    `(${alias}.organizationId IS NULL OR ${alias}.organizationId = :catalogOrganizationId)`,
    { catalogOrganizationId: organizationId },
  );
}
