/**
 * Booking admin detail: enriched GET, status history, cancel with reason (engine #27).
 * Run: pnpm --filter @africatourismgate/api test:bookings-detail
 * Requires migration: database/migrations/add_booking_status_history.sql
 */
import { loadEnv } from './lib/load-env.mjs';
import { SEED_ADMIN_EMAIL, getSeedAdminPassword } from './lib/test-credentials.mjs';

loadEnv();

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api').replace(
  /\/$/,
  '',
);
const SEED_ROOM_ID = '00000000-0000-4000-8000-000000002011';
const TEST_DATE = '2099-10-01';

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
    } else if (row.availableUnits < 1) {
      await request('PATCH', `/room-availability/${row.id}`, {
        token,
        body: { availableUnits: 2 },
      });
    }
  }

  const checkoutBody = {
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

  console.log('1. POST /bookings');
  const created = await request('POST', '/bookings', { token, body: checkoutBody });
  assertStatus('POST /bookings', created.status, 201);
  const bookingId = created.data?.booking?.id;
  if (!bookingId) throw new Error('Missing booking id');

  console.log('2. GET /bookings/:id (admin detail)');
  const detail = await request('GET', `/bookings/${bookingId}`, { token });
  assertStatus('GET detail', detail.status, 200);
  if (!detail.data?.client?.email) {
    throw new Error('Detail missing client.email');
  }
  if (!Array.isArray(detail.data?.items) || detail.data.items.length < 1) {
    throw new Error('Detail missing items');
  }
  if (!Array.isArray(detail.data?.statusHistory)) {
    throw new Error('Detail missing statusHistory');
  }
  if (detail.data.statusHistory.length < 1) {
    throw new Error('Expected at least one status history entry');
  }
  if (detail.data.statusHistory[0].toStatus !== 'pending_payment') {
    throw new Error('First history should be pending_payment');
  }
  console.log(`  OK client=${detail.data.client.email}, history=${detail.data.statusHistory.length}`);

  console.log('3. PATCH /bookings/:id/status → confirmed');
  const confirm = await request('PATCH', `/bookings/${bookingId}/status`, {
    token,
    body: { status: 'confirmed', reason: 'Test confirmation admin' },
  });
  assertStatus('PATCH status confirmed', confirm.status, 200);
  if (confirm.data?.booking?.status !== 'confirmed') {
    throw new Error(`Expected confirmed, got ${confirm.data?.booking?.status}`);
  }

  console.log('4. GET detail — history includes confirmation');
  const afterConfirm = await request('GET', `/bookings/${bookingId}`, { token });
  const history = afterConfirm.data?.statusHistory ?? [];
  const hasConfirmed = history.some((h) => h.toStatus === 'confirmed');
  if (!hasConfirmed) {
    throw new Error('History missing confirmed transition');
  }

  console.log('5. POST /bookings/:id/cancel with reason');
  const cancel = await request('POST', `/bookings/${bookingId}/cancel`, {
    token,
    body: { reason: 'Test annulation client — intégration' },
  });
  assertStatus('POST cancel', cancel.status, 201);
  if (cancel.data?.booking?.status !== 'cancelled') {
    throw new Error(`Expected cancelled, got ${cancel.data?.booking?.status}`);
  }

  console.log('6. GET detail — cancel reason in history');
  const afterCancel = await request('GET', `/bookings/${bookingId}`, { token });
  const cancelEntry = (afterCancel.data?.statusHistory ?? []).find(
    (h) => h.toStatus === 'cancelled',
  );
  if (!cancelEntry) {
    throw new Error('History missing cancelled entry');
  }
  if (!cancelEntry.reason?.includes('annulation')) {
    throw new Error(`Cancel reason not stored: ${cancelEntry.reason}`);
  }
  console.log(`  OK cancel reason="${cancelEntry.reason}"`);

  console.log('\nAll booking detail checks passed.');
}

main().catch((err) => {
  console.error('\nBooking detail test failed:', err.message);
  process.exit(1);
});
