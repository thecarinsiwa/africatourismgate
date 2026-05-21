/**
 * Promo codes & promotions in checkout-preview (requires API :3000).
 * Run: pnpm --filter @africatourismgate/api test:promo
 */
import { randomUUID } from 'node:crypto';
import { loadEnv } from './lib/load-env.mjs';
import { SEED_ADMIN_EMAIL, getSeedAdminPassword } from './lib/test-credentials.mjs';

loadEnv();

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api').replace(
  /\/$/,
  '',
);
const SEED_ROOM_ID = '00000000-0000-4000-8000-000000002011';
const TEST_DATE = '2099-12-01';

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

const checkoutBase = {
  currency: 'USD',
  items: [
    {
      itemType: 'room',
      referenceId: SEED_ROOM_ID,
      startDate: TEST_DATE,
      endDate: TEST_DATE,
      quantity: 1,
    },
  ],
};

async function main() {
  console.log(`API: ${API_URL}\n`);
  const token = await login(SEED_ADMIN_EMAIL, getSeedAdminPassword());
  const suffix = randomUUID().slice(0, 8).toUpperCase();
  const promoCode = `T${suffix}`.slice(0, 12);
  let promoId;
  let promotionId;

  console.log('0. Room availability');
  const existing = await request(
    'GET',
    `/room-availability?roomId=${SEED_ROOM_ID}&dateFrom=${TEST_DATE}&dateTo=${TEST_DATE}`,
    { token },
  );
  if (existing.status === 200) {
    const row = existing.data?.data?.find((r) => r.date?.startsWith(TEST_DATE));
    if (!row) {
      const create = await request('POST', '/room-availability', {
        token,
        body: {
          roomId: SEED_ROOM_ID,
          date: TEST_DATE,
          availableUnits: 5,
          priceCents: 10000,
        },
      });
      assertStatus('POST room-availability', create.status, 201);
    }
  }

  console.log('1. POST /promo-codes (20 % off)');
  const createPromo = await request('POST', '/promo-codes', {
    token,
    body: {
      code: promoCode,
      discountType: 'percent',
      discountValue: '20',
      validFrom: '2020-01-01',
      validUntil: '2099-12-31',
      maxRedemptions: 100,
      redemptionCount: 0,
      active: 1,
    },
  });
  assertStatus('POST promo-codes', createPromo.status, 201);
  promoId = createPromo.data?.id;

  console.log('2. POST checkout-preview with valid promo (20 % of 10000 = 8000)');
  const previewOk = await request('POST', '/bookings/checkout-preview', {
    token,
    body: { ...checkoutBase, promoCode },
  });
  assertStatus('POST preview valid promo', previewOk.status, 200);
  if (previewOk.data?.subtotalCents !== 10000) {
    throw new Error(`Expected subtotal 10000, got ${previewOk.data?.subtotalCents}`);
  }
  if (previewOk.data?.discountCents !== 2000) {
    throw new Error(`Expected discount 2000, got ${previewOk.data?.discountCents}`);
  }
  if (previewOk.data?.totalCents !== 8000) {
    throw new Error(`Expected total 8000, got ${previewOk.data?.totalCents}`);
  }
  if (previewOk.data?.appliedDiscount?.label?.toUpperCase() !== promoCode) {
    throw new Error('appliedDiscount label mismatch');
  }

  console.log('3. POST checkout-preview invalid code (expect 400)');
  const previewBad = await request('POST', '/bookings/checkout-preview', {
    token,
    body: { ...checkoutBase, promoCode: 'INVALID_CODE_XYZ' },
  });
  assertStatus('POST preview invalid promo', previewBad.status, 400);

  console.log('4. POST /promotions (fixed 15 USD off)');
  const createPromotion = await request('POST', '/promotions', {
    token,
    body: {
      name: `Promo Test ${suffix}`,
      description: 'Integration promotion',
      discountType: 'fixed_amount',
      discountValue: '15',
      validFrom: '2020-01-01',
      validUntil: '2099-12-31',
      maxRedemptions: 50,
      redemptionCount: 0,
      active: 1,
    },
  });
  assertStatus('POST promotions', createPromotion.status, 201);
  promotionId = createPromotion.data?.id;

  console.log('5. POST checkout-preview with promotionId (10000 - 1500 = 8500)');
  const previewPromo = await request('POST', '/bookings/checkout-preview', {
    token,
    body: { ...checkoutBase, promotionId },
  });
  assertStatus('POST preview promotion', previewPromo.status, 200);
  if (previewPromo.data?.discountCents !== 1500) {
    throw new Error(`Expected discount 1500, got ${previewPromo.data?.discountCents}`);
  }
  if (previewPromo.data?.totalCents !== 8500) {
    throw new Error(`Expected total 8500, got ${previewPromo.data?.totalCents}`);
  }

  console.log('6. POST /bookings with promo — total stored discounted');
  const booking = await request('POST', '/bookings', {
    token,
    body: { ...checkoutBase, promoCode },
  });
  assertStatus('POST booking with promo', booking.status, 201);
  if (booking.data?.booking?.totalCents !== 8000) {
    throw new Error(`Booking total expected 8000, got ${booking.data?.booking?.totalCents}`);
  }
  if (booking.data?.booking?.promoCodeId !== promoId) {
    throw new Error('Booking missing promoCodeId');
  }

  console.log('7. Expired promo code (expect 400)');
  const expiredCode = `EXP${suffix}`.slice(0, 12);
  await request('POST', '/promo-codes', {
    token,
    body: {
      code: expiredCode,
      discountType: 'percent',
      discountValue: '10',
      validFrom: '2020-01-01',
      validUntil: '2020-12-31',
      active: 1,
      redemptionCount: 0,
    },
  });
  const previewExpired = await request('POST', '/bookings/checkout-preview', {
    token,
    body: { ...checkoutBase, promoCode: expiredCode },
  });
  assertStatus('POST preview expired promo', previewExpired.status, 400);

  console.log('\nAll promo checkout checks passed.');
}

main().catch((err) => {
  console.error('\nPromo checkout test failed:', err.message);
  process.exit(1);
});
