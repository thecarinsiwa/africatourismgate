/**
 * Properties + property-images CRUD + image upload (requires API :3000 and seeded DB).
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
const TEST_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
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

async function uploadPropertyImage(token, propertyId, buffer, filename, mimeType) {
  const form = new FormData();
  form.append('file', new Blob([buffer], { type: mimeType }), filename);
  const res = await fetch(`${API_URL}/properties/${propertyId}/upload-image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
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

async function fetchUrl(url) {
  const res = await fetch(url);
  return { status: res.status };
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
  let uploadedUrl;

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

  console.log('4. POST /properties/:id/upload-image');
  const upload = await uploadPropertyImage(
    token,
    propertyId,
    TEST_PNG,
    'test-property.png',
    'image/png',
  );
  assertStatus('POST /properties/:id/upload-image', upload.status, 201);
  uploadedUrl = upload.data?.url;
  if (!uploadedUrl || !uploadedUrl.includes('/uploads/properties/')) {
    throw new Error(`Upload missing or invalid url: ${JSON.stringify(upload.data)}`);
  }
  console.log(`  uploaded url: ${uploadedUrl}`);

  console.log('5. GET uploaded file');
  assertStatus('GET uploaded file', (await fetchUrl(uploadedUrl)).status, 200);

  console.log('6. POST /property-images (uploaded url)');
  const img = await request('POST', '/property-images', {
    token,
    body: {
      propertyId,
      url: uploadedUrl,
      caption: 'Test uploaded image',
      sortOrder: 1,
    },
  });
  assertStatus('POST /property-images', img.status, 201);
  imageId = img.data?.id;
  if (!imageId) throw new Error('Create image missing id');

  console.log('7. GET /public/accommodations/:id');
  const publicDetail = await request('GET', `/public/accommodations/${propertyId}?guests=2`);
  assertStatus('GET /public/accommodations/:id', publicDetail.status, 200);
  if (
    !publicDetail.data?.images?.some(
      (image) => image.url === uploadedUrl || image.url?.includes('/uploads/properties/'),
    )
  ) {
    throw new Error('Public detail did not include uploaded image');
  }

  console.log('8. GET /property-images?propertyId=' + propertyId);
  const imgs = await request('GET', `/property-images?propertyId=${propertyId}`, { token });
  assertStatus('GET /property-images filtered', imgs.status, 200);
  if (!imgs.data?.data?.some((i) => i.id === imageId)) {
    throw new Error('Image list filter failed');
  }

  console.log('9. PATCH /properties/:id');
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

  console.log('10. DELETE /property-images/:id');
  assertStatus(
    'DELETE /property-images/:id',
    (await request('DELETE', `/property-images/${imageId}`, { token })).status,
    200,
  );

  console.log('11. DELETE /properties/:id');
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
