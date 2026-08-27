import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { apiPath, authHeader, loginAsSeedAdmin, registerAndLoginCustomer } from './auth-client';
import { SEED_ROOM_ID } from './constants';
import { createE2eApp } from './create-app';

const MESSAGES_E2E_DATE = '2099-08-22';
/** Isolated from other e2e suites — availability is ensured in-test, not in beforeAll. */
const OTHER_USER_BOOKING_DATE = '2099-08-25';
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
    customerToken = await registerAndLoginCustomer(app, {
      email: CUSTOMER_EMAIL,
      password: CUSTOMER_PASSWORD,
      firstName: 'E2E',
      lastName: 'Customer',
    });
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
        preferredPaymentMethod: 'stripe',
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
    expect(res.body.authorName).toBe('E2E Customer');
    expect(res.body.body).toContain('confirmer ma demande');

    const adminList = await request(app.getHttpServer())
      .get(apiPath('/bookings'))
      .set(authHeader(adminToken))
      .expect(200);

    const row = (
      adminList.body.data as Array<{ id: string; unreadCustomerMessage?: boolean }>
    ).find((item) => item.id === bookingId);
    expect(row?.unreadCustomerMessage).toBe(true);
  });

  it('admin replies (isStaff true)', async () => {
    const res = await request(app.getHttpServer())
      .post(apiPath(`/bookings/${bookingId}/messages`))
      .set(authHeader(adminToken))
      .send({ body: 'Bonjour, nous examinons votre demande et revenons vers vous sous 24h.' })
      .expect(201);

    expect(res.body.isStaff).toBe(true);
    expect(res.body.body).toContain('examinons votre demande');
    expect(res.body.customerNotifiedByEmail).toBe(true);
  });

  it('admin reply sets actionRequired until customer reads thread', async () => {
    const unreadBeforeRead = await request(app.getHttpServer())
      .get(apiPath(`/bookings/${bookingId}/messages/unread-count`))
      .set(authHeader(customerToken))
      .expect(200);
    expect(unreadBeforeRead.body.count).toBe(1);

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

    const unreadAfterRead = await request(app.getHttpServer())
      .get(apiPath(`/bookings/${bookingId}/messages/unread-count`))
      .set(authHeader(customerToken))
      .expect(200);
    expect(unreadAfterRead.body.count).toBe(0);

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
    expect(customerView.body.messages[0].authorName).toBe('E2E Customer');
    expect(customerView.body.messages[1].isStaff).toBe(true);

    const adminView = await request(app.getHttpServer())
      .get(apiPath(`/bookings/${bookingId}/messages`))
      .set(authHeader(adminToken))
      .expect(200);

    expect(adminView.body.messages).toHaveLength(2);
    expect(adminView.body.messages[0].authorName).toBe('E2E Customer');

    const adminListAfterRead = await request(app.getHttpServer())
      .get(apiPath('/bookings'))
      .set(authHeader(adminToken))
      .expect(200);

    const rowAfterStaffRead = (
      adminListAfterRead.body.data as Array<{ id: string; unreadCustomerMessage?: boolean }>
    ).find((item) => item.id === bookingId);
    expect(rowAfterStaffRead?.unreadCustomerMessage).toBe(false);
  });

  it('customer cannot read messages on another user booking', async () => {
    await ensureRoomAvailabilityForDate(app, adminToken, OTHER_USER_BOOKING_DATE, 1);

    const other = await request(app.getHttpServer())
      .post(apiPath('/bookings/request'))
      .set(authHeader(adminToken))
      .send({
        items: [
          {
            itemType: 'room',
            referenceId: SEED_ROOM_ID,
            startDate: OTHER_USER_BOOKING_DATE,
            endDate: OTHER_USER_BOOKING_DATE,
            quantity: 1,
          },
        ],
        currency: 'USD',
        preferredPaymentMethod: 'stripe',
      })
      .expect(201);

    await request(app.getHttpServer())
      .get(apiPath(`/bookings/${other.body.bookingId}/messages`))
      .set(authHeader(customerToken))
      .expect(403);
  });
});

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
