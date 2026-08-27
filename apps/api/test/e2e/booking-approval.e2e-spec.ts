import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { apiPath, authHeader, loginAsSeedAdmin, registerAndLoginCustomer } from './auth-client';
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
  preferredPaymentMethod: 'stripe' as const,
});

describe('Booking approval (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let customerToken: string;

  beforeAll(async () => {
    app = await createE2eApp();
    ({ accessToken: adminToken } = await loginAsSeedAdmin(app));
    customerToken = await registerAndLoginCustomer(app, {
      email: `booking-approval-e2e-${Date.now()}@example.com`,
      password: 'ChangeMe123!',
      firstName: 'Approval',
      lastName: 'Customer',
    });
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

  it('POST package assisted request approves after schedules exist on requested date', async () => {
    const PACKAGE_ID = '00000000-0000-4000-8000-000000005001';
    const startDate = '2026-07-20';
    const endDate = '2026-07-21';

    const created = await request(app.getHttpServer())
      .post(apiPath('/bookings/request'))
      .set(authHeader(customerToken))
      .send({
        packageId: PACKAGE_ID,
        currency: 'USD',
        preferredPaymentMethod: 'stripe',
        items: [
          {
            itemType: 'package',
            referenceId: PACKAGE_ID,
            quantity: 2,
            startDate,
            endDate,
          },
        ],
      })
      .expect(201);

    const bookingId = created.body.bookingId as string;

    const approved = await request(app.getHttpServer())
      .post(apiPath(`/bookings/${bookingId}/approve`))
      .set(authHeader(adminToken))
      .send({})
      .expect(201);

    expect(approved.body.booking?.status).toBe('pending_payment');
  });

  it('POST package assisted request cannot approve without schedules for date', async () => {
    const PACKAGE_ID = '00000000-0000-4000-8000-000000005001';

    const created = await request(app.getHttpServer())
      .post(apiPath('/bookings/request'))
      .set(authHeader(customerToken))
      .send({
        packageId: PACKAGE_ID,
        currency: 'USD',
        preferredPaymentMethod: 'stripe',
        items: [
          {
            itemType: 'package',
            referenceId: PACKAGE_ID,
            quantity: 2,
            startDate: '2099-12-15',
            endDate: '2099-12-16',
          },
        ],
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(apiPath(`/bookings/${created.body.bookingId}/approve`))
      .set(authHeader(adminToken))
      .send({})
      .expect(400);
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

  it('POST /bookings/:id/approve with travelers creates manifest and sets total to sum', async () => {
    const date = '2099-09-01';
    await ensureRoomAvailabilityForDate(app, adminToken, date, 2);

    const created = await request(app.getHttpServer())
      .post(apiPath('/bookings/request'))
      .set(authHeader(customerToken))
      .send(assistedCheckoutBody(date))
      .expect(201);

    const bookingId = created.body.bookingId as string;

    const approved = await request(app.getHttpServer())
      .post(apiPath(`/bookings/${bookingId}/approve`))
      .set(authHeader(adminToken))
      .send({
        travelers: [
          { fullName: 'Alice Martin', priceCents: 5000 },
          { fullName: 'Bob Martin', priceCents: 3500 },
        ],
      })
      .expect(201);

    expect(approved.body.booking?.status).toBe('pending_payment');
    expect(approved.body.booking?.totalCents).toBe(8500);

    const manifest = await request(app.getHttpServer())
      .get(apiPath(`/bookings/${bookingId}/manifest-entries`))
      .set(authHeader(adminToken))
      .expect(200);

    expect(manifest.body).toHaveLength(2);
    expect(manifest.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fullName: 'Alice Martin', priceCents: 5000 }),
        expect.objectContaining({ fullName: 'Bob Martin', priceCents: 3500 }),
      ]),
    );
  });

  it('POST /bookings/:id/approve with travelers respects totalCents override', async () => {
    const date = '2099-09-02';
    await ensureRoomAvailabilityForDate(app, adminToken, date, 2);

    const created = await request(app.getHttpServer())
      .post(apiPath('/bookings/request'))
      .set(authHeader(customerToken))
      .send(assistedCheckoutBody(date))
      .expect(201);

    const bookingId = created.body.bookingId as string;

    const approved = await request(app.getHttpServer())
      .post(apiPath(`/bookings/${bookingId}/approve`))
      .set(authHeader(adminToken))
      .send({
        travelers: [{ fullName: 'Solo Traveler', priceCents: 6000 }],
        totalCents: 10000,
      })
      .expect(201);

    expect(approved.body.booking?.totalCents).toBe(10000);

    const manifest = await request(app.getHttpServer())
      .get(apiPath(`/bookings/${bookingId}/manifest-entries`))
      .set(authHeader(adminToken))
      .expect(200);

    expect(manifest.body).toHaveLength(1);
    expect(manifest.body[0].priceCents).toBe(6000);
  });

  it('PUT /bookings/:id/pricing updates manifest prices and total in pending_payment', async () => {
    const date = '2099-09-03';
    await ensureRoomAvailabilityForDate(app, adminToken, date, 2);

    const created = await request(app.getHttpServer())
      .post(apiPath('/bookings/request'))
      .set(authHeader(customerToken))
      .send(assistedCheckoutBody(date))
      .expect(201);

    const bookingId = created.body.bookingId as string;

    await request(app.getHttpServer())
      .post(apiPath(`/bookings/${bookingId}/approve`))
      .set(authHeader(adminToken))
      .send({
        travelers: [{ fullName: 'Jean Dupont', priceCents: 4000 }],
      })
      .expect(201);

    const manifestBefore = await request(app.getHttpServer())
      .get(apiPath(`/bookings/${bookingId}/manifest-entries`))
      .set(authHeader(adminToken))
      .expect(200);

    const entryId = manifestBefore.body[0].id as string;

    const updated = await request(app.getHttpServer())
      .put(apiPath(`/bookings/${bookingId}/pricing`))
      .set(authHeader(adminToken))
      .send({
        travelers: [{ id: entryId, priceCents: 5500 }],
      })
      .expect(200);

    expect(updated.body.booking?.totalCents).toBe(5500);

    const manifestAfter = await request(app.getHttpServer())
      .get(apiPath(`/bookings/${bookingId}/manifest-entries`))
      .set(authHeader(adminToken))
      .expect(200);

    expect(manifestAfter.body[0].priceCents).toBe(5500);
  });

  it('PUT /bookings/:id/pricing removes manifest entries omitted from travelers', async () => {
    const date = '2099-09-04';
    await ensureRoomAvailabilityForDate(app, adminToken, date, 2);

    const created = await request(app.getHttpServer())
      .post(apiPath('/bookings/request'))
      .set(authHeader(customerToken))
      .send(assistedCheckoutBody(date))
      .expect(201);

    const bookingId = created.body.bookingId as string;

    await request(app.getHttpServer())
      .post(apiPath(`/bookings/${bookingId}/approve`))
      .set(authHeader(adminToken))
      .send({
        travelers: [
          { fullName: 'Alice Martin', priceCents: 4000 },
          { fullName: 'Bob Martin', priceCents: 4000 },
        ],
      })
      .expect(201);

    const manifestBefore = await request(app.getHttpServer())
      .get(apiPath(`/bookings/${bookingId}/manifest-entries`))
      .set(authHeader(adminToken))
      .expect(200);

    expect(manifestBefore.body).toHaveLength(2);
    const keptId = manifestBefore.body[0].id as string;

    await request(app.getHttpServer())
      .put(apiPath(`/bookings/${bookingId}/pricing`))
      .set(authHeader(adminToken))
      .send({
        travelers: [{ id: keptId, fullName: 'Alice Martin', priceCents: 4200 }],
      })
      .expect(200);

    const manifestAfter = await request(app.getHttpServer())
      .get(apiPath(`/bookings/${bookingId}/manifest-entries`))
      .set(authHeader(adminToken))
      .expect(200);

    expect(manifestAfter.body).toHaveLength(1);
    expect(manifestAfter.body[0].id).toBe(keptId);
    expect(manifestAfter.body[0].fullName).toBe('Alice Martin');
    expect(manifestAfter.body[0].priceCents).toBe(4200);
  });

  it('PUT /bookings/:id/visit-dates updates item dates in pending_approval', async () => {
    const startDate = '2099-09-10';
    const endDate = '2099-09-12';
    const newStartDate = '2099-09-15';
    const expectedEndDate = '2099-09-17';
    await ensureRoomAvailabilityForDate(app, adminToken, startDate, 2);
    await ensureRoomAvailabilityForDate(app, adminToken, '2099-09-11', 2);
    await ensureRoomAvailabilityForDate(app, adminToken, endDate, 2);
    await ensureRoomAvailabilityForDate(app, adminToken, newStartDate, 2);
    await ensureRoomAvailabilityForDate(app, adminToken, '2099-09-16', 2);
    await ensureRoomAvailabilityForDate(app, adminToken, expectedEndDate, 2);

    const created = await request(app.getHttpServer())
      .post(apiPath('/bookings/request'))
      .set(authHeader(customerToken))
      .send({
        items: [
          {
            itemType: 'room',
            referenceId: SEED_ROOM_ID,
            startDate,
            endDate,
            quantity: 1,
          },
        ],
        currency: 'USD',
        preferredPaymentMethod: 'stripe',
      })
      .expect(201);

    const bookingId = created.body.bookingId as string;

    const updated = await request(app.getHttpServer())
      .put(apiPath(`/bookings/${bookingId}/visit-dates`))
      .set(authHeader(adminToken))
      .send({ startDate: newStartDate })
      .expect(200);

    expect(updated.body.items).toHaveLength(3);
    expect(updated.body.items[0]?.startDate).toMatch(new RegExp(`^${newStartDate}`));
    expect(updated.body.items[2]?.startDate).toMatch(new RegExp(`^${expectedEndDate}`));
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
