import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCheckoutItems,
  buildDraftBrowseHref,
  buildDraftDetailHref,
  buildReservationQuery,
  isCabinOfferBookable,
  parseReservationDraft,
} from './flow';

const FLIGHT_ID = '00000000-0000-4000-8000-000000003020';
const FLIGHT_CLASS_ECO = '00000000-0000-4000-8000-000000003022';
const VEHICLE_ID = '00000000-0000-4000-8000-000000004021';
const VEHICLE_SLOT_ID = '00000000-0000-4000-8000-000000004023';
const SAILING_ID = '00000000-0000-4000-8000-000000003036';
const CABIN_AVAIL_STD = '00000000-0000-4000-8000-000000003037';

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

test('parseReservationDraft parses vehicle from query params', () => {
  const draft = parseReservationDraft({
    kind: 'vehicle',
    vehicleId: VEHICLE_ID,
    availabilitySlotId: VEHICLE_SLOT_ID,
    pickupDate: '2026-08-01',
    returnDate: '2026-08-08',
  });

  assert.deepEqual(draft, {
    kind: 'vehicle',
    vehicleId: VEHICLE_ID,
    availabilitySlotId: VEHICLE_SLOT_ID,
    pickupDate: '2026-08-01',
    returnDate: '2026-08-08',
  });
});

test('parseReservationDraft rejects vehicle when return is not after pickup', () => {
  assert.equal(
    parseReservationDraft({
      kind: 'vehicle',
      vehicleId: VEHICLE_ID,
      availabilitySlotId: VEHICLE_SLOT_ID,
      pickupDate: '2026-08-08',
      returnDate: '2026-08-01',
    }),
    null,
  );
});

test('buildReservationQuery serializes vehicle draft', () => {
  const query = buildReservationQuery({
    kind: 'vehicle',
    vehicleId: VEHICLE_ID,
    availabilitySlotId: VEHICLE_SLOT_ID,
    pickupDate: '2026-08-01',
    returnDate: '2026-08-08',
  });

  const params = new URLSearchParams(query);
  assert.equal(params.get('kind'), 'vehicle');
  assert.equal(params.get('vehicleId'), VEHICLE_ID);
  assert.equal(params.get('availabilitySlotId'), VEHICLE_SLOT_ID);
  assert.equal(params.get('pickupDate'), '2026-08-01');
  assert.equal(params.get('returnDate'), '2026-08-08');
});

test('buildCheckoutItems maps vehicle to booking payload with slot reference', () => {
  const items = buildCheckoutItems({
    kind: 'vehicle',
    vehicleId: VEHICLE_ID,
    availabilitySlotId: VEHICLE_SLOT_ID,
    pickupDate: '2026-08-01',
    returnDate: '2026-08-08',
  });

  assert.deepEqual(items, [
    {
      itemType: 'vehicle',
      referenceId: VEHICLE_SLOT_ID,
      quantity: 1,
      startDate: '2026-08-01',
      endDate: '2026-08-08',
    },
  ]);
});

test('buildDraftDetailHref links vehicle draft back to car detail', () => {
  assert.equal(
    buildDraftDetailHref({
      kind: 'vehicle',
      vehicleId: VEHICLE_ID,
      availabilitySlotId: VEHICLE_SLOT_ID,
      pickupDate: '2026-08-01',
      returnDate: '2026-08-08',
    }),
    `/cars/${VEHICLE_ID}?pickupDate=2026-08-01&returnDate=2026-08-08`,
  );
});

test('buildDraftBrowseHref routes vehicle draft to cars listing', () => {
  assert.equal(
    buildDraftBrowseHref({
      kind: 'vehicle',
      vehicleId: VEHICLE_ID,
      availabilitySlotId: VEHICLE_SLOT_ID,
      pickupDate: '2026-08-01',
      returnDate: '2026-08-08',
    }),
    '/cars',
  );
});

test('parseReservationDraft parses cabin from query params', () => {
  const draft = parseReservationDraft({
    kind: 'cabin',
    sailingId: SAILING_ID,
    cabinAvailabilityId: CABIN_AVAIL_STD,
    guests: '2',
  });

  assert.deepEqual(draft, {
    kind: 'cabin',
    sailingId: SAILING_ID,
    cabinAvailabilityId: CABIN_AVAIL_STD,
    guests: 2,
  });
});

test('parseReservationDraft rejects cabin when params incomplete', () => {
  assert.equal(
    parseReservationDraft({
      kind: 'cabin',
      sailingId: SAILING_ID,
      guests: '2',
    }),
    null,
  );
});

test('buildReservationQuery serializes cabin draft', () => {
  const query = buildReservationQuery({
    kind: 'cabin',
    sailingId: SAILING_ID,
    cabinAvailabilityId: CABIN_AVAIL_STD,
    guests: 2,
  });

  const params = new URLSearchParams(query);
  assert.equal(params.get('kind'), 'cabin');
  assert.equal(params.get('sailingId'), SAILING_ID);
  assert.equal(params.get('cabinAvailabilityId'), CABIN_AVAIL_STD);
  assert.equal(params.get('guests'), '2');
});

test('buildCheckoutItems maps cabin to booking payload with availability reference', () => {
  const items = buildCheckoutItems({
    kind: 'cabin',
    sailingId: SAILING_ID,
    cabinAvailabilityId: CABIN_AVAIL_STD,
    guests: 2,
  });

  assert.deepEqual(items, [
    {
      itemType: 'cabin',
      referenceId: CABIN_AVAIL_STD,
      quantity: 1,
    },
  ]);
});

test('buildDraftDetailHref links cabin draft back to cruise sailing detail', () => {
  assert.equal(
    buildDraftDetailHref({
      kind: 'cabin',
      sailingId: SAILING_ID,
      cabinAvailabilityId: CABIN_AVAIL_STD,
      guests: 2,
    }),
    `/cruises/${SAILING_ID}?guests=2&cabinId=${CABIN_AVAIL_STD}`,
  );
});

test('buildDraftBrowseHref routes cabin draft to cruises listing', () => {
  assert.equal(
    buildDraftBrowseHref({
      kind: 'cabin',
      sailingId: SAILING_ID,
      cabinAvailabilityId: CABIN_AVAIL_STD,
      guests: 2,
    }),
    '/cruises',
  );
});

test('isCabinOfferBookable requires stock and guest capacity', () => {
  assert.equal(isCabinOfferBookable({ availableCount: 8, maxGuests: 2 }, 2), true);
  assert.equal(isCabinOfferBookable({ availableCount: 0, maxGuests: 4 }, 2), false);
  assert.equal(isCabinOfferBookable({ availableCount: 5, maxGuests: 1 }, 2), false);
  assert.equal(isCabinOfferBookable(null, 2), false);
});
