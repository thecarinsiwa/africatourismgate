import test from 'node:test';
import assert from 'node:assert/strict';
import { addDays, formatDateISO, todayISODate } from './dates';

test('todayISODate returns local calendar date in ISO format', () => {
  const now = new Date();
  const expected = formatDateISO(now.getFullYear(), now.getMonth() + 1, now.getDate());
  assert.equal(todayISODate(), expected);
  assert.match(todayISODate(), /^\d{4}-\d{2}-\d{2}$/);
});

test('addDays advances return min for car rental dates', () => {
  assert.equal(addDays('2026-08-01', 1), '2026-08-02');
});
