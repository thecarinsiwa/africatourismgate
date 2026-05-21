/**
 * Stripe PaymentIntent + webhook → booking confirmed (test mode).
 *
 * Prérequis:
 *   - API :3000, DB seedée, SEED_ADMIN_PASSWORD
 *   - STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET dans .env ou .env.local (test mode)
 *   - Migration booking_status_history appliquée
 *
 * Run: pnpm --filter @africatourismgate/api test:stripe
 *
 * Stripe CLI (écouter les webhooks en local):
 *   stripe listen --forward-to localhost:3000/api/stripe/webhook
 *   → copier le whsec_… dans STRIPE_WEBHOOK_SECRET
 *
 * Ce script confirme le PaymentIntent via l’API Stripe puis envoie un webhook signé
 * (sans obliger stripe listen si STRIPE_WEBHOOK_SECRET est défini).
 */
import Stripe from 'stripe';
import { loadEnv } from './lib/load-env.mjs';
import { SEED_ADMIN_EMAIL, getSeedAdminPassword } from './lib/test-credentials.mjs';

loadEnv();

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api').replace(
  /\/$/,
  '',
);
const SEED_ROOM_ID = '00000000-0000-4000-8000-000000002011';
const TEST_DATE = '2099-11-15';

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
  console.log('Stripe: test mode\n');

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

  console.log('1. POST /bookings');
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

  console.log('2. POST /bookings/:id/payment-intent');
  const piRes = await request('POST', `/bookings/${bookingId}/payment-intent`, { token });
  assertStatus('POST payment-intent', piRes.status, 201);
  const { paymentIntentId, paymentId, clientSecret } = piRes.data ?? {};
  if (!paymentIntentId || !clientSecret) {
    throw new Error('Missing paymentIntentId or clientSecret');
  }
  console.log(`  OK paymentId=${paymentId}, pi=${paymentIntentId}`);

  console.log('3. Confirm PaymentIntent (Stripe test card)');
  const confirmed = await stripe.paymentIntents.confirm(paymentIntentId, {
    payment_method: 'pm_card_visa',
    return_url: 'https://example.com/return',
  });
  if (confirmed.status !== 'succeeded') {
    throw new Error(`Expected PI succeeded, got ${confirmed.status}`);
  }
  console.log(`  OK Stripe PI status=${confirmed.status}`);

  console.log('4. Webhook payment_intent.succeeded');
  await postSignedWebhook(stripe, confirmed);

  console.log('5. GET /bookings/:id — expect confirmed + payment succeeded');
  const detail = await request('GET', `/bookings/${bookingId}`, { token });
  assertStatus('GET booking detail', detail.status, 200);
  if (detail.data?.booking?.status !== 'confirmed') {
    throw new Error(`Booking not confirmed: ${detail.data?.booking?.status}`);
  }
  const payment = (detail.data?.payments ?? []).find((p) => p.id === paymentId);
  if (!payment || payment.status !== 'succeeded') {
    throw new Error('Payment row not succeeded');
  }
  const hasConfirmedHistory = (detail.data?.statusHistory ?? []).some(
    (h) => h.toStatus === 'confirmed',
  );
  if (!hasConfirmedHistory) {
    throw new Error('Status history missing confirmed transition');
  }
  console.log('  OK booking confirmed, payment succeeded, history updated');

  console.log('\nAll Stripe payment checks passed.');
  console.log('\nStripe CLI (optional live forwarding):');
  console.log('  stripe listen --forward-to localhost:3000/api/stripe/webhook');
}

main().catch((err) => {
  console.error('\nStripe payment test failed:', err.message);
  process.exit(1);
});
