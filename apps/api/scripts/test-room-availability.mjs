/**
 * Room availability CRUD + bulk upsert (requires API :3000 and seeded DB).
 * Run: pnpm --filter @africatourismgate/api test:room-availability
 */
import { loadEnv } from './lib/load-env.mjs';
import { SEED_ADMIN_EMAIL, getSeedAdminPassword } from './lib/test-credentials.mjs';

loadEnv();

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api').replace(
  /\/$/,
  '',
);
const SEED_ROOM_ID = '00000000-0000-4000-8000-000000002011';

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

async function main() {
  console.log(`API: ${API_URL}\n`);
  const token = await login(SEED_ADMIN_EMAIL, getSeedAdminPassword());

  const testDate = '2099-06-15';
  const bulkFrom = '2099-06-16';
  const bulkTo = '2099-06-18';
  let availabilityId;

  console.log('1. POST /room-availability');
  const create = await request('POST', '/room-availability', {
    token,
    body: {
      roomId: SEED_ROOM_ID,
      date: testDate,
      availableUnits: 4,
      priceCents: 9000,
    },
  });
  assertStatus('POST /room-availability', create.status, 201);
  availabilityId = create.data?.id;
  if (!availabilityId) throw new Error('Create missing id');

  console.log('2. POST duplicate room+date (409)');
  const dup = await request('POST', '/room-availability', {
    token,
    body: {
      roomId: SEED_ROOM_ID,
      date: testDate,
      availableUnits: 2,
      priceCents: 8000,
    },
  });
  assertStatus('POST duplicate', dup.status, 409);

  console.log('3. PUT /room-availability/bulk (3 days)');
  const bulk = await request('PUT', '/room-availability/bulk', {
    token,
    body: {
      roomId: SEED_ROOM_ID,
      dateFrom: bulkFrom,
      dateTo: bulkTo,
      availableUnits: 6,
      priceCents: 9500,
    },
  });
  assertStatus('PUT bulk', bulk.status, 200);
  if (bulk.data?.upsertedCount !== 3) {
    throw new Error(`Expected upsertedCount 3, got ${bulk.data?.upsertedCount}`);
  }

  console.log('4. GET /room-availability filtered');
  const list = await request(
    'GET',
    `/room-availability?roomId=${SEED_ROOM_ID}&dateFrom=${bulkFrom}&dateTo=${bulkTo}&page=1&limit=100`,
    { token },
  );
  assertStatus('GET filtered', list.status, 200);
  const dates = (list.data?.data ?? []).map((r) => r.date?.slice(0, 10));
  for (const d of [bulkFrom, '2099-06-17', bulkTo]) {
    if (!dates.includes(d)) {
      throw new Error(`Missing date ${d} in list: ${dates.join(', ')}`);
    }
  }

  console.log('5. PATCH /room-availability/:id');
  const patch = await request('PATCH', `/room-availability/${availabilityId}`, {
    token,
    body: { availableUnits: 3, priceCents: 9100 },
  });
  assertStatus('PATCH', patch.status, 200);
  if (patch.data?.availableUnits !== 3) {
    throw new Error('PATCH did not update availableUnits');
  }

  console.log('6. Cleanup DELETE test rows');
  const allInRange = await request(
    'GET',
    `/room-availability?roomId=${SEED_ROOM_ID}&dateFrom=${testDate}&dateTo=${bulkTo}&page=1&limit=100`,
    { token },
  );
  for (const row of allInRange.data?.data ?? []) {
    const del = await request('DELETE', `/room-availability/${row.id}`, { token });
    assertStatus(`DELETE ${row.id}`, del.status, 200);
  }

  console.log('\nAll room-availability checks passed.');
}

main().catch((err) => {
  console.error('\nRoom availability test failed:', err.message);
  process.exit(1);
});
