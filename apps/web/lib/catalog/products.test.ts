import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CATALOG_PRODUCT_KEYS,
  DEFAULT_CATALOG_PRODUCTS,
  isCatalogProductEnabled,
  normalizeCatalogProducts,
} from '@africatourismgate/types/organization-settings';
import {
  catalogKeyForSearchVertical,
  isSearchVerticalCatalogEnabled,
} from './keys';

test('normalizeCatalogProducts returns defaults for nullish / non-object', () => {
  assert.deepEqual(normalizeCatalogProducts(null), DEFAULT_CATALOG_PRODUCTS);
  assert.deepEqual(normalizeCatalogProducts(undefined), DEFAULT_CATALOG_PRODUCTS);
  assert.deepEqual(
    normalizeCatalogProducts('x' as unknown as never),
    DEFAULT_CATALOG_PRODUCTS,
  );
});

test('normalizeCatalogProducts merges only boolean flags', () => {
  const resolved = normalizeCatalogProducts({
    hotels: false,
    flights: true,
    cars: 'yes' as unknown as boolean,
    cruises: false,
  });

  assert.equal(resolved.hotels, false);
  assert.equal(resolved.flights, true);
  assert.equal(resolved.cars, true);
  assert.equal(resolved.cruises, false);
  assert.equal(resolved.tours, true);
  assert.equal(resolved.packages, true);
});

test('normalizeCatalogProducts allows all products disabled', () => {
  const allOff = Object.fromEntries(
    CATALOG_PRODUCT_KEYS.map((key) => [key, false]),
  ) as Record<(typeof CATALOG_PRODUCT_KEYS)[number], boolean>;

  assert.deepEqual(normalizeCatalogProducts(allOff), allOff);
});

test('isCatalogProductEnabled respects resolved map', () => {
  assert.equal(isCatalogProductEnabled('hotels'), true);
  assert.equal(
    isCatalogProductEnabled('hotels', { ...DEFAULT_CATALOG_PRODUCTS, hotels: false }),
    false,
  );
});

test('catalogKeyForSearchVertical maps 1:1', () => {
  assert.equal(catalogKeyForSearchVertical('tours'), 'tours');
  assert.equal(catalogKeyForSearchVertical('hotels'), 'hotels');
  assert.equal(catalogKeyForSearchVertical('flights'), 'flights');
  assert.equal(catalogKeyForSearchVertical('cars'), 'cars');
  assert.equal(catalogKeyForSearchVertical('cruises'), 'cruises');
});

test('isSearchVerticalCatalogEnabled follows catalog flags', () => {
  const products = { ...DEFAULT_CATALOG_PRODUCTS, tours: false, cars: false };
  assert.equal(isSearchVerticalCatalogEnabled('hotels', products), true);
  assert.equal(isSearchVerticalCatalogEnabled('tours', products), false);
  assert.equal(isSearchVerticalCatalogEnabled('cars', products), false);
});
