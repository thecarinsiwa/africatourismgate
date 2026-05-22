/**
 * Vehicle rental catalog: agencies, categories, vehicles, availability.
 * Run: pnpm --filter @africatourismgate/api test:vehicles
 */
import { randomUUID } from 'node:crypto';
import { loadEnv } from './lib/load-env.mjs';
import { SEED_ADMIN_EMAIL, getSeedAdminPassword } from './lib/test-credentials.mjs';

loadEnv();

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api').replace(
  /\/$/,
  '',
);

const SEED_DESTINATION_ID = '00000000-0000-4000-8000-000000002001';
const SEED_CATEGORY_ID = '00000000-0000-4000-8000-000000004010';

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
  let agencyId;
  let vehicleId;
  let availabilityId;

  console.log('1. POST /rental-agencies');
  const createAgency = await request('POST', '/rental-agencies', {
    token,
    body: {
      name: `Test Agency ${suffix}`,
      destinationId: SEED_DESTINATION_ID,
      address: '1 Test Street',
    },
  });
  assertStatus('POST /rental-agencies', createAgency.status, 201);
  agencyId = createAgency.data?.id;
  if (!agencyId) throw new Error('Create agency missing id');

  console.log('2. GET /rental-agencies?search=' + suffix);
  const listAgencies = await request(
    'GET',
    `/rental-agencies?search=${encodeURIComponent(suffix)}`,
    { token },
  );
  assertStatus('GET /rental-agencies search', listAgencies.status, 200);
  if (!listAgencies.data?.data?.some((a) => a.id === agencyId)) {
    throw new Error('Agency search did not return created agency');
  }

  console.log('3. POST /vehicles');
  const plate = `T${suffix}`.toUpperCase();
  const createVehicle = await request('POST', '/vehicles', {
    token,
    body: {
      agencyId,
      categoryId: SEED_CATEGORY_ID,
      licensePlate: plate,
      dailyPriceCents: 5500,
      currency: 'USD',
    },
  });
  assertStatus('POST /vehicles', createVehicle.status, 201);
  vehicleId = createVehicle.data?.id;
  if (!vehicleId) throw new Error('Create vehicle missing id');

  console.log('4. GET /vehicles?agencyId=' + agencyId);
  const listVehicles = await request('GET', `/vehicles?agencyId=${agencyId}`, { token });
  assertStatus('GET /vehicles filtered', listVehicles.status, 200);
  if (!listVehicles.data?.data?.some((v) => v.id === vehicleId)) {
    throw new Error('Vehicle list filter by agency failed');
  }

  console.log('5. GET /vehicles?search=' + plate);
  const searchVehicles = await request(
    'GET',
    `/vehicles?search=${encodeURIComponent(plate)}`,
    { token },
  );
  assertStatus('GET /vehicles search plate', searchVehicles.status, 200);
  if (!searchVehicles.data?.data?.some((v) => v.licensePlate === plate)) {
    throw new Error('Vehicle search by plate failed');
  }

  console.log('6. POST /vehicle-availability');
  const createAvail = await request('POST', '/vehicle-availability', {
    token,
    body: {
      vehicleId,
      startDatetime: '2099-08-01T08:00:00.000Z',
      endDatetime: '2099-08-10T18:00:00.000Z',
      status: 'available',
    },
  });
  assertStatus('POST /vehicle-availability', createAvail.status, 201);
  availabilityId = createAvail.data?.id;

  console.log('7. POST invalid range (400)');
  const badRange = await request('POST', '/vehicle-availability', {
    token,
    body: {
      vehicleId,
      startDatetime: '2099-09-10T12:00:00.000Z',
      endDatetime: '2099-09-01T12:00:00.000Z',
      status: 'available',
    },
  });
  assertStatus('POST invalid date range', badRange.status, 400);

  console.log('8. GET /vehicle-availability filtered');
  const listAvail = await request(
    'GET',
    `/vehicle-availability?vehicleId=${vehicleId}&startFrom=2099-08-01T00:00:00.000Z&endTo=2099-08-31T23:59:59.000Z&page=1&limit=50`,
    { token },
  );
  assertStatus('GET /vehicle-availability filtered', listAvail.status, 200);
  if (!listAvail.data?.data?.some((s) => s.id === availabilityId)) {
    throw new Error('Availability filter did not return created slot');
  }

  console.log('9. PATCH /vehicle-availability/:id');
  const patchAvail = await request('PATCH', `/vehicle-availability/${availabilityId}`, {
    token,
    body: { status: 'maintenance' },
  });
  assertStatus('PATCH availability', patchAvail.status, 200);
  if (patchAvail.data?.status !== 'maintenance') {
    throw new Error('PATCH did not update status');
  }

  console.log('10. Cleanup');
  assertStatus(
    'DELETE availability',
    (await request('DELETE', `/vehicle-availability/${availabilityId}`, { token })).status,
    200,
  );
  assertStatus(
    'DELETE vehicle',
    (await request('DELETE', `/vehicles/${vehicleId}`, { token })).status,
    200,
  );
  assertStatus(
    'DELETE agency',
    (await request('DELETE', `/rental-agencies/${agencyId}`, { token })).status,
    200,
  );

  console.log('\nAll vehicle rental catalog checks passed.');
}

main().catch((err) => {
  console.error('\nVehicles CRUD test failed:', err.message);
  process.exit(1);
});
