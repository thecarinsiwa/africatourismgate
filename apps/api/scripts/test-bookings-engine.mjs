/**
 * Booking engine: checkout-preview, create, confirm, cancel (requires API :3000, seeded DB).
 * Run: pnpm --filter @africatourismgate/api test:bookings
 */
import { loadEnv } from './lib/load-env.mjs';
import { SEED_ADMIN_EMAIL, getSeedAdminPassword } from './lib/test-credentials.mjs';

loadEnv();

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api').replace(
  /\/$/,
  '',
);
const SEED_ROOM_ID = '00000000-0000-4000-8000-000000002011';
const TEST_DATE = '2099-07-01';

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

const checkoutBody = {
  items: [
    {
      itemType: 'room',
      referenceId: SEED_ROOM_ID,
      startDate: TEST_DATE,
      endDate: TEST_DATE,
      quantity: 1,
    },
  ],
  currency: 'USD',
};

async function main() {
  console.log(`API: ${API_URL}\n`);
  const token = await login(SEED_ADMIN_EMAIL, getSeedAdminPassword());
  let availabilityId;
  let bookingId;
  let initialUnits;

  console.log('0. Ensure room availability for test date');
  const existing = await request(
    'GET',
    `/room-availability?roomId=${SEED_ROOM_ID}&dateFrom=${TEST_DATE}&dateTo=${TEST_DATE}`,
    { token },
  );
  assertStatus('GET room-availability', existing.status, 200);
  const row = existing.data?.data?.find((r) => r.date?.startsWith(TEST_DATE));
  if (row) {
    availabilityId = row.id;
    initialUnits = row.availableUnits;
    if (initialUnits < 2) {
      const patch = await request('PATCH', `/room-availability/${availabilityId}`, {
        token,
        body: { availableUnits: 2 },
      });
      assertStatus('PATCH room-availability units', patch.status, 200);
      initialUnits = 2;
    }
  } else {
    const create = await request('POST', '/room-availability', {
      token,
      body: {
        roomId: SEED_ROOM_ID,
        date: TEST_DATE,
        availableUnits: 2,
        priceCents: 9000,
      },
    });
    assertStatus('POST /room-availability', create.status, 201);
    availabilityId = create.data?.id;
    initialUnits = 2;
  }

  console.log('1. POST /bookings/checkout-preview');
  const preview = await request('POST', '/bookings/checkout-preview', {
    token,
    body: checkoutBody,
  });
  assertStatus('POST checkout-preview', preview.status, 200);
  if (preview.data?.subtotalCents !== 9000 || preview.data?.totalCents !== 9000) {
    throw new Error(
      `Expected subtotal/total 9000, got subtotal=${preview.data?.subtotalCents} total=${preview.data?.totalCents}`,
    );
  }

  console.log('2. POST /bookings (create)');
  const createBooking = await request('POST', '/bookings', {
    token,
    body: checkoutBody,
  });
  assertStatus('POST /bookings', createBooking.status, 201);
  bookingId = createBooking.data?.booking?.id;
  if (!bookingId) throw new Error('Booking missing id');
  if (createBooking.data?.booking?.status !== 'pending_payment') {
    throw new Error(`Expected pending_payment, got ${createBooking.data?.booking?.status}`);
  }

  const itemsSum = (createBooking.data?.items ?? []).reduce(
    (s, i) => s + i.quantity * i.unitPriceCents,
    0,
  );
  if (createBooking.data?.booking?.totalCents !== itemsSum) {
    throw new Error(
      `totalCents ${createBooking.data.booking.totalCents} !== items sum ${itemsSum}`,
    );
  }

  console.log('3. Verify stock decremented');
  const afterBook = await request(
    'GET',
    `/room-availability?roomId=${SEED_ROOM_ID}&dateFrom=${TEST_DATE}&dateTo=${TEST_DATE}`,
    { token },
  );
  const afterRow = afterBook.data?.data?.find((r) => r.id === availabilityId);
  if (!afterRow || afterRow.availableUnits !== initialUnits - 1) {
    throw new Error(
      `Stock not decremented: expected ${initialUnits - 1}, got ${afterRow?.availableUnits}`,
    );
  }
  console.log(`  OK stock ${initialUnits} → ${afterRow.availableUnits}`);

  console.log('4. POST checkout-preview qty > stock (expect 400)');
  const over = await request('POST', '/bookings/checkout-preview', {
    token,
    body: {
      items: [
        {
          itemType: 'room',
          referenceId: SEED_ROOM_ID,
          startDate: TEST_DATE,
          endDate: TEST_DATE,
          quantity: 99,
        },
      ],
      currency: 'USD',
    },
  });
  assertStatus('POST preview overbook', over.status, 400);

  console.log('5. POST /bookings/:id/confirm');
  const confirm = await request('POST', `/bookings/${bookingId}/confirm`, { token });
  assertStatus('POST confirm', confirm.status, 201);
  if (confirm.data?.booking?.status !== 'confirmed') {
    throw new Error(`Expected confirmed, got ${confirm.data?.booking?.status}`);
  }

  console.log('6. POST /bookings/:id/cancel');
  const cancel = await request('POST', `/bookings/${bookingId}/cancel`, { token });
  assertStatus('POST cancel', cancel.status, 201);
  if (cancel.data?.booking?.status !== 'cancelled') {
    throw new Error(`Expected cancelled, got ${cancel.data?.booking?.status}`);
  }

  console.log('7. Verify stock restored');
  const afterCancel = await request(
    'GET',
    `/room-availability?roomId=${SEED_ROOM_ID}&dateFrom=${TEST_DATE}&dateTo=${TEST_DATE}`,
    { token },
  );
  const restored = afterCancel.data?.data?.find((r) => r.id === availabilityId);
  if (!restored || restored.availableUnits !== initialUnits) {
    throw new Error(
      `Stock not restored: expected ${initialUnits}, got ${restored?.availableUnits}`,
    );
  }
  console.log(`  OK stock restored to ${restored.availableUnits}`);

  console.log('\nAll booking engine checks passed.');
}

main().catch((err) => {
  console.error('\nBooking engine test failed:', err.message);
  process.exit(1);
});
