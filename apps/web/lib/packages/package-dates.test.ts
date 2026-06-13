import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPackageTravelDates,
  computePackageEndDate,
  parsePackageDurationDays,
} from './package-dates';

test('parsePackageDurationDays defaults invalid values to 3', () => {
  assert.equal(parsePackageDurationDays(undefined), 3);
  assert.equal(parsePackageDurationDays({ durationDays: 0 }), 3);
  assert.equal(parsePackageDurationDays({ durationDays: 5 }), 5);
});

test('computePackageEndDate adds calendar days', () => {
  assert.equal(computePackageEndDate('2026-08-01', 7), '2026-08-08');
});

test('buildPackageTravelDates validates input', () => {
  assert.deepEqual(buildPackageTravelDates('2026-08-01', 3, 2), {
    startDate: '2026-08-01',
    endDate: '2026-08-04',
    travelers: 2,
  });
  assert.equal(buildPackageTravelDates('', 3, 2), null);
});
