import test from 'node:test';
import assert from 'node:assert/strict';
import { BadRequestException } from '@nestjs/common';
import { DEFAULT_CATALOG_PRODUCTS } from '@africatourismgate/types';
import { validateSettingValue } from './validate-setting-value';

test('validateSettingValue products_enabled returns defaults when empty', () => {
  const result = validateSettingValue('products_enabled', {});
  assert.deepEqual(result, DEFAULT_CATALOG_PRODUCTS);
});

test('validateSettingValue products_enabled merges boolean flags', () => {
  const result = validateSettingValue('products_enabled', {
    hotels: false,
    packages: false,
    tours: true,
  });
  assert.equal(result.hotels, false);
  assert.equal(result.packages, false);
  assert.equal(result.tours, true);
  assert.equal(result.flights, true);
  assert.equal(result.cars, true);
  assert.equal(result.cruises, true);
});

test('validateSettingValue products_enabled allows all disabled', () => {
  const result = validateSettingValue('products_enabled', {
    hotels: false,
    flights: false,
    cars: false,
    cruises: false,
    tours: false,
    packages: false,
  });
  assert.equal(Object.values(result).every((v) => v === false), true);
});

test('validateSettingValue products_enabled rejects non-boolean flags', () => {
  assert.throws(
    () =>
      validateSettingValue('products_enabled', {
        hotels: 'off',
      }),
    (error: unknown) =>
      error instanceof BadRequestException &&
      String(error.message).includes('hotels'),
  );
});
