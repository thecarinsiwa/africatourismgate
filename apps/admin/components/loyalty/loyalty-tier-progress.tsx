'use client';

import type { LoyaltyTier } from '@africatourismgate/types';
import { cn } from '@africatourismgate/ui';
import {
  formatPoints,
  getTierProgress,
  loyaltyTierLabels,
} from '../../lib/loyalty-tier-utils';

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
  const progress = getTierProgress(pointsBalance, tier);

  return (
    <div className={cn('min-w-[8rem]', className)}>
      <div
        className="h-2 overflow-hidden rounded-full bg-atg-border/60"
        role="progressbar"
        aria-valuenow={progress.percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={
          progress.nextTier
            ? `Progression vers ${loyaltyTierLabels[progress.nextTier]}`
            : 'Palier maximum atteint'
        }
      >
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
      {!compact ? (
        <p className="mt-1.5 text-xs text-atg-muted">
          {progress.nextTier ? (
            <>
              <span className="tabular-nums font-medium text-atg-fg">
                {formatPoints(progress.pointsToNext)}
              </span>{' '}
              pts avant {loyaltyTierLabels[progress.nextTier]}
            </>
          ) : (
            'Palier maximum'
          )}
        </p>
      ) : null}
    </div>
  );
}
