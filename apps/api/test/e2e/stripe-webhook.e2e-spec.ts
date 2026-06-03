import type { INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';
import request from 'supertest';
import { apiPath } from './auth-client';
import { DEFAULT_STRIPE_WEBHOOK_E2E_SECRET } from './constants';
import { createE2eApp } from './create-app';
import {
  buildSignedStripeWebhookRequest,
  paymentIntentSucceededEvent,
} from './stripe-webhook.util';

describe('Stripe webhook (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.STRIPE_SECRET_KEY =
      process.env.STRIPE_SECRET_KEY?.trim() || 'sk_test_e2e_placeholder';
    process.env.STRIPE_WEBHOOK_SECRET = DEFAULT_STRIPE_WEBHOOK_E2E_SECRET;
    app = await createE2eApp();
  }, 120_000);

  afterAll(async () => {
    await app.close();
  });

  it('POST /stripe/webhook rejects missing stripe-signature', async () => {
    await request(app.getHttpServer())
      .post(apiPath('/stripe/webhook'))
      .set('Content-Type', 'application/json')
      .send('{}')
      .expect(400);
  });

  it('POST /stripe/webhook rejects invalid signature', async () => {
    const payload = paymentIntentSucceededEvent({
      id: 'pi_invalid_e2e',
      object: 'payment_intent',
      status: 'succeeded',
      amount: 9000,
      currency: 'usd',
      metadata: {},
    });

    await request(app.getHttpServer())
      .post(apiPath('/stripe/webhook'))
      .set('Content-Type', 'application/json')
      .set('stripe-signature', 't=0,v1=invalid')
      .send(payload)
      .expect(400);
  });

  it('POST /stripe/webhook accepts signed payment_intent.succeeded mock (no metadata)', async () => {
    const payload = paymentIntentSucceededEvent({
      id: 'pi_mock_e2e_no_metadata',
      object: 'payment_intent',
      status: 'succeeded',
      amount: 9000,
      currency: 'usd',
      metadata: {},
    });
    const { signature } = buildSignedStripeWebhookRequest(payload);

    const res = await postRawWebhook(app.getHttpServer(), payload, signature);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ received: true });
  });
});

/** Preserves exact bytes for Stripe signature verification (supertest may re-serialize JSON). */
async function postRawWebhook(
  server: Server,
  payload: string,
  signature: string,
): Promise<{ status: number; body: { received: boolean } }> {
  const res = await request(server)
    .post(apiPath('/stripe/webhook'))
    .set('Content-Type', 'application/json')
    .set('stripe-signature', signature)
    .send(payload);

  return { status: res.status, body: res.body };
}
