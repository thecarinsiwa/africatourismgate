import test from 'node:test';
import assert from 'node:assert/strict';
import { formatSiteSearchPrefilledSubtitle } from './prefilled';
import { matchesSiteAirport } from './search-flights';
import { matchesSitePickupLocation } from './search-cars';

test('formatSiteSearchPrefilledSubtitle joins detail and hint', () => {
  assert.equal(
    formatSiteSearchPrefilledSubtitle('FIH'),
    'FIH · Recherche pré-remplie',
  );
  assert.equal(
    formatSiteSearchPrefilledSubtitle('', 'Pre-filled search'),
    'Pre-filled search',
  );
});

test('matchesSiteAirport matches name, iata and city', () => {
  const airport = {
    iataCode: 'FIH',
    name: 'Ndjili International',
    city: 'Kinshasa',
  };
  assert.equal(matchesSiteAirport(airport, ''), false);
  assert.equal(matchesSiteAirport(airport, 'fih'), true);
  assert.equal(matchesSiteAirport(airport, 'ndjili'), true);
  assert.equal(matchesSiteAirport(airport, 'kinshasa'), true);
  assert.equal(matchesSiteAirport(airport, 'xyz'), false);
});

test('matchesSitePickupLocation matches name and country', () => {
  const location = { name: 'Kinshasa', countryCode: 'CD' };
  assert.equal(matchesSitePickupLocation(location, ''), false);
  assert.equal(matchesSitePickupLocation(location, 'kin'), true);
  assert.equal(matchesSitePickupLocation(location, 'cd'), true);
  assert.equal(matchesSitePickupLocation(location, 'xyz'), false);
});
