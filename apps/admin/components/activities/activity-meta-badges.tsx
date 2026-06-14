'use client';

import type { ActivityDifficultyLevel } from '@africatourismgate/types';
import { DataTableBadge } from '@africatourismgate/ui';
import {
  getActivityDifficultyBadgeVariant,
  getActivityDifficultyLabel,
} from '../../lib/activity-difficulty';
import { formatDurationMinutes } from '../../lib/flight-datetime';

type ActivityMetaBadgesProps = {
  durationMinutes: number | null;
  difficultyLevel: ActivityDifficultyLevel | null;
  className?: string;
};

export function ActivityMetaBadges({
  durationMinutes,
  difficultyLevel,
  className,
}: ActivityMetaBadgesProps) {
  const durationLabel =
    durationMinutes != null ? formatDurationMinutes(durationMinutes) : null;
  const difficultyLabel = getActivityDifficultyLabel(difficultyLevel);

  if (!durationLabel && !difficultyLabel) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ''}`}>
      {durationLabel ? (
        <DataTableBadge variant="muted">
          <span className="inline-flex items-center gap-1.5">
            <svg
              className="h-3.5 w-3.5 opacity-70"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {durationLabel}
          </span>
        </DataTableBadge>
      ) : null}
      {difficultyLevel && difficultyLabel ? (
        <DataTableBadge variant={getActivityDifficultyBadgeVariant(difficultyLevel)}>
          {difficultyLabel}
        </DataTableBadge>
      ) : null}
    </div>
  );
}

export function ActivityDurationBadge({
  durationMinutes,
}: {
  durationMinutes: number | null;
}) {
  if (durationMinutes == null) {
    return <span className="text-sm text-atg-muted">—</span>;
  }
  return (
    <DataTableBadge variant="muted">{formatDurationMinutes(durationMinutes)}</DataTableBadge>
  );
}

export function ActivityDifficultyBadge({
  difficultyLevel,
}: {
  difficultyLevel: ActivityDifficultyLevel | null;
}) {
  const label = getActivityDifficultyLabel(difficultyLevel);
  if (!difficultyLevel || !label) {
    return <span className="text-sm text-atg-muted">—</span>;
  }
  return (
    <DataTableBadge variant={getActivityDifficultyBadgeVariant(difficultyLevel)}>
      {label}
    </DataTableBadge>
  );
}
