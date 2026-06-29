/**
 * Admin user sub-pages API (addresses, payment methods, sessions, audit logs).
 * Run: pnpm --filter @africatourismgate/api test:admin-user-subpages
 *
 * Requires API on :3000, seeded DB, and in .env.local:
 *   SEED_ADMIN_PASSWORD — see database/seeds/README.md
 */
import { randomUUID } from 'node:crypto';
import { loadEnv } from './lib/load-env.mjs';
import {
  SEED_ADMIN_EMAIL,
  ephemeralTestPassword,
  getSeedAdminPassword,
} from './lib/test-credentials.mjs';

loadEnv();

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api').replace(
  /\/$/,
  '',
);
const USER_SUPER_ADMIN_ID = '00000000-0000-4000-8000-000000000010';

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
  return { status: res.status, data, headers: res.headers };
}

async function login(email, password) {
  const { status, data } = await request('POST', '/auth/login', {
    body: { email, password },
  });
  if (status !== 200 || !data?.accessToken) {
    throw new Error(`Login failed for ${email}: ${status} ${JSON.stringify(data)}`);
  }
  return data.accessToken;
}

function assertStatus(label, actual, expected) {
  if (actual !== expected) {
    throw new Error(`${label}: expected HTTP ${expected}, got ${actual}`);
  }
  console.log(`  OK ${label} → ${actual}`);
}

function assertPaginated(label, payload) {
  if (!Array.isArray(payload?.data) || typeof payload?.meta?.total !== 'number') {
    throw new Error(`${label}: invalid paginated response shape`);
  }
}

function assertNoKeys(label, rows, forbiddenKeys) {
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    for (const key of forbiddenKeys) {
      if (key in row) {
        throw new Error(`${label}: response must not include "${key}"`);
      }
    }
  }
}

function assertAllUserId(label, rows, userId) {
  for (const row of rows) {
    if (row.userId !== userId) {
      throw new Error(`${label}: expected userId ${userId}, got ${row.userId}`);
    }
  }
}

async function main() {
  console.log(`API: ${API_URL}\n`);

  const adminToken = await login(SEED_ADMIN_EMAIL, getSeedAdminPassword());
  const suffix = randomUUID().slice(0, 8);
  const testEmail = `admin.subpages.${suffix}@africatourismgate.local`;
  const testPassword = ephemeralTestPassword();

  console.log('0. Register test user (creates an auth session)');
  const reg = await request('POST', '/auth/register', {
    body: {
      email: testEmail,
      password: testPassword,
      firstName: 'Subpages',
      lastName: `Test ${suffix}`,
    },
  });
  assertStatus('POST /auth/register', reg.status, 201);
  const testUserId = reg.data?.user?.id;
  if (!testUserId) throw new Error('Register response missing user.id');

  await login(testEmail, testPassword);

  console.log('1. POST /user-addresses (staff, target user)');
  const address = await request('POST', '/user-addresses', {
    token: adminToken,
    body: {
      userId: testUserId,
      label: 'Test',
      line1: '1 Rue Test',
      city: 'Kinshasa',
      countryCode: 'CD',
      isDefault: true,
    },
  });
  assertStatus('POST /user-addresses', address.status, 201);
  const addressId = address.data?.id;
  if (!addressId) throw new Error('Address create missing id');

  console.log('2. GET /user-addresses?userId=' + testUserId);
  const addresses = await request(
    'GET',
    `/user-addresses?page=1&limit=20&userId=${testUserId}`,
    { token: adminToken },
  );
  assertStatus('GET /user-addresses filtered', addresses.status, 200);
  assertPaginated('GET /user-addresses', addresses.data);
  if (!addresses.data.data.some((row) => row.id === addressId)) {
    throw new Error('Filtered address list missing created row');
  }
  assertAllUserId('GET /user-addresses', addresses.data.data, testUserId);
  console.log(`  OK rows = ${addresses.data.data.length}`);

  console.log('3. POST /user-payment-methods (staff, with externalToken)');
  const payment = await request('POST', '/user-payment-methods', {
    token: adminToken,
    body: {
      userId: testUserId,
      type: 'card',
      provider: 'visa',
      lastFour: '4242',
      externalToken: 'tok_secret_should_not_leak',
      isDefault: true,
    },
  });
  assertStatus('POST /user-payment-methods', payment.status, 201);
  if ('externalToken' in (payment.data ?? {})) {
    throw new Error('POST /user-payment-methods must not return externalToken');
  }
  const paymentId = payment.data?.id;
  if (!paymentId) throw new Error('Payment method create missing id');

  console.log('4. GET /user-payment-methods?userId=' + testUserId);
  const payments = await request(
    'GET',
    `/user-payment-methods?page=1&limit=20&userId=${testUserId}`,
    { token: adminToken },
  );
  assertStatus('GET /user-payment-methods filtered', payments.status, 200);
  assertPaginated('GET /user-payment-methods', payments.data);
  assertNoKeys('GET /user-payment-methods', payments.data.data, [
    'externalToken',
    'refreshTokenHash',
  ]);
  assertAllUserId('GET /user-payment-methods', payments.data.data, testUserId);
  console.log(`  OK rows = ${payments.data.data.length}`);

  console.log('5. GET /user-sessions?userId=' + testUserId);
  const sessions = await request(
    'GET',
    `/user-sessions?page=1&limit=20&userId=${testUserId}`,
    { token: adminToken },
  );
  assertStatus('GET /user-sessions filtered', sessions.status, 200);
  assertPaginated('GET /user-sessions', sessions.data);
  assertNoKeys('GET /user-sessions', sessions.data.data, [
    'refreshTokenHash',
    'externalToken',
  ]);
  assertAllUserId('GET /user-sessions', sessions.data.data, testUserId);
  if (!sessions.data.data.length) {
    throw new Error('Expected at least one active session for test user');
  }
  const sessionId = sessions.data.data[0].id;
  console.log(`  OK rows = ${sessions.data.data.length}`);

  console.log('6. DELETE /user-sessions/:id (revoke)');
  const revoke = await request('DELETE', `/user-sessions/${sessionId}`, {
    token: adminToken,
  });
  assertStatus('DELETE /user-sessions/:id', revoke.status, 204);

  console.log('7. GET /user-sessions/:id after revoke (expect 404)');
  const revoked = await request('GET', `/user-sessions/${sessionId}`, {
    token: adminToken,
  });
  assertStatus('GET revoked session', revoked.status, 404);

  console.log('8. GET /rbac-audit-logs?userId=' + USER_SUPER_ADMIN_ID);
  const audit = await request(
    'GET',
    `/rbac-audit-logs?page=1&limit=5&userId=${USER_SUPER_ADMIN_ID}`,
    { token: adminToken },
  );
  assertStatus('GET /rbac-audit-logs userId filter', audit.status, 200);
  assertPaginated('GET /rbac-audit-logs', audit.data);
  console.log(`  OK meta.total = ${audit.data.meta.total}`);

  console.log('9. org user — GET /rbac-audit-logs (expect 403)');
  assertStatus(
    'GET /rbac-audit-logs (non-super-admin)',
    (
      await request('GET', '/rbac-audit-logs?page=1&limit=5', {
        token: reg.data.accessToken,
      })
    ).status,
    403,
  );

  console.log('\nAll admin user sub-pages API checks passed.');
}

main().catch((err) => {
  console.error('\nAdmin user sub-pages test failed:', err.message);
  process.exit(1);
});
