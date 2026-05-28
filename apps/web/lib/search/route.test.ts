import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSearchRoute } from './route';

test('buildSearchRoute routes hotels to /hotels', () => {
  const params = new URLSearchParams({ destination: 'Nairobi' });
  assert.equal(buildSearchRoute('hotels', params), '/hotels?destination=Nairobi');
});

test('buildSearchRoute routes flights to /search/flights', () => {
  const params = new URLSearchParams({ from: 'Kinshasa', to: 'Nairobi' });
  assert.equal(buildSearchRoute('flights', params), '/search/flights?from=Kinshasa&to=Nairobi');
});
