/**
 * Organization settings & bank accounts integration checks (API on :3000, seeded DB).
 * Run: pnpm --filter @africatourismgate/api test:org-settings
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
const PLATFORM_ORG_ID = '00000000-0000-4000-8000-000000000001';
const SEED_BANK_ACCOUNT_ID = '00000000-0000-4000-8000-000000000020';

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
  const adminToken = await login(SEED_ADMIN_EMAIL, getSeedAdminPassword());

  console.log('1. super_admin — GET /organization-settings?organizationId=platform');
  const listSettings = await request(
    'GET',
    `/organization-settings?organizationId=${PLATFORM_ORG_ID}&page=1&limit=20`,
    { token: adminToken },
  );
  assertStatus('GET organization-settings', listSettings.status, 200);
  if (!listSettings.data?.data?.length) {
    throw new Error('Expected seeded organization settings');
  }

  console.log('2. super_admin — PUT bulk invalid currency (expect 400)');
  const badCurrency = await request('PUT', '/organization-settings/bulk', {
    token: adminToken,
    body: {
      organizationId: PLATFORM_ORG_ID,
      settings: [
        {
          settingGroup: 'general',
          settingKey: 'locale',
          settingValue: { language: 'fr', currency: 'US', timezone: 'Africa/Kinshasa' },
        },
      ],
    },
  });
  assertStatus('PUT bulk bad currency', badCurrency.status, 400);

  console.log('3. super_admin — PUT bulk valid currency (expect 200)');
  const goodCurrency = await request('PUT', '/organization-settings/bulk', {
    token: adminToken,
    body: {
      organizationId: PLATFORM_ORG_ID,
      settings: [
        {
          settingGroup: 'general',
          settingKey: 'locale',
          settingValue: {
            language: 'fr',
            currency: 'EUR',
            timezone: 'Africa/Kinshasa',
          },
        },
      ],
    },
  });
  assertStatus('PUT bulk EUR', goodCurrency.status, 200);

  console.log('4. super_admin — PATCH organization invalid email (expect 400)');
  const badEmail = await request('PATCH', `/organizations/${PLATFORM_ORG_ID}`, {
    token: adminToken,
    body: { contactEmail: 'not-an-email' },
  });
  assertStatus('PATCH org bad email', badEmail.status, 400);

  console.log('5. super_admin — PATCH organization valid email (expect 200)');
  const goodEmail = await request('PATCH', `/organizations/${PLATFORM_ORG_ID}`, {
    token: adminToken,
    body: { contactEmail: 'contact@africatourismgate.local' },
  });
  assertStatus('PATCH org valid email', goodEmail.status, 200);

  console.log('6. super_admin — GET bank accounts full account number');
  const adminBanks = await request(
    'GET',
    `/organization-bank-accounts?organizationId=${PLATFORM_ORG_ID}&page=1&limit=10`,
    { token: adminToken },
  );
  assertStatus('GET bank accounts (admin)', adminBanks.status, 200);
  const seedAccount = adminBanks.data?.data?.find((a) => a.id === SEED_BANK_ACCOUNT_ID);
  if (!seedAccount?.accountNumber?.includes('0001234567890')) {
    throw new Error(
      `super_admin should see full account number, got: ${seedAccount?.accountNumber}`,
    );
  }
  console.log('  OK account number visible to super_admin');

  console.log('7. org_admin via register — scoped access');
  const orgEmail = `org.settings.${Date.now()}@africatourismgate.local`;
  const reg = await request('POST', '/auth/register', {
    body: {
      email: orgEmail,
      password: ephemeralTestPassword(),
      firstName: 'Org',
      lastName: 'Settings',
    },
  });
  if (reg.status !== 201) {
    throw new Error(`Register failed: ${reg.status} ${JSON.stringify(reg.data)}`);
  }
  const orgToken = reg.data.accessToken;
  const orgId = reg.data.user.organizationId;
  if (!orgId) throw new Error('Registered user missing organizationId');

  const orgSettings = await request('GET', '/organization-settings?page=1&limit=20', {
    token: orgToken,
  });
  assertStatus('GET settings (org_admin)', orgSettings.status, 200);

  const suffix = randomUUID().slice(0, 8);
  const otherOrg = await request('POST', '/organizations', {
    token: adminToken,
    body: {
      name: `Other Org ${suffix}`,
      slug: `other-org-${suffix}`,
      currency: 'USD',
    },
  });
  assertStatus('POST other organization', otherOrg.status, 201);
  const otherOrgId = otherOrg.data.id;

  const forbiddenOtherOrg = await request(
    'GET',
    `/organization-settings?organizationId=${otherOrgId}&page=1&limit=5`,
    { token: orgToken },
  );
  assertStatus('GET settings other org (403)', forbiddenOtherOrg.status, 403);

  console.log('8. org_admin — masked bank account number');
  const orgBanks = await request('GET', '/organization-bank-accounts?page=1&limit=10', {
    token: orgToken,
  });
  assertStatus('GET bank accounts (org_admin)', orgBanks.status, 200);
  if (orgBanks.data?.data?.length) {
    const num = orgBanks.data.data[0].accountNumber;
    if (!num.includes('****')) {
      throw new Error(`Expected masked account number for org_admin, got: ${num}`);
    }
    console.log('  OK account number masked for org_admin');
  } else {
    console.log('  (skip mask check — no bank accounts for new org)');
  }

  console.log('9. org_admin — POST bank account invalid currency (expect 400)');
  const badBank = await request('POST', '/organization-bank-accounts', {
    token: orgToken,
    body: {
      bankName: 'Test Bank',
      accountName: 'Test Account',
      accountNumber: '1234567890123456',
      currency: 'ABCD',
    },
  });
  assertStatus('POST bank bad currency', badBank.status, 400);

  console.log('10. org_admin — POST bank account valid (expect 201)');
  const goodBank = await request('POST', '/organization-bank-accounts', {
    token: orgToken,
    body: {
      bankName: 'Test Bank',
      accountName: `Test ${randomUUID().slice(0, 8)}`,
      accountNumber: '9876543210987654',
      currency: 'USD',
      isDefault: true,
    },
  });
  assertStatus('POST bank valid', goodBank.status, 201);
  if (!goodBank.data?.accountNumber?.includes('****')) {
    console.log('  OK create response may include masked number for org_admin');
  }

  console.log('\nAll organization settings checks passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
