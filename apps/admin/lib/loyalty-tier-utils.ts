import type { LoyaltyTier } from '@africatourismgate/types';

/** Seuils de points pour chaque palier (référence produit OneKey). */
export const LOYALTY_TIER_THRESHOLDS: Record<LoyaltyTier, number> = {
  member: 0,
  silver: 500,
  gold: 2000,
  platinum: 5000,
};

export const LOYALTY_TIER_ORDER: LoyaltyTier[] = ['member', 'silver', 'gold', 'platinum'];

export type TierProgress = {
  currentTier: LoyaltyTier;
  nextTier: LoyaltyTier | null;
  percent: number;
  pointsToNext: number;
  nextThreshold: number | null;
};

export function getTierProgress(pointsBalance: number, tier: LoyaltyTier): TierProgress {
  const tierIndex = LOYALTY_TIER_ORDER.indexOf(tier);
  const nextTier = tierIndex < LOYALTY_TIER_ORDER.length - 1 ? LOYALTY_TIER_ORDER[tierIndex + 1]! : null;

  if (!nextTier) {
    return {
      currentTier: tier,
      nextTier: null,
      percent: 100,
      pointsToNext: 0,
      nextThreshold: null,
    };
  }

  const currentThreshold = LOYALTY_TIER_THRESHOLDS[tier];
  const nextThreshold = LOYALTY_TIER_THRESHOLDS[nextTier];
  const span = nextThreshold - currentThreshold;
  const progress = Math.max(0, Math.min(1, (pointsBalance - currentThreshold) / span));
  const pointsToNext = Math.max(0, nextThreshold - pointsBalance);

  return {
    currentTier: tier,
    nextTier,
    percent: Math.round(progress * 100),
    pointsToNext,
    nextThreshold,
  };
}

export function formatPoints(value: number, locale: string): string {
  return value.toLocaleString(locale);
}
