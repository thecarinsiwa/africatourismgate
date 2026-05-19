/**
 * Organizations CRUD integration checks (requires API on :3000 and seeded DB).
 * Run: pnpm --filter @africatourismgate/api test:organizations
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
  const slug = `test-org-${suffix}`;
  let orgId;

  console.log('1. POST /organizations (create)');
  const create = await request('POST', '/organizations', {
    token,
    body: {
      name: `Test Org ${suffix}`,
      slug,
      currency: 'USD',
      status: 'active',
    },
  });
  assertStatus('POST /organizations', create.status, 201);
  orgId = create.data.id;
  if (!orgId) throw new Error('Create response missing id');

  console.log('2. POST duplicate slug (expect 409)');
  const dup = await request('POST', '/organizations', {
    token,
    body: {
      name: `Duplicate ${suffix}`,
      slug,
      currency: 'USD',
    },
  });
  assertStatus('POST duplicate slug', dup.status, 409);

  console.log('3. GET /organizations?search=' + slug);
  const list = await request('GET', `/organizations?search=${encodeURIComponent(slug)}`, {
    token,
  });
  assertStatus('GET /organizations search', list.status, 200);
  const found = list.data?.data?.some((o) => o.slug === slug);
  if (!found) throw new Error('Search did not return created organization');

  console.log('4. GET /organizations/:id');
  assertStatus(
    'GET /organizations/:id',
    (await request('GET', `/organizations/${orgId}`, { token })).status,
    200,
  );

  console.log('5. PATCH /organizations/:id');
  const updatedSlug = `${slug}-updated`;
  const patch = await request('PATCH', `/organizations/${orgId}`, {
    token,
    body: { name: `Test Org Updated ${suffix}`, slug: updatedSlug },
  });
  assertStatus('PATCH /organizations/:id', patch.status, 200);

  console.log('6. DELETE /organizations/:id (soft delete)');
  assertStatus(
    'DELETE /organizations/:id',
    (await request('DELETE', `/organizations/${orgId}`, { token })).status,
    200,
  );

  console.log('\nAll organizations CRUD checks passed.');
}

main().catch((err) => {
  console.error('\nOrganizations CRUD test failed:', err.message);
  process.exit(1);
});
