/**
 * Public flight search (no auth).
 * Run: pnpm --filter @africatourismgate/api test:public-flight-search
 */
import { loadEnv } from './lib/load-env.mjs';

loadEnv();

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api').replace(
  /\/$/,
  '',
);

const FLIGHT_DEMO_FIH_NBO = '00000000-0000-4000-8000-000000003020';

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

async function main() {
  console.log(`API: ${API_URL}\n`);

  console.log('1. GET /public/flights/search FIH→NBO one-way');
  const oneWay = await request(
    '/public/flights/search?from=FIH&to=NBO&departureDate=2026-08-01',
  );
  assertStatus('one-way search', oneWay.status, 200);
  if (!oneWay.data?.data?.length) {
    throw new Error('Expected at least one flight FIH→NBO');
  }
  const kq550 = oneWay.data.data.find((f) => f.flightNumber === 'KQ550');
  if (!kq550) {
    throw new Error('Seed flight KQ550 not found');
  }
  if (kq550.minPriceCents !== 12000) {
    throw new Error(`Expected economy minPriceCents 12000, got ${kq550.minPriceCents}`);
  }
  console.log(`  OK KQ550 @ ${kq550.minPriceCents} cents`);

  console.log('2. GET /public/flights/search FIH→NBO round-trip');
  const roundTrip = await request(
    '/public/flights/search?from=FIH&to=NBO&departureDate=2026-08-01&returnDate=2026-08-08',
  );
  assertStatus('round-trip search', roundTrip.status, 200);
  if (!roundTrip.data?.data?.length) {
    throw new Error('Expected round-trip results');
  }
  const rt = roundTrip.data.data.find((f) => f.flightNumber === 'KQ550');
  if (!rt?.roundTrip) {
    throw new Error('Expected roundTrip=true');
  }
  if (rt.minPriceCents !== 23500) {
    throw new Error(`Expected round-trip minPriceCents 23500, got ${rt.minPriceCents}`);
  }
  console.log(`  OK round-trip KQ550 @ ${rt.minPriceCents} cents`);

  console.log('3. GET /public/flights/:id detail');
  const detail = await request(
    `/public/flights/${FLIGHT_DEMO_FIH_NBO}?departureDate=2026-08-01&passengers=2`,
  );
  assertStatus('flight detail', detail.status, 200);
  if (detail.data?.classes?.length < 2) {
    throw new Error('Expected economy and business classes');
  }
  const eco = detail.data.classes.find((c) => c.className === 'economy');
  if (!eco || eco.totalPriceCents !== 24000) {
    throw new Error(`Expected economy totalPriceCents 24000, got ${eco?.totalPriceCents}`);
  }
  console.log(`  OK detail: ${detail.data.classes.length} classes`);

  console.log('4. GET search passengers=99 (empty)');
  const empty = await request(
    '/public/flights/search?from=FIH&to=NBO&departureDate=2026-08-01&passengers=99',
  );
  assertStatus('passengers=99', empty.status, 200);
  if (empty.data?.data?.length !== 0) {
    throw new Error('Expected empty results for passengers=99');
  }

  console.log('5. GET search invalid returnDate (400)');
  const invalid = await request(
    '/public/flights/search?from=FIH&to=NBO&departureDate=2026-08-08&returnDate=2026-08-01',
  );
  assertStatus('invalid dates', invalid.status, 400);

  console.log('\nAll public flight search checks passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
