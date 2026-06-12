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
