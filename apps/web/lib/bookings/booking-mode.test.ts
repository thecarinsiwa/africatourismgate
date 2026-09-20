import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_BOOKING_ITEM_TYPE_MODES,
  getBookingCtaLabel,
} from './booking-mode';

const labels = {
  bookNow: 'Book now',
  requestBooking: 'Request a booking',
};

test('getBookingCtaLabel returns bookNow for immediate vehicle mode (default)', () => {
  assert.equal(getBookingCtaLabel('vehicle', labels), 'Book now');
  assert.equal(
    getBookingCtaLabel('vehicle', labels, DEFAULT_BOOKING_ITEM_TYPE_MODES),
    'Book now',
  );
});

test('getBookingCtaLabel returns requestBooking for assisted activity and package modes', () => {
  assert.equal(
    getBookingCtaLabel('activity_schedule', labels),
    'Request a booking',
  );
  assert.equal(getBookingCtaLabel('package', labels), 'Request a booking');
});

test('getBookingCtaLabel respects an overridden mode map', () => {
  const modes = {
    ...DEFAULT_BOOKING_ITEM_TYPE_MODES,
    vehicle: 'assisted' as const,
    package: 'immediate' as const,
  };
  assert.equal(getBookingCtaLabel('vehicle', labels, modes), 'Request a booking');
  assert.equal(getBookingCtaLabel('package', labels, modes), 'Book now');
});
