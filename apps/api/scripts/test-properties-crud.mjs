/**
 * Properties + property-images CRUD (requires API :3000 and seeded DB).
 * Run: pnpm --filter @africatourismgate/api test:properties
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
  const slug = `test-prop-${suffix}`;
  let propertyId;
  let imageId;

  console.log('1. POST /properties');
  const create = await request('POST', '/properties', {
    token,
    body: {
      destinationId: SEED_DESTINATION_ID,
      name: `Test Property ${suffix}`,
      slug,
      propertyType: 'hotel',
      starRating: 4,
      description: 'Integration test property',
      addressLine: '1 Test Street',
    },
  });
  assertStatus('POST /properties', create.status, 201);
  propertyId = create.data?.id;
  if (!propertyId) throw new Error('Create property missing id');

  console.log('2. POST duplicate slug (409)');
  const dup = await request('POST', '/properties', {
    token,
    body: {
      destinationId: SEED_DESTINATION_ID,
      name: `Dup ${suffix}`,
      slug,
      propertyType: 'hotel',
    },
  });
  assertStatus('POST duplicate slug', dup.status, 409);

  console.log('3. GET /properties?destinationId=' + SEED_DESTINATION_ID);
  const list = await request(
    'GET',
    `/properties?destinationId=${SEED_DESTINATION_ID}&search=${encodeURIComponent(slug)}`,
    { token },
  );
  assertStatus('GET /properties filtered', list.status, 200);
  if (!list.data?.data?.some((p) => p.slug === slug)) {
    throw new Error('Filter/search did not return created property');
  }

  console.log('4. POST /property-images');
  const img = await request('POST', '/property-images', {
    token,
    body: {
      propertyId,
      url: 'https://example.com/test-hotel.jpg',
      caption: 'Test image',
      sortOrder: 1,
    },
  });
  assertStatus('POST /property-images', img.status, 201);
  imageId = img.data?.id;
  if (!imageId) throw new Error('Create image missing id');

  console.log('5. GET /property-images?propertyId=' + propertyId);
  const imgs = await request('GET', `/property-images?propertyId=${propertyId}`, { token });
  assertStatus('GET /property-images filtered', imgs.status, 200);
  if (!imgs.data?.data?.some((i) => i.id === imageId)) {
    throw new Error('Image list filter failed');
  }

  console.log('6. PATCH /properties/:id');
  assertStatus(
    'PATCH /properties/:id',
    (
      await request('PATCH', `/properties/${propertyId}`, {
        token,
        body: { name: `Test Property Updated ${suffix}` },
      })
    ).status,
    200,
  );

  console.log('7. DELETE /property-images/:id');
  assertStatus(
    'DELETE /property-images/:id',
    (await request('DELETE', `/property-images/${imageId}`, { token })).status,
    200,
  );

  console.log('8. DELETE /properties/:id');
  assertStatus(
    'DELETE /properties/:id',
    (await request('DELETE', `/properties/${propertyId}`, { token })).status,
    200,
  );

  console.log('\nAll properties CRUD checks passed.');
}

main().catch((err) => {
  console.error('\nProperties CRUD test failed:', err.message);
  process.exit(1);
});
