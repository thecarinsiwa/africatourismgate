import type { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Server } from 'node:http';
import request from 'supertest';
import { Repository } from 'typeorm';
import { newId } from '../../src/common/utils/uuid';
import { Payments } from '../../src/entities/generated';
import {
  STRIPE_METADATA_BOOKING_ID,
  STRIPE_METADATA_PAYMENT_ID,
} from '../../src/modules/stripe/stripe.constants';
import { apiPath, authHeader, loginAsSeedAdmin, registerAndLoginCustomer } from './auth-client';
import { SEED_ROOM_ID } from './constants';
import { createE2eApp } from './create-app';
import {
  buildSignedStripeWebhookRequest,
  paymentIntentSucceededEvent,
} from './stripe-webhook.util';

const E2E_DATE = '2099-10-01';

describe('Stripe booking confirmation (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let customerToken: string;

  beforeAll(async () => {
    app = await createE2eApp();
    ({ accessToken: adminToken } = await loginAsSeedAdmin(app));
    customerToken = await registerAndLoginCustomer(app, {
      email: `stripe-confirm-e2e-${Date.now()}@example.com`,
      password: 'ChangeMe123!',
      firstName: 'Stripe',
      lastName: 'Payer',
    });
    await ensureRoomAvailabilityForDate(app, adminToken, E2E_DATE, 2);
  }, 120_000);

  afterAll(async () => {
    await app.close();
  });

  it('payment_intent.succeeded webhook confirms pending_payment booking', async () => {
    const created = await request(app.getHttpServer())
      .post(apiPath('/bookings/request'))
      .set(authHeader(customerToken))
      .send({
        items: [
          {
            itemType: 'room',
            referenceId: SEED_ROOM_ID,
            startDate: E2E_DATE,
            endDate: E2E_DATE,
            quantity: 1,
          },
        ],
        currency: 'USD',
        preferredPaymentMethod: 'stripe',
      })
      .expect(201);

    const bookingId = created.body.bookingId as string;

    await request(app.getHttpServer())
      .post(apiPath(`/bookings/${bookingId}/approve`))
      .set(authHeader(adminToken))
      .send({ totalCents: 8500 })
      .expect(201);

    const paymentId = newId();
    const paymentIntentId = `pi_e2e_${paymentId.slice(0, 8)}`;
    const paymentsRepo = app.get<Repository<Payments>>(getRepositoryToken(Payments));
    await paymentsRepo.save({
      id: paymentId,
      bookingId,
      amountCents: 8500,
      currency: 'USD',
      status: 'pending',
      provider: 'stripe',
      externalId: paymentIntentId,
      createdByUserId: null,
      updatedByUserId: null,
      deletedByUserId: null,
      deletedAt: null,
    } as Payments);

    const payload = paymentIntentSucceededEvent({
      id: paymentIntentId,
      object: 'payment_intent',
      status: 'succeeded',
      amount: 8500,
      currency: 'usd',
      metadata: {
        [STRIPE_METADATA_BOOKING_ID]: bookingId,
        [STRIPE_METADATA_PAYMENT_ID]: paymentId,
      },
    });
    const { signature } = buildSignedStripeWebhookRequest(payload);

    const webhookRes = await postRawWebhook(app.getHttpServer(), payload, signature);
    expect(webhookRes.status).toBe(200);

    const detail = await request(app.getHttpServer())
      .get(apiPath(`/bookings/${bookingId}`))
      .set(authHeader(customerToken))
      .expect(200);

    expect(detail.body.booking?.status).toBe('confirmed');

    const payments = await paymentsRepo.find({
      where: { bookingId, id: paymentId },
    });
    expect(payments[0]?.status).toBe('succeeded');
  });

  it('POST /bookings/:id/sync-payment is idempotent when booking already confirmed', async () => {
    const created = await request(app.getHttpServer())
      .post(apiPath('/bookings/request'))
      .set(authHeader(customerToken))
      .send({
        items: [
          {
            itemType: 'room',
            referenceId: SEED_ROOM_ID,
            startDate: E2E_DATE,
            endDate: E2E_DATE,
            quantity: 1,
          },
        ],
        currency: 'USD',
        preferredPaymentMethod: 'stripe',
      })
      .expect(201);

    const bookingId = created.body.bookingId as string;

    await request(app.getHttpServer())
      .post(apiPath(`/bookings/${bookingId}/approve`))
      .set(authHeader(adminToken))
      .send({ totalCents: 7200 })
      .expect(201);

    const paymentId = newId();
    const paymentIntentId = `pi_e2e_sync_${paymentId.slice(0, 8)}`;
    const paymentsRepo = app.get<Repository<Payments>>(getRepositoryToken(Payments));
    await paymentsRepo.save({
      id: paymentId,
      bookingId,
      amountCents: 7200,
      currency: 'USD',
      status: 'pending',
      provider: 'stripe',
      externalId: paymentIntentId,
      createdByUserId: null,
      updatedByUserId: null,
      deletedByUserId: null,
      deletedAt: null,
    } as Payments);

    const payload = paymentIntentSucceededEvent({
      id: paymentIntentId,
      object: 'payment_intent',
      status: 'succeeded',
      amount: 7200,
      currency: 'usd',
      metadata: {
        [STRIPE_METADATA_BOOKING_ID]: bookingId,
        [STRIPE_METADATA_PAYMENT_ID]: paymentId,
      },
    });
    const { signature } = buildSignedStripeWebhookRequest(payload);
    const webhookRes = await postRawWebhook(app.getHttpServer(), payload, signature);
    expect(webhookRes.status).toBe(200);

    const synced = await request(app.getHttpServer())
      .post(apiPath(`/bookings/${bookingId}/sync-payment`))
      .set(authHeader(customerToken))
      .expect(201);

    expect(synced.body.booking?.status).toBe('confirmed');
  });
});

async function postRawWebhook(
  server: Server,
  payload: string,
  signature: string,
): Promise<request.Response> {
  return request(server)
    .post(apiPath('/stripe/webhook'))
    .set('Content-Type', 'application/json')
    .set('stripe-signature', signature)
    .send(payload);
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
