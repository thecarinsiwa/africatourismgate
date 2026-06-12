import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCruiseDetailHref,
  buildCruisesSearchQuery,
  formatPortTime,
  hasRequiredCruiseSearchParams,
  normalizeCruisesSearchParams,
  parseGuestsParam,
  toCruiseSailingDetailQuery,
  toCruiseSearchQuery,
} from './listings';

test('normalizeCruisesSearchParams maps legacy home-search params', () => {
  assert.deepEqual(
    normalizeCruisesSearchParams({
      from: 'cdkin',
      to: 'cdbnw',
      checkIn: '2026-09-01',
      checkOut: '2026-09-30',
      adults: '2',
    }),
    {
      sailFrom: 'CDKIN',
      sailTo: 'CDBNW',
      startDate: '2026-09-01',
      endDate: '2026-09-30',
      guests: '2',
    },
  );
});

test('normalizeCruisesSearchParams prefers canonical cruise params', () => {
  assert.deepEqual(
    normalizeCruisesSearchParams({
      sailFrom: 'CDKIN',
      sailTo: 'CDBNW',
      startDate: '2026-09-01',
      endDate: '2026-09-30',
      guests: '3',
      from: 'UNKNOWN',
      checkIn: '2026-08-01',
    }),
    {
      sailFrom: 'CDKIN',
      sailTo: 'CDBNW',
      startDate: '2026-09-01',
      endDate: '2026-09-30',
      guests: '3',
    },
  );
});

test('parseGuestsParam defaults invalid values to 1', () => {
  assert.equal(parseGuestsParam(undefined), 1);
  assert.equal(parseGuestsParam('0'), 1);
  assert.equal(parseGuestsParam('abc'), 1);
  assert.equal(parseGuestsParam('4'), 4);
});

test('hasRequiredCruiseSearchParams requires ports and valid date range', () => {
  assert.equal(
    hasRequiredCruiseSearchParams({
      sailFrom: 'CDKIN',
      sailTo: 'CDBNW',
      startDate: '2026-09-01',
      endDate: '2026-09-30',
    }),
    true,
  );
  assert.equal(
    hasRequiredCruiseSearchParams({
      sailFrom: 'CDKIN',
      sailTo: 'CDBNW',
      startDate: '2026-09-30',
      endDate: '2026-09-01',
    }),
    false,
  );
  assert.equal(
    hasRequiredCruiseSearchParams({
      sailFrom: 'CDKIN',
      startDate: '2026-09-01',
      endDate: '2026-09-30',
    }),
    false,
  );
});

test('toCruiseSearchQuery returns null when params incomplete', () => {
  assert.equal(
    toCruiseSearchQuery({
      sailFrom: 'CDKIN',
      startDate: '2026-09-01',
      endDate: '2026-09-30',
    }),
    null,
  );
});

test('toCruiseSearchQuery maps to API query', () => {
  assert.deepEqual(
    toCruiseSearchQuery({
      sailFrom: 'cdkin',
      sailTo: 'cdbnw',
      startDate: '2026-09-01',
      endDate: '2026-09-30',
      guests: '2',
    }),
    {
      sailFrom: 'CDKIN',
      sailTo: 'CDBNW',
      startDate: '2026-09-01',
      endDate: '2026-09-30',
      guests: 2,
      limit: 50,
    },
  );
});

test('toCruiseSailingDetailQuery passes guests', () => {
  assert.deepEqual(toCruiseSailingDetailQuery({ guests: '3' }), { guests: 3 });
  assert.deepEqual(toCruiseSailingDetailQuery({}), { guests: 1 });
});

test('buildCruisesSearchQuery serializes search params', () => {
  const query = buildCruisesSearchQuery({
    sailFrom: 'CDKIN',
    sailTo: 'CDBNW',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    guests: '2',
  });
  const params = new URLSearchParams(query.slice(1));
  assert.equal(params.get('sailFrom'), 'CDKIN');
  assert.equal(params.get('sailTo'), 'CDBNW');
  assert.equal(params.get('startDate'), '2026-09-01');
  assert.equal(params.get('endDate'), '2026-09-30');
  assert.equal(params.get('guests'), '2');
});

test('buildCruiseDetailHref preserves search context and cabin selection', () => {
  assert.equal(
    buildCruiseDetailHref('sailing-1', {
      sailFrom: 'CDKIN',
      sailTo: 'CDBNW',
      startDate: '2026-09-01',
      endDate: '2026-09-30',
      guests: '2',
      cabinId: 'avail-1',
    }),
    '/cruises/sailing-1?sailFrom=CDKIN&sailTo=CDBNW&startDate=2026-09-01&endDate=2026-09-30&guests=2&cabinId=avail-1',
  );
});

test('formatPortTime formats HH:MM:SS values in UTC', () => {
  assert.equal(formatPortTime('10:00:00', 'fr-FR'), '10:00');
});
