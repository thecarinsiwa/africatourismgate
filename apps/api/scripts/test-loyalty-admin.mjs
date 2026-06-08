/**
 * Admin loyalty accounts: list with user info, super_admin manual points adjustment,
 * balance consistent with customer GET /loyalty-accounts.
 *
 * Run: pnpm --filter @africatourismgate/api test:loyalty-admin
 */
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

const INITIAL_POINTS = 150;
const ADJUST_DELTA = 75;
const EXPECTED_AFTER_ADJUST = INITIAL_POINTS + ADJUST_DELTA;

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
  const res = await request('POST', '/auth/login', {
    body: { email, password },
  });
  if (res.status !== 200 || !res.data?.accessToken) {
    throw new Error(`Login failed for ${email}: ${res.status} ${JSON.stringify(res.data)}`);
  }
  return res.data.accessToken;
}

async function registerCustomer() {
  const email = `loyalty.admin.${Date.now()}@africatourismgate.local`;
  const password = ephemeralTestPassword();
  const reg = await request('POST', '/auth/register', {
    body: {
      email,
      password,
      firstName: 'Loyalty',
      lastName: 'Customer',
    },
  });
  if (reg.status !== 201 || !reg.data?.accessToken) {
    throw new Error(`Register failed: ${reg.status} ${JSON.stringify(reg.data)}`);
  }
  const userId = reg.data?.user?.id;
  if (!userId) throw new Error('Register response missing user.id');
  return { token: reg.data.accessToken, userId, email };
}

function assertStatus(label, actual, expected) {
  if (actual !== expected) {
    throw new Error(`${label}: expected HTTP ${expected}, got ${actual}`);
  }
  console.log(`  OK ${label} → ${actual}`);
}

function findOneKeyBalance(accounts, userId) {
  const row = (accounts ?? []).find(
    (a) => a.userId === userId && a.programCode === 'ONEKEY',
  );
  return row?.pointsBalance ?? null;
}

async function main() {
  console.log(`API: ${API_URL}\n`);

  const { token: customerToken, userId, email } = await registerCustomer();
  console.log(`  Customer: ${email} (${userId})\n`);

  const adminToken = await login(SEED_ADMIN_EMAIL, getSeedAdminPassword());
  console.log(`  Admin: ${SEED_ADMIN_EMAIL}\n`);

  console.log('1. POST /loyalty-accounts (admin creates ONEKEY account)');
  const created = await request('POST', '/loyalty-accounts', {
    token: adminToken,
    body: {
      userId,
      programCode: 'ONEKEY',
      pointsBalance: INITIAL_POINTS,
      tier: 'silver',
    },
  });
  assertStatus('POST loyalty-accounts', created.status, 201);
  const accountId = created.data?.id;
  if (!accountId) throw new Error('Missing account id');
  if (created.data.pointsBalance !== INITIAL_POINTS) {
    throw new Error(`Expected ${INITIAL_POINTS} points, got ${created.data.pointsBalance}`);
  }
  console.log(`  OK accountId=${accountId}, balance=${INITIAL_POINTS}`);

  console.log('2. GET /loyalty-accounts (customer — same balance as web panel)');
  const customerList = await request('GET', '/loyalty-accounts?limit=20', {
    token: customerToken,
  });
  assertStatus('GET customer loyalty-accounts', customerList.status, 200);
  const customerBalance = findOneKeyBalance(customerList.data?.data, userId);
  if (customerBalance !== INITIAL_POINTS) {
    throw new Error(
      `Customer balance mismatch: expected ${INITIAL_POINTS}, got ${customerBalance}`,
    );
  }
  console.log(`  OK customer sees ${customerBalance} points (web panel)`);

  console.log('3. GET /loyalty-accounts (admin list with user info)');
  const adminList = await request('GET', '/loyalty-accounts?limit=50', {
    token: adminToken,
  });
  assertStatus('GET admin loyalty-accounts', adminList.status, 200);
  const adminRow = (adminList.data?.data ?? []).find((a) => a.id === accountId);
  if (!adminRow) throw new Error('Account not in admin list');
  if (!adminRow.userEmail || adminRow.userEmail !== email) {
    throw new Error('Admin list missing userEmail');
  }
  if (adminRow.pointsBalance !== INITIAL_POINTS) {
    throw new Error('Admin list pointsBalance mismatch');
  }
  if (adminRow.tier !== 'silver') {
    throw new Error(`Expected tier silver, got ${adminRow.tier}`);
  }
  if (!adminRow.lastActivityAt) {
    throw new Error('Admin list missing lastActivityAt');
  }
  console.log(`  OK admin row (${adminRow.userEmail}, tier ${adminRow.tier})`);

  console.log('4. POST /loyalty-accounts/:id/adjust-points (super_admin +75)');
  const adjusted = await request('POST', `/loyalty-accounts/${accountId}/adjust-points`, {
    token: adminToken,
    body: { delta: ADJUST_DELTA, reason: 'Test ajustement admin #59' },
  });
  assertStatus('POST adjust-points', adjusted.status, 200);
  if (adjusted.data?.pointsBalance !== EXPECTED_AFTER_ADJUST) {
    throw new Error(
      `Expected ${EXPECTED_AFTER_ADJUST} after adjust, got ${adjusted.data?.pointsBalance}`,
    );
  }
  console.log(`  OK balance ${EXPECTED_AFTER_ADJUST} after adjust`);

  console.log('5. GET /loyalty-accounts (customer — balance coherent after adjust)');
  const customerAfter = await request('GET', '/loyalty-accounts?limit=20', {
    token: customerToken,
  });
  assertStatus('GET customer loyalty after adjust', customerAfter.status, 200);
  const balanceAfter = findOneKeyBalance(customerAfter.data?.data, userId);
  if (balanceAfter !== EXPECTED_AFTER_ADJUST) {
    throw new Error(
      `Customer balance after adjust: expected ${EXPECTED_AFTER_ADJUST}, got ${balanceAfter}`,
    );
  }
  console.log(`  OK customer sees ${balanceAfter} points (coherent with admin)`);

  console.log('6. POST adjust-points — rejects negative balance');
  const overdraft = await request('POST', `/loyalty-accounts/${accountId}/adjust-points`, {
    token: adminToken,
    body: { delta: -99999 },
  });
  if (overdraft.status !== 400) {
    throw new Error(`Expected 400 for overdraft, got ${overdraft.status}`);
  }
  console.log('  OK overdraft rejected (400)');

  console.log('\nAll loyalty admin checks passed.');
}

main().catch((err) => {
  console.error('\nLoyalty admin test failed:', err.message);
  process.exit(1);
});
