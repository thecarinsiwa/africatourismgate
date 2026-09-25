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

export {
  catalogKeyForSearchVertical,
  isSearchVerticalCatalogEnabled,
} from './keys';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

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
