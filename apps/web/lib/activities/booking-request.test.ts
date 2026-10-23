import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getActivityListingCtaMode,
  shouldShowActivityBookingRequestForm,
  todayDateInputValue,
} from './booking-request';

describe('getActivityListingCtaMode', () => {
  it('returns book when date and slots are available', () => {
    assert.equal(
      getActivityListingCtaMode(
        {
          availableSchedulesCount: 2,
          allowBookingRequestsWhenUnavailable: true,
          nextStartDatetime: '2026-08-15T09:00:00.000Z',
        },
        '2026-08-15',
      ),
      'book',
    );
  });

  it('returns request when zero slots and toggle enabled', () => {
    assert.equal(
      getActivityListingCtaMode({
        availableSchedulesCount: 0,
        allowBookingRequestsWhenUnavailable: true,
      }),
      'request',
    );
  });

  it('returns unavailable when zero slots and toggle disabled', () => {
    assert.equal(
      getActivityListingCtaMode({
        availableSchedulesCount: 0,
        allowBookingRequestsWhenUnavailable: false,
      }),
      'unavailable',
    );
  });
});

describe('shouldShowActivityBookingRequestForm', () => {
  it('shows form when preferRequest and toggle on with no bookable slots', () => {
    assert.equal(
      shouldShowActivityBookingRequestForm(
        {
          date: '',
          schedules: [],
          allowBookingRequestsWhenUnavailable: true,
        },
        2,
        true,
      ),
      true,
    );
  });

  it('shows form when date has no remaining places', () => {
    assert.equal(
      shouldShowActivityBookingRequestForm(
        {
          date: '2026-08-15',
          schedules: [
            {
              scheduleId: 's1',
              startDatetime: '2026-08-15T09:00:00.000Z',
              capacity: 10,
              bookedCount: 10,
              remainingPlaces: 0,
              priceCents: 1000,
              currency: 'USD',
            },
          ],
          allowBookingRequestsWhenUnavailable: true,
        },
        1,
        false,
      ),
      true,
    );
  });

  it('hides form when a bookable schedule exists', () => {
    assert.equal(
      shouldShowActivityBookingRequestForm(
        {
          date: '2026-08-15',
          schedules: [
            {
              scheduleId: 's1',
              startDatetime: '2026-08-15T09:00:00.000Z',
              capacity: 10,
              bookedCount: 2,
              remainingPlaces: 8,
              priceCents: 1000,
              currency: 'USD',
            },
          ],
          allowBookingRequestsWhenUnavailable: true,
        },
        2,
        true,
      ),
      false,
    );
  });
});

describe('todayDateInputValue', () => {
  it('formats local YYYY-MM-DD', () => {
    assert.equal(todayDateInputValue(new Date(2026, 7, 5)), '2026-08-05');
  });
});
