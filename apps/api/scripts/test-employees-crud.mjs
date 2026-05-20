/**
 * Employees CRUD integration checks (requires API on :3000 and seeded DB).
 * Run: pnpm --filter @africatourismgate/api test:employees
 */
import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
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
  const token = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
  const suffix = randomUUID().slice(0, 8);
  const email = `test-emp-user-${suffix}@example.com`;
  let userId;
  let orgId;
  let employeeId;

  console.log('0. POST /organizations (for FK)');
  const orgCreate = await request('POST', '/organizations', {
    token,
    body: {
      name: `Test Org Emp ${suffix}`,
      slug: `test-org-emp-${suffix}`,
      currency: 'USD',
      status: 'active',
    },
  });
  assertStatus('POST /organizations', orgCreate.status, 201);
  orgId = orgCreate.data?.id;
  if (!orgId) throw new Error('Organization create missing id');

  console.log('0b. POST /users (for FK)');
  const userCreate = await request('POST', '/users', {
    token,
    body: {
      email,
      password: 'TestPass123!',
      firstName: 'Emp',
      lastName: `User ${suffix}`,
      status: 'active',
      organizationId: orgId,
    },
  });
  assertStatus('POST /users', userCreate.status, 201);
  userId = userCreate.data?.id;
  if (!userId) throw new Error('User create missing id');

  console.log('1. POST /employees (create)');
  const create = await request('POST', '/employees', {
    token,
    body: {
      userId,
      organizationId: orgId,
      jobTitle: 'Test Role',
      status: 'active',
      currency: 'USD',
    },
  });
  assertStatus('POST /employees', create.status, 201);
  employeeId = create.data?.id;
  const code = create.data?.employeeCode;
  if (!employeeId) throw new Error('Create response missing id');
  if (!code || !/-EMP-\d{4}$/.test(code)) {
    throw new Error(`Auto employeeCode invalid: ${code}`);
  }
  if (create.data?.userId !== userId) {
    throw new Error('Create response userId FK mismatch');
  }
  if (create.data?.organizationId !== orgId) {
    throw new Error('Create response organizationId FK mismatch');
  }

  console.log('2. POST duplicate userId (expect 409)');
  const dup = await request('POST', '/employees', {
    token,
    body: { userId, organizationId: orgId },
  });
  assertStatus('POST duplicate userId', dup.status, 409);

  console.log('3. GET /employees?organizationId=' + orgId);
  const listOrg = await request(
    'GET',
    `/employees?organizationId=${encodeURIComponent(orgId)}&search=${encodeURIComponent(code)}`,
    { token },
  );
  assertStatus('GET /employees by org', listOrg.status, 200);
  const foundOrg = listOrg.data?.data?.some((e) => e.id === employeeId);
  if (!foundOrg) throw new Error('List by organizationId did not return created employee');

  console.log('4. GET /employees?search=' + code);
  const list = await request('GET', `/employees?search=${encodeURIComponent(code)}`, {
    token,
  });
  assertStatus('GET /employees search', list.status, 200);
  const found = list.data?.data?.some((e) => e.employeeCode === code);
  if (!found) throw new Error('Search did not return created employee');

  console.log('5. GET /employees/:id');
  const one = await request('GET', `/employees/${employeeId}`, { token });
  assertStatus('GET /employees/:id', one.status, 200);
  if (!one.data?.user?.email) {
    throw new Error('GET /employees/:id should include linked user summary');
  }

  console.log('6. PATCH /employees/:id (on_leave)');
  const patch = await request('PATCH', `/employees/${employeeId}`, {
    token,
    body: { status: 'on_leave', department: 'QA' },
  });
  assertStatus('PATCH /employees/:id', patch.status, 200);
  if (patch.data?.status !== 'on_leave') {
    throw new Error('PATCH did not set status to on_leave');
  }

  console.log('7. POST invalid organizationId (expect 404)');
  const badOrg = await request('POST', '/employees', {
    token,
    body: {
      userId: '00000000-0000-4000-8000-000000009999',
      organizationId: '00000000-0000-4000-8000-000000009998',
      employeeCode: `BAD-${suffix}`,
    },
  });
  assertStatus('POST invalid FK', badOrg.status, 404);

  console.log('8. DELETE /employees/:id (soft delete)');
  assertStatus(
    'DELETE /employees/:id',
    (await request('DELETE', `/employees/${employeeId}`, { token })).status,
    200,
  );

  console.log('9. Cleanup user and org');
  await request('DELETE', `/users/${userId}`, { token });
  await request('DELETE', `/organizations/${orgId}`, { token });

  console.log('\nAll employees CRUD checks passed.');
}

main().catch((err) => {
  console.error('\nEmployees CRUD test failed:', err.message);
  process.exit(1);
});
