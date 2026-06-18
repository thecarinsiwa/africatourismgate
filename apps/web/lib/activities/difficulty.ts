import type { ActivityDifficultyLevel } from '@africatourismgate/types';

export type ActivityDifficultyLabels = Record<ActivityDifficultyLevel, string>;

export function getActivityDifficultyLabel(
  level: ActivityDifficultyLevel | null | undefined,
  labels: ActivityDifficultyLabels,
): string | null {
  if (!level) return null;
  return labels[level];
}

export function getActivityDifficultyBadgeClass(level: ActivityDifficultyLevel): string {
  switch (level) {
    case 'easy':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300';
    case 'moderate':
      return 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300';
    case 'hard':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300';
    case 'expert':
      return 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300';
  }
}
