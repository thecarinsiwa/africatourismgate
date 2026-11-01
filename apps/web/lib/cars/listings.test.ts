import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCarDetailHref,
  buildCarsSearchQuery,
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
    }),
    {
      departureLocation: 'Kinshasa',
      arrivalLocation: undefined,
      travelDate: '2026-08-01',
      routeId: undefined,
    },
  );
});

test('normalizeCarsSearchParams prefers canonical car params', () => {
  assert.deepEqual(
    normalizeCarsSearchParams({
      departureLocation: 'Kinshasa',
      arrivalLocation: 'Lubumbashi',
      travelDate: '2026-09-01',
      routeId: 'route-1',
      destination: 'Nairobi',
      pickupDate: '2026-08-01',
    }),
    {
      departureLocation: 'Kinshasa',
      arrivalLocation: 'Lubumbashi',
      travelDate: '2026-09-01',
      routeId: 'route-1',
    },
  );
});

test('hasRequiredCarDates requires travelDate', () => {
  assert.equal(
    hasRequiredCarDates({
      departureLocation: 'Kinshasa',
      arrivalLocation: 'Lubumbashi',
      travelDate: '2026-08-01',
    }),
    true,
  );
  assert.equal(
    hasRequiredCarDates({
      departureLocation: 'Kinshasa',
      arrivalLocation: 'Lubumbashi',
    }),
    false,
  );
});

test('toVehicleSearchQuery returns browse query when params incomplete', () => {
  assert.deepEqual(toVehicleSearchQuery({ departureLocation: 'Kinshasa' }), {
    departureLocation: 'Kinshasa',
    limit: 50,
  });
  assert.deepEqual(toVehicleSearchQuery({}), { limit: 50 });
});

test('toVehicleSearchQuery maps to API query', () => {
  assert.deepEqual(
    toVehicleSearchQuery({
      departureLocation: 'Kinshasa',
      arrivalLocation: 'Lubumbashi',
      travelDate: '2026-08-01',
    }),
    {
      departureLocation: 'Kinshasa',
      arrivalLocation: 'Lubumbashi',
      travelDate: '2026-08-01',
      limit: 50,
    },
  );
});

test('toVehicleDetailQuery requires travelDate', () => {
  assert.deepEqual(
    toVehicleDetailQuery({
      routeId: 'route-1',
      departureLocation: 'Kinshasa',
      arrivalLocation: 'Lubumbashi',
      travelDate: '2026-08-01',
    }),
    {
      routeId: 'route-1',
      departureCity: 'Kinshasa',
      arrivalCity: 'Lubumbashi',
      travelDate: '2026-08-01',
    },
  );
  assert.equal(toVehicleDetailQuery({ routeId: 'route-1' }), null);
});

test('buildCarsSearchQuery serializes search params', () => {
  const query = buildCarsSearchQuery({
    departureLocation: 'Kinshasa',
    arrivalLocation: 'Lubumbashi',
    travelDate: '2026-08-01',
  });
  const params = new URLSearchParams(query.slice(1));
  assert.equal(params.get('departureLocation'), 'Kinshasa');
  assert.equal(params.get('arrivalLocation'), 'Lubumbashi');
  assert.equal(params.get('travelDate'), '2026-08-01');
});

test('buildCarDetailHref preserves route and travel date', () => {
  assert.equal(
    buildCarDetailHref('veh-1', {
      routeId: 'route-1',
      departureLocation: 'Kinshasa',
      arrivalLocation: 'Lubumbashi',
      travelDate: '2026-08-01',
    }),
    '/cars/veh-1?routeId=route-1&departureLocation=Kinshasa&arrivalLocation=Lubumbashi&travelDate=2026-08-01',
  );
});
