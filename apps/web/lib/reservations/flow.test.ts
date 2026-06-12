import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCheckoutItems,
  buildReservationQuery,
  parseReservationDraft,
} from './flow';

const FLIGHT_ID = '00000000-0000-4000-8000-000000003020';
const FLIGHT_CLASS_ECO = '00000000-0000-4000-8000-000000003022';

test('parseReservationDraft parses flight_class from query params', () => {
  const draft = parseReservationDraft({
    kind: 'flight_class',
    flightId: FLIGHT_ID,
    flightClassId: FLIGHT_CLASS_ECO,
    departureDate: '2026-08-01',
    passengers: '2',
  });

  assert.deepEqual(draft, {
    kind: 'flight_class',
    flightId: FLIGHT_ID,
    flightClassId: FLIGHT_CLASS_ECO,
    departureDate: '2026-08-01',
    passengers: 2,
  });
});

test('buildReservationQuery serializes flight_class draft', () => {
  const query = buildReservationQuery({
    kind: 'flight_class',
    flightId: FLIGHT_ID,
    flightClassId: FLIGHT_CLASS_ECO,
    departureDate: '2026-08-01',
    passengers: 2,
  });

  const params = new URLSearchParams(query);
  assert.equal(params.get('kind'), 'flight_class');
  assert.equal(params.get('flightId'), FLIGHT_ID);
  assert.equal(params.get('flightClassId'), FLIGHT_CLASS_ECO);
  assert.equal(params.get('departureDate'), '2026-08-01');
  assert.equal(params.get('passengers'), '2');
});

test('buildCheckoutItems maps flight_class to booking payload', () => {
  const items = buildCheckoutItems({
    kind: 'flight_class',
    flightId: FLIGHT_ID,
    flightClassId: FLIGHT_CLASS_ECO,
    departureDate: '2026-08-01',
    passengers: 2,
  });

  assert.deepEqual(items, [
    {
      itemType: 'flight_class',
      referenceId: FLIGHT_CLASS_ECO,
      quantity: 2,
      date: '2026-08-01',
    },
  ]);
});
