/**
 * Mixed booking: room + activity_schedule — stock allocate on create, restore on cancel.
 * Run: pnpm --filter @africatourismgate/api test:bookings-polymorphic
 */
import { randomUUID } from 'node:crypto';
import { loadEnv } from './lib/load-env.mjs';
import { SEED_ADMIN_EMAIL, getSeedAdminPassword } from './lib/test-credentials.mjs';

loadEnv();

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api').replace(
  /\/$/,
  '',
);
const SEED_ROOM_ID = '00000000-0000-4000-8000-000000002011';
const SEED_DESTINATION_ID = '00000000-0000-4000-8000-000000002001';
const TEST_DATE = '2099-08-15';

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
  let roomAvailabilityId;
  let initialRoomUnits;
  let providerId;
  let activityId;
  let scheduleId;
  let initialBookedCount = 0;
  let bookingId;

  console.log('0. Room availability for mixed test');
  const existing = await request(
    'GET',
    `/room-availability?roomId=${SEED_ROOM_ID}&dateFrom=${TEST_DATE}&dateTo=${TEST_DATE}`,
    { token },
  );
  assertStatus('GET room-availability', existing.status, 200);
  const roomRow = existing.data?.data?.find((r) => r.date?.startsWith(TEST_DATE));
  if (roomRow) {
    roomAvailabilityId = roomRow.id;
    initialRoomUnits = roomRow.availableUnits;
    if (initialRoomUnits < 2) {
      const patch = await request('PATCH', `/room-availability/${roomAvailabilityId}`, {
        token,
        body: { availableUnits: 2 },
      });
      assertStatus('PATCH room-availability', patch.status, 200);
      initialRoomUnits = 2;
    }
  } else {
    const create = await request('POST', '/room-availability', {
      token,
      body: {
        roomId: SEED_ROOM_ID,
        date: TEST_DATE,
        availableUnits: 2,
        priceCents: 9000,
      },
    });
    assertStatus('POST room-availability', create.status, 201);
    roomAvailabilityId = create.data?.id;
    initialRoomUnits = 2;
  }

  console.log('1. Activity catalog for schedule item');
  const createProvider = await request('POST', '/activity-providers', {
    token,
    body: {
      destinationId: SEED_DESTINATION_ID,
      name: `Booking Mix Provider ${suffix}`,
    },
  });
  assertStatus('POST activity-provider', createProvider.status, 201);
  providerId = createProvider.data?.id;

  const createActivity = await request('POST', '/activities', {
    token,
    body: {
      providerId,
      title: `Booking Mix Activity ${suffix}`,
      durationMinutes: 60,
      priceCents: 5000,
      currency: 'USD',
    },
  });
  assertStatus('POST activity', createActivity.status, 201);
  activityId = createActivity.data?.id;

  const slotStart = new Date('2099-09-01T10:00:00.000Z').toISOString();
  const createSchedule = await request('POST', '/activity-schedules', {
    token,
    body: {
      activityId,
      startDatetime: slotStart,
      capacity: 10,
    },
  });
  assertStatus('POST activity-schedule', createSchedule.status, 201);
  scheduleId = createSchedule.data?.id;
  initialBookedCount = createSchedule.data?.bookedCount ?? 0;

  const mixedBody = {
    currency: 'USD',
    items: [
      {
        itemType: 'room',
        referenceId: SEED_ROOM_ID,
        startDate: TEST_DATE,
        endDate: TEST_DATE,
        quantity: 1,
      },
      {
        itemType: 'activity_schedule',
        referenceId: scheduleId,
        quantity: 2,
      },
    ],
  };

  console.log('2. POST /bookings/checkout-preview (mixed)');
  const preview = await request('POST', '/bookings/checkout-preview', {
    token,
    body: mixedBody,
  });
  assertStatus('POST checkout-preview', preview.status, 200);
  const lineTypes = new Set((preview.data?.lines ?? []).map((l) => l.itemType));
  if (!lineTypes.has('room') || !lineTypes.has('activity_schedule')) {
    throw new Error(`Preview missing line types: ${[...lineTypes].join(', ')}`);
  }
  const expectedTotal = 9000 + 2 * 5000;
  if (preview.data?.totalCents !== expectedTotal) {
    throw new Error(`Expected total ${expectedTotal}, got ${preview.data?.totalCents}`);
  }
  console.log(`  OK preview totalCents=${preview.data.totalCents}`);

  console.log('3. POST /bookings (mixed create)');
  const createBooking = await request('POST', '/bookings', {
    token,
    body: mixedBody,
  });
  assertStatus('POST /bookings', createBooking.status, 201);
  bookingId = createBooking.data?.booking?.id;
  const itemTypes = new Set((createBooking.data?.items ?? []).map((i) => i.itemType));
  if (itemTypes.size !== 2) {
    throw new Error(`Expected 2 item types, got ${[...itemTypes].join(', ')}`);
  }
  if (createBooking.data?.booking?.totalCents !== expectedTotal) {
    throw new Error(`Booking total mismatch: ${createBooking.data?.booking?.totalCents}`);
  }

  console.log('4. Verify room stock decremented');
  const afterRoom = await request(
    'GET',
    `/room-availability?roomId=${SEED_ROOM_ID}&dateFrom=${TEST_DATE}&dateTo=${TEST_DATE}`,
    { token },
  );
  const roomAfter = afterRoom.data?.data?.find((r) => r.id === roomAvailabilityId);
  if (!roomAfter || roomAfter.availableUnits !== initialRoomUnits - 1) {
    throw new Error(
      `Room stock: expected ${initialRoomUnits - 1}, got ${roomAfter?.availableUnits}`,
    );
  }
  console.log(`  OK room units ${initialRoomUnits} → ${roomAfter.availableUnits}`);

  console.log('5. Verify activity bookedCount incremented');
  const schedAfter = await request('GET', `/activity-schedules/${scheduleId}`, { token });
  assertStatus('GET activity-schedule', schedAfter.status, 200);
  if (schedAfter.data?.bookedCount !== initialBookedCount + 2) {
    throw new Error(
      `Activity bookedCount: expected ${initialBookedCount + 2}, got ${schedAfter.data?.bookedCount}`,
    );
  }
  console.log(
    `  OK activity bookedCount ${initialBookedCount} → ${schedAfter.data.bookedCount}`,
  );

  console.log('6. POST /bookings/:id/cancel');
  const cancel = await request('POST', `/bookings/${bookingId}/cancel`, { token });
  assertStatus('POST cancel', cancel.status, 201);

  console.log('7. Verify stock restored (room + activity)');
  const roomRestored = await request(
    'GET',
    `/room-availability?roomId=${SEED_ROOM_ID}&dateFrom=${TEST_DATE}&dateTo=${TEST_DATE}`,
    { token },
  );
  const roomFinal = roomRestored.data?.data?.find((r) => r.id === roomAvailabilityId);
  if (!roomFinal || roomFinal.availableUnits !== initialRoomUnits) {
    throw new Error(
      `Room not restored: expected ${initialRoomUnits}, got ${roomFinal?.availableUnits}`,
    );
  }

  const schedRestored = await request('GET', `/activity-schedules/${scheduleId}`, { token });
  if (schedRestored.data?.bookedCount !== initialBookedCount) {
    throw new Error(
      `Activity not restored: expected ${initialBookedCount}, got ${schedRestored.data?.bookedCount}`,
    );
  }
  console.log('  OK room and activity stock restored');

  console.log('8. Cleanup activity catalog');
  await request('DELETE', `/activity-schedules/${scheduleId}`, { token });
  await request('DELETE', `/activities/${activityId}`, { token });
  await request('DELETE', `/activity-providers/${providerId}`, { token });

  console.log('\nAll polymorphic mixed booking checks passed.');
}

main().catch((err) => {
  console.error('\nPolymorphic booking test failed:', err.message);
  process.exit(1);
});
