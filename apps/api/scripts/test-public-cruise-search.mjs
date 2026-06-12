/**
 * Public cruise search (no auth).
 * Run: pnpm --filter @africatourismgate/api test:public-cruise-search
 */
import { loadEnv } from './lib/load-env.mjs';

loadEnv();

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api').replace(
  /\/$/,
  '',
);

const SAILING_DEMO_KIN_BNW = '00000000-0000-4000-8000-000000003036';
const CABIN_AVAIL_DEMO_STD = '00000000-0000-4000-8000-000000003037';

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

  console.log('1. GET /public/cruises/search CDKIN→CDBNW');
  const search = await request(
    '/public/cruises/search?sailFrom=CDKIN&sailTo=CDBNW&startDate=2026-09-01&endDate=2026-09-30',
  );
  assertStatus('CDKIN→CDBNW search', search.status, 200);
  if (!search.data?.data?.length) {
    throw new Error('Expected at least one sailing CDKIN→CDBNW');
  }
  const sailing = search.data.data.find((s) => s.id === SAILING_DEMO_KIN_BNW);
  if (!sailing) {
    throw new Error('Seed sailing Kinshasa — Banana not found');
  }
  if (sailing.minPriceCents !== 245000) {
    throw new Error(`Expected minPriceCents 245000, got ${sailing.minPriceCents}`);
  }
  if (sailing.departureDate !== '2026-09-15' || sailing.returnDate !== '2026-09-20') {
    throw new Error(
      `Unexpected dates: ${sailing.departureDate} → ${sailing.returnDate}`,
    );
  }
  console.log(
    `  OK ${sailing.itineraryName} @ ${sailing.minPriceCents} cents (${sailing.departureDate})`,
  );

  console.log('2. GET search date window without sailing (empty)');
  const emptyWindow = await request(
    '/public/cruises/search?sailFrom=CDKIN&sailTo=CDBNW&startDate=2026-10-01&endDate=2026-10-31',
  );
  assertStatus('empty date window', emptyWindow.status, 200);
  if (emptyWindow.data?.data?.length !== 0) {
    throw new Error('Expected empty results for October dates');
  }

  console.log('3. GET search unknown port codes (empty)');
  const emptyPorts = await request(
    '/public/cruises/search?sailFrom=UNKNOWN&sailTo=CDBNW&startDate=2026-09-01&endDate=2026-09-30',
  );
  assertStatus('unknown port', emptyPorts.status, 200);
  if (emptyPorts.data?.data?.length !== 0) {
    throw new Error('Expected empty results for unknown sailFrom port');
  }

  console.log('4. GET search invalid endDate (400)');
  const invalid = await request(
    '/public/cruises/search?sailFrom=CDKIN&sailTo=CDBNW&startDate=2026-09-30&endDate=2026-09-01',
  );
  assertStatus('invalid dates', invalid.status, 400);

  console.log('5. GET /public/cruises/sailings/:id detail');
  const detail = await request(`/public/cruises/sailings/${SAILING_DEMO_KIN_BNW}`);
  assertStatus('sailing detail', detail.status, 200);
  if (detail.data?.itineraryPorts?.length !== 2) {
    throw new Error('Expected 2 itinerary ports in detail');
  }
  if (detail.data?.cabins?.length !== 1) {
    throw new Error('Expected only Standard cabin with stock in detail');
  }
  const std = detail.data.cabins[0];
  if (std.categoryName !== 'Standard' || std.availabilityId !== CABIN_AVAIL_DEMO_STD) {
    throw new Error('Expected Standard cabin availability in detail');
  }
  if (std.availableCount !== 8 || std.priceCents !== 245000) {
    throw new Error(`Unexpected Standard cabin: count=${std.availableCount} price=${std.priceCents}`);
  }
  if (detail.data.minPriceCents !== 245000) {
    throw new Error(`Expected minPriceCents 245000, got ${detail.data.minPriceCents}`);
  }
  console.log(`  OK detail: ${detail.data.cabins.length} cabin(s), ${detail.data.itineraryPorts.length} ports`);

  console.log('\nAll public cruise search checks passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
