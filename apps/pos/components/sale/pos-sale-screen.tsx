'use client';

import type { BookingCheckoutItem } from '@africatourismgate/types';
import { Button } from '@africatourismgate/ui';
import { useCallback, useState } from 'react';
import { posSalePageConfig } from '../../config/sale';
import type { SaleCartLine } from '../../lib/sale/types';
import { SaleSearchPanel } from './sale-search-panel';

const { cart: cartLabels, backToHomeLabel } = posSalePageConfig;

function newCartLineId(): string {
  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function PosSaleScreen() {
  const [cartLines, setCartLines] = useState<SaleCartLine[]>([]);

  const handleAddToCart = useCallback((item: BookingCheckoutItem, label: string) => {
    setCartLines((prev) => [
      ...prev,
      {
        id: newCartLineId(),
        label,
        item,
      },
    ]);
  }, []);

  const cartCountLabel = cartLabels.itemCount(cartLines.length);

  return (
    <div className="flex flex-1 flex-col gap-6 lg:flex-row lg:gap-8">
      <section className="min-w-0 flex-1">
        <SaleSearchPanel onAddToCart={handleAddToCart} />
      </section>

      <aside className="w-full shrink-0 lg:w-80">
        <div className="sticky top-4 rounded-2xl border border-atg-border bg-atg-elevated p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-xl font-bold text-atg-fg">{cartLabels.title}</h2>
            <span className="rounded-full bg-primary/15 px-3 py-1 text-sm font-semibold text-primary">
              {cartCountLabel}
            </span>
          </div>

          {cartLines.length === 0 ? (
            <p className="text-base text-atg-muted">{cartLabels.empty}</p>
          ) : (
            <ul className="max-h-[40vh] space-y-3 overflow-y-auto">
              {cartLines.map((line) => (
                <li
                  key={line.id}
                  className="rounded-lg border border-atg-border bg-atg-surface px-3 py-3 text-sm"
                >
                  <p className="font-medium text-atg-fg">{line.label}</p>
                  <p className="mt-1 text-atg-muted">
                    Qté {line.item.quantity} · {line.item.itemType}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <Button
            variant="outline"
            size="lg"
            href="/"
            fullWidth
            className="pos-touch mt-6 min-h-[3rem]"
          >
            {backToHomeLabel}
          </Button>
        </div>
      </aside>
    </div>
  );
}
