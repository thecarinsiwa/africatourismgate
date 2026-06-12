import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPackageDetailHref,
  buildPackagesSearchQuery,
  formatPackagePrice,
  hasPackageDiscount,
  isActivityOnlyPackage,
  normalizePackagesSearchParams,
  toPackagesBrowseQuery,
} from './listings';

test('normalizePackagesSearchParams maps search and legacy guest params', () => {
  assert.deepEqual(
    normalizePackagesSearchParams({
      search: '  safari  ',
      guests: '2',
      checkIn: '2026-08-01',
    }),
    {
      search: 'safari',
      page: undefined,
      date: '2026-08-01',
      participants: '2',
    },
  );
});

test('formatPackagePrice formats USD cents', () => {
  assert.match(formatPackagePrice(8100, 'USD'), /81/);
});

test('buildPackageDetailHref builds detail URL with query and hash', () => {
  assert.equal(
    buildPackageDetailHref(
      'pkg-1',
      { date: '2026-07-20', participants: '2' },
      '#items',
    ),
    '/packages/pkg-1?date=2026-07-20&participants=2#items',
  );
});

test('buildPackagesSearchQuery serializes search params', () => {
  assert.equal(buildPackagesSearchQuery({ search: 'duo', page: '2' }), '?search=duo&page=2');
});

test('toPackagesBrowseQuery defaults page to 1', () => {
  assert.deepEqual(toPackagesBrowseQuery({ search: 'kin' }), {
    search: 'kin',
    page: 1,
    limit: 50,
  });
});

test('isActivityOnlyPackage detects activity-only bundles', () => {
  assert.equal(
    isActivityOnlyPackage([
      { itemType: 'activity' },
      { itemType: 'activity' },
    ]),
    true,
  );
  assert.equal(
    isActivityOnlyPackage([
      { itemType: 'activity' },
      { itemType: 'property' },
    ]),
    false,
  );
});

test('hasPackageDiscount detects positive discount', () => {
  assert.equal(hasPackageDiscount({ discountAmountCents: 900 }), true);
  assert.equal(hasPackageDiscount({ discountAmountCents: 0 }), false);
});
