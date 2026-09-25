import { cache } from 'react';
import { notFound } from 'next/navigation';
import {
  DEFAULT_CATALOG_PRODUCTS,
  isCatalogProductEnabled,
  normalizeCatalogProducts,
  type CatalogProductKey,
  type CatalogProductsSettingValue,
  type ResolvedCatalogProducts,
} from '@africatourismgate/types/organization-settings';
import type { SearchVertical } from '../search/route';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

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

export const getPublicCatalogProducts = cache(
  async (): Promise<ResolvedCatalogProducts> => {
    try {
      const response = await fetch(
        `${apiUrl}/organization-settings/public/catalog-products`,
        { cache: 'no-store' },
      );
      if (!response.ok) return { ...DEFAULT_CATALOG_PRODUCTS };
      const payload = (await response.json()) as CatalogProductsSettingValue;
      return normalizeCatalogProducts(payload);
    } catch {
      return { ...DEFAULT_CATALOG_PRODUCTS };
    }
  },
);

export async function assertCatalogProductEnabled(
  product: CatalogProductKey,
): Promise<void> {
  const products = await getPublicCatalogProducts();
  if (!isCatalogProductEnabled(product, products)) {
    notFound();
  }
}
