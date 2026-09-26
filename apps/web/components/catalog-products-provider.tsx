'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  DEFAULT_CATALOG_PRODUCTS,
  normalizeCatalogProducts,
  type CatalogProductsSettingValue,
  type ResolvedCatalogProducts,
} from '@africatourismgate/types/organization-settings';

declare global {
  interface Window {
    /** Playwright E2E only — see tests/e2e/helpers/mock-catalog-products.ts */
    __ATG_E2E_CATALOG_PRODUCTS__?: CatalogProductsSettingValue;
  }
}

const CatalogProductsContext = createContext<ResolvedCatalogProducts>(
  DEFAULT_CATALOG_PRODUCTS,
);

export function CatalogProductsProvider({
  products,
  children,
}: {
  products: ResolvedCatalogProducts;
  children: ReactNode;
}) {
  const [resolved, setResolved] = useState(products);

  useEffect(() => {
    const override = window.__ATG_E2E_CATALOG_PRODUCTS__;
    setResolved(override ? normalizeCatalogProducts(override) : products);
  }, [products]);

  return (
    <CatalogProductsContext.Provider value={resolved}>
      {children}
    </CatalogProductsContext.Provider>
  );
}

export function useCatalogProducts(): ResolvedCatalogProducts {
  return useContext(CatalogProductsContext);
}
