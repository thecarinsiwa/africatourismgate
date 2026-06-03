'use client';

import { SaleCartProvider } from '../../lib/sale/cart-context';
import { SaleCartPanel } from './sale-cart-panel';
import { SaleSearchPanel } from './sale-search-panel';

export function PosSaleScreen() {
  return (
    <SaleCartProvider>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem] xl:gap-8">
        <section className="min-w-0">
          <SaleSearchPanel />
        </section>
        <SaleCartPanel />
      </div>
    </SaleCartProvider>
  );
}
