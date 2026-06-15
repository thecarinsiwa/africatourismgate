/**
 * Public packages list + detail (no auth).
 * Run: pnpm --filter @africatourismgate/api test:public-packages
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
const ACTIVITY_DEMO_GOMBE_TOUR = '00000000-0000-4000-8000-000000004031';

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

  console.log('1. Setup active package (admin)');
  const createPkg = await request('POST', '/packages', {
    token,
    body: {
      name: `Public Pkg ${suffix}`,
      description: 'Forfait test API publique',
      discountPercent: 15,
      active: true,
    },
  });
  assertStatus('POST /packages', createPkg.status, 201);
  const packageId = createPkg.data?.id;
  if (!packageId) throw new Error('Package missing id');

  const itemProperty = await request('POST', '/package-items', {
    token,
    body: {
      packageId,
      itemType: 'property',
      itemId: SEED_PROPERTY_ID,
    },
  });
  assertStatus('POST /package-items property', itemProperty.status, 201);

  const itemActivity = await request('POST', '/package-items', {
    token,
    body: {
      packageId,
      itemType: 'activity',
      itemId: ACTIVITY_DEMO_GOMBE_TOUR,
    },
  });
  assertStatus('POST /package-items activity', itemActivity.status, 201);

  console.log('2. GET /public/packages (no auth)');
  const list = await request('GET', '/public/packages');
  assertStatus('public packages list', list.status, 200);
  if (!list.data?.data?.length) {
    throw new Error('Expected at least one active package in public list');
  }
  const listed = list.data.data.find((p) => p.id === packageId);
  if (!listed) {
    throw new Error('Created package not found in public list');
  }
  if (listed.itemCount !== 2) {
    throw new Error(`Expected itemCount 2, got ${listed.itemCount}`);
  }
  if (listed.pricing?.discountPercent !== 15) {
    throw new Error(`Expected discountPercent 15, got ${listed.pricing?.discountPercent}`);
  }
  if (listed.pricing?.totalCents >= listed.pricing?.subtotalCents) {
    throw new Error('Expected totalCents < subtotalCents when discount applies');
  }
  console.log(
    `  OK package "${listed.name}" — ${listed.itemCount} items, total ${listed.pricing.totalCents} cents`,
  );

  console.log('3. GET /public/packages/:id (no auth)');
  const detail = await request('GET', `/public/packages/${packageId}`);
  assertStatus('public package detail', detail.status, 200);
  if (detail.data?.items?.length !== 2) {
    throw new Error(`Expected 2 items in detail, got ${detail.data?.items?.length}`);
  }
  if (detail.data?.pricing?.discountAmountCents <= 0) {
    throw new Error('Expected positive discountAmountCents');
  }
  console.log(`  OK detail with ${detail.data.items.length} enriched item(s)`);

  console.log('4. GET /public/packages/:id inactive package → 404');
  const inactive = await request('PATCH', `/packages/${packageId}`, {
    token,
    body: { active: false },
  });
  assertStatus('PATCH deactivate package', inactive.status, 200);
  const hidden = await request('GET', `/public/packages/${packageId}`);
  assertStatus('inactive package hidden', hidden.status, 404);

  console.log('5. Cleanup');
  await request('DELETE', `/packages/${packageId}`, { token });

  console.log('\nAll public packages checks passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
