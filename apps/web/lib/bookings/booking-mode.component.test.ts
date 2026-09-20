import { describe, expect, it } from 'vitest';
import {
  DEFAULT_BOOKING_ITEM_TYPE_MODES,
  getBookingCtaLabel,
} from './booking-mode';

const labels = {
  bookNow: 'Book now',
  requestBooking: 'Request a booking',
};

describe('getBookingCtaLabel', () => {
  it('returns bookNow for immediate vehicle mode (default)', () => {
    expect(getBookingCtaLabel('vehicle', labels)).toBe('Book now');
    expect(
      getBookingCtaLabel('vehicle', labels, DEFAULT_BOOKING_ITEM_TYPE_MODES),
    ).toBe('Book now');
  });

  it('returns requestBooking for assisted activity and package modes', () => {
    expect(getBookingCtaLabel('activity_schedule', labels)).toBe(
      'Request a booking',
    );
    expect(getBookingCtaLabel('package', labels)).toBe('Request a booking');
  });

  it('respects an overridden mode map', () => {
    const modes = {
      ...DEFAULT_BOOKING_ITEM_TYPE_MODES,
      vehicle: 'assisted' as const,
      package: 'immediate' as const,
    };
    expect(getBookingCtaLabel('vehicle', labels, modes)).toBe(
      'Request a booking',
    );
    expect(getBookingCtaLabel('package', labels, modes)).toBe('Book now');
  });
});
