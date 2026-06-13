import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPackageDetailHref,
  buildPackageDetailHrefWithSelections,
  buildPackagesSearchQuery,
  formatPackagePrice,
  hasPackageDiscount,
  isActivityOnlyPackage,
  normalizePackagesSearchParams,
  parsePackageScheduleSelections,
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
      date: '2026-08-01',
      participants: '2',
      checkIn: '2026-08-01',
      checkOut: undefined,
      guests: '2',
      departureDate: undefined,
      passengers: undefined,
      pickupDate: undefined,
      returnDate: undefined,
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

test('parsePackageScheduleSelections reads line params from URL search', () => {
  assert.deepEqual(
    parsePackageScheduleSelections({
      lineCount: '2',
      line0_activityId: 'act-a',
      line0_scheduleId: 'sched-a',
      line1_activityId: 'act-b',
      line1_scheduleId: 'sched-b',
    }),
    {
      'act-a': 'sched-a',
      'act-b': 'sched-b',
    },
  );
  assert.deepEqual(parsePackageScheduleSelections({ lineCount: '0' }), {});
  assert.deepEqual(parsePackageScheduleSelections({}), {});
});

test('buildPackageDetailHrefWithSelections encodes multi-line activity selections', () => {
  assert.equal(
    buildPackageDetailHrefWithSelections(
      'pkg-1',
      { date: '2026-07-20', participants: '2' },
      ['act-a', 'act-b'],
      { 'act-a': 'sched-a', 'act-b': 'sched-b' },
      '#configure',
    ),
    '/packages/pkg-1?date=2026-07-20&participants=2&lineCount=2&line0_activityId=act-a&line0_scheduleId=sched-a&line1_activityId=act-b&line1_scheduleId=sched-b#configure',
  );
});

test('parseParticipantsParam defaults invalid values to 1', () => {
  assert.equal(parseParticipantsParam(undefined), 1);
  assert.equal(parseParticipantsParam('0'), 1);
  assert.equal(parseParticipantsParam('3'), 3);
});
