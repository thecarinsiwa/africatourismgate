/**
 * Booking items list API: pagination + filters (requires API :3000, seeded DB).
 * Run: pnpm --filter @africatourismgate/api test:booking-items-list
 */
import { loadEnv } from './lib/load-env.mjs';
import { SEED_ADMIN_EMAIL, getSeedAdminPassword } from './lib/test-credentials.mjs';

loadEnv();

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api').replace(
  /\/$/,
  '',
);

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

function assertEnrichment(row) {
  if (!row.titleSnapshot) {
    throw new Error('List item missing titleSnapshot');
  }
  if (!row.bookingStatus) {
    throw new Error('List item missing bookingStatus enrichment');
  }
  if (!row.currency) {
    throw new Error('List item missing currency enrichment');
  }
  if (typeof row.lineTotalCents !== 'number') {
    throw new Error('List item missing lineTotalCents');
  }
  const expectedLineTotal = row.unitPriceCents * row.quantity;
  if (row.lineTotalCents !== expectedLineTotal) {
    throw new Error(
      `lineTotalCents mismatch: expected ${expectedLineTotal}, got ${row.lineTotalCents}`,
    );
  }
}

async function main() {
  console.log(`API: ${API_URL}\n`);
  const token = await login(SEED_ADMIN_EMAIL, getSeedAdminPassword());

  console.log('1. GET /booking-items (paginated list)');
  const list = await request('GET', '/booking-items?page=1&limit=5', { token });
  assertStatus('GET /booking-items', list.status, 200);
  if (!Array.isArray(list.data?.data)) {
    throw new Error('Expected paginated data array');
  }
  if (!list.data?.meta?.totalPages) {
    throw new Error('Expected meta.totalPages');
  }

  const first = list.data.data[0];
  if (first) {
    assertEnrichment(first);
    console.log(
      `  OK first row type=${first.itemType} booking=${first.bookingId.slice(0, 8)}`,
    );

    console.log(`2. GET /booking-items?itemType=${first.itemType}`);
    const byType = await request(
      'GET',
      `/booking-items?itemType=${first.itemType}&limit=10`,
      { token },
    );
    assertStatus('GET by itemType', byType.status, 200);
    for (const row of byType.data?.data ?? []) {
      if (row.itemType !== first.itemType) {
        throw new Error(`Expected itemType ${first.itemType}, got ${row.itemType}`);
      }
    }

    console.log(`3. GET /booking-items?status=${first.bookingStatus}`);
    const byStatus = await request(
      'GET',
      `/booking-items?status=${first.bookingStatus}&limit=10`,
      { token },
    );
    assertStatus('GET by booking status', byStatus.status, 200);
    for (const row of byStatus.data?.data ?? []) {
      if (row.bookingStatus !== first.bookingStatus) {
        throw new Error(
          `Expected bookingStatus ${first.bookingStatus}, got ${row.bookingStatus}`,
        );
      }
    }

    console.log(`4. GET /booking-items?bookingId=${first.bookingId}`);
    const byBooking = await request(
      'GET',
      `/booking-items?bookingId=${first.bookingId}&limit=10`,
      { token },
    );
    assertStatus('GET by bookingId', byBooking.status, 200);
    const rows = byBooking.data?.data ?? [];
    if (rows.length === 0) {
      throw new Error('Expected at least one row for bookingId filter');
    }
    for (const row of rows) {
      if (row.bookingId !== first.bookingId) {
        throw new Error(`Expected bookingId ${first.bookingId}, got ${row.bookingId}`);
      }
    }
  } else {
    console.log('  OK empty list (no booking items yet) — skip filter checks');
  }

  console.log('5. GET /booking-items without token (expect 401)');
  const noAuth = await request('GET', '/booking-items');
  assertStatus('GET without auth', noAuth.status, 401);

  console.log('\nAll booking items list checks passed.');
}

main().catch((err) => {
  console.error('\nBooking items list test failed:', err.message);
  process.exit(1);
});
