'use client';

import { SaleCartProvider } from '../../lib/sale/cart-context';
import { SaleCartPanel } from './sale-cart-panel';
import { SaleSearchPanel } from './sale-search-panel';

export function PosSaleScreen() {
  return (
    <SaleCartProvider>
      <div className="flex flex-1 flex-col gap-6 lg:flex-row lg:gap-8">
        <section className="min-w-0 flex-1">
          <SaleSearchPanel />
        </section>
        <SaleCartPanel />
      </div>
    </SaleCartProvider>
  );
}
