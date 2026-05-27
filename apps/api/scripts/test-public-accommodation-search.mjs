/**
 * Public accommodation search (no auth).
 * Run: pnpm --filter @africatourismgate/api test:public-accommodation-search
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

async function main() {
  console.log(`API: ${API_URL}\n`);

  console.log('1. GET /public/destinations');
  const dests = await request('/public/destinations');
  assertStatus('GET /public/destinations', dests.status, 200);
  if (!Array.isArray(dests.data) || dests.data.length < 1) {
    throw new Error('Expected at least one destination from seed');
  }
  const kinshasa = dests.data.find((d) => d.name === 'Kinshasa');
  if (!kinshasa) {
    throw new Error('Kinshasa destination not found in seed data');
  }

  console.log('2. GET /public/accommodations/search?destination=Kinshasa');
  const search = await request(
    '/public/accommodations/search?destination=Kinshasa&guests=2',
  );
  assertStatus('search Kinshasa', search.status, 200);
  if (!search.data?.data?.length) {
    throw new Error('Expected at least one property for Kinshasa');
  }
  const demo = search.data.data.find(
    (p) => p.slug === 'tourism-gate-demo-hotel',
  );
  if (!demo) {
    throw new Error('Seed property tourism-gate-demo-hotel not found');
  }
  if (demo.minPriceCents !== 8500) {
    throw new Error(
      `Expected demo minPriceCents 8500, got ${demo.minPriceCents}`,
    );
  }
  console.log(`  OK demo hotel: ${demo.name} @ ${demo.minPriceCents} cents`);

  console.log('3. GET search with guests=99 (empty)');
  const emptyGuests = await request(
    '/public/accommodations/search?destination=Kinshasa&guests=99',
  );
  assertStatus('search guests=99', emptyGuests.status, 200);
  if (emptyGuests.data?.data?.length !== 0) {
    throw new Error('Expected empty results for guests=99');
  }

  console.log('4. GET search destination=Nairobi (empty)');
  const emptyDest = await request(
    '/public/accommodations/search?destination=Nairobi',
  );
  assertStatus('search Nairobi', emptyDest.status, 200);
  if (emptyDest.data?.data?.length !== 0) {
    throw new Error('Expected empty results for Nairobi');
  }

  console.log('\nAll public accommodation search checks passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
