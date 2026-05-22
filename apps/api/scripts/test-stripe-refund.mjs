/**
 * Stripe refunds: partial + full, webhook idempotence, booking cancelled prerequisite.
 *
 * Prérequis: API :3000, DB seedée, STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET (test mode)
 *
 * Run: pnpm --filter @africatourismgate/api test:stripe-refund
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
const TEST_DATE = '2099-11-20';

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

async function postSignedWebhook(stripe, eventType, object) {
  const webhookSecret = requireEnv('STRIPE_WEBHOOK_SECRET');
  const payload = JSON.stringify({
    id: `evt_test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    object: 'event',
    type: eventType,
    data: { object },
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
  console.log(`  OK POST /stripe/webhook (${eventType}) → 200`);
}

async function setupPaidBooking(token, stripe) {
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
          priceCents: 10000,
        },
      });
      assertStatus('POST room-availability', create.status, 201);
    }
  }

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
  const totalCents = created.data?.totalCents ?? 10000;
  if (!bookingId) throw new Error('Missing booking id');

  const piRes = await request('POST', `/bookings/${bookingId}/payment-intent`, { token });
  assertStatus('POST payment-intent', piRes.status, 201);
  const { paymentIntentId, paymentId, clientSecret } = piRes.data ?? {};
  if (!paymentIntentId || !clientSecret) {
    throw new Error('Missing paymentIntentId or clientSecret');
  }

  const confirmed = await stripe.paymentIntents.confirm(paymentIntentId, {
    payment_method: 'pm_card_visa',
    return_url: 'https://example.com/return',
  });
  if (confirmed.status !== 'succeeded') {
    throw new Error(`Expected PI succeeded, got ${confirmed.status}`);
  }

  await postSignedWebhook(stripe, 'payment_intent.succeeded', confirmed);

  const detail = await request('GET', `/bookings/${bookingId}`, { token });
  if (detail.data?.booking?.status !== 'confirmed') {
    throw new Error(`Booking not confirmed: ${detail.data?.booking?.status}`);
  }

  return { bookingId, paymentId, totalCents, paymentIntentId };
}

async function main() {
  const stripeSecret = requireEnv('STRIPE_SECRET_KEY');
  requireEnv('STRIPE_WEBHOOK_SECRET');
  const stripe = new Stripe(stripeSecret);

  console.log(`API: ${API_URL}`);
  console.log('Stripe refunds test\n');

  const token = await login(SEED_ADMIN_EMAIL, getSeedAdminPassword());

  console.log('1. Paid booking (confirmed)');
  const { bookingId, paymentId, totalCents } = await setupPaidBooking(token, stripe);
  const partialAmount = Math.floor(totalCents / 2);
  console.log(`  bookingId=${bookingId}, paymentId=${paymentId}, total=${totalCents}`);

  console.log('2. Guard: refund on confirmed booking (no cancel) → 400');
  const guard = await request('POST', `/payments/${paymentId}/refund`, { token });
  if (guard.status !== 400) {
    throw new Error(`Expected 400 for refund without cancel, got ${guard.status}`);
  }
  console.log('  OK refund blocked when booking not cancelled');

  console.log('3. POST /bookings/:id/cancel');
  const cancel = await request('POST', `/bookings/${bookingId}/cancel`, {
    token,
    body: { reason: 'Test refund flow' },
  });
  assertStatus('POST cancel', cancel.status, 201);
  if (cancel.data?.booking?.status !== 'cancelled') {
    throw new Error(`Expected cancelled, got ${cancel.data?.booking?.status}`);
  }

  console.log('4. Partial refund');
  const partial = await request('POST', `/payments/${paymentId}/refund`, {
    token,
    body: { amountCents: partialAmount },
  });
  assertStatus('POST partial refund', partial.status, 201);

  const refundPartial = await stripe.refunds.retrieve(partial.data.refundId);
  if (refundPartial.status === 'succeeded') {
    await postSignedWebhook(stripe, 'refund.updated', refundPartial);
  }

  let detail = await request('GET', `/bookings/${bookingId}`, { token });
  const payAfterPartial = (detail.data?.payments ?? []).find((p) => p.id === paymentId);
  if (payAfterPartial?.status !== 'succeeded') {
    throw new Error(`After partial refund payment should be succeeded, got ${payAfterPartial?.status}`);
  }
  if (detail.data?.booking?.status !== 'cancelled') {
    throw new Error(`After partial refund booking should stay cancelled`);
  }
  console.log('  OK partial: payment succeeded, booking cancelled');

  console.log('5. Full refund (remainder)');
  const full = await request('POST', `/payments/${paymentId}/refund`, { token });
  assertStatus('POST full refund', full.status, 201);

  const refundFull = await stripe.refunds.retrieve(full.data.refundId);
  if (refundFull.status === 'succeeded') {
    await postSignedWebhook(stripe, 'refund.updated', refundFull);
  }

  detail = await request('GET', `/bookings/${bookingId}`, { token });
  const payAfterFull = (detail.data?.payments ?? []).find((p) => p.id === paymentId);
  if (payAfterFull?.status !== 'refunded') {
    throw new Error(`After full refund payment should be refunded, got ${payAfterFull?.status}`);
  }
  if (detail.data?.booking?.status !== 'refunded') {
    throw new Error(`After full refund booking should be refunded, got ${detail.data?.booking?.status}`);
  }
  const refundedHistory = (detail.data?.statusHistory ?? []).filter(
    (h) => h.toStatus === 'refunded',
  );
  if (refundedHistory.length !== 1) {
    throw new Error(`Expected 1 refunded history entry, got ${refundedHistory.length}`);
  }
  console.log('  OK full refund: payment refunded, booking refunded');

  console.log('6. Webhook idempotence (replay refund.updated)');
  await postSignedWebhook(stripe, 'refund.updated', refundFull);
  detail = await request('GET', `/bookings/${bookingId}`, { token });
  const refundedHistoryAfter = (detail.data?.statusHistory ?? []).filter(
    (h) => h.toStatus === 'refunded',
  );
  if (refundedHistoryAfter.length !== 1) {
    throw new Error(
      `Idempotence failed: expected 1 refunded history, got ${refundedHistoryAfter.length}`,
    );
  }
  console.log('  OK webhook replay did not duplicate history');

  console.log('\nAll Stripe refund checks passed.');
}

main().catch((err) => {
  console.error('\nStripe refund test failed:', err.message);
  process.exit(1);
});
