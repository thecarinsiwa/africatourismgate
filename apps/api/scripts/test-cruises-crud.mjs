/**
 * Cruises catalog CRUD: lines, ports, ships, itineraries, sailings, cabins, availability.
 * Run: pnpm --filter @africatourismgate/api test:cruises
 */
import { randomUUID } from 'node:crypto';
import { loadEnv } from './lib/load-env.mjs';
import { SEED_ADMIN_EMAIL, getSeedAdminPassword } from './lib/test-credentials.mjs';

loadEnv();

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api').replace(
  /\/$/,
  '',
);

const SEED_CRUISE_LINE_ID = '00000000-0000-4000-8000-000000003010';
const SEED_PORT_KIN = '00000000-0000-4000-8000-000000003011';
const SEED_PORT_BNW = '00000000-0000-4000-8000-000000003012';

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
  const shipName = `Test Ship ${suffix}`;
  let shipId;
  let itineraryId;
  let sailingId;
  let cabinId;
  let availabilityId;
  let itineraryPortId;

  console.log('1. POST /ships');
  const createShip = await request('POST', '/ships', {
    token,
    body: {
      cruiseLineId: SEED_CRUISE_LINE_ID,
      name: shipName,
      builtYear: 2020,
    },
  });
  assertStatus('POST /ships', createShip.status, 201);
  shipId = createShip.data?.id;
  if (!shipId) throw new Error('Create ship missing id');

  console.log('2. GET /ships?search=' + encodeURIComponent(shipName));
  const listShips = await request(
    'GET',
    `/ships?search=${encodeURIComponent(shipName)}`,
    { token },
  );
  assertStatus('GET /ships search', listShips.status, 200);
  if (!listShips.data?.data?.some((s) => s.name === shipName)) {
    throw new Error('Ship search did not return created ship');
  }

  console.log('3. POST /itineraries');
  const createItinerary = await request('POST', '/itineraries', {
    token,
    body: {
      shipId,
      name: `Itinéraire test ${suffix}`,
      durationNights: 5,
    },
  });
  assertStatus('POST /itineraries', createItinerary.status, 201);
  itineraryId = createItinerary.data?.id;

  console.log('4. POST /itinerary-ports');
  const createPortStop = await request('POST', '/itinerary-ports', {
    token,
    body: {
      itineraryId,
      portId: SEED_PORT_KIN,
      dayNumber: 1,
      arrivalTime: '08:00:00',
      departureTime: '18:00:00',
    },
  });
  assertStatus('POST /itinerary-ports', createPortStop.status, 201);
  itineraryPortId = createPortStop.data?.id;

  const createPortStop2 = await request('POST', '/itinerary-ports', {
    token,
    body: {
      itineraryId,
      portId: SEED_PORT_BNW,
      dayNumber: 3,
    },
  });
  assertStatus('POST /itinerary-ports day 3', createPortStop2.status, 201);

  console.log('5. GET /itinerary-ports?itineraryId=' + itineraryId);
  const listStops = await request(
    'GET',
    `/itinerary-ports?itineraryId=${itineraryId}&page=1&limit=50`,
    { token },
  );
  assertStatus('GET itinerary-ports filtered', listStops.status, 200);
  if ((listStops.data?.data?.length ?? 0) < 2) {
    throw new Error('Expected at least 2 itinerary ports');
  }

  console.log('6. POST /cabins');
  const createCabin = await request('POST', '/cabins', {
    token,
    body: {
      shipId,
      categoryName: 'Suite',
      maxGuests: 2,
      basePriceCents: 300000,
      currency: 'USD',
    },
  });
  assertStatus('POST /cabins', createCabin.status, 201);
  cabinId = createCabin.data?.id;

  console.log('7. POST /cruise-sailings');
  const departureDate = '2099-06-15';
  const createSailing = await request('POST', '/cruise-sailings', {
    token,
    body: { itineraryId, departureDate },
  });
  assertStatus('POST /cruise-sailings', createSailing.status, 201);
  sailingId = createSailing.data?.id;
  if (createSailing.data?.itineraryId !== itineraryId) {
    throw new Error('Sailing missing itinerary link');
  }

  console.log('8. POST /cabin-availability');
  const createAvail = await request('POST', '/cabin-availability', {
    token,
    body: {
      cabinId,
      sailingId,
      availableCount: 4,
      priceCents: 295000,
    },
  });
  assertStatus('POST /cabin-availability', createAvail.status, 201);
  availabilityId = createAvail.data?.id;

  console.log('9. POST duplicate cabin+sailing (409)');
  const dup = await request('POST', '/cabin-availability', {
    token,
    body: {
      cabinId,
      sailingId,
      availableCount: 2,
      priceCents: 280000,
    },
  });
  assertStatus('POST duplicate availability', dup.status, 409);

  console.log('10. GET /cabin-availability?sailingId=' + sailingId);
  const listAvail = await request(
    'GET',
    `/cabin-availability?sailingId=${sailingId}&page=1&limit=50`,
    { token },
  );
  assertStatus('GET cabin-availability filtered', listAvail.status, 200);
  const row = listAvail.data?.data?.find((r) => r.cabinId === cabinId);
  if (!row || row.availableCount !== 4) {
    throw new Error('Bookable cabin not found on sailing');
  }

  console.log('11. Cleanup');
  assertStatus(
    'DELETE availability',
    (await request('DELETE', `/cabin-availability/${availabilityId}`, { token })).status,
    200,
  );
  assertStatus(
    'DELETE sailing',
    (await request('DELETE', `/cruise-sailings/${sailingId}`, { token })).status,
    200,
  );
  assertStatus(
    'DELETE cabin',
    (await request('DELETE', `/cabins/${cabinId}`, { token })).status,
    200,
  );
  assertStatus(
    'DELETE itinerary port',
    (await request('DELETE', `/itinerary-ports/${itineraryPortId}`, { token })).status,
    200,
  );
  assertStatus(
    'DELETE itinerary port 2',
    (await request('DELETE', `/itinerary-ports/${createPortStop2.data.id}`, { token }))
      .status,
    200,
  );
  assertStatus(
    'DELETE itinerary',
    (await request('DELETE', `/itineraries/${itineraryId}`, { token })).status,
    200,
  );
  assertStatus(
    'DELETE ship',
    (await request('DELETE', `/ships/${shipId}`, { token })).status,
    200,
  );

  console.log('\nAll cruises catalog checks passed.');
}

main().catch((err) => {
  console.error('\nCruises CRUD test failed:', err.message);
  process.exit(1);
});
