/**
 * Rooms + amenities + property-amenities sync (requires API :3000 and seeded DB).
 * Run: pnpm --filter @africatourismgate/api test:rooms-amenities
 */
import { randomUUID } from 'node:crypto';
import { loadEnv } from './lib/load-env.mjs';
import { SEED_ADMIN_EMAIL, getSeedAdminPassword } from './lib/test-credentials.mjs';

loadEnv();

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api').replace(
  /\/$/,
  '',
);
const SEED_PROPERTY_ID = '00000000-0000-4000-8000-000000002010';

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
  const amenityCode = `test_amenity_${suffix}`;
  let amenityId;
  let roomId;

  console.log('1. POST /amenities');
  const createAmenity = await request('POST', '/amenities', {
    token,
    body: { code: amenityCode, name: `Test Amenity ${suffix}` },
  });
  assertStatus('POST /amenities', createAmenity.status, 201);
  amenityId = createAmenity.data?.id;
  if (!amenityId) throw new Error('Create amenity missing id');

  console.log('2. POST duplicate amenity code (409)');
  const dupAmenity = await request('POST', '/amenities', {
    token,
    body: { code: amenityCode, name: `Dup ${suffix}` },
  });
  assertStatus('POST duplicate amenity code', dupAmenity.status, 409);

  console.log('3. PUT /property-amenities/sync');
  const sync = await request('PUT', '/property-amenities/sync', {
    token,
    body: { propertyId: SEED_PROPERTY_ID, amenityIds: [amenityId] },
  });
  assertStatus('PUT /property-amenities/sync', sync.status, 200);
  if (!sync.data?.amenityIds?.includes(amenityId)) {
    throw new Error('Sync did not return linked amenity');
  }

  console.log('4. GET /property-amenities?propertyId=' + SEED_PROPERTY_ID);
  const links = await request(
    'GET',
    `/property-amenities?propertyId=${SEED_PROPERTY_ID}`,
    { token },
  );
  assertStatus('GET /property-amenities filtered', links.status, 200);
  if (!links.data?.data?.some((l) => l.amenityId === amenityId)) {
    throw new Error('Property amenities filter failed');
  }

  console.log('5. POST /rooms');
  const createRoom = await request('POST', '/rooms', {
    token,
    body: {
      propertyId: SEED_PROPERTY_ID,
      name: `Test Room ${suffix}`,
      roomType: 'standard',
      maxGuests: 2,
      bedConfig: '1 double',
      basePriceCents: 9900,
      currency: 'USD',
    },
  });
  assertStatus('POST /rooms', createRoom.status, 201);
  roomId = createRoom.data?.id;
  if (!roomId) throw new Error('Create room missing id');

  console.log('6. GET /rooms?propertyId=' + SEED_PROPERTY_ID);
  const rooms = await request('GET', `/rooms?propertyId=${SEED_PROPERTY_ID}`, { token });
  assertStatus('GET /rooms filtered', rooms.status, 200);
  if (!rooms.data?.data?.some((r) => r.id === roomId)) {
    throw new Error('Rooms filter failed');
  }

  console.log('7. PUT sync clear amenities');
  const syncClear = await request('PUT', '/property-amenities/sync', {
    token,
    body: { propertyId: SEED_PROPERTY_ID, amenityIds: [] },
  });
  assertStatus('PUT sync clear', syncClear.status, 200);

  console.log('8. DELETE /rooms/:id');
  assertStatus(
    'DELETE /rooms/:id',
    (await request('DELETE', `/rooms/${roomId}`, { token })).status,
    200,
  );

  console.log('9. DELETE /amenities/:id');
  assertStatus(
    'DELETE /amenities/:id',
    (await request('DELETE', `/amenities/${amenityId}`, { token })).status,
    200,
  );

  console.log('\nAll rooms + amenities checks passed.');
}

main().catch((err) => {
  console.error('\nRooms/amenities test failed:', err.message);
  process.exit(1);
});
