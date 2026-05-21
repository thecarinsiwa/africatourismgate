/**
 * Activity providers + activities + schedules CRUD (requires API on :3000 and seeded DB).
 * Run: pnpm --filter @africatourismgate/api test:activities
 */
import { randomUUID } from 'node:crypto';
import { loadEnv } from './lib/load-env.mjs';
import { SEED_ADMIN_EMAIL, getSeedAdminPassword } from './lib/test-credentials.mjs';

loadEnv();

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api').replace(
  /\/$/,
  '',
);
const SEED_DESTINATION_ID = '00000000-0000-4000-8000-000000002001';

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
  let providerId;
  let activityId;
  let scheduleId1;
  let scheduleId2;

  console.log('1. POST /activity-providers');
  const createProvider = await request('POST', '/activity-providers', {
    token,
    body: {
      destinationId: SEED_DESTINATION_ID,
      name: `Test Provider ${suffix}`,
    },
  });
  assertStatus('POST /activity-providers', createProvider.status, 201);
  providerId = createProvider.data?.id;
  if (!providerId) throw new Error('Create provider missing id');

  console.log('2. GET /activity-providers?destinationId=' + SEED_DESTINATION_ID);
  const providerList = await request(
    'GET',
    `/activity-providers?destinationId=${SEED_DESTINATION_ID}`,
    { token },
  );
  assertStatus('GET /activity-providers filtered', providerList.status, 200);
  if (!providerList.data?.data?.some((p) => p.id === providerId)) {
    throw new Error('Provider list filter did not return created provider');
  }

  console.log('3. POST /activities');
  const createActivity = await request('POST', '/activities', {
    token,
    body: {
      providerId,
      title: `Test Activity ${suffix}`,
      description: 'Integration test activity',
      durationMinutes: 90,
      priceCents: 12500,
      currency: 'USD',
    },
  });
  assertStatus('POST /activities', createActivity.status, 201);
  activityId = createActivity.data?.id;
  if (!activityId) throw new Error('Create activity missing id');

  console.log('4. GET /activities?destinationId=' + SEED_DESTINATION_ID);
  const activityList = await request(
    'GET',
    `/activities?destinationId=${SEED_DESTINATION_ID}`,
    { token },
  );
  assertStatus('GET /activities filtered', activityList.status, 200);
  if (!activityList.data?.data?.some((a) => a.id === activityId)) {
    throw new Error('Activity list filter did not return created activity');
  }

  console.log('5. POST /activity-schedules (créneau 1)');
  const slot1Start = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const createSched1 = await request('POST', '/activity-schedules', {
    token,
    body: {
      activityId,
      startDatetime: slot1Start,
      capacity: 12,
    },
  });
  assertStatus('POST /activity-schedules #1', createSched1.status, 201);
  scheduleId1 = createSched1.data?.id;
  if (!scheduleId1) throw new Error('Create schedule 1 missing id');
  if (createSched1.data?.bookedCount !== 0) {
    throw new Error('New schedule should have bookedCount 0');
  }

  console.log('6. POST /activity-schedules (créneau 2)');
  const slot2Start = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString();
  const createSched2 = await request('POST', '/activity-schedules', {
    token,
    body: {
      activityId,
      startDatetime: slot2Start,
      capacity: 8,
    },
  });
  assertStatus('POST /activity-schedules #2', createSched2.status, 201);
  scheduleId2 = createSched2.data?.id;
  if (!scheduleId2) throw new Error('Create schedule 2 missing id');

  console.log('7. GET /activity-schedules?activityId=' + activityId);
  const schedList = await request(
    'GET',
    `/activity-schedules?activityId=${activityId}`,
    { token },
  );
  assertStatus('GET /activity-schedules filtered', schedList.status, 200);
  const ids = new Set(schedList.data?.data?.map((s) => s.id) ?? []);
  if (!ids.has(scheduleId1) || !ids.has(scheduleId2)) {
    throw new Error('Schedule list did not return both créneaux');
  }

  console.log('8. PATCH /activities/:id');
  const patchActivity = await request('PATCH', `/activities/${activityId}`, {
    token,
    body: { title: `Test Activity Updated ${suffix}` },
  });
  assertStatus('PATCH /activities/:id', patchActivity.status, 200);

  console.log('9. PATCH /activity-providers/:id');
  const patchProvider = await request('PATCH', `/activity-providers/${providerId}`, {
    token,
    body: { name: `Test Provider Updated ${suffix}` },
  });
  assertStatus('PATCH /activity-providers/:id', patchProvider.status, 200);

  console.log('10. DELETE schedules, activity, provider');
  assertStatus(
    'DELETE schedule 1',
    (await request('DELETE', `/activity-schedules/${scheduleId1}`, { token })).status,
    200,
  );
  assertStatus(
    'DELETE schedule 2',
    (await request('DELETE', `/activity-schedules/${scheduleId2}`, { token })).status,
    200,
  );
  assertStatus(
    'DELETE activity',
    (await request('DELETE', `/activities/${activityId}`, { token })).status,
    200,
  );
  assertStatus(
    'DELETE provider',
    (await request('DELETE', `/activity-providers/${providerId}`, { token })).status,
    200,
  );

  console.log('\nAll activities CRUD checks passed.');
}

main().catch((err) => {
  console.error('\nActivities CRUD test failed:', err.message);
  process.exit(1);
});
