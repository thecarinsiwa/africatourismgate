import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { apiPath, authHeader, loginAsSeedAdmin } from './auth-client';
import { BOOKING_E2E_DATE, SEED_ROOM_ID } from './constants';
import { createE2eApp } from './create-app';

const MESSAGES_E2E_DATE = '2099-08-22';
const CUSTOMER_EMAIL = `booking-messages-e2e-${Date.now()}@example.com`;
const CUSTOMER_PASSWORD = 'ChangeMe123!';

describe('Booking messages (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let customerToken: string;
  let bookingId: string;

  beforeAll(async () => {
    app = await createE2eApp();
    ({ accessToken: adminToken } = await loginAsSeedAdmin(app));
    customerToken = await registerAndLoginCustomer(app);
    await ensureRoomAvailabilityForDate(app, adminToken, MESSAGES_E2E_DATE, 2);

    const created = await request(app.getHttpServer())
      .post(apiPath('/bookings/request'))
      .set(authHeader(customerToken))
      .send({
        items: [
          {
            itemType: 'room',
            referenceId: SEED_ROOM_ID,
            startDate: MESSAGES_E2E_DATE,
            endDate: MESSAGES_E2E_DATE,
            quantity: 1,
          },
        ],
        currency: 'USD',
      })
      .expect(201);

    bookingId = created.body.bookingId;
  }, 120_000);

  afterAll(async () => {
    await app.close();
  });

  it('customer posts a message (isStaff false)', async () => {
    const res = await request(app.getHttpServer())
      .post(apiPath(`/bookings/${bookingId}/messages`))
      .set(authHeader(customerToken))
      .send({ body: 'Bonjour, pouvez-vous confirmer ma demande ?' })
      .expect(201);

    expect(res.body.id).toEqual(expect.any(String));
    expect(res.body.bookingId).toBe(bookingId);
    expect(res.body.isStaff).toBe(false);
    expect(res.body.body).toContain('confirmer ma demande');
  });

  it('admin replies (isStaff true)', async () => {
    const res = await request(app.getHttpServer())
      .post(apiPath(`/bookings/${bookingId}/messages`))
      .set(authHeader(adminToken))
      .send({ body: 'Bonjour, nous examinons votre demande et revenons vers vous sous 24h.' })
      .expect(201);

    expect(res.body.isStaff).toBe(true);
    expect(res.body.body).toContain('examinons votre demande');
  });

  it('admin reply sets actionRequired until customer reads thread', async () => {
    const listAfterReply = await request(app.getHttpServer())
      .get(apiPath('/bookings'))
      .set(authHeader(customerToken))
      .expect(200);

    const row = (listAfterReply.body.data as Array<{ id: string; actionRequired?: boolean }>).find(
      (item) => item.id === bookingId,
    );
    expect(row?.actionRequired).toBe(true);

    await request(app.getHttpServer())
      .get(apiPath(`/bookings/${bookingId}/messages`))
      .set(authHeader(customerToken))
      .expect(200);

    const listAfterRead = await request(app.getHttpServer())
      .get(apiPath('/bookings'))
      .set(authHeader(customerToken))
      .expect(200);

    const rowAfterRead = (
      listAfterRead.body.data as Array<{ id: string; actionRequired?: boolean }>
    ).find((item) => item.id === bookingId);
    expect(rowAfterRead?.actionRequired).toBe(false);
  });

  it('customer and admin see the full thread', async () => {
    const customerView = await request(app.getHttpServer())
      .get(apiPath(`/bookings/${bookingId}/messages`))
      .set(authHeader(customerToken))
      .expect(200);

    expect(customerView.body.messages).toHaveLength(2);
    expect(customerView.body.messages[0].isStaff).toBe(false);
    expect(customerView.body.messages[1].isStaff).toBe(true);

    const adminView = await request(app.getHttpServer())
      .get(apiPath(`/bookings/${bookingId}/messages`))
      .set(authHeader(adminToken))
      .expect(200);

    expect(adminView.body.messages).toHaveLength(2);
  });

  it('customer cannot read messages on another user booking', async () => {
    const other = await request(app.getHttpServer())
      .post(apiPath('/bookings/request'))
      .set(authHeader(adminToken))
      .send({
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
      })
      .expect(201);

    await request(app.getHttpServer())
      .get(apiPath(`/bookings/${other.body.bookingId}/messages`))
      .set(authHeader(customerToken))
      .expect(403);
  });
});

async function registerAndLoginCustomer(app: INestApplication): Promise<string> {
  await request(app.getHttpServer())
    .post(apiPath('/auth/register/customer'))
    .send({
      email: CUSTOMER_EMAIL,
      password: CUSTOMER_PASSWORD,
      firstName: 'E2E',
      lastName: 'Customer',
    })
    .expect(201);

  const login = await request(app.getHttpServer())
    .post(apiPath('/auth/login'))
    .send({ email: CUSTOMER_EMAIL, password: CUSTOMER_PASSWORD })
    .expect(200);

  if (!login.body.accessToken) {
    throw new Error('Customer login missing accessToken');
  }
  return login.body.accessToken as string;
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
