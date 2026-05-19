/**
 * RBAC integration checks (requires API on :3000 and seeded DB).
 * Run: pnpm --filter @africatourismgate/api test:rbac
 */
import { createConnection } from 'mysql2/promise';
import { randomUUID } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../../..');

function loadEnv() {
  for (const name of ['.env', '.env.local']) {
    const path = join(root, name);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m && !process.env[m[1].trim()]) {
        process.env[m[1].trim()] = m[2].trim();
      }
    }
  }
}

loadEnv();

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api').replace(
  /\/$/,
  '',
);
const ADMIN_EMAIL = 'admin@africatourismgate.local';
const ADMIN_PASSWORD = 'ChangeMe123!';
const SUPPORT_EMAIL = 'rbac.support.test@africatourismgate.local';
const SUPPORT_PASSWORD = 'SupportTest123!';
const ROLE_SUPPORT_ID = '00000000-0000-4000-8000-000000000102';
const ROLE_ORG_ADMIN_ID = '00000000-0000-4000-8000-000000000101';

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
    [SUPPORT_EMAIL],
  );
  let userId = rows[0]?.id;

  if (!userId) {
    const reg = await request('POST', '/auth/register', {
      body: {
        email: SUPPORT_EMAIL,
        password: SUPPORT_PASSWORD,
        firstName: 'RBAC',
        lastName: 'Support',
      },
    });
    if (reg.status !== 201) {
      throw new Error(`Register support user failed: ${reg.status}`);
    }
    userId = reg.data.user.id;
    console.log(`  Created support test user ${SUPPORT_EMAIL}`);
  }

  await mysql.execute(
    `UPDATE user_role_assignments SET revoked_at = NOW() 
     WHERE user_id = ? AND revoked_at IS NULL`,
    [userId],
  );

  const assignmentId = randomUUID();
  await mysql.execute(
    `INSERT INTO user_role_assignments (id, user_id, role_id, scope_type, assigned_at)
     VALUES (?, ?, ?, 'global', NOW())`,
    [assignmentId, userId, ROLE_SUPPORT_ID],
  );

  return userId;
}

async function countPermissionDenied(mysql) {
  const [rows] = await mysql.execute(
    `SELECT COUNT(*) AS c FROM rbac_audit_logs 
     WHERE event_type = 'permission_denied' AND deleted_at IS NULL`,
  );
  return Number(rows[0].c);
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
    const deniedBefore = await countPermissionDenied(mysql);

    console.log('1. super_admin — GET /users');
    const adminToken = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
    assertStatus('GET /users', (await request('GET', '/users', { token: adminToken })).status, 200);

    console.log('2. super_admin — GET /payments');
    assertStatus(
      'GET /payments',
      (await request('GET', '/payments', { token: adminToken })).status,
      200,
    );

    console.log('3. support user — GET /payments (expect 403)');
    await ensureSupportUser(mysql);
    const supportToken = await login(SUPPORT_EMAIL, SUPPORT_PASSWORD);
    assertStatus(
      'GET /payments',
      (await request('GET', '/payments', { token: supportToken })).status,
      403,
    );

    console.log('4. support user — GET /bookings (expect 200)');
    assertStatus(
      'GET /bookings',
      (await request('GET', '/bookings', { token: supportToken })).status,
      200,
    );

    console.log('5. rbac_audit_logs permission_denied row');
    const deniedAfter = await countPermissionDenied(mysql);
    if (deniedAfter <= deniedBefore) {
      throw new Error('Expected new permission_denied audit log after 403');
    }
    console.log(`  OK audit logs: ${deniedBefore} → ${deniedAfter}`);

    console.log('\nAll RBAC checks passed.');
  } finally {
    await mysql.end();
  }
}

main().catch((err) => {
  console.error('\nRBAC test failed:', err.message);
  process.exit(1);
});
