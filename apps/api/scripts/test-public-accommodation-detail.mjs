/**
 * Public accommodation detail (no auth).
 * Run: pnpm --filter @africatourismgate/api test:public-accommodation-detail
 */
import { loadEnv } from './lib/load-env.mjs';

loadEnv();

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api').replace(
  /\/$/,
  '',
);

async function request(path) {
  const res = await fetch(`${API_URL}${path}`);
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

function daysInMonth(isoMonth) {
  const [y, m] = isoMonth.split('-').map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

async function main() {
  console.log(`API: ${API_URL}\n`);

  console.log('1. Search Kinshasa for property id');
  const search = await request(
    '/public/accommodations/search?destination=Kinshasa&guests=2',
  );
  assertStatus('search', search.status, 200);
  const first = search.data?.data?.[0];
  if (!first?.id) {
    throw new Error('Expected at least one property from search');
  }
  const id = first.id;
  console.log(`  property id: ${id}`);

  console.log('2. GET /public/accommodations/:id');
  const detail = await request(`/public/accommodations/${id}?guests=2`);
  assertStatus('detail', detail.status, 200);
  if (!Array.isArray(detail.data?.images) || detail.data.images.length < 1) {
    throw new Error('Expected images array');
  }
  if (!Array.isArray(detail.data?.amenities)) {
    throw new Error('Expected amenities array');
  }
  if (!Array.isArray(detail.data?.rooms) || detail.data.rooms.length < 1) {
    throw new Error('Expected at least one room');
  }
  const ar = detail.data.averageRating;
  if (ar !== null && typeof ar !== 'number') {
    throw new Error('Expected averageRating null or number');
  }
  if (typeof detail.data.reviewCount !== 'number') {
    throw new Error('Expected reviewCount number');
  }
  console.log(
    `  OK ${detail.data.name}: ${detail.data.images.length} images, ${detail.data.rooms.length} rooms, ${detail.data.reviewCount} reviews`,
  );

  console.log('3. GET detail with stay dates');
  const withDates = await request(
    `/public/accommodations/${id}?guests=2&checkIn=2026-06-01&checkOut=2026-06-05`,
  );
  assertStatus('detail with dates', withDates.status, 200);
  if (withDates.data.stay.nights < 1) {
    throw new Error(`Expected stay.nights > 0, got ${withDates.data.stay.nights}`);
  }
  const roomWithTotal = withDates.data.rooms.find((r) => r.totalPriceCents != null);
  if (!roomWithTotal) {
    throw new Error('Expected at least one room with totalPriceCents for dated stay');
  }
  console.log(
    `  OK ${withDates.data.stay.nights} nights, room total ${roomWithTotal.totalPriceCents} cents`,
  );

  console.log('4. GET detail with calendar month');
  const month = '2026-06';
  const withMonth = await request(
    `/public/accommodations/${id}?guests=2&month=${month}`,
  );
  assertStatus('detail with month', withMonth.status, 200);
  const expectedDays = daysInMonth(month);
  if (withMonth.data.calendarDays.length !== expectedDays) {
    throw new Error(
      `Expected ${expectedDays} calendar days, got ${withMonth.data.calendarDays.length}`,
    );
  }
  console.log(`  OK calendarDays.length = ${expectedDays}`);

  console.log('5. GET unknown id → 404');
  const missing = await request(
    '/public/accommodations/00000000-0000-4000-8000-000000000099',
  );
  assertStatus('detail 404', missing.status, 404);

  console.log('6. GET /public/accommodations/:id/reviews');
  const reviews = await request(`/public/accommodations/${id}/reviews?limit=5`);
  assertStatus('reviews', reviews.status, 200);
  if (!Array.isArray(reviews.data?.data)) {
    throw new Error('Expected reviews.data array');
  }
  console.log(`  OK ${reviews.data.data.length} review(s) on page 1`);

  console.log('\nAll public accommodation detail checks passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
