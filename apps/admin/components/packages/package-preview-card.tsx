'use client';

import { cn, DataTableBadge } from '@africatourismgate/ui';
import type { Package, PackagePricing } from '@africatourismgate/types';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { formatMoney } from '../../lib/format-money';
import { resolveMediaUrl } from '../../lib/resolve-media-url';
import { stripHtml } from '../../lib/rich-text';

type PackagePreviewCardProps = {
  pkg: Package;
  itemCount: number;
  pricing: PackagePricing;
  /** URL de couverture (sinon `pkg.coverImageUrl`). */
  coverImageUrl?: string | null;
  size?: 'sm' | 'md';
  className?: string;
};

function hasPackageDiscount(pricing: PackagePricing): boolean {
  return pricing.discountAmountCents > 0;
}

export function PackagePreviewCard({
  pkg,
  itemCount,
  pricing,
  coverImageUrl,
  size = 'md',
  className,
}: PackagePreviewCardProps) {
  const t = useTranslations('modules.packages.sections.preview');
  const tPricing = useTranslations('modules.packages.sections.pricingRecap');
  const showDiscount = hasPackageDiscount(pricing);
  const discountPercent = Math.round(Number(pkg.discountPercent));
  const descriptionPreview = pkg.description ? stripHtml(pkg.description) : '';
  const isCompact = size === 'sm';
  const coverUrl = (coverImageUrl ?? pkg.coverImageUrl)?.trim() || null;

  return (
    <article
      className={cn(
        'overflow-hidden rounded-xl border border-atg-border bg-atg-elevated shadow-sm',
        className,
      )}
      aria-label={t('ariaLabel')}
    >
      <p
        className={cn(
          'border-b border-atg-border font-medium text-atg-muted',
          isCompact ? 'px-3 py-1.5 text-[11px]' : 'px-4 py-2 text-xs',
        )}
      >
        {t('header')}
      </p>

      <div className="flex flex-col">
        <div
          className={cn(
            'relative overflow-hidden bg-gradient-to-br from-[#0f2744] to-primary/80 text-white',
            isCompact ? 'min-h-[7.5rem] px-3 py-3' : 'min-h-[10rem] px-5 py-6',
          )}
        >
          {coverUrl ? (
            <Image
              src={resolveMediaUrl(coverUrl)}
              alt=""
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 20rem"
              aria-hidden
            />
          ) : null}
          <div
            className={cn(
              'absolute inset-0',
              coverUrl
                ? 'bg-gradient-to-t from-black/80 via-black/45 to-black/20'
                : 'bg-gradient-to-t from-black/30 via-transparent to-black/10',
            )}
          />
          <div className="relative z-10">
            <p
              className={cn(
                'font-semibold uppercase tracking-wide text-white/80',
                isCompact ? 'text-[10px]' : 'text-xs',
              )}
            >
              {t('eyebrow')}
            </p>
            <p
              className={cn(
                'mt-1 font-bold leading-tight',
                isCompact ? 'line-clamp-2 text-sm' : 'text-lg',
              )}
            >
              {pkg.name}
            </p>
            {descriptionPreview ? (
              <p
                className={cn(
                  'text-white/85',
                  isCompact ? 'mt-1 line-clamp-2 text-xs' : 'mt-2 line-clamp-3 text-sm',
                )}
              >
                {descriptionPreview}
              </p>
            ) : null}
          </div>
        </div>

        <div className={cn('flex flex-col', isCompact ? 'gap-1.5 p-3' : 'gap-3 p-4')}>
          <p className={cn('font-medium text-primary', isCompact ? 'text-xs' : 'text-sm')}>
            {t('includedCount', { count: itemCount })}
          </p>

          {discountPercent > 0 ? (
            <p className={cn('text-atg-muted', isCompact ? 'text-xs' : 'text-sm')}>
              {t('discountOnBundle', { percent: discountPercent })}
            </p>
          ) : null}

          <p className="text-xs text-atg-muted">
            {t('suggestedDuration', { days: pkg.durationDays })}
          </p>

          <div className={cn('border-t border-atg-border', isCompact ? 'pt-2' : 'pt-3')}>
            <p className="text-[11px] uppercase tracking-wide text-atg-muted">{t('packagePrice')}</p>
            <div className="mt-1 flex flex-wrap items-baseline justify-end gap-1.5">
              {showDiscount ? (
                <span
                  className={cn(
                    'tabular-nums text-atg-muted line-through',
                    isCompact ? 'text-xs' : 'text-sm',
                  )}
                  aria-label={tPricing('separatePriceAria')}
                >
                  {formatMoney(pricing.subtotalCents, pricing.currency)}
                </span>
              ) : null}
              <span
                className={cn(
                  'font-bold tabular-nums text-atg-fg',
                  isCompact ? 'text-base' : 'text-xl',
                )}
              >
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
