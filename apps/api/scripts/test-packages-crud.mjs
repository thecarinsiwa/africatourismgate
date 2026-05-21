/**
 * Packages + package-items CRUD (requires API on :3000 and seeded DB).
 * Run: pnpm --filter @africatourismgate/api test:packages
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
  let packageId;
  let activityId;
  let itemPropertyId;
  let itemActivityId;

  console.log('1. Setup activity for package item');
  const provider = await request('POST', '/activity-providers', {
    token,
    body: {
      destinationId: SEED_DESTINATION_ID,
      name: `Pkg Provider ${suffix}`,
    },
  });
  assertStatus('POST /activity-providers', provider.status, 201);
  const activity = await request('POST', '/activities', {
    token,
    body: {
      providerId: provider.data.id,
      title: `Pkg Activity ${suffix}`,
      priceCents: 5000,
      currency: 'USD',
    },
  });
  assertStatus('POST /activities', activity.status, 201);
  activityId = activity.data?.id;
  if (!activityId) throw new Error('Activity missing id');

  console.log('2. POST /packages');
  const createPkg = await request('POST', '/packages', {
    token,
    body: {
      name: `Test Package ${suffix}`,
      description: 'Integration test package',
      discountPercent: 10,
      active: true,
    },
  });
  assertStatus('POST /packages', createPkg.status, 201);
  packageId = createPkg.data?.id;
  if (!packageId) throw new Error('Package missing id');

  console.log('3. POST /package-items (property + activity)');
  const item1 = await request('POST', '/package-items', {
    token,
    body: {
      packageId,
      itemType: 'property',
      itemId: SEED_PROPERTY_ID,
    },
  });
  assertStatus('POST /package-items property', item1.status, 201);
  itemPropertyId = item1.data?.id;

  const item2 = await request('POST', '/package-items', {
    token,
    body: {
      packageId,
      itemType: 'activity',
      itemId: activityId,
    },
  });
  assertStatus('POST /package-items activity', item2.status, 201);
  itemActivityId = item2.data?.id;

  console.log('4. POST duplicate item (expect 409)');
  const dup = await request('POST', '/package-items', {
    token,
    body: {
      packageId,
      itemType: 'property',
      itemId: SEED_PROPERTY_ID,
    },
  });
  assertStatus('POST duplicate package-item', dup.status, 409);

  console.log('5. GET /package-items?packageId=' + packageId);
  const itemList = await request('GET', `/package-items?packageId=${packageId}`, {
    token,
  });
  assertStatus('GET /package-items', itemList.status, 200);
  if ((itemList.data?.data?.length ?? 0) < 2) {
    throw new Error('Expected at least 2 package items');
  }

  console.log('6. GET /packages/:id (pricing)');
  const detail = await request('GET', `/packages/${packageId}`, { token });
  assertStatus('GET /packages/:id', detail.status, 200);
  const { pricing, items } = detail.data ?? {};
  if (!items || items.length < 2) throw new Error('Detail missing items');
  if (!pricing) throw new Error('Detail missing pricing');

  const subtotal = items.reduce((s, i) => s + i.unitPriceCents, 0);
  if (pricing.subtotalCents !== subtotal) {
    throw new Error(
      `subtotal mismatch: expected ${subtotal}, got ${pricing.subtotalCents}`,
    );
  }
  const expectedDiscount = Math.round((subtotal * 10) / 100);
  if (pricing.discountAmountCents !== expectedDiscount) {
    throw new Error(
      `discount mismatch: expected ${expectedDiscount}, got ${pricing.discountAmountCents}`,
    );
  }
  if (pricing.totalCents !== subtotal - expectedDiscount) {
    throw new Error(
      `total mismatch: expected ${subtotal - expectedDiscount}, got ${pricing.totalCents}`,
    );
  }
  console.log(
    `  OK pricing subtotal=${pricing.subtotalCents} discount=${pricing.discountAmountCents} total=${pricing.totalCents} ${pricing.currency}`,
  );

  console.log('7. PATCH /packages/:id');
  const patch = await request('PATCH', `/packages/${packageId}`, {
    token,
    body: { name: `Test Package Updated ${suffix}`, discountPercent: 5 },
  });
  assertStatus('PATCH /packages/:id', patch.status, 200);

  console.log('8. DELETE package-items and package');
  assertStatus(
    'DELETE property item',
    (await request('DELETE', `/package-items/${itemPropertyId}`, { token })).status,
    200,
  );
  assertStatus(
    'DELETE activity item',
    (await request('DELETE', `/package-items/${itemActivityId}`, { token })).status,
    200,
  );
  assertStatus(
    'DELETE package',
    (await request('DELETE', `/packages/${packageId}`, { token })).status,
    200,
  );

  console.log('9. Cleanup activity provider');
  await request('DELETE', `/activities/${activityId}`, { token });
  await request('DELETE', `/activity-providers/${provider.data.id}`, { token });

  console.log('\nAll packages CRUD checks passed.');
}

main().catch((err) => {
  console.error('\nPackages CRUD test failed:', err.message);
  process.exit(1);
});
