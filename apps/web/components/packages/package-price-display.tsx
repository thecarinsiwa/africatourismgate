import {
  formatPackagePrice,
  hasPackageDiscount,
} from '../../lib/packages/listings';
import type { PackagePricing } from '../../lib/packages/types';

type PackagePriceDisplayProps = {
  pricing: PackagePricing;
  size?: 'sm' | 'md';
  priceLabel?: string;
  discountBadgeTemplate?: string;
  className?: string;
};

export function PackagePriceDisplay({
  pricing,
  size = 'md',
  priceLabel,
  discountBadgeTemplate,
  className = '',
}: PackagePriceDisplayProps) {
  const showStrikethrough = hasPackageDiscount(pricing);
  const priceClass =
    size === 'sm' ? 'text-xl font-bold' : 'text-2xl font-bold';
  const badgeText = discountBadgeTemplate?.replace(
    '{n}',
    String(Math.round(pricing.discountPercent)),
  );

  return (
    <div className={className}>
      {priceLabel ? (
        <p className="text-xs uppercase tracking-wide text-atg-muted">
          {priceLabel}
        </p>
      ) : null}
      <div className="mt-1 flex flex-wrap items-baseline justify-end gap-2">
        {showStrikethrough ? (
          <p
            className={`text-sm text-atg-muted line-through text-atg-muted ${
              size === 'sm' ? '' : 'text-base'
            }`}
            aria-label="Original price"
          >
            {formatPackagePrice(pricing.subtotalCents, pricing.currency)}
          </p>
        ) : null}
        <p className={`${priceClass} text-atg-fg`}>
          {formatPackagePrice(pricing.totalCents, pricing.currency)}
        </p>
        {showStrikethrough && badgeText ? (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
            {badgeText}
          </span>
        ) : null}
      </div>
    </div>
  );
}
