'use client';

import type { LoyaltyTier } from '@africatourismgate/types';
import { cn } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { useFormatPoints, useLoyaltyTierLabels } from '../../lib/i18n/use-module-labels';
import { getTierProgress } from '../../lib/loyalty-tier-utils';

type LoyaltyTierProgressProps = {
  pointsBalance: number;
  tier: LoyaltyTier;
  compact?: boolean;
  className?: string;
};

export function LoyaltyTierProgress({
  pointsBalance,
  tier,
  compact = false,
  className,
}: LoyaltyTierProgressProps) {
  const t = useTranslations('modules.loyalty.progress');
  const formatPoints = useFormatPoints();
  const tierLabels = useLoyaltyTierLabels();
  const progress = getTierProgress(pointsBalance, tier);

  const ariaLabel = useMemo(() => {
    if (progress.nextTier) {
      return t('ariaToward', { tier: tierLabels[progress.nextTier] });
    }
    return t('ariaMaxReached');
  }, [progress.nextTier, t, tierLabels]);

  return (
    <div className={cn('min-w-[8rem]', className)}>
      <div
        className="h-2 overflow-hidden rounded-full bg-atg-border/60"
        role="progressbar"
        aria-valuenow={progress.percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel}
      >
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
      {!compact ? (
        <p className="mt-1.5 text-xs text-atg-muted">
          {progress.nextTier ? (
            t('pointsBeforeTier', {
              points: formatPoints(progress.pointsToNext),
              tier: tierLabels[progress.nextTier],
            })
          ) : (
            t('maxTier')
          )}
        </p>
      ) : null}
    </div>
  );
}
