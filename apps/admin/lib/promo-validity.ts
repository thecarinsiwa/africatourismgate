import type { DataTableBadgeVariant } from '@africatourismgate/ui';
import type { PromoCode, PromoCodeDiscountType } from '@africatourismgate/types';

export type PromoValidityState = 'active' | 'upcoming' | 'expired';

export const PROMO_VALIDITY_STATES: PromoValidityState[] = ['active', 'upcoming', 'expired'];

const validityVariants: Record<PromoValidityState, DataTableBadgeVariant> = {
  active: 'success',
  upcoming: 'warning',
  expired: 'danger',
};

export type PromoValidityLabels = Record<PromoValidityState, string>;

export type PromoDiscountLabels = {
  informative: string;
  pending: string;
  percentFormat: string;
  fixedFormat: string;
  noDateLimit: string;
  fromDate: string;
  untilDate: string;
  range: string;
};

function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

function todayDateKey(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getPromoValidityState(
  validFrom: string,
  validUntil: string,
  now = new Date(),
): PromoValidityState {
  const today = todayDateKey(now);
  const from = toDateKey(validFrom);
  const until = toDateKey(validUntil);

  if (today > until) return 'expired';
  if (today < from) return 'upcoming';
  return 'active';
}

export function getPromoValidityLabel(
  state: PromoValidityState,
  labels: PromoValidityLabels,
): string {
  return labels[state];
}

export function getPromoValidityBadgeVariant(state: PromoValidityState): DataTableBadgeVariant {
  return validityVariants[state];
}

export function formatPromoValidityRange(validFrom: string, validUntil: string): string {
  return `${toDateKey(validFrom)} → ${toDateKey(validUntil)}`;
}

export function formatPromotionValidityDisplay(
  validFrom: string | null | undefined,
  validUntil: string | null | undefined,
  labels: Pick<PromoDiscountLabels, 'noDateLimit' | 'fromDate' | 'untilDate' | 'range'>,
): string {
  const from = validFrom?.slice(0, 10);
  const until = validUntil?.slice(0, 10);
  if (!from && !until) return labels.noDateLimit;
  if (from && until) return labels.range.replace('{from}', from).replace('{until}', until);
  if (from) return labels.fromDate.replace('{from}', from);
  return labels.untilDate.replace('{until}', until ?? '');
}

export function getPromotionValidityState(
  validFrom: string | null | undefined,
  validUntil: string | null | undefined,
  now = new Date(),
): PromoValidityState | null {
  const today = todayDateKey(now);
  if (validUntil && today > toDateKey(validUntil)) return 'expired';
  if (validFrom && today < toDateKey(validFrom)) return 'upcoming';
  if (validFrom || validUntil) return 'active';
  return null;
}

export function formatPromoDiscountLabel(
  promo: Pick<PromoCode, 'discountType' | 'discountValue'>,
  labels: Pick<PromoDiscountLabels, 'percentFormat' | 'fixedFormat'>,
): string {
  const value = Number(promo.discountValue);
  if (promo.discountType === 'percent') {
    return labels.percentFormat.replace('{value}', String(value));
  }
  return labels.fixedFormat.replace('{value}', value.toFixed(2));
}

export function getPromoDiscountTypeLabel(
  type: PromoCodeDiscountType,
  labels: Record<PromoCodeDiscountType, string>,
): string {
  return labels[type];
}

export function formatPromotionDiscountBadge(
  params: {
    hasDiscount: boolean;
    discountType?: PromoCodeDiscountType | null;
    discountValue?: string | number | null;
  },
  labels: PromoDiscountLabels,
): string {
  if (!params.hasDiscount) return labels.informative;
  const value = Number(params.discountValue);
  if (!Number.isFinite(value) || value <= 0) return labels.pending;
  if (params.discountType === 'percent') {
    return labels.percentFormat.replace('{value}', String(value));
  }
  if (params.discountType === 'fixed_amount') {
    return labels.fixedFormat.replace('{value}', value.toFixed(2));
  }
  return labels.pending;
}

export function formatPromoUsageLabel(
  redemptionCount: number,
  maxRedemptions: number | null,
  format: string,
  unlimitedMax: string,
): string {
  const max = maxRedemptions != null ? String(maxRedemptions) : unlimitedMax;
  return format.replace('{count}', String(redemptionCount)).replace('{max}', max);
}

export function getPromoUsageBadgeVariant(
  redemptionCount: number,
  maxRedemptions: number | null,
): DataTableBadgeVariant {
  if (maxRedemptions == null) return 'muted';
  if (redemptionCount >= maxRedemptions) return 'danger';
  if (redemptionCount / maxRedemptions >= 0.8) return 'warning';
  return 'success';
}
