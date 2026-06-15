export const ACTIVITY_DIFFICULTY_LEVELS = [
  'easy',
  'moderate',
  'hard',
  'expert',
] as const;

export type ActivityDifficultyLevel = (typeof ACTIVITY_DIFFICULTY_LEVELS)[number];
