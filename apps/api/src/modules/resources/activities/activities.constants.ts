export const ACTIVITY_DIFFICULTY_LEVELS = [
  'easy',
  'moderate',
  'hard',
  'expert',
] as const;

export type ActivityDifficultyLevel = (typeof ACTIVITY_DIFFICULTY_LEVELS)[number];

export const ACTIVITY_BOOKING_REQUEST_STATUSES = [
  'pending',
  'contacted',
  'confirmed',
  'cancelled',
] as const;

export type ActivityBookingRequestStatus =
  (typeof ACTIVITY_BOOKING_REQUEST_STATUSES)[number];
