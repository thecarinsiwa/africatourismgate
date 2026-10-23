import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPackageDetailHref,
  buildPackagesSearchQuery,
  formatPackagePrice,
  hasPackageDiscount,
  normalizePackagesSearchParams,
  parseParticipantsParam,
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
      startDate: '2026-08-01',
      travelers: '2',
      sailingId: undefined,
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
      { startDate: '2026-07-20', travelers: '2' },
      '#items',
    ),
    '/packages/pkg-1?startDate=2026-07-20&travelers=2#items',
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

test('hasPackageDiscount detects positive discount', () => {
  assert.equal(hasPackageDiscount({ discountAmountCents: 900 }), true);
  assert.equal(hasPackageDiscount({ discountAmountCents: 0 }), false);
});

test('parseParticipantsParam defaults invalid values to 1', () => {
  assert.equal(parseParticipantsParam(undefined), 1);
  assert.equal(parseParticipantsParam('0'), 1);
  assert.equal(parseParticipantsParam('3'), 3);
});
