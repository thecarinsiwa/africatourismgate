/**
 * RBAC CRUD integration checks (requires API on :3000 and seeded DB).
 * Run: pnpm --filter @africatourismgate/api test:rbac-crud
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
const ROLE_ORG_ADMIN_ID = '00000000-0000-4000-8000-000000000101';
const ROLE_SUPER_ADMIN_ID = '00000000-0000-4000-8000-000000000100';
const PROP_DEMO_ID = '00000000-0000-4000-8000-000000002010';

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
  const suffix = randomUUID().slice(0, 8);
  const roleCode = `test_role_${suffix}`;
  let customRoleId;
  let assignmentId;
  let testUserId;

  console.log('1. POST /roles (custom role)');
  const createRole = await request('POST', '/roles', {
    token,
    body: {
      code: roleCode,
      name: `Test Role ${suffix}`,
      description: 'RBAC integration test',
    },
  });
  assertStatus('POST /roles', createRole.status, 201);
  customRoleId = createRole.data?.id;
  if (!customRoleId) throw new Error('Create role missing id');

  console.log('2. PATCH custom role');
  const patchRole = await request('PATCH', `/roles/${customRoleId}`, {
    token,
    body: { name: `Test Role Updated ${suffix}` },
  });
  assertStatus('PATCH custom role', patchRole.status, 200);

  console.log('3. PATCH system role org_admin (expect 403)');
  const patchSystem = await request('PATCH', `/roles/${ROLE_ORG_ADMIN_ID}`, {
    token,
    body: { name: 'Hacked Org Admin' },
  });
  assertStatus('PATCH system role', patchSystem.status, 403);

  console.log('4. GET /permissions + PUT /roles/:id/permissions');
  const permsList = await request('GET', '/permissions?limit=10', { token });
  assertStatus('GET /permissions', permsList.status, 200);
  const permIds = (permsList.data?.data ?? []).slice(0, 3).map((p) => p.id);
  if (permIds.length < 2) throw new Error('Need at least 2 permissions in seed');

  const putPerms = await request('PUT', `/roles/${customRoleId}/permissions`, {
    token,
    body: { permissionIds: permIds },
  });
  assertStatus('PUT role permissions', putPerms.status, 200);

  const getPerms = await request('GET', `/roles/${customRoleId}/permissions`, { token });
  assertStatus('GET role permissions', getPerms.status, 200);
  if (getPerms.data?.permissionIds?.length !== permIds.length) {
    throw new Error('Permission matrix mismatch after PUT');
  }

  console.log('5. PUT permissions on super_admin (expect 403)');
  const putSystem = await request('PUT', `/roles/${ROLE_SUPER_ADMIN_ID}/permissions`, {
    token,
    body: { permissionIds: permIds },
  });
  assertStatus('PUT system role permissions', putSystem.status, 403);

  console.log('6. POST /users for assignment');
  const email = `rbac-test-${suffix}@example.com`;
  const userCreate = await request('POST', '/users', {
    token,
    body: {
      email,
      password: ephemeralTestPassword(),
      firstName: 'RBAC',
      lastName: `Test ${suffix}`,
    },
  });
  assertStatus('POST /users', userCreate.status, 201);
  testUserId = userCreate.data?.id;

  console.log('7. POST /user-role-assignments (property scope)');
  const assign = await request('POST', '/user-role-assignments', {
    token,
    body: {
      userId: testUserId,
      roleId: customRoleId,
      scopeType: 'property',
      scopeId: PROP_DEMO_ID,
    },
  });
  assertStatus('POST assignment', assign.status, 201);
  assignmentId = assign.data?.id;

  console.log('8. POST duplicate assignment (expect 409)');
  const dupAssign = await request('POST', '/user-role-assignments', {
    token,
    body: {
      userId: testUserId,
      roleId: customRoleId,
      scopeType: 'property',
      scopeId: PROP_DEMO_ID,
    },
  });
  assertStatus('POST duplicate assignment', dupAssign.status, 409);

  console.log('9. PATCH revoke assignment');
  const revoke = await request('PATCH', `/user-role-assignments/${assignmentId}/revoke`, {
    token,
  });
  assertStatus('PATCH revoke', revoke.status, 200);

  console.log('10. Cleanup');
  await request('DELETE', `/users/${testUserId}`, { token });
  assertStatus('DELETE custom role', (await request('DELETE', `/roles/${customRoleId}`, { token })).status, 200);

  console.log('\nAll RBAC CRUD checks passed.');
}

main().catch((err) => {
  console.error('\nRBAC CRUD test failed:', err.message);
  process.exit(1);
});
