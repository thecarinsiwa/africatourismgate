/**
 * OneKey loyalty: points credited after Stripe payment_intent.succeeded (idempotent).
 *
 * Prérequis:
 *   - API :3000, DB seedée (loyalty/onekey setting), SEED_ADMIN_PASSWORD
 *   - STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET (test mode)
 *
 * Run: pnpm --filter @africatourismgate/api test:loyalty
 */
import Stripe from 'stripe';
import { loadEnv } from './lib/load-env.mjs';
import { SEED_ADMIN_EMAIL, getSeedAdminPassword } from './lib/test-credentials.mjs';

loadEnv();

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api').replace(
  /\/$/,
  '',
);
const SEED_ADMIN_USER_ID = '00000000-0000-4000-8000-000000000010';
const SEED_ROOM_ID = '00000000-0000-4000-8000-000000002011';
const TEST_DATE = '2099-11-16';

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required (use Stripe test keys in .env.local).`);
  }
  return value;
}

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

function findOneKeyBalance(accounts, userId) {
  const row = (accounts ?? []).find(
    (a) => a.userId === userId && a.programCode === 'ONEKEY',
  );
  return row?.pointsBalance ?? 0;
}

async function postSignedWebhook(stripe, intent) {
  const webhookSecret = requireEnv('STRIPE_WEBHOOK_SECRET');
  const payload = JSON.stringify({
    id: `evt_test_${Date.now()}`,
    object: 'event',
    type: 'payment_intent.succeeded',
    data: { object: intent },
    created: Math.floor(Date.now() / 1000),
    livemode: false,
  });
  const signature = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: webhookSecret,
  });
  const res = await fetch(`${API_URL}/stripe/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': signature,
    },
    body: payload,
  });
  if (res.status !== 200) {
    const text = await res.text();
    throw new Error(`Webhook POST failed: ${res.status} ${text}`);
  }
  console.log('  OK POST /stripe/webhook (signed test event) → 200');
}

async function main() {
  const stripeSecret = requireEnv('STRIPE_SECRET_KEY');
  requireEnv('STRIPE_WEBHOOK_SECRET');
  const stripe = new Stripe(stripeSecret);

  console.log(`API: ${API_URL}`);
  console.log('OneKey loyalty + Stripe test mode\n');

  const token = await login(SEED_ADMIN_EMAIL, getSeedAdminPassword());

  console.log('0. Baseline GET /loyalty-accounts');
  const beforeList = await request('GET', '/loyalty-accounts?limit=50', { token });
  assertStatus('GET loyalty-accounts (before)', beforeList.status, 200);
  const balanceBefore = findOneKeyBalance(beforeList.data?.data, SEED_ADMIN_USER_ID);
  console.log(`  OK ONEKEY balance before=${balanceBefore}`);

  console.log('1. Ensure room availability');
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
          priceCents: 12500,
        },
      });
      assertStatus('POST room-availability', create.status, 201);
    }
  }

  console.log('2. POST /bookings');
  const created = await request('POST', '/bookings', {
    token,
    body: {
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
    },
  });
  assertStatus('POST /bookings', created.status, 201);
  const bookingId = created.data?.booking?.id;
  if (!bookingId) throw new Error('Missing booking id');

  console.log('3. POST /bookings/:id/payment-intent');
  const piRes = await request('POST', `/bookings/${bookingId}/payment-intent`, { token });
  assertStatus('POST payment-intent', piRes.status, 201);
  const { paymentIntentId, paymentId } = piRes.data ?? {};
  if (!paymentIntentId) throw new Error('Missing paymentIntentId');

  const confirmed = await stripe.paymentIntents.confirm(paymentIntentId, {
    payment_method: 'pm_card_visa',
    return_url: 'https://example.com/return',
  });
  if (confirmed.status !== 'succeeded') {
    throw new Error(`Expected PI succeeded, got ${confirmed.status}`);
  }
  console.log(`  OK Stripe PI status=${confirmed.status}`);

  console.log('4. Webhook payment_intent.succeeded (first time)');
  await postSignedWebhook(stripe, confirmed);

  const detail = await request('GET', `/bookings/${bookingId}`, { token });
  assertStatus('GET booking detail', detail.status, 200);
  const payment = (detail.data?.payments ?? []).find((p) => p.id === paymentId);
  if (!payment || payment.status !== 'succeeded') {
    throw new Error('Payment row not succeeded');
  }

  const expectedDelta =
    Math.floor(payment.amountCents / 100) * 1;
  if (expectedDelta < 1) {
    throw new Error(`Expected positive points delta, amountCents=${payment.amountCents}`);
  }

  console.log('5. GET /loyalty-accounts — balance updated');
  const afterList = await request('GET', '/loyalty-accounts?limit=50', { token });
  assertStatus('GET loyalty-accounts (after)', afterList.status, 200);
  const balanceAfter = findOneKeyBalance(afterList.data?.data, SEED_ADMIN_USER_ID);
  if (balanceAfter !== balanceBefore + expectedDelta) {
    throw new Error(
      `Expected ONEKEY balance ${balanceBefore + expectedDelta}, got ${balanceAfter} (delta ${expectedDelta}, payment ${payment.amountCents} cents)`,
    );
  }
  console.log(
    `  OK ONEKEY balance ${balanceBefore} → ${balanceAfter} (+${expectedDelta} pts)`,
  );

  console.log('6. Replay webhook — idempotent (no double credit)');
  await postSignedWebhook(stripe, confirmed);
  const afterReplay = await request('GET', '/loyalty-accounts?limit=50', { token });
  assertStatus('GET loyalty-accounts (after replay)', afterReplay.status, 200);
  const balanceReplay = findOneKeyBalance(afterReplay.data?.data, SEED_ADMIN_USER_ID);
  if (balanceReplay !== balanceAfter) {
    throw new Error(
      `Idempotence failed: balance after replay ${balanceReplay}, expected ${balanceAfter}`,
    );
  }
  console.log(`  OK balance unchanged after replay (${balanceReplay} pts)`);

  console.log('\nAll OneKey loyalty payment checks passed.');
}

main().catch((err) => {
  console.error('\nLoyalty payment test failed:', err.message);
  process.exit(1);
});
