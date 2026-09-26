import type { Page } from '@playwright/test';
import type {
  CatalogProductsSettingValue,
  ResolvedCatalogProducts,
} from '@africatourismgate/types/organization-settings';
import { DEFAULT_CATALOG_PRODUCTS } from '@africatourismgate/types/organization-settings';

export type E2ECatalogProducts = ResolvedCatalogProducts;

/**
 * Override public catalog products for E2E.
 * Layout SSR still uses the API/default (all on); the client provider
 * applies `window.__ATG_E2E_CATALOG_PRODUCTS__` after mount so nav matches.
 * Route fulfill also covers SSR fetches when the route is registered early.
 */
export async function mockCatalogProducts(
  page: Page,
  overrides: CatalogProductsSettingValue = {},
): Promise<E2ECatalogProducts> {
  const products: E2ECatalogProducts = {
    ...DEFAULT_CATALOG_PRODUCTS,
    ...overrides,
  };

  await page.addInitScript((m) => {
    (
      window as unknown as { __ATG_E2E_CATALOG_PRODUCTS__?: E2ECatalogProducts }
    ).__ATG_E2E_CATALOG_PRODUCTS__ = m;
  }, products);

  await page.route('**/organization-settings/public/catalog-products**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(products),
    });
  });

  return products;
}
