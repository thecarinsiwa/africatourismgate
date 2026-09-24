export const API_PREFIX = process.env.API_GLOBAL_PREFIX ?? 'api';

export const SEED_ADMIN_EMAIL =
  process.env.SEED_ADMIN_EMAIL?.trim() ?? 'admin@africatourismgate.local';

export const SEED_ROOM_ID = '00000000-0000-4000-8000-000000002011';

/** Isolated date for booking e2e (avoids clashing with integration scripts). */
export const BOOKING_E2E_DATE = '2099-08-20';

/** Matches EmailVerificationService when E2E_FIXED_OTP=1 (see test/setup-env.ts). */
export const E2E_OTP_CODE = '000000';

export const DEFAULT_STRIPE_WEBHOOK_E2E_SECRET =
  'whsec_e2e_test_secret_for_signature_only';

/** Exclusive checkout helper: endDate = startDate + days (hotel nights). */
export function addDaysIso(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(year!, month! - 1, day!));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}