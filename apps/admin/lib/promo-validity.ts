import type { DataTableBadgeVariant } from '@africatourismgate/ui';
import type { PromoCode, PromoCodeDiscountType } from '@africatourismgate/types';

export type PromoValidityState = 'active' | 'upcoming' | 'expired';

const validityLabels: Record<PromoValidityState, string> = {
  active: 'En cours',
  upcoming: 'À venir',
  expired: 'Expiré',
};

const validityVariants: Record<PromoValidityState, DataTableBadgeVariant> = {
  active: 'success',
  upcoming: 'warning',
  expired: 'danger',
};

const discountTypeLabels: Record<PromoCodeDiscountType, string> = {
  percent: '%',
  fixed_amount: 'Fixe',
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

export function getPromoValidityLabel(state: PromoValidityState): string {
  return validityLabels[state];
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
): string {
  const from = validFrom?.slice(0, 10);
  const until = validUntil?.slice(0, 10);
  if (!from && !until) return 'Sans limite de dates';
  if (from && until) return `${from} → ${until}`;
  if (from) return `À partir du ${from}`;
  return `Jusqu’au ${until}`;
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

export function formatPromoDiscountLabel(promo: Pick<PromoCode, 'discountType' | 'discountValue'>): string {
  const value = Number(promo.discountValue);
  if (promo.discountType === 'percent') {
    return `−${value} %`;
  }
  return `−${value.toFixed(2)}`;
}

export function getPromoDiscountTypeLabel(type: PromoCodeDiscountType): string {
  return discountTypeLabels[type];
}

export function formatPromotionDiscountBadge(params: {
  hasDiscount: boolean;
  discountType?: PromoCodeDiscountType | null;
  discountValue?: string | number | null;
}): string {
  if (!params.hasDiscount) return 'Campagne informative';
  const value = Number(params.discountValue);
  if (!Number.isFinite(value) || value <= 0) return 'Réduction…';
  if (params.discountType === 'percent') return `−${value} %`;
  if (params.discountType === 'fixed_amount') return `−${value.toFixed(2)}`;
  return 'Réduction…';
}

export function formatPromoUsageLabel(
  redemptionCount: number,
  maxRedemptions: number | null,
): string {
  const max = maxRedemptions != null ? String(maxRedemptions) : '∞';
  return `${redemptionCount} / ${max}`;
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
