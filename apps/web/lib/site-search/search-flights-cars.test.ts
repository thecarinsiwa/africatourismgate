import test from 'node:test';
import assert from 'node:assert/strict';
import { formatSiteSearchPrefilledSubtitle } from './prefilled';
import { siteSearchDeepLinks } from './deep-links';
import {
  matchesSiteVehicleRouteCity,
  matchesSiteVehicleRoutePair,
} from './vehicle-route-match';
import { normalizeSiteSearchText } from './nav-match';

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

test('matchesSiteAirport-equivalent airport text normalize still works', () => {
  assert.equal(normalizeSiteSearchText('Ndjili'), 'ndjili');
  assert.equal(normalizeSiteSearchText('FIH'), 'fih');
});

test('matchesSiteVehicleRouteCity matches departure/arrival names', () => {
  assert.equal(matchesSiteVehicleRouteCity('Rumangabo', ''), false);
  assert.equal(matchesSiteVehicleRouteCity('Rumangabo', 'ruma'), true);
  assert.equal(matchesSiteVehicleRouteCity('Goma', 'goma'), true);
  assert.equal(matchesSiteVehicleRouteCity('Goma', 'xyz'), false);
});

test('matchesSiteVehicleRoutePair matches cities and arrow-style queries', () => {
  const pair = { departureCity: 'Rumangabo', arrivalCity: 'Goma' };
  assert.equal(matchesSiteVehicleRoutePair(pair, ''), false);
  assert.equal(matchesSiteVehicleRoutePair(pair, 'ruma'), true);
  assert.equal(matchesSiteVehicleRoutePair(pair, 'goma'), true);
  assert.equal(matchesSiteVehicleRoutePair(pair, 'rumangabo goma'), true);
  assert.equal(matchesSiteVehicleRoutePair(pair, 'rumangabo → goma'), true);
  assert.equal(matchesSiteVehicleRoutePair(pair, 'xyz'), false);
});

test('cars deep links use departureLocation / arrivalLocation', () => {
  assert.equal(
    siteSearchDeepLinks.carsByDeparture('Rumangabo'),
    '/cars?departureLocation=Rumangabo',
  );
  assert.equal(
    siteSearchDeepLinks.carsByRoute('Rumangabo', 'Goma'),
    '/cars?departureLocation=Rumangabo&arrivalLocation=Goma',
  );
});
