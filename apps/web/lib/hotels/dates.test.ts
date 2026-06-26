import test from 'node:test';
import assert from 'node:assert/strict';
import { addDays, countStayNights, formatDateISO, isStayNight, todayISODate } from './dates';

test('todayISODate returns local calendar date in ISO format', () => {
  const now = new Date();
  const expected = formatDateISO(now.getFullYear(), now.getMonth() + 1, now.getDate());
  assert.equal(todayISODate(), expected);
  assert.match(todayISODate(), /^\d{4}-\d{2}-\d{2}$/);
});

test('addDays advances return min for car rental dates', () => {
  assert.equal(addDays('2026-08-01', 1), '2026-08-02');
});

test('countStayNights uses checkIn inclusive and checkOut exclusive', () => {
  assert.equal(countStayNights('2026-06-17', '2026-06-24'), 7);
  assert.equal(countStayNights('2026-06-17', '2026-06-18'), 1);
});

test('isStayNight highlights billed nights only', () => {
  const checkIn = '2026-06-17';
  const checkOut = '2026-06-24';
  assert.equal(isStayNight('2026-06-17', checkIn, checkOut), true);
  assert.equal(isStayNight('2026-06-23', checkIn, checkOut), true);
  assert.equal(isStayNight('2026-06-24', checkIn, checkOut), false);
});
