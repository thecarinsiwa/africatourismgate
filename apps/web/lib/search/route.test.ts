import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSearchRoute } from './route';

test('buildSearchRoute routes hotels to /hotels', () => {
  const params = new URLSearchParams({ destination: 'Nairobi' });
  assert.equal(buildSearchRoute('hotels', params), '/hotels?destination=Nairobi');
});

test('buildSearchRoute routes flights to /flights', () => {
  const params = new URLSearchParams({ from: 'FIH', to: 'NBO', departureDate: '2026-08-01' });
  assert.equal(
    buildSearchRoute('flights', params),
    '/flights?from=FIH&to=NBO&departureDate=2026-08-01',
  );
});

test('buildSearchRoute routes cars to /cars', () => {
  const params = new URLSearchParams({
    pickupLocation: 'Kinshasa',
    pickupDate: '2026-08-01',
    returnDate: '2026-08-08',
  });
  assert.equal(
    buildSearchRoute('cars', params),
    '/cars?pickupLocation=Kinshasa&pickupDate=2026-08-01&returnDate=2026-08-08',
  );
});
