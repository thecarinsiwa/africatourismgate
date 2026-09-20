import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPackageDetailHref,
  buildPackageDetailHrefWithLines,
  buildPackagesSearchQuery,
  formatPackagePrice,
  hasPackageDiscount,
  isActivityOnlyPackage,
  normalizePackagesSearchParams,
  parsePackageLineSelections,
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

test('parsePackageLineSelections reads line params from URL search', () => {
  assert.deepEqual(
    parsePackageLineSelections(
      {
        lineCount: '2',
        line0_activityId: 'act-a',
        line0_scheduleId: 'sched-a',
        line0_date: '2026-07-20',
        line0_participants: '2',
        line1_activityId: 'act-b',
        line1_scheduleId: 'sched-b',
        line1_date: '2026-07-21',
        line1_participants: '2',
      },
      2,
    ),
    [
      {
        lineType: 'activity',
        itemId: 'act-a',
        scheduleId: 'sched-a',
        date: '2026-07-20',
        participants: 2,
      },
      {
        lineType: 'activity',
        itemId: 'act-b',
        scheduleId: 'sched-b',
        date: '2026-07-21',
        participants: 2,
      },
    ],
  );
  assert.deepEqual(parsePackageLineSelections({ lineCount: '0' }, 2), [null, null]);
  assert.deepEqual(parsePackageLineSelections({}, 2), [null, null]);
});

test('buildPackageDetailHrefWithLines encodes multi-line activity selections', () => {
  assert.equal(
    buildPackageDetailHrefWithLines(
      'pkg-1',
      { startDate: '2026-07-20', travelers: '2' },
      [
        {
          lineType: 'activity',
          itemId: 'act-a',
          scheduleId: 'sched-a',
          date: '2026-07-20',
          participants: 2,
        },
        {
          lineType: 'activity',
          itemId: 'act-b',
          scheduleId: 'sched-b',
          date: '2026-07-21',
          participants: 2,
        },
      ],
      '#configure',
    ),
    '/packages/pkg-1?startDate=2026-07-20&travelers=2&lineCount=2&line0_type=activity&line0_itemId=act-a&line0_activityId=act-a&line0_scheduleId=sched-a&line0_date=2026-07-20&line0_participants=2&line1_type=activity&line1_itemId=act-b&line1_activityId=act-b&line1_scheduleId=sched-b&line1_date=2026-07-21&line1_participants=2#configure',
  );
});

test('parseParticipantsParam defaults invalid values to 1', () => {
  assert.equal(parseParticipantsParam(undefined), 1);
  assert.equal(parseParticipantsParam('0'), 1);
  assert.equal(parseParticipantsParam('3'), 3);
});
