/**
 * Public unified site-search (no auth).
 * Run: pnpm --filter @africatourismgate/api test:public-site-search
 */
import { loadEnv } from './lib/load-env.mjs';

loadEnv();

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api').replace(
  /\/$/,
  '',
);

const CATALOG_TYPES = [
  'hotels',
  'flights',
  'cars',
  'cruises',
  'activities',
  'packages',
  'blog',
];

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

function assertShape(label, payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error(`${label}: expected object response`);
  }
  if (typeof payload.query !== 'string') {
    throw new Error(`${label}: missing query`);
  }
  if (!Array.isArray(payload.types) || !Array.isArray(payload.groups)) {
    throw new Error(`${label}: missing types/groups`);
  }
  if (typeof payload.limit !== 'number') {
    throw new Error(`${label}: missing limit`);
  }
  for (const group of payload.groups) {
    if (!CATALOG_TYPES.includes(group.type) && group.type) {
      // allow only known types
    }
    if (!Array.isArray(group.hits)) {
      throw new Error(`${label}: group ${group.type} missing hits array`);
    }
    for (const hit of group.hits) {
      for (const key of ['type', 'id', 'title', 'href', 'score']) {
        if (hit[key] === undefined || hit[key] === null || hit[key] === '') {
          throw new Error(`${label}: hit missing ${key}`);
        }
      }
    }
  }
  console.log(`  OK ${label} shape (${payload.groups.length} groups)`);
}

async function main() {
  console.log(`API: ${API_URL}\n`);

  console.log('1. GET /public/site-search?q=ab (validation min length)');
  const tooShort = await request('/public/site-search?q=a');
  assertStatus('q too short', tooShort.status, 400);

  console.log('2. GET /public/site-search?q=Kinshasa');
  const all = await request('/public/site-search?q=Kinshasa&limit=5');
  assertStatus('search Kinshasa', all.status, 200);
  assertShape('search Kinshasa', all.data);
  if (all.data.query !== 'Kinshasa') {
    throw new Error(`Expected query Kinshasa, got ${all.data.query}`);
  }
  if (all.data.types.length !== CATALOG_TYPES.length) {
    throw new Error(
      `Expected ${CATALOG_TYPES.length} types, got ${all.data.types.length}`,
    );
  }

  console.log('3. GET /public/site-search?q=Kinshasa&types=hotels,blog');
  const filtered = await request(
    '/public/site-search?q=Kinshasa&types=hotels,blog&limit=3&locale=fr',
  );
  assertStatus('filtered types', filtered.status, 200);
  assertShape('filtered types', filtered.data);
  if (filtered.data.types.join(',') !== 'hotels,blog') {
    throw new Error(
      `Expected types hotels,blog got ${filtered.data.types.join(',')}`,
    );
  }
  if (filtered.data.locale !== 'fr') {
    throw new Error(`Expected locale fr, got ${filtered.data.locale}`);
  }
  if (filtered.data.groups.length !== 2) {
    throw new Error(`Expected 2 groups, got ${filtered.data.groups.length}`);
  }

  console.log('4. GET /public/site-search?q=zzzz-no-match-xyz');
  const empty = await request('/public/site-search?q=zzzz-no-match-xyz');
  assertStatus('empty query match', empty.status, 200);
  assertShape('empty query match', empty.data);
  const hitCount = empty.data.groups.reduce(
    (sum, group) => sum + group.hits.length,
    0,
  );
  console.log(`  OK empty-ish hits total=${hitCount}`);

  console.log('\nPublic site-search OK');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
