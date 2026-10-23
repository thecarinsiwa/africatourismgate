import test from 'node:test';
import assert from 'node:assert/strict';
import { getBookingItemCatalogHref } from './booking-item-catalog-href';

test('getBookingItemCatalogHref deep-links with catalogProductId', () => {
  assert.equal(
    getBookingItemCatalogHref('room', 'room-1', 'property-1'),
    '/hebergements/property-1/voir',
  );
  assert.equal(
    getBookingItemCatalogHref('flight_class', 'class-1', 'flight-1'),
    '/produits/vols/flight-1/voir',
  );
  assert.equal(
    getBookingItemCatalogHref('vehicle', 'avail-1', 'vehicle-1'),
    '/produits/locations/vehicle-1/voir',
  );
  assert.equal(
    getBookingItemCatalogHref('cabin', 'avail-1', 'sailing-1'),
    '/produits/croisieres/sailing-1',
  );
  assert.equal(
    getBookingItemCatalogHref('activity_schedule', 'sched-1', 'activity-1'),
    '/produits/activites/activity-1/voir',
  );
  assert.equal(
    getBookingItemCatalogHref('package', 'pkg-1', 'pkg-1'),
    '/produits/forfaits/pkg-1/voir',
  );
});

test('getBookingItemCatalogHref falls back to list without catalogProductId', () => {
  assert.equal(getBookingItemCatalogHref('room', 'room-1'), '/hebergements');
  assert.equal(
    getBookingItemCatalogHref('package', 'pkg-1'),
    '/produits/forfaits/pkg-1/voir',
  );
});

test('getBookingItemCatalogHref returns null for unknown type', () => {
  assert.equal(getBookingItemCatalogHref('unknown', 'x', 'y'), null);
});
