import type { ActivityDifficultyLevel } from '@africatourismgate/types';
import type { DataTableBadgeVariant } from '@africatourismgate/ui';

export const ACTIVITY_DIFFICULTY_LEVELS = [
  'easy',
  'moderate',
  'hard',
  'expert',
] as const satisfies readonly ActivityDifficultyLevel[];

export const ACTIVITY_DIFFICULTY_LABELS: Record<ActivityDifficultyLevel, string> = {
  easy: 'Facile',
  moderate: 'Modérée',
  hard: 'Difficile',
  expert: 'Expert',
};

export function getActivityDifficultyLabel(
  level: ActivityDifficultyLevel | null | undefined,
): string | null {
  if (!level) return null;
  return ACTIVITY_DIFFICULTY_LABELS[level];
}

export function getActivityDifficultyBadgeVariant(
  level: ActivityDifficultyLevel,
): DataTableBadgeVariant {
  switch (level) {
    case 'easy':
      return 'success';
    case 'moderate':
      return 'default';
    case 'hard':
      return 'warning';
    case 'expert':
      return 'danger';
  }
}
