/**
 * Bookings list API: pagination + filters (requires API :3000, seeded DB).
 * Run: pnpm --filter @africatourismgate/api test:bookings-list
 */
import { loadEnv } from './lib/load-env.mjs';
import { SEED_ADMIN_EMAIL, getSeedAdminPassword } from './lib/test-credentials.mjs';

loadEnv();

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api').replace(
  /\/$/,
  '',
);
const SEED_ORG_ID = '00000000-0000-4000-8000-000000000001';
const SEED_ADMIN_USER_ID = '00000000-0000-4000-8000-000000000010';

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

  console.log('1. GET /bookings (paginated list)');
  const list = await request('GET', '/bookings?page=1&limit=5', { token });
  assertStatus('GET /bookings', list.status, 200);
  if (!Array.isArray(list.data?.data)) {
    throw new Error('Expected paginated data array');
  }
  if (!list.data?.meta?.totalPages) {
    throw new Error('Expected meta.totalPages');
  }
  const first = list.data.data[0];
  if (first) {
    if (!first.clientEmail) {
      throw new Error('List item missing clientEmail enrichment');
    }
    if (first.organizationId === undefined) {
      throw new Error('List item missing organizationId field');
    }
    console.log(`  OK first row client=${first.clientEmail}`);
  } else {
    console.log('  OK empty list (no bookings yet)');
  }

  console.log('2. GET /bookings?status=cancelled');
  const byStatus = await request('GET', '/bookings?status=cancelled&limit=10', { token });
  assertStatus('GET by status', byStatus.status, 200);
  for (const row of byStatus.data?.data ?? []) {
    if (row.status !== 'cancelled') {
      throw new Error(`Expected cancelled, got ${row.status}`);
    }
  }

  console.log('3. GET /bookings?userId=' + SEED_ADMIN_USER_ID);
  const byUser = await request(
    'GET',
    `/bookings?userId=${SEED_ADMIN_USER_ID}&limit=10`,
    { token },
  );
  assertStatus('GET by userId', byUser.status, 200);
  for (const row of byUser.data?.data ?? []) {
    if (row.userId !== SEED_ADMIN_USER_ID) {
      throw new Error(`Expected userId ${SEED_ADMIN_USER_ID}, got ${row.userId}`);
    }
  }

  console.log('4. GET /bookings?organizationId=' + SEED_ORG_ID);
  const byOrg = await request(
    'GET',
    `/bookings?organizationId=${SEED_ORG_ID}&limit=10`,
    { token },
  );
  assertStatus('GET by organizationId', byOrg.status, 200);
  for (const row of byOrg.data?.data ?? []) {
    if (row.organizationId !== SEED_ORG_ID) {
      throw new Error(
        `Expected organizationId ${SEED_ORG_ID}, got ${row.organizationId}`,
      );
    }
  }

  console.log('5. GET /bookings?dateFrom=2099-01-01&dateTo=2099-12-31');
  const byDate = await request(
    'GET',
    '/bookings?dateFrom=2099-01-01&dateTo=2099-12-31&limit=10',
    { token },
  );
  assertStatus('GET by date range', byDate.status, 200);

  console.log('6. GET /bookings without token (expect 401)');
  const noAuth = await request('GET', '/bookings');
  assertStatus('GET without auth', noAuth.status, 401);

  console.log('\nAll bookings list checks passed.');
}

main().catch((err) => {
  console.error('\nBookings list test failed:', err.message);
  process.exit(1);
});
