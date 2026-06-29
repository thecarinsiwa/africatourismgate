import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { apiPath, authHeader, loginAsSeedAdmin } from './auth-client';
import { SEED_ROOM_ID } from './constants';
import { createE2eApp } from './create-app';

const APPROVAL_E2E_DATE = '2099-08-23';
const REJECT_E2E_DATE = '2099-08-24';

const assistedCheckoutBody = (date: string) => ({
  items: [
    {
      itemType: 'room',
      referenceId: SEED_ROOM_ID,
      startDate: date,
      endDate: date,
      quantity: 1,
    },
  ],
  currency: 'USD',
});

describe('Booking approval (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let customerToken: string;

  beforeAll(async () => {
    app = await createE2eApp();
    ({ accessToken: adminToken } = await loginAsSeedAdmin(app));
    customerToken = await registerAndLoginCustomer(app);
    await ensureRoomAvailabilityForDate(app, adminToken, APPROVAL_E2E_DATE, 3);
    await ensureRoomAvailabilityForDate(app, adminToken, REJECT_E2E_DATE, 3);
  }, 120_000);

  afterAll(async () => {
    await app.close();
  });

  it('POST /bookings/:id/approve moves pending_approval to pending_payment and decrements stock', async () => {
    const unitsBefore = await getRoomAvailabilityUnits(
      app,
      adminToken,
      APPROVAL_E2E_DATE,
    );

    const created = await request(app.getHttpServer())
      .post(apiPath('/bookings/request'))
      .set(authHeader(customerToken))
      .send(assistedCheckoutBody(APPROVAL_E2E_DATE))
      .expect(201);

    const bookingId = created.body.bookingId as string;

    const approved = await request(app.getHttpServer())
      .post(apiPath(`/bookings/${bookingId}/approve`))
      .set(authHeader(adminToken))
      .send({ totalCents: 8500, reason: 'Tarif négocié' })
      .expect(201);

    expect(approved.body.booking?.status).toBe('pending_payment');
    expect(approved.body.booking?.totalCents).toBe(8500);
    expect(
      (approved.body.statusHistory ?? []).some(
        (entry: { toStatus?: string }) => entry.toStatus === 'pending_payment',
      ),
    ).toBe(true);

    const unitsAfter = await getRoomAvailabilityUnits(
      app,
      adminToken,
      APPROVAL_E2E_DATE,
    );
    expect(unitsAfter).toBe(unitsBefore - 1);
  });

  it('POST /bookings/:id/reject cancels pending_approval without stock change', async () => {
    const unitsBefore = await getRoomAvailabilityUnits(
      app,
      adminToken,
      REJECT_E2E_DATE,
    );

    const created = await request(app.getHttpServer())
      .post(apiPath('/bookings/request'))
      .set(authHeader(customerToken))
      .send(assistedCheckoutBody(REJECT_E2E_DATE))
      .expect(201);

    const bookingId = created.body.bookingId as string;

    const rejected = await request(app.getHttpServer())
      .post(apiPath(`/bookings/${bookingId}/reject`))
      .set(authHeader(adminToken))
      .send({ reason: 'Dates indisponibles' })
      .expect(201);

    expect(rejected.body.booking?.status).toBe('cancelled');
    expect(
      (rejected.body.statusHistory ?? []).some(
        (entry: { reason?: string }) => entry.reason?.includes('Refus'),
      ),
    ).toBe(true);

    const unitsAfter = await getRoomAvailabilityUnits(
      app,
      adminToken,
      REJECT_E2E_DATE,
    );
    expect(unitsAfter).toBe(unitsBefore);
  });

  it('rejects approve when status is not pending_approval', async () => {
    await ensureRoomAvailabilityForDate(app, adminToken, '2099-08-25', 2);

    const created = await request(app.getHttpServer())
      .post(apiPath('/bookings/request'))
      .set(authHeader(customerToken))
      .send(assistedCheckoutBody('2099-08-25'))
      .expect(201);

    const bookingId = created.body.bookingId as string;
    await request(app.getHttpServer())
      .post(apiPath(`/bookings/${bookingId}/approve`))
      .set(authHeader(adminToken))
      .send({})
      .expect(201);

    await request(app.getHttpServer())
      .post(apiPath(`/bookings/${bookingId}/approve`))
      .set(authHeader(adminToken))
      .send({})
      .expect(400);
  });

  it('customer cannot approve assisted booking', async () => {
    await ensureRoomAvailabilityForDate(app, adminToken, '2099-08-26', 2);

    const created = await request(app.getHttpServer())
      .post(apiPath('/bookings/request'))
      .set(authHeader(customerToken))
      .send(assistedCheckoutBody('2099-08-26'))
      .expect(201);

    await request(app.getHttpServer())
      .post(apiPath(`/bookings/${created.body.bookingId}/approve`))
      .set(authHeader(customerToken))
      .send({})
      .expect(403);
  });

  it('POST /bookings/:id/invite-payment requires pending_payment', async () => {
    await ensureRoomAvailabilityForDate(app, adminToken, '2099-08-27', 2);

    const created = await request(app.getHttpServer())
      .post(apiPath('/bookings/request'))
      .set(authHeader(customerToken))
      .send(assistedCheckoutBody('2099-08-27'))
      .expect(201);

    await request(app.getHttpServer())
      .post(apiPath(`/bookings/${created.body.bookingId}/invite-payment`))
      .set(authHeader(adminToken))
      .expect(400);
  });
});

async function registerAndLoginCustomer(app: INestApplication): Promise<string> {
  const email = `booking-approval-e2e-${Date.now()}@example.com`;
  await request(app.getHttpServer())
    .post(apiPath('/auth/register/customer'))
    .send({
      email,
      password: 'ChangeMe123!',
      firstName: 'Approval',
      lastName: 'Customer',
    })
    .expect(201);

  const login = await request(app.getHttpServer())
    .post(apiPath('/auth/login'))
    .send({ email, password: 'ChangeMe123!' })
    .expect(200);

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
    .query({ roomId: SEED_ROOM_ID, dateFrom: date, dateTo: date })
    .set(authHeader(token));

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
    .query({ roomId: SEED_ROOM_ID, dateFrom: date, dateTo: date })
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
