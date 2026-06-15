'use client';

import { Card, cn, DataTableBadge } from '@africatourismgate/ui';
import type { PackagePricing } from '@africatourismgate/types';
import { formatMoney } from '../../lib/format-money';

type PackagePricingRecapProps = {
  pricing: PackagePricing;
  itemCount?: number;
  size?: 'sm' | 'md';
  className?: string;
};

function hasPackageDiscount(pricing: PackagePricing): boolean {
  return pricing.discountAmountCents > 0;
}

export function PackagePricingRecap({
  pricing,
  itemCount = 0,
  size = 'md',
  className,
}: PackagePricingRecapProps) {
  const showDiscount = hasPackageDiscount(pricing);
  const isCompact = size === 'sm';
  const hasItems = itemCount > 0;

  return (
    <Card variant="dashboard" className={cn('max-w-md', className)}>
      <h3 className="text-sm font-semibold text-atg-fg">Récapitulatif tarifaire</h3>

      {!hasItems ? (
        <p className="mt-2 text-sm text-atg-muted">
          Ajoutez des items pour calculer le prix du forfait.
        </p>
      ) : null}

      <div className={cn('mt-3 space-y-3', !hasItems && 'opacity-60')}>
        {showDiscount ? (
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <span className="text-sm text-atg-muted">Prix séparé</span>
            <span
              className="tabular-nums text-sm font-medium text-atg-muted line-through"
              aria-label="Prix des composants achetés séparément"
            >
              {formatMoney(pricing.subtotalCents, pricing.currency)}
            </span>
          </div>
        ) : null}

        <div
          className={cn(
            'flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2',
            showDiscount && 'border-t border-atg-border pt-3',
          )}
        >
          <span className="text-sm font-medium text-atg-fg">Prix forfait</span>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span
              className={cn(
                'tabular-nums font-semibold text-atg-fg',
                isCompact ? 'text-lg' : 'text-xl',
              )}
            >
              {formatMoney(pricing.totalCents, pricing.currency)}
            </span>
            {showDiscount ? (
              <DataTableBadge variant="success">
                −{Math.round(pricing.discountPercent)}%
              </DataTableBadge>
            ) : null}
          </div>
        </div>

        {showDiscount ? (
          <p className="text-xs text-atg-muted">
            Économie de {formatMoney(pricing.discountAmountCents, pricing.currency)} par rapport
            à l&apos;achat séparé des composants.
          </p>
        ) : null}
      </div>
    </Card>
  );
}
