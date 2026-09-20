import type { Page } from '@playwright/test';
import type { ResolvedBookingItemTypeModes } from '@africatourismgate/types/tour-guide';

/** Immediate modes so hotel/car Stripe checkout hits createBookingCheckoutSession. */
export const E2E_IMMEDIATE_BOOKING_MODES: ResolvedBookingItemTypeModes = {
  room: 'immediate',
  flight_class: 'immediate',
  vehicle: 'immediate',
  cabin: 'immediate',
  activity_schedule: 'assisted',
  package: 'assisted',
};

/**
 * Override public booking modes for E2E.
 * Layout SSR may still use API/assisted; the client provider applies
 * `window.__ATG_E2E_BOOKING_MODES__` after mount (same pattern as payment methods).
 */
export async function mockBookingModes(
  page: Page,
  modes: Partial<ResolvedBookingItemTypeModes> = E2E_IMMEDIATE_BOOKING_MODES,
): Promise<void> {
  await page.addInitScript((m) => {
    (
      window as unknown as { __ATG_E2E_BOOKING_MODES__?: Partial<ResolvedBookingItemTypeModes> }
    ).__ATG_E2E_BOOKING_MODES__ = m;
  }, modes);
}
