'use client';

import { cn, DataTableBadge } from '@africatourismgate/ui';
import type { Package, PackagePricing } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { formatMoney } from '../../lib/format-money';
import { stripHtml } from '../../lib/rich-text';

type PackagePreviewCardProps = {
  pkg: Package;
  itemCount: number;
  pricing: PackagePricing;
  className?: string;
};

function hasPackageDiscount(pricing: PackagePricing): boolean {
  return pricing.discountAmountCents > 0;
}

export function PackagePreviewCard({
  pkg,
  itemCount,
  pricing,
  className,
}: PackagePreviewCardProps) {
  const t = useTranslations('modules.packages.sections.preview');
  const tPricing = useTranslations('modules.packages.sections.pricingRecap');
  const showDiscount = hasPackageDiscount(pricing);
  const discountPercent = Math.round(Number(pkg.discountPercent));
  const descriptionPreview = pkg.description ? stripHtml(pkg.description) : '';

  return (
    <article
      className={cn(
        'overflow-hidden rounded-xl border border-atg-border bg-atg-elevated shadow-sm',
        className,
      )}
      aria-label={t('ariaLabel')}
    >
      <p className="border-b border-atg-border px-4 py-2 text-xs font-medium text-atg-muted">
        {t('header')}
      </p>

      <div className="flex flex-col">
        <div className="bg-gradient-to-br from-[#0f2744] to-primary/80 px-5 py-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
            {t('eyebrow')}
          </p>
          <p className="mt-1 text-lg font-bold leading-tight">{pkg.name}</p>
          {descriptionPreview ? (
            <p className="mt-2 line-clamp-3 text-sm text-white/80">{descriptionPreview}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 p-4">
          <p className="text-sm font-medium text-primary">
            {t('includedCount', { count: itemCount })}
          </p>

          {discountPercent > 0 ? (
            <p className="text-sm text-atg-muted">
              {t('discountOnBundle', { percent: discountPercent })}
            </p>
          ) : null}

          <p className="text-xs text-atg-muted">
            {t('suggestedDuration', { days: pkg.durationDays })}
          </p>

          <div className="border-t border-atg-border pt-3">
            <p className="text-xs uppercase tracking-wide text-atg-muted">{t('packagePrice')}</p>
            <div className="mt-1 flex flex-wrap items-baseline justify-end gap-2">
              {showDiscount ? (
                <span
                  className="tabular-nums text-sm text-atg-muted line-through"
                  aria-label={tPricing('separatePriceAria')}
                >
                  {formatMoney(pricing.subtotalCents, pricing.currency)}
                </span>
              ) : null}
              <span className="text-xl font-bold tabular-nums text-atg-fg">
                {formatMoney(pricing.totalCents, pricing.currency)}
              </span>
              {showDiscount ? (
                <DataTableBadge variant="success">−{discountPercent}%</DataTableBadge>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
