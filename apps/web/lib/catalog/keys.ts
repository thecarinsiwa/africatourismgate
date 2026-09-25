import {
  isCatalogProductEnabled,
  type CatalogProductKey,
  type ResolvedCatalogProducts,
  DEFAULT_CATALOG_PRODUCTS,
} from '@africatourismgate/types/organization-settings';
import type { SearchVertical } from '../search/route';

/** Search verticals map 1:1 onto catalog product keys (packages is nav-only). */
export function catalogKeyForSearchVertical(vertical: SearchVertical): CatalogProductKey {
  return vertical;
}

export function isSearchVerticalCatalogEnabled(
  vertical: SearchVertical,
  products: ResolvedCatalogProducts = DEFAULT_CATALOG_PRODUCTS,
): boolean {
  return isCatalogProductEnabled(catalogKeyForSearchVertical(vertical), products);
}
