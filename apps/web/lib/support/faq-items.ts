export const SUPPORT_FAQ_KEYS = [
  'booking',
  'payment',
  'cancellation',
  'account',
  'contact',
] as const;

export type SupportFaqKey = (typeof SUPPORT_FAQ_KEYS)[number];
