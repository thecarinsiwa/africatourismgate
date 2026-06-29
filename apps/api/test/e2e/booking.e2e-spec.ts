import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { apiPath, authHeader, loginAsSeedAdmin } from './auth-client';
import { BOOKING_E2E_DATE, SEED_ROOM_ID } from './constants';
import { createE2eApp } from './create-app';

const ASSISTED_BOOKING_E2E_DATE = '2099-08-21';

const checkoutBody = {
  items: [
    {
      itemType: 'room',
      referenceId: SEED_ROOM_ID,
      startDate: BOOKING_E2E_DATE,
      endDate: BOOKING_E2E_DATE,
      quantity: 1,
    },
  ],
  currency: 'USD',
};

describe('Bookings (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    app = await createE2eApp();
    ({ accessToken } = await loginAsSeedAdmin(app));
    await ensureRoomAvailability(app, accessToken);
  }, 120_000);

  afterAll(async () => {
    await app.close();
  });

  it('POST /bookings/checkout-preview returns pricing', async () => {
    const res = await request(app.getHttpServer())
      .post(apiPath('/bookings/checkout-preview'))
      .set(authHeader(accessToken))
      .send(checkoutBody)
      .expect(201);

    expect(res.body.subtotalCents).toBe(9000);
    expect(res.body.totalCents).toBe(9000);
    expect(res.body.currency).toBe('USD');
  });

  it('POST /bookings creates pending_payment booking (mock checkout)', async () => {
    const res = await request(app.getHttpServer())
      .post(apiPath('/bookings'))
      .set(authHeader(accessToken))
      .send(checkoutBody)
      .expect(201);

    expect(res.body.booking?.id).toEqual(expect.any(String));
    expect(res.body.booking?.status).toBe('pending_payment');
    expect(res.body.booking?.totalCents).toBe(9000);
    expect(res.body.items?.length).toBeGreaterThan(0);
  });

  it('POST /bookings/checkout-preview rejects overbooking', async () => {
    await request(app.getHttpServer())
      .post(apiPath('/bookings/checkout-preview'))
      .set(authHeader(accessToken))
      .send({
        ...checkoutBody,
        items: [{ ...checkoutBody.items[0], quantity: 99 }],
      })
      .expect(400);
  });

  it('POST /bookings/request creates pending_approval without stock decrement or payment', async () => {
    const assistedBody = {
      items: [
        {
          itemType: 'room',
          referenceId: SEED_ROOM_ID,
          startDate: ASSISTED_BOOKING_E2E_DATE,
          endDate: ASSISTED_BOOKING_E2E_DATE,
          quantity: 1,
        },
      ],
      currency: 'USD',
    };

    await ensureRoomAvailabilityForDate(app, accessToken, ASSISTED_BOOKING_E2E_DATE, 3);

    const availabilityBefore = await getRoomAvailabilityUnits(
      app,
      accessToken,
      ASSISTED_BOOKING_E2E_DATE,
    );

    const res = await request(app.getHttpServer())
      .post(apiPath('/bookings/request'))
      .set(authHeader(accessToken))
      .send(assistedBody)
      .expect(201);

    expect(res.body.bookingId).toEqual(expect.any(String));
    expect(res.body.status).toBe('pending_approval');
    expect(res.body.message).toBe('Demande enregistrée — en attente de validation');
    expect(res.body.totalCents).toBe(9000);
    expect(res.body.currency).toBe('USD');

    const availabilityAfter = await getRoomAvailabilityUnits(
      app,
      accessToken,
      ASSISTED_BOOKING_E2E_DATE,
    );
    expect(availabilityAfter).toBe(availabilityBefore);

    const detail = await request(app.getHttpServer())
      .get(apiPath(`/bookings/${res.body.bookingId}`))
      .set(authHeader(accessToken))
      .expect(200);

    expect(detail.body.booking?.status).toBe('pending_approval');
    expect(detail.body.items?.length).toBe(1);
    expect(detail.body.payments ?? []).toHaveLength(0);
    expect(
      (detail.body.statusHistory ?? []).some(
        (entry: { toStatus?: string }) => entry.toStatus === 'pending_approval',
      ),
    ).toBe(true);
  });
});

async function ensureRoomAvailability(
  app: INestApplication,
  token: string,
): Promise<void> {
  await ensureRoomAvailabilityForDate(app, token, BOOKING_E2E_DATE, 2);
}

async function ensureRoomAvailabilityForDate(
  app: INestApplication,
  token: string,
  date: string,
  units: number,
): Promise<void> {
  const list = await request(app.getHttpServer())
    .get(apiPath('/room-availability'))
    .query({
      roomId: SEED_ROOM_ID,
      dateFrom: date,
      dateTo: date,
    })
    .set(authHeader(token));

  if (list.status !== 200) {
    throw new Error(`room-availability list failed: ${list.status}`);
  }

  const row = (list.body?.data ?? []).find((r: { date?: string }) =>
    r.date?.startsWith(date),
  );

  if (row) {
    if (row.availableUnits < units) {
      await request(app.getHttpServer())
        .patch(apiPath(`/room-availability/${row.id}`))
        .set(authHeader(token))
        .send({ availableUnits: units })
        .expect(200);
    }
    return;
  }

  await request(app.getHttpServer())
    .post(apiPath('/room-availability'))
    .set(authHeader(token))
    .send({
      roomId: SEED_ROOM_ID,
      date,
      availableUnits: units,
      priceCents: 9000,
    })
    .expect(201);
}

async function getRoomAvailabilityUnits(
  app: INestApplication,
  token: string,
  date: string,
): Promise<number> {
  const list = await request(app.getHttpServer())
    .get(apiPath('/room-availability'))
    .query({
      roomId: SEED_ROOM_ID,
      dateFrom: date,
      dateTo: date,
    })
    .set(authHeader(token))
    .expect(200);

  const row = (list.body?.data ?? []).find((r: { date?: string }) =>
    r.date?.startsWith(date),
  );
  if (!row) {
    throw new Error(`room availability not found for ${date}`);
  }
  return row.availableUnits as number;
}
