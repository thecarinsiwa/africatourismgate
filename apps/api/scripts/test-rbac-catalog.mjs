/**
 * Catalog RBAC integration checks (requires API :3000, seeded DB).
 *
 * Run: pnpm --filter @africatourismgate/api test:rbac-catalog
 *
 * curl examples:
 *   curl -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:3000/api/properties
 *   curl -H "Authorization: Bearer $ORG_ADMIN_TOKEN" http://localhost:3000/api/properties
 *   curl http://localhost:3000/api/public/destinations
 */
import bcrypt from 'bcryptjs';
import { createConnection } from 'mysql2/promise';
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
const RBAC_TEST_ORG_ADMIN_EMAIL =
  process.env.RBAC_TEST_ORG_ADMIN_EMAIL?.trim() ??
  'rbac.orgadmin.test@africatourismgate.local';
const ROLE_ORG_ADMIN_ID = '00000000-0000-4000-8000-000000000101';
const PERMISSION_PROPERTIES_READ = '00000000-0000-4000-8000-000000001010';
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

async function countPermissionDenied(mysql) {
  const [rows] = await mysql.execute(
    `SELECT COUNT(*) AS c FROM rbac_audit_logs
     WHERE event_type = 'permission_denied' AND deleted_at IS NULL`,
  );
  return Number(rows[0].c);
}

async function ensureOrgAdminUser(mysql) {
  const password = ephemeralTestPassword();
  const [rows] = await mysql.execute(
    'SELECT id FROM users WHERE email = ? AND deleted_at IS NULL LIMIT 1',
    [RBAC_TEST_ORG_ADMIN_EMAIL],
  );
  let userId = rows[0]?.id;

  if (!userId) {
    const reg = await request('POST', '/auth/register', {
      body: {
        email: RBAC_TEST_ORG_ADMIN_EMAIL,
        password,
        firstName: 'RBAC',
        lastName: 'OrgAdmin',
      },
    });
    if (reg.status !== 201) {
      throw new Error(`Register org_admin test user failed: ${reg.status}`);
    }
    userId = reg.data.user.id;
    console.log(`  Created org_admin test user ${RBAC_TEST_ORG_ADMIN_EMAIL}`);
  } else {
    const hash = await bcrypt.hash(password, 10);
    await mysql.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hash, userId]);
  }

  await mysql.execute(
    `UPDATE user_role_assignments SET revoked_at = NOW()
     WHERE user_id = ? AND revoked_at IS NULL`,
    [userId],
  );

  await mysql.execute(
    `INSERT INTO user_role_assignments (id, user_id, role_id, scope_type, assigned_at)
     VALUES (?, ?, ?, 'global', NOW())`,
    [randomUUID(), userId, ROLE_ORG_ADMIN_ID],
  );

  return { userId, password };
}

async function revokeOrgAdminPropertiesRead(mysql) {
  const [result] = await mysql.execute(
    `DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?`,
    [ROLE_ORG_ADMIN_ID, PERMISSION_PROPERTIES_READ],
  );
  return result.affectedRows;
}

async function restoreOrgAdminPropertiesRead(mysql) {
  await mysql.execute(
    `INSERT IGNORE INTO role_permissions (role_id, permission_id, granted_by_user_id)
     VALUES (?, ?, ?)`,
    [ROLE_ORG_ADMIN_ID, PERMISSION_PROPERTIES_READ, SEED_ADMIN_USER_ID],
  );
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

  let propertiesReadRevoked = false;

  try {
    const deniedBefore = await countPermissionDenied(mysql);

    console.log('1. super_admin — GET /properties');
    const adminToken = await login(SEED_ADMIN_EMAIL, getSeedAdminPassword());
    assertStatus(
      'GET /properties',
      (await request('GET', '/properties?limit=1', { token: adminToken })).status,
      200,
    );

    console.log('2. super_admin — GET /flights');
    assertStatus(
      'GET /flights',
      (await request('GET', '/flights?limit=1', { token: adminToken })).status,
      200,
    );

    console.log('3. public — GET /public/destinations (no auth)');
    assertStatus(
      'GET /public/destinations',
      (await request('GET', '/public/destinations')).status,
      200,
    );

    console.log('4. GET /properties without token (expect 401)');
    assertStatus('GET /properties unauthenticated', (await request('GET', '/properties')).status, 401);

    console.log('5. org_admin without properties.read — GET /properties (expect 403)');
    const { password: orgAdminPassword } = await ensureOrgAdminUser(mysql);
    const revoked = await revokeOrgAdminPropertiesRead(mysql);
    propertiesReadRevoked = revoked > 0;
    if (!propertiesReadRevoked) {
      console.log('  WARN properties.read was already absent on org_admin role');
    }

    const orgAdminToken = await login(RBAC_TEST_ORG_ADMIN_EMAIL, orgAdminPassword);
    assertStatus(
      'GET /properties as org_admin without properties.read',
      (await request('GET', '/properties?limit=1', { token: orgAdminToken })).status,
      403,
    );

    console.log('6. rbac_audit_logs permission_denied row');
    const deniedAfterDenied = await countPermissionDenied(mysql);
    if (deniedAfterDenied <= deniedBefore) {
      throw new Error('Expected new permission_denied audit log after catalog 403');
    }
    console.log(`  OK audit logs: ${deniedBefore} → ${deniedAfterDenied}`);

    console.log('7. restore org_admin properties.read — GET /properties (expect 200)');
    await restoreOrgAdminPropertiesRead(mysql);
    propertiesReadRevoked = false;
    assertStatus(
      'GET /properties as org_admin with properties.read',
      (await request('GET', '/properties?limit=1', { token: orgAdminToken })).status,
      200,
    );

    console.log('\nAll catalog RBAC checks passed.');
  } finally {
    if (propertiesReadRevoked) {
      await restoreOrgAdminPropertiesRead(mysql);
    }
    await mysql.end();
  }
}

main().catch((err) => {
  console.error('\nCatalog RBAC test failed:', err.message);
  process.exit(1);
});
