/**
 * Flights catalog CRUD: airlines, airports, flights, classes, availability.
 * Run: pnpm --filter @africatourismgate/api test:flights
 */
import { randomUUID } from 'node:crypto';
import { loadEnv } from './lib/load-env.mjs';
import { SEED_ADMIN_EMAIL, getSeedAdminPassword } from './lib/test-credentials.mjs';

loadEnv();

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api').replace(
  /\/$/,
  '',
);

const SEED_AIRLINE_ID = '00000000-0000-4000-8000-000000003001';
const SEED_AIRPORT_FIH = '00000000-0000-4000-8000-000000003002';
const SEED_AIRPORT_NBO = '00000000-0000-4000-8000-000000003006';

async function request(method, path, { token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  return { status: res.status, data };
}

async function login(email, password) {
  const { status, data } = await request('POST', '/auth/login', {
    body: { email, password },
  });
  if (status !== 200 || !data?.accessToken) {
    throw new Error(`Login failed: ${status} ${JSON.stringify(data)}`);
  }
  return data.accessToken;
}

function assertStatus(label, actual, expected) {
  if (actual !== expected) {
    throw new Error(`${label}: expected HTTP ${expected}, got ${actual}`);
  }
  console.log(`  OK ${label} → ${actual}`);
}

async function main() {
  console.log(`API: ${API_URL}\n`);
  const token = await login(SEED_ADMIN_EMAIL, getSeedAdminPassword());
  const suffix = randomUUID().slice(0, 8);
  const flightNumber = `T${suffix}`.toUpperCase();
  let flightId;
  let classId;
  let availabilityId;

  console.log('1. POST /flights');
  const createFlight = await request('POST', '/flights', {
    token,
    body: {
      airlineId: SEED_AIRLINE_ID,
      flightNumber,
      departureAirportId: SEED_AIRPORT_FIH,
      arrivalAirportId: SEED_AIRPORT_NBO,
      departureTime: '2026-08-01T08:00:00.000Z',
      arrivalTime: '2026-08-01T14:30:00.000Z',
      durationMinutes: 390,
    },
  });
  assertStatus('POST /flights', createFlight.status, 201);
  flightId = createFlight.data?.id;
  if (!flightId) throw new Error('Create flight missing id');

  console.log('2. GET /flights?search=' + flightNumber);
  const listFlights = await request(
    'GET',
    `/flights?search=${encodeURIComponent(flightNumber)}`,
    { token },
  );
  assertStatus('GET /flights search', listFlights.status, 200);
  if (!listFlights.data?.data?.some((f) => f.flightNumber === flightNumber)) {
    throw new Error('Search did not return created flight');
  }

  console.log('3. POST /flight-classes');
  const createClass = await request('POST', '/flight-classes', {
    token,
    body: {
      flightId,
      className: 'economy',
      basePriceCents: 12000,
      seatsTotal: 80,
    },
  });
  assertStatus('POST /flight-classes', createClass.status, 201);
  classId = createClass.data?.id;
  if (!classId) throw new Error('Create class missing id');

  console.log('4. GET /flight-classes?flightId=' + flightId);
  const listClasses = await request(
    'GET',
    `/flight-classes?flightId=${flightId}`,
    { token },
  );
  assertStatus('GET /flight-classes filtered', listClasses.status, 200);
  if (!listClasses.data?.data?.some((c) => c.id === classId)) {
    throw new Error('Class list filter failed');
  }

  const testDate = '2099-07-10';
  const bulkFrom = '2099-07-11';
  const bulkTo = '2099-07-13';

  console.log('5. POST /flight-class-availability');
  const createAvail = await request('POST', '/flight-class-availability', {
    token,
    body: {
      flightClassId: classId,
      date: testDate,
      availableSeats: 15,
      priceCents: 12500,
    },
  });
  assertStatus('POST /flight-class-availability', createAvail.status, 201);
  availabilityId = createAvail.data?.id;

  console.log('6. POST duplicate class+date (409)');
  const dup = await request('POST', '/flight-class-availability', {
    token,
    body: {
      flightClassId: classId,
      date: testDate,
      availableSeats: 10,
      priceCents: 12000,
    },
  });
  assertStatus('POST duplicate availability', dup.status, 409);

  console.log('7. PUT /flight-class-availability/bulk');
  const bulk = await request('PUT', '/flight-class-availability/bulk', {
    token,
    body: {
      flightClassId: classId,
      dateFrom: bulkFrom,
      dateTo: bulkTo,
      availableSeats: 20,
      priceCents: 13000,
    },
  });
  assertStatus('PUT bulk', bulk.status, 200);
  if (bulk.data?.upsertedCount !== 3) {
    throw new Error(`Expected upsertedCount 3, got ${bulk.data?.upsertedCount}`);
  }

  console.log('8. GET /flight-class-availability filtered');
  const listAvail = await request(
    'GET',
    `/flight-class-availability?flightClassId=${classId}&dateFrom=${bulkFrom}&dateTo=${bulkTo}&page=1&limit=100`,
    { token },
  );
  assertStatus('GET availability filtered', listAvail.status, 200);
  const dates = (listAvail.data?.data ?? []).map((r) => r.date?.slice(0, 10));
  for (const d of [bulkFrom, '2099-07-12', bulkTo]) {
    if (!dates.includes(d)) {
      throw new Error(`Missing date ${d} in list`);
    }
  }

  console.log('9. Cleanup availability, class, flight');
  assertStatus(
    'DELETE availability',
    (await request('DELETE', `/flight-class-availability/${availabilityId}`, { token }))
      .status,
    200,
  );
  assertStatus(
    'DELETE class',
    (await request('DELETE', `/flight-classes/${classId}`, { token })).status,
    200,
  );
  assertStatus(
    'DELETE flight',
    (await request('DELETE', `/flights/${flightId}`, { token })).status,
    200,
  );

  console.log('\nAll flights catalog checks passed.');
}

main().catch((err) => {
  console.error('\nFlights CRUD test failed:', err.message);
  process.exit(1);
});
