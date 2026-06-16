'use client';

import { DataTableBadge, cn } from '@africatourismgate/ui';
import type { PromoCodeDiscountType } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import {
  usePromoDiscountLabels,
  usePromoDiscountTypeLabels,
  usePromoValidityLabels,
} from '../../lib/i18n/use-module-labels';
import { useHydrated } from '../../lib/i18n/use-hydrated';
import {
  formatPromotionDiscountBadge,
  formatPromotionValidityDisplay,
  formatPromoUsageLabel,
  getPromoDiscountTypeLabel,
  getPromotionValidityState,
  getPromoValidityBadgeVariant,
  getPromoValidityLabel,
} from '../../lib/promo-validity';

export type PromotionPreviewBannerProps = {
  name: string;
  description?: string | null;
  hasDiscount: boolean;
  discountType?: PromoCodeDiscountType | null;
  discountValue?: string | number | null;
  validFrom?: string | null;
  validUntil?: string | null;
  active?: boolean;
  redemptionCount?: number;
  maxRedemptions?: number | null;
  /** Version compacte pour la liste ou les espaces restreints. */
  compact?: boolean;
  className?: string;
};

export function PromotionPreviewBanner({
  name,
  description,
  hasDiscount,
  discountType,
  discountValue,
  validFrom,
  validUntil,
  active = true,
  redemptionCount,
  maxRedemptions,
  compact = false,
  className,
}: PromotionPreviewBannerProps) {
  const t = useTranslations('modules.promotions');
  const discountLabels = usePromoDiscountLabels();
  const validityLabels = usePromoValidityLabels();
  const discountTypeLabels = usePromoDiscountTypeLabels();
  const tUsage = useTranslations('modules.promoCodes.usage');
  const hydrated = useHydrated();

  const displayName = name.trim() || t('preview.defaultName');
  const discountLabel = formatPromotionDiscountBadge(
    { hasDiscount, discountType, discountValue },
    discountLabels,
  );
  const validityText = formatPromotionValidityDisplay(validFrom, validUntil, discountLabels);
  const validityState = hydrated
    ? getPromotionValidityState(validFrom, validUntil)
    : null;
  const showUsage =
    redemptionCount != null &&
    (maxRedemptions != null || redemptionCount > 0);
  const usageText =
    redemptionCount != null
      ? formatPromoUsageLabel(
          redemptionCount,
          maxRedemptions ?? null,
          tUsage('format'),
          tUsage('unlimitedMax'),
        )
      : '';

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-xl border border-atg-border shadow-sm',
        className,
      )}
      aria-label={t('preview.ariaLabel', { name: displayName })}
    >
      <div
        className={cn(
          'relative bg-gradient-to-br from-[#0f2744] via-[#163456] to-primary/80',
          compact ? 'min-h-[88px] px-4 py-3' : 'min-h-[160px] px-6 py-6 sm:min-h-[200px] sm:px-8 sm:py-8',
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />

        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-white/70 sm:text-xs">
              {t('preview.badge')}
            </p>
            <h2
              className={cn(
                'font-bold leading-tight text-white',
                compact ? 'text-base sm:text-lg' : 'text-xl sm:text-2xl',
              )}
            >
              {displayName}
            </h2>
            {description?.trim() && !compact ? (
              <p className="line-clamp-2 text-sm text-white/85">{description.trim()}</p>
            ) : description?.trim() && compact ? (
              <p className="line-clamp-1 text-xs text-white/80">{description.trim()}</p>
            ) : null}
            <p className={cn('tabular-nums text-white/75', compact ? 'text-[11px]' : 'text-xs')}>
              {validityText}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:max-w-[220px] sm:justify-end">
            <span
              className={cn(
                'inline-flex items-center rounded-full bg-white/15 px-2.5 py-0.5 font-semibold text-white ring-1 ring-inset ring-white/25 backdrop-blur-sm',
                compact ? 'text-[11px] tabular-nums' : 'text-xs tabular-nums',
              )}
            >
              {discountLabel}
            </span>
            {hasDiscount && discountType ? (
              <span className="inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/90 ring-1 ring-inset ring-white/20">
                {getPromoDiscountTypeLabel(discountType, discountTypeLabels)}
              </span>
            ) : null}
            <DataTableBadge
              variant={active ? 'success' : 'muted'}
              className={cn(
                'ring-white/20',
                active
                  ? 'bg-emerald-500/20 text-white'
                  : 'bg-white/10 text-white/80',
              )}
            >
              {active ? t('status.active') : t('status.inactive')}
            </DataTableBadge>
            {validityState ? (
              <DataTableBadge
                variant={getPromoValidityBadgeVariant(validityState)}
                className="bg-white/10 text-white ring-white/20"
              >
                {getPromoValidityLabel(validityState, validityLabels)}
              </DataTableBadge>
            ) : null}
          </div>
        </div>

        {showUsage && !compact ? (
          <p className="relative z-10 mt-3 text-xs tabular-nums text-white/70">
            {t('preview.usage', { usage: usageText })}
          </p>
        ) : null}
      </div>
    </section>
  );
}

/** Mappe une promotion API vers les props du bandeau. */
export function promotionToPreviewProps(promo: {
  name: string;
  description: string | null;
  discountType: PromoCodeDiscountType | null;
  discountValue: string | null;
  validFrom: string | null;
  validUntil: string | null;
  active: number;
  redemptionCount: number;
  maxRedemptions: number | null;
}): Omit<PromotionPreviewBannerProps, 'compact' | 'className'> {
  const hasDiscount = promo.discountType != null && promo.discountValue != null;
  return {
    name: promo.name,
    description: promo.description,
    hasDiscount,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    validFrom: promo.validFrom,
    validUntil: promo.validUntil,
    active: promo.active === 1,
    redemptionCount: promo.redemptionCount,
    maxRedemptions: promo.maxRedemptions,
  };
}
