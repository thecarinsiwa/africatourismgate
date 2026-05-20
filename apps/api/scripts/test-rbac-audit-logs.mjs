/**
 * RBAC audit logs read API (requires API on :3000 and seeded DB).
 * Run: pnpm --filter @africatourismgate/api test:rbac-audit
 *
 * Requires in .env.local (gitignored):
 *   SEED_ADMIN_PASSWORD — see database/seeds/README.md
 *   RBAC_TEST_SUPPORT_PASSWORD — any strong password for the ephemeral support test user
 */
import { createConnection } from 'mysql2/promise';
import { randomUUID } from 'node:crypto';
import { loadEnv } from './lib/load-env.mjs';
import {
  SEED_ADMIN_EMAIL,
  ephemeralTestPassword,
  getRbacTestSupportEmail,
  getRbacTestSupportPassword,
  getSeedAdminPassword,
} from './lib/test-credentials.mjs';

const RBAC_TEST_SUPPORT_EMAIL = getRbacTestSupportEmail(
  'rbac.audit.support@africatourismgate.local',
);

loadEnv();

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api').replace(
  /\/$/,
  '',
);
const USER_SUPER_ADMIN_ID = '00000000-0000-4000-8000-000000000010';
const ROLE_SUPPORT_ID = '00000000-0000-4000-8000-000000000102';

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

async function ensureSupportUser(mysql) {
  const [rows] = await mysql.execute(
    'SELECT id FROM users WHERE email = ? AND deleted_at IS NULL LIMIT 1',
    [RBAC_TEST_SUPPORT_EMAIL],
  );
  let userId = rows[0]?.id;

  if (!userId) {
    const reg = await request('POST', '/auth/register', {
      body: {
        email: RBAC_TEST_SUPPORT_EMAIL,
        password: getRbacTestSupportPassword(),
        firstName: 'Audit',
        lastName: 'Support',
      },
    });
    if (reg.status !== 201) {
      throw new Error(`Register support user failed: ${reg.status}`);
    }
    userId = reg.data.user.id;
    console.log(`  Created support test user ${RBAC_TEST_SUPPORT_EMAIL}`);
  }

  await mysql.execute(
    `UPDATE user_role_assignments SET revoked_at = NOW()
     WHERE user_id = ? AND revoked_at IS NULL`,
    [userId],
  );

  await mysql.execute(
    `INSERT INTO user_role_assignments (id, user_id, role_id, scope_type, assigned_at)
     VALUES (?, ?, ?, 'global', NOW())`,
    [randomUUID(), userId, ROLE_SUPPORT_ID],
  );

  return userId;
}

async function main() {
  console.log(`API: ${API_URL}\n`);

  const mysql = await createConnection({
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number(process.env.DATABASE_PORT ?? 3306),
    user: process.env.DATABASE_USER ?? 'root',
    password: process.env.DATABASE_PASSWORD ?? '',
    database: process.env.DATABASE_NAME ?? 'africatourismgate',
  });

  try {
    console.log('1. No token — GET /rbac-audit-logs (expect 401)');
    assertStatus(
      'GET /rbac-audit-logs',
      (await request('GET', '/rbac-audit-logs')).status,
      401,
    );

    const adminToken = await login(SEED_ADMIN_EMAIL, getSeedAdminPassword());

    console.log('2. super_admin — GET /rbac-audit-logs (expect 200, paginated)');
    const list = await request('GET', '/rbac-audit-logs?page=1&limit=5', {
      token: adminToken,
    });
    assertStatus('GET /rbac-audit-logs', list.status, 200);
    if (!Array.isArray(list.data?.data) || typeof list.data?.meta?.total !== 'number') {
      throw new Error('Invalid paginated response shape');
    }
    console.log(`  OK meta.total = ${list.data.meta.total}`);

    console.log('3. Trigger permission_denied via support GET /roles');
    await ensureSupportUser(mysql);
    const supportToken = await login(
      RBAC_TEST_SUPPORT_EMAIL,
      getRbacTestSupportPassword(),
    );
    assertStatus(
      'GET /roles (support)',
      (await request('GET', '/roles', { token: supportToken })).status,
      403,
    );

    console.log('4. Filter eventType=permission_denied');
    const filtered = await request(
      'GET',
      '/rbac-audit-logs?page=1&limit=20&eventType=permission_denied',
      { token: adminToken },
    );
    assertStatus('GET filtered', filtered.status, 200);
    if (!filtered.data?.data?.length) {
      throw new Error('Expected at least one permission_denied audit row');
    }
    console.log(`  OK rows = ${filtered.data.data.length}`);

    console.log('5. Filter actorUserId = seed super admin');
    const byActor = await request(
      'GET',
      `/rbac-audit-logs?page=1&limit=5&actorUserId=${USER_SUPER_ADMIN_ID}`,
      { token: adminToken },
    );
    assertStatus('GET by actor', byActor.status, 200);

    console.log('6. org_admin (register) — GET /rbac-audit-logs (expect 403)');
    const orgEmail = `rbac.audit.org.${Date.now()}@africatourismgate.local`;
    const reg = await request('POST', '/auth/register', {
      body: {
        email: orgEmail,
        password: ephemeralTestPassword(),
        firstName: 'Org',
        lastName: 'Admin',
      },
    });
    if (reg.status !== 201) {
      throw new Error(`Register org_admin failed: ${reg.status}`);
    }
    const orgToken = reg.data.accessToken;
    assertStatus(
      'GET /rbac-audit-logs (org_admin)',
      (await request('GET', '/rbac-audit-logs', { token: orgToken })).status,
      403,
    );

    if (list.data.data[0]?.id) {
      console.log('7. super_admin — GET /rbac-audit-logs/:id');
      const one = await request('GET', `/rbac-audit-logs/${list.data.data[0].id}`, {
        token: adminToken,
      });
      assertStatus('GET by id', one.status, 200);
    }

    console.log('\nAll RBAC audit log checks passed.');
  } finally {
    await mysql.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
