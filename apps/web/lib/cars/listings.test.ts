import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCarDetailHref,
  buildCarsSearchQuery,
  computeVehicleTotal,
  countRentalDays,
  hasRequiredCarDates,
  normalizeCarsSearchParams,
  toVehicleDetailQuery,
  toVehicleSearchQuery,
} from './listings';

test('normalizeCarsSearchParams maps legacy home-search params', () => {
  assert.deepEqual(
    normalizeCarsSearchParams({
      destination: 'Kinshasa',
      checkIn: '2026-08-01',
      checkOut: '2026-08-08',
    }),
    {
      pickupLocation: 'Kinshasa',
      pickupDate: '2026-08-01',
      returnDate: '2026-08-08',
    },
  );
});

test('normalizeCarsSearchParams prefers canonical car params', () => {
  assert.deepEqual(
    normalizeCarsSearchParams({
      pickupLocation: 'Nairobi',
      pickupDate: '2026-09-01',
      returnDate: '2026-09-05',
      destination: 'Kinshasa',
      checkIn: '2026-08-01',
    }),
    {
      pickupLocation: 'Nairobi',
      pickupDate: '2026-09-01',
      returnDate: '2026-09-05',
    },
  );
});

test('hasRequiredCarDates requires location and valid date range', () => {
  assert.equal(
    hasRequiredCarDates({
      pickupLocation: 'Kinshasa',
      pickupDate: '2026-08-01',
      returnDate: '2026-08-08',
    }),
    true,
  );
  assert.equal(
    hasRequiredCarDates({
      pickupLocation: 'Kinshasa',
      pickupDate: '2026-08-08',
      returnDate: '2026-08-01',
    }),
    false,
  );
  assert.equal(hasRequiredCarDates({ pickupDate: '2026-08-01', returnDate: '2026-08-08' }), false);
});

test('countRentalDays matches API calendar days', () => {
  assert.equal(countRentalDays('2026-08-01', '2026-08-08'), 7);
  assert.equal(countRentalDays('2026-08-01', '2026-08-02'), 1);
});

test('computeVehicleTotal multiplies daily rate by rental days', () => {
  assert.equal(computeVehicleTotal(5500, 7), 38500);
});

test('toVehicleSearchQuery returns browse query when params incomplete', () => {
  assert.deepEqual(toVehicleSearchQuery({ pickupLocation: 'Kinshasa' }), {
    pickupLocation: 'Kinshasa',
    limit: 50,
  });
  assert.deepEqual(toVehicleSearchQuery({}), { limit: 50 });
});

test('toVehicleSearchQuery maps to API query', () => {
  assert.deepEqual(
    toVehicleSearchQuery({
      pickupLocation: 'Kinshasa',
      pickupDate: '2026-08-01',
      returnDate: '2026-08-08',
    }),
    {
      pickupLocation: 'Kinshasa',
      pickupDate: '2026-08-01',
      returnDate: '2026-08-08',
      limit: 50,
    },
  );
});

test('toVehicleDetailQuery requires valid dates', () => {
  assert.deepEqual(
    toVehicleDetailQuery({
      pickupDate: '2026-08-01',
      returnDate: '2026-08-08',
    }),
    {
      pickupDate: '2026-08-01',
      returnDate: '2026-08-08',
    },
  );
  assert.equal(
    toVehicleDetailQuery({ pickupDate: '2026-08-08', returnDate: '2026-08-01' }),
    null,
  );
});

test('buildCarsSearchQuery serializes search params', () => {
  const query = buildCarsSearchQuery({
    pickupLocation: 'Kinshasa',
    pickupDate: '2026-08-01',
    returnDate: '2026-08-08',
  });
  const params = new URLSearchParams(query.slice(1));
  assert.equal(params.get('pickupLocation'), 'Kinshasa');
  assert.equal(params.get('pickupDate'), '2026-08-01');
  assert.equal(params.get('returnDate'), '2026-08-08');
});

test('buildCarDetailHref preserves dates on detail link', () => {
  assert.equal(
    buildCarDetailHref('veh-1', {
      pickupLocation: 'Kinshasa',
      pickupDate: '2026-08-01',
      returnDate: '2026-08-08',
    }),
    '/cars/veh-1?pickupLocation=Kinshasa&pickupDate=2026-08-01&returnDate=2026-08-08',
  );
});
