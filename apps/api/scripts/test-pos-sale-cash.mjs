/**
 * POS cash sale: create booking + POST cash-payment → confirmed.
 *
 * Prérequis: API :3000, DB seedée, SEED_ADMIN_PASSWORD
 * Run: pnpm --filter @africatourismgate/api test:pos-sale-cash
 */
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

async function main() {
  console.log(`API: ${API_URL}\n`);

  const token = await login(SEED_ADMIN_EMAIL, getSeedAdminPassword());

  console.log('0. Ensure room availability');
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
          availableUnits: 2,
          priceCents: 9000,
        },
      });
      assertStatus('POST room-availability', create.status, 201);
    }
  }

  const checkoutItem = {
    itemType: 'room',
    referenceId: SEED_ROOM_ID,
    startDate: TEST_DATE,
    endDate: TEST_DATE,
    quantity: 1,
  };

  console.log('1. POST /bookings/checkout-preview');
  const previewRes = await request('POST', '/bookings/checkout-preview', {
    token,
    body: { items: [checkoutItem], currency: 'USD' },
  });
  if (previewRes.status !== 201) {
    throw new Error(
      `checkout-preview: expected HTTP 201, got ${previewRes.status} ${JSON.stringify(previewRes.data)}`,
    );
  }
  console.log(`  OK checkout-preview → ${previewRes.status}`);
  if (!previewRes.data?.totalCents) {
    throw new Error('Preview missing totalCents');
  }

  console.log('2. POST /bookings');
  const created = await request('POST', '/bookings', {
    token,
    body: { currency: 'USD', items: [checkoutItem] },
  });
  assertStatus('POST /bookings', created.status, 201);
  const bookingId = created.data?.booking?.id;
  if (!bookingId) throw new Error('Missing booking id');
  if (created.data?.booking?.status !== 'pending_payment') {
    throw new Error(`Expected pending_payment, got ${created.data?.booking?.status}`);
  }

  console.log('3. POST /bookings/:id/cash-payment');
  const paid = await request('POST', `/bookings/${bookingId}/cash-payment`, {
    token,
    body: { note: 'Test caisse POS' },
  });
  assertStatus('POST cash-payment', paid.status, 201);
  if (paid.data?.booking?.status !== 'confirmed') {
    throw new Error(`Expected confirmed, got ${paid.data?.booking?.status}`);
  }

  console.log('4. GET /bookings/:id — payment row');
  const detail = await request('GET', `/bookings/${bookingId}`, { token });
  assertStatus('GET booking detail', detail.status, 200);
  const cashPayment = (detail.data?.payments ?? []).find((p) => p.provider === 'cash');
  if (!cashPayment || cashPayment.status !== 'succeeded') {
    throw new Error('Cash payment row missing or not succeeded');
  }

  console.log('\nPOS cash sale API checks passed.');
}

main().catch((err) => {
  console.error('\nPOS cash test failed:', err.message);
  process.exit(1);
});
