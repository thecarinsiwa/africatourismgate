'use client';

import {
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { Button } from '@africatourismgate/ui';
import { useState } from 'react';
import { posSalePageConfig } from '../../config/sale';
import { formatCents } from '../../lib/sale/format';
import { buildSuccessUrl } from '../../lib/sale/sale-checkout';
import { waitForBookingConfirmed } from '../../lib/sale/wait-booking-confirmed';

const { payment: labels } = posSalePageConfig;

type SaleStripePaymentFormProps = {
  bookingId: string;
  amountCents: number;
  currency: string;
  onSuccess: () => void;
  onError: (message: string) => void;
};

export function SaleStripePaymentForm({
  bookingId,
  amountCents,
  currency,
  onSuccess,
  onError,
}: SaleStripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    setSubmitting(true);

    try {
      const returnUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}${buildSuccessUrl(bookingId, 'card')}`
          : buildSuccessUrl(bookingId, 'card');

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: returnUrl },
        redirect: 'if_required',
      });

      if (error) {
        // Paiement non abouti : l’utilisateur peut réessayer ou fermer le sheet
        // (fermeture → cancelAbandonedPosBooking côté payment-bar).
        onError(error.message ?? labels.cardErrorLabel);
        return;
      }

      // Paiement Stripe accepté : même si le poll webhook timeout,
      // aller sur la page succès (ne pas annuler — le stock/paiement sont en cours).
      await waitForBookingConfirmed(bookingId);
      onSuccess();
    } catch (err) {
      onError(err instanceof Error ? err.message : labels.cardErrorLabel);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="pos-touch space-y-5">
      <p className="text-center text-lg font-bold text-atg-fg">
        {formatCents(amountCents, currency)}
      </p>

      <PaymentElement
        options={{
          layout: 'tabs',
        }}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        className="min-h-[3.5rem] text-lg"
        disabled={!stripe || !elements || submitting}
        loading={submitting}
      >
        {labels.cardPayLabel}
      </Button>
    </form>
  );
}
