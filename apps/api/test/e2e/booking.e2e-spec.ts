import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { apiPath, authHeader, loginAsSeedAdmin } from './auth-client';
import { BOOKING_E2E_DATE, SEED_ROOM_ID } from './constants';
import { createE2eApp } from './create-app';

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
});

async function ensureRoomAvailability(
  app: INestApplication,
  token: string,
): Promise<void> {
  const list = await request(app.getHttpServer())
    .get(apiPath('/room-availability'))
    .query({
      roomId: SEED_ROOM_ID,
      dateFrom: BOOKING_E2E_DATE,
      dateTo: BOOKING_E2E_DATE,
    })
    .set(authHeader(token));

  if (list.status !== 200) {
    throw new Error(`room-availability list failed: ${list.status}`);
  }

  const row = (list.body?.data ?? []).find((r: { date?: string }) =>
    r.date?.startsWith(BOOKING_E2E_DATE),
  );

  if (row) {
    if (row.availableUnits < 2) {
      await request(app.getHttpServer())
        .patch(apiPath(`/room-availability/${row.id}`))
        .set(authHeader(token))
        .send({ availableUnits: 2 })
        .expect(200);
    }
    return;
  }

  await request(app.getHttpServer())
    .post(apiPath('/room-availability'))
    .set(authHeader(token))
    .send({
      roomId: SEED_ROOM_ID,
      date: BOOKING_E2E_DATE,
      availableUnits: 2,
      priceCents: 9000,
    })
    .expect(201);
}
