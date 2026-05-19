/**
 * Users CRUD integration checks (requires API on :3000 and seeded DB).
 * Run: pnpm --filter @africatourismgate/api test:users
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

function assertNoPasswordHash(label, obj) {
  if (!obj || typeof obj !== 'object') return;
  if ('passwordHash' in obj || 'password_hash' in obj) {
    throw new Error(`${label}: response must not include password hash`);
  }
}

async function main() {
  console.log(`API: ${API_URL}\n`);
  const token = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
  const suffix = randomUUID().slice(0, 8);
  const email = `test-user-${suffix}@example.com`;
  let userId;

  console.log('1. POST /users (create)');
  const create = await request('POST', '/users', {
    token,
    body: {
      email,
      password: 'TestPass123!',
      firstName: 'Test',
      lastName: `User ${suffix}`,
      status: 'active',
    },
  });
  assertStatus('POST /users', create.status, 201);
  assertNoPasswordHash('POST /users body', create.data);
  userId = create.data?.id;
  if (!userId) throw new Error('Create response missing id');

  console.log('2. POST duplicate email (expect 409)');
  const dup = await request('POST', '/users', {
    token,
    body: {
      email,
      password: 'TestPass123!',
      firstName: 'Dup',
      lastName: 'User',
    },
  });
  assertStatus('POST duplicate email', dup.status, 409);

  console.log('3. GET /users?search=' + suffix);
  const list = await request('GET', `/users?search=${encodeURIComponent(suffix)}`, {
    token,
  });
  assertStatus('GET /users search', list.status, 200);
  const found = list.data?.data?.some((u) => u.email === email);
  if (!found) throw new Error('Search did not return created user');

  console.log('4. GET /users?status=active');
  const listStatus = await request('GET', '/users?status=active&limit=5', { token });
  assertStatus('GET /users status filter', listStatus.status, 200);

  console.log('5. GET /users/:id');
  const one = await request('GET', `/users/${userId}`, { token });
  assertStatus('GET /users/:id', one.status, 200);
  assertNoPasswordHash('GET /users/:id body', one.data);

  console.log('6. PATCH /users/:id (suspend)');
  const patch = await request('PATCH', `/users/${userId}`, {
    token,
    body: { status: 'suspended' },
  });
  assertStatus('PATCH /users/:id', patch.status, 200);
  if (patch.data?.status !== 'suspended') {
    throw new Error('PATCH did not set status to suspended');
  }

  console.log('7. DELETE /users/:id (soft delete)');
  assertStatus(
    'DELETE /users/:id',
    (await request('DELETE', `/users/${userId}`, { token })).status,
    200,
  );

  console.log('\nAll users CRUD checks passed.');
}

main().catch((err) => {
  console.error('\nUsers CRUD test failed:', err.message);
  process.exit(1);
});
