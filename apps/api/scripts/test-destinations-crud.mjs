/**
 * Destinations + POI CRUD integration checks (requires API on :3000 and seeded DB).
 * Run: pnpm --filter @africatourismgate/api test:destinations
 */
import { randomUUID } from 'node:crypto';
import { loadEnv } from './lib/load-env.mjs';
import { SEED_ADMIN_EMAIL, getSeedAdminPassword } from './lib/test-credentials.mjs';

loadEnv();

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api').replace(
  /\/$/,
  '',
);

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
  const slug = `test-dest-${suffix}`;
  let destinationId;
  let poiId;

  console.log('1. POST /destinations (create)');
  const create = await request('POST', '/destinations', {
    token,
    body: {
      name: `Test Destination ${suffix}`,
      slug,
      countryCode: 'CD',
      description: 'Integration test destination',
    },
  });
  assertStatus('POST /destinations', create.status, 201);
  destinationId = create.data?.id;
  if (!destinationId) throw new Error('Create destination missing id');

  console.log('2. POST duplicate slug (expect 409)');
  const dup = await request('POST', '/destinations', {
    token,
    body: {
      name: `Duplicate ${suffix}`,
      slug,
      countryCode: 'CD',
    },
  });
  assertStatus('POST duplicate slug', dup.status, 409);

  console.log('3. GET /destinations?search=' + slug);
  const list = await request('GET', `/destinations?search=${encodeURIComponent(slug)}`, {
    token,
  });
  assertStatus('GET /destinations search', list.status, 200);
  const found = list.data?.data?.some((d) => d.slug === slug);
  if (!found) throw new Error('Search did not return created destination');
  if (!list.data?.meta?.totalPages) throw new Error('List missing pagination meta');

  console.log('4. POST /points-of-interest (with lat/lng)');
  const createPoi = await request('POST', '/points-of-interest', {
    token,
    body: {
      destinationId,
      name: `Test POI ${suffix}`,
      latitude: -4.321,
      longitude: 15.3123,
    },
  });
  assertStatus('POST /points-of-interest', createPoi.status, 201);
  poiId = createPoi.data?.id;
  if (!poiId) throw new Error('Create POI missing id');
  if (createPoi.data?.latitude == null || createPoi.data?.longitude == null) {
    throw new Error('POI response missing latitude/longitude');
  }

  console.log('5. GET /points-of-interest?destinationId=' + destinationId);
  const poiList = await request(
    'GET',
    `/points-of-interest?destinationId=${destinationId}`,
    { token },
  );
  assertStatus('GET /points-of-interest filtered', poiList.status, 200);
  const poiFound = poiList.data?.data?.some((p) => p.id === poiId);
  if (!poiFound) throw new Error('POI list filter did not return created POI');

  console.log('6. PATCH /destinations/:id');
  const updatedSlug = `${slug}-updated`;
  const patch = await request('PATCH', `/destinations/${destinationId}`, {
    token,
    body: { name: `Test Destination Updated ${suffix}`, slug: updatedSlug },
  });
  assertStatus('PATCH /destinations/:id', patch.status, 200);

  console.log('7. DELETE /points-of-interest/:id');
  assertStatus(
    'DELETE /points-of-interest/:id',
    (await request('DELETE', `/points-of-interest/${poiId}`, { token })).status,
    200,
  );

  console.log('8. DELETE /destinations/:id (soft delete)');
  assertStatus(
    'DELETE /destinations/:id',
    (await request('DELETE', `/destinations/${destinationId}`, { token })).status,
    200,
  );

  console.log('\nAll destinations + POI CRUD checks passed.');
}

main().catch((err) => {
  console.error('\nDestinations CRUD test failed:', err.message);
  process.exit(1);
});
