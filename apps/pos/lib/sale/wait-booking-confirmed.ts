import type { BookingStatus } from '@africatourismgate/types';
import { getApiClient } from '../auth/api';

const CONFIRMED: BookingStatus = 'confirmed';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/** Poll until booking is confirmed (e.g. after Stripe webhook in dev). */
export async function waitForBookingConfirmed(
  bookingId: string,
  options?: { maxAttempts?: number; intervalMs?: number },
): Promise<boolean> {
  const maxAttempts = options?.maxAttempts ?? 24;
  const intervalMs = options?.intervalMs ?? 500;
  const client = getApiClient();

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const detail = await client.getBooking(bookingId);
    if (detail.booking.status === CONFIRMED) {
      return true;
    }
    if (attempt < maxAttempts - 1) {
      await sleep(intervalMs);
    }
  }

  return false;
}
