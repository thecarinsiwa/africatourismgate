import Stripe from 'stripe';
import { DEFAULT_STRIPE_WEBHOOK_E2E_SECRET } from './constants';

function webhookSecret(): string {
  return (
    process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? DEFAULT_STRIPE_WEBHOOK_E2E_SECRET
  );
}

export function buildSignedStripeWebhookRequest(payload: string): {
  payload: string;
  signature: string;
} {
  const stripe = new Stripe('sk_test_e2e_placeholder');
  const signature = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: webhookSecret(),
  });
  return { payload, signature };
}

export function paymentIntentSucceededEvent(intent: Record<string, unknown>): string {
  return JSON.stringify({
    id: `evt_e2e_${Date.now()}`,
    object: 'event',
    type: 'payment_intent.succeeded',
    data: { object: intent },
    created: Math.floor(Date.now() / 1000),
    livemode: false,
  });
}
