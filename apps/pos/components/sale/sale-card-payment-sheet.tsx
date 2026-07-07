'use client';

import type { BookingPaymentIntentResponse } from '@africatourismgate/types';
import { Button } from '@africatourismgate/ui';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { useMemo, useState } from 'react';
import { posSalePageConfig } from '../../config/sale';
import { getStripePublishableKey } from '../../lib/sale/stripe-publishable';
import { SaleStripePaymentForm } from './sale-stripe-payment-form';

const { payment: labels } = posSalePageConfig;

let stripePromise: Promise<Stripe | null> | null = null;

function getStripePromise(): Promise<Stripe | null> | null {
  const key = getStripePublishableKey();
  if (!key) return null;
  if (!stripePromise) {
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}

type SaleCardPaymentSheetProps = {
  open: boolean;
  bookingId: string;
  intent: BookingPaymentIntentResponse;
  onClose: () => void;
  onPaid: () => void;
};

export function SaleCardPaymentSheet({
  open,
  bookingId,
  intent,
  onClose,
  onPaid,
}: SaleCardPaymentSheetProps) {
  const [error, setError] = useState<string | null>(null);
  const stripePromise = useMemo(() => getStripePromise(), []);

  if (!open) {
    return null;
  }

  if (!stripePromise) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 pb-[env(safe-area-inset-bottom)] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sale-card-pay-title"
    >
      <div className="flex max-h-[calc(100dvh-8px)] w-full max-w-lg flex-col rounded-t-2xl border border-atg-border bg-atg-elevated shadow-xl sm:max-h-[92vh] sm:rounded-2xl">
        <div className="border-b border-atg-border px-4 py-4 sm:px-5">
          <h2 id="sale-card-pay-title" className="text-xl font-bold text-atg-fg">
            {labels.cardSheetTitle}
          </h2>
          <p className="mt-1 text-base text-atg-muted">{labels.cardSheetSubtitle}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-5">
          {error ? (
            <p role="alert" className="mb-4 text-base text-red-600">
              {error}
            </p>
          ) : null}

          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: intent.clientSecret,
              appearance: { theme: 'stripe' },
            }}
          >
            <SaleStripePaymentForm
              bookingId={bookingId}
              amountCents={intent.amountCents}
              currency={intent.currency}
              onSuccess={onPaid}
              onError={setError}
            />
          </Elements>
        </div>

        <div className="border-t border-atg-border px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-5 sm:pb-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            fullWidth
            className="min-h-[3rem]"
            onClick={onClose}
          >
            {labels.closeCardLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
