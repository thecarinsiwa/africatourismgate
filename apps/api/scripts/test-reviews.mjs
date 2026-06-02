/**
 * Reviews: post-stay booking review, public listing, property aggregates.
 * Run: pnpm --filter @africatourismgate/api test:reviews
 */
import { loadEnv } from './lib/load-env.mjs';
import { SEED_ADMIN_EMAIL, ephemeralTestPassword, getSeedAdminPassword } from './lib/test-credentials.mjs';

loadEnv();

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api').replace(
  /\/$/,
  '',
);
const SEED_ROOM_ID = '00000000-0000-4000-8000-000000002011';
const SEED_PROPERTY_ID = '00000000-0000-4000-8000-000000002010';
const PAST_START = '2026-05-01';
const PAST_END = '2026-05-02';
const FUTURE_DATE = '2099-09-15';

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

async function registerCustomer() {
  const email = `reviews.${Date.now()}@africatourismgate.local`;
  const password = ephemeralTestPassword();
  const reg = await request('POST', '/auth/register', {
    body: {
      email,
      password,
      firstName: 'Review',
      lastName: 'Guest',
    },
  });
  if (reg.status !== 201 || !reg.data?.accessToken) {
    throw new Error(`Register failed: ${reg.status} ${JSON.stringify(reg.data)}`);
  }
  return { token: reg.data.accessToken, email };
}

function assertStatus(label, actual, expected) {
  if (actual !== expected) {
    throw new Error(`${label}: expected HTTP ${expected}, got ${actual}`);
  }
  console.log(`  OK ${label} → ${actual}`);
}

async function ensureAvailability(token, date) {
  const existing = await request(
    'GET',
    `/room-availability?roomId=${SEED_ROOM_ID}&dateFrom=${date}&dateTo=${date}`,
    { token },
  );
  assertStatus(`GET room-availability ${date}`, existing.status, 200);
  const row = existing.data?.data?.find((r) => r.date?.startsWith(date));
  if (row) {
    if (row.availableUnits < 2) {
      const patch = await request('PATCH', `/room-availability/${row.id}`, {
        token,
        body: { availableUnits: 2 },
      });
      assertStatus('PATCH room-availability units', patch.status, 200);
    }
    return;
  }
  const create = await request('POST', '/room-availability', {
    token,
    body: {
      roomId: SEED_ROOM_ID,
      date,
      availableUnits: 2,
      priceCents: 9000,
    },
  });
  assertStatus(`POST room-availability ${date}`, create.status, 201);
}

async function createConfirmedBooking(token, startDate, endDate) {
  const checkoutBody = {
    currency: 'USD',
    items: [
      {
        itemType: 'room',
        referenceId: SEED_ROOM_ID,
        startDate,
        endDate,
        quantity: 1,
      },
    ],
  };
  const created = await request('POST', '/bookings', { token, body: checkoutBody });
  assertStatus('POST /bookings', created.status, 201);
  const bookingId = created.data?.booking?.id;
  if (!bookingId) throw new Error('Missing booking id');
  const confirm = await request('POST', `/bookings/${bookingId}/confirm`, { token });
  assertStatus('POST confirm', confirm.status, 201);
  if (confirm.data?.booking?.status !== 'confirmed') {
    throw new Error(`Expected confirmed, got ${confirm.data?.booking?.status}`);
  }
  return bookingId;
}

async function main() {
  console.log(`API: ${API_URL}\n`);

  const adminToken = await login(SEED_ADMIN_EMAIL, getSeedAdminPassword());
  const { token: customerToken, email } = await registerCustomer();
  console.log(`  Customer: ${email}\n`);

  console.log('0. Ensure room availability (past + future dates)');
  await ensureAvailability(adminToken, PAST_START);
  await ensureAvailability(adminToken, PAST_END);
  await ensureAvailability(adminToken, FUTURE_DATE);

  console.log('1. Create confirmed booking with past stay dates');
  const pastBookingId = await createConfirmedBooking(customerToken, PAST_START, PAST_END);

  console.log('2. GET /bookings/:id — canReview true, no review');
  const beforeReview = await request('GET', `/bookings/${pastBookingId}`, {
    token: customerToken,
  });
  assertStatus('GET booking detail', beforeReview.status, 200);
  if (beforeReview.data?.canReview !== true) {
    throw new Error(`Expected canReview true, got ${beforeReview.data?.canReview}`);
  }
  if (beforeReview.data?.review != null) {
    throw new Error('Expected no review before submit');
  }
  console.log('  OK canReview=true');

  console.log('3. POST /bookings/:id/reviews');
  const createReview = await request('POST', `/bookings/${pastBookingId}/reviews`, {
    token: customerToken,
    body: {
      rating: 5,
      title: 'Séjour parfait',
      body: 'Chambre confortable et accueil chaleureux.',
    },
  });
  assertStatus('POST review', createReview.status, 201);
  if (createReview.data?.rating !== 5) {
    throw new Error(`Expected rating 5, got ${createReview.data?.rating}`);
  }
  const reviewId = createReview.data?.id;
  if (!reviewId) throw new Error('Missing review id');

  console.log('4. Duplicate POST review → 409');
  const duplicate = await request('POST', `/bookings/${pastBookingId}/reviews`, {
    token: customerToken,
    body: { rating: 4, title: 'Again' },
  });
  assertStatus('POST duplicate review', duplicate.status, 409);

  console.log('5. GET /bookings/:id — review present, canReview false');
  const afterReview = await request('GET', `/bookings/${pastBookingId}`, {
    token: customerToken,
  });
  assertStatus('GET booking after review', afterReview.status, 200);
  if (afterReview.data?.canReview !== false) {
    throw new Error(`Expected canReview false, got ${afterReview.data?.canReview}`);
  }
  if (afterReview.data?.review?.id !== reviewId) {
    throw new Error('Expected review on booking detail');
  }

  console.log('6. GET /public/accommodations/:id — averageRating + reviewCount');
  const propertyDetail = await request(
    'GET',
    `/public/accommodations/${SEED_PROPERTY_ID}?guests=2`,
  );
  assertStatus('GET public property', propertyDetail.status, 200);
  if (propertyDetail.data?.reviewCount < 1) {
    throw new Error(`Expected reviewCount >= 1, got ${propertyDetail.data?.reviewCount}`);
  }
  if (propertyDetail.data?.averageRating == null) {
    throw new Error('Expected averageRating on property detail');
  }
  console.log(
    `  OK averageRating=${propertyDetail.data.averageRating}, reviewCount=${propertyDetail.data.reviewCount}`,
  );

  console.log('7. GET /public/accommodations/:id/reviews');
  const publicReviews = await request(
    'GET',
    `/public/accommodations/${SEED_PROPERTY_ID}/reviews?limit=10`,
  );
  assertStatus('GET public reviews', publicReviews.status, 200);
  const found = (publicReviews.data?.data ?? []).some((r) => r.id === reviewId);
  if (!found) {
    throw new Error('Submitted review not in public list');
  }
  console.log(`  OK ${publicReviews.data.data.length} review(s) listed`);

  console.log('8. Future stay — POST review → 400');
  const futureBookingId = await createConfirmedBooking(customerToken, FUTURE_DATE, FUTURE_DATE);
  const tooEarly = await request('POST', `/bookings/${futureBookingId}/reviews`, {
    token: customerToken,
    body: { rating: 3, body: 'Too early' },
  });
  assertStatus('POST review before stay ends', tooEarly.status, 400);

  console.log('\nAll reviews checks passed.');
}

main().catch((err) => {
  console.error('\nReviews test failed:', err.message);
  process.exit(1);
});
