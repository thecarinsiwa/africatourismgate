/**
 * Package discount in checkout-preview (requires API :3000).
 * Run: pnpm --filter @africatourismgate/api test:booking-package-checkout
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
const ACTIVITY_DEMO_GOMBE_TOUR = '00000000-0000-4000-8000-000000004031';
const ACTIVITY_SCHEDULE_DEMO_MORNING = '00000000-0000-4000-8000-000000004033';
const TEST_DATE = '2026-07-20';
const PARTICIPANTS = 2;
const UNIT_PRICE_CENTS = 4500;

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
  let activityBId;
  let scheduleBId;

  console.log('1. Setup second activity for package');
  const provider = await request('POST', '/activity-providers', {
    token,
    body: {
      destinationId: SEED_DESTINATION_ID,
      name: `Pkg Checkout Provider ${suffix}`,
    },
  });
  assertStatus('POST /activity-providers', provider.status, 201);

  const activityB = await request('POST', '/activities', {
    token,
    body: {
      providerId: provider.data.id,
      title: `Pkg Checkout Activity B ${suffix}`,
      priceCents: UNIT_PRICE_CENTS,
      currency: 'USD',
    },
  });
  assertStatus('POST /activities B', activityB.status, 201);
  activityBId = activityB.data.id;

  const scheduleB = await request('POST', '/activity-schedules', {
    token,
    body: {
      activityId: activityBId,
      startDatetime: `${TEST_DATE}T14:00:00.000Z`,
      capacity: 12,
      bookedCount: 0,
    },
  });
  assertStatus('POST /activity-schedules B', scheduleB.status, 201);
  scheduleBId = scheduleB.data.id;

  console.log('2. Create package with 2 activities (-20 %)');
  const createPkg = await request('POST', '/packages', {
    token,
    body: {
      name: `Pkg Checkout ${suffix}`,
      discountPercent: 20,
      active: true,
    },
  });
  assertStatus('POST /packages', createPkg.status, 201);
  packageId = createPkg.data.id;

  for (const itemId of [ACTIVITY_DEMO_GOMBE_TOUR, activityBId]) {
    const item = await request('POST', '/package-items', {
      token,
      body: { packageId, itemType: 'activity', itemId },
    });
    assertStatus(`POST /package-items ${itemId}`, item.status, 201);
  }

  const checkoutItems = [
    {
      itemType: 'activity_schedule',
      referenceId: ACTIVITY_SCHEDULE_DEMO_MORNING,
      quantity: PARTICIPANTS,
    },
    {
      itemType: 'activity_schedule',
      referenceId: scheduleBId,
      quantity: PARTICIPANTS,
    },
  ];

  const subtotalCents = UNIT_PRICE_CENTS * PARTICIPANTS * 2;
  const expectedPackageDiscount = Math.round(subtotalCents * 0.2);
  const expectedTotal = subtotalCents - expectedPackageDiscount;

  console.log('3. POST /bookings/checkout-preview with packageId');
  const preview = await request('POST', '/bookings/checkout-preview', {
    token,
    body: {
      currency: 'USD',
      packageId,
      items: checkoutItems,
    },
  });
  assertStatus('checkout-preview package', preview.status, 200);
  if (preview.data.subtotalCents !== subtotalCents) {
    throw new Error(
      `Expected subtotal ${subtotalCents}, got ${preview.data.subtotalCents}`,
    );
  }
  if (preview.data.packageDiscountCents !== expectedPackageDiscount) {
    throw new Error(
      `Expected package discount ${expectedPackageDiscount}, got ${preview.data.packageDiscountCents}`,
    );
  }
  if (preview.data.totalCents !== expectedTotal) {
    throw new Error(`Expected total ${expectedTotal}, got ${preview.data.totalCents}`);
  }
  if (preview.data.appliedPackageDiscount?.packageId !== packageId) {
    throw new Error('Missing appliedPackageDiscount.packageId');
  }
  console.log(
    `  OK subtotal ${preview.data.subtotalCents}, package -${preview.data.packageDiscountCents}, total ${preview.data.totalCents}`,
  );

  console.log('4. POST checkout-preview mismatched items (expect 400)');
  const mismatch = await request('POST', '/bookings/checkout-preview', {
    token,
    body: {
      currency: 'USD',
      packageId,
      items: [checkoutItems[0]],
    },
  });
  assertStatus('mismatch items', mismatch.status, 400);

  console.log('5. Cleanup');
  await request('DELETE', `/packages/${packageId}`, { token });
  await request('DELETE', `/activity-schedules/${scheduleBId}`, { token });
  await request('DELETE', `/activities/${activityBId}`, { token });
  await request('DELETE', `/activity-providers/${provider.data.id}`, { token });

  console.log('\nAll package checkout checks passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
