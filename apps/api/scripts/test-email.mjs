/**
 * Email notifications: forgot-password, welcome (register), booking confirmation.
 *
 * Prérequis:
 * - API sur :3000 (pnpm dev:api)
 * - Mailpit SMTP :1025 (https://github.com/axllent/mailpit) OU EMAIL_TRANSPORT=ethereal
 * - DB seedée ; SEED_ADMIN_PASSWORD pour l’étape booking
 *
 * Run: pnpm --filter @africatourismgate/api test:email
 */
import { loadEnv } from './lib/load-env.mjs';
import {
  SEED_ADMIN_EMAIL,
  ephemeralTestPassword,
  getSeedAdminPassword,
} from './lib/test-credentials.mjs';

loadEnv();

const API_PORT = process.env.API_PORT ?? '3010';
const API_PREFIX = process.env.API_GLOBAL_PREFIX ?? 'api';
const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? `http://localhost:${API_PORT}/${API_PREFIX}`
).replace(/\/$/, '');
const SEED_ROOM_ID = '00000000-0000-4000-8000-000000002011';
const TEST_DATE = '2099-12-02';

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

function assertStatus(label, actual, expected) {
  if (actual !== expected) {
    throw new Error(`${label}: expected HTTP ${expected}, got ${actual}`);
  }
  console.log(`  OK ${label} → ${actual}`);
}

async function main() {
  console.log(`API: ${API_URL}`);
  console.log(
    `SMTP: ${process.env.SMTP_HOST ?? 'localhost'}:${process.env.SMTP_PORT ?? '1025'} (transport=${process.env.EMAIL_TRANSPORT ?? 'mailpit'})\n`,
  );

  console.log('1. Forgot password → reset email');
  const forgot = await request('POST', '/auth/forgot-password', {
    body: { email: SEED_ADMIN_EMAIL },
  });
  assertStatus('POST /auth/forgot-password', forgot.status, 200);

  console.log('2. Register → welcome email');
  const email = `welcome.${Date.now()}@africatourismgate.local`;
  const password = ephemeralTestPassword();
  const reg = await request('POST', '/auth/register', {
    body: {
      email,
      password,
      firstName: 'Email',
      lastName: 'Test',
    },
  });
  assertStatus('POST /auth/register', reg.status, 201);

  console.log('3. Booking cash payment → confirmation email');
  const token = (
    await request('POST', '/auth/login', {
      body: { email: SEED_ADMIN_EMAIL, password: getSeedAdminPassword() },
    })
  ).data?.accessToken;
  if (!token) {
    throw new Error('Admin login failed — set SEED_ADMIN_PASSWORD');
  }

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

  const preview = await request('POST', '/bookings/checkout-preview', {
    token,
    body: {
      currency: 'USD',
      items: [
        {
          itemType: 'room',
          referenceId: SEED_ROOM_ID,
          quantity: 1,
          startDate: TEST_DATE,
          endDate: TEST_DATE,
        },
      ],
    },
  });
  assertStatus('POST checkout-preview', preview.status, 201);

  const booking = await request('POST', '/bookings', {
    token,
    body: {
      currency: 'USD',
      items: [
        {
          itemType: 'room',
          referenceId: SEED_ROOM_ID,
          quantity: 1,
          startDate: TEST_DATE,
          endDate: TEST_DATE,
        },
      ],
    },
  });
  assertStatus('POST /bookings', booking.status, 201);
  const bookingId = booking.data?.booking?.id;
  if (!bookingId) throw new Error('Missing booking id');

  const cash = await request('POST', `/bookings/${bookingId}/cash-payment`, {
    token,
    body: {},
  });
  assertStatus('POST cash-payment', cash.status, 201);

  console.log('\nDone. Vérifiez les e-mails :');
  console.log('  • Mailpit UI : http://localhost:8025');
  console.log('  • Ethereal   : URL preview dans les logs API si EMAIL_TRANSPORT=ethereal');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
