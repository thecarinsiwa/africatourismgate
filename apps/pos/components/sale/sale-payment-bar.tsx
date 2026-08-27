'use client';

import type { BookingPaymentIntentResponse } from '@africatourismgate/types';
import { Button } from '@africatourismgate/ui';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { posSalePageConfig } from '../../config/sale';
import { useSaleCart } from '../../lib/sale/cart-context';
import { isStripeConfigured } from '../../lib/sale/stripe-publishable';
import {
  buildSuccessUrl,
  createBookingFromCart,
  createCardPaymentIntent,
  payBookingCash,
  saleApiErrorMessage,
} from '../../lib/sale/sale-checkout';
import { SaleCardPaymentSheet } from './sale-card-payment-sheet';

const { payment: labels } = posSalePageConfig;

export function SalePaymentBar() {
  const router = useRouter();
  const { lines, preview, previewLoading, previewError, clearCart } = useSaleCart();
  const [processing, setProcessing] = useState<'cash' | 'card' | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [cardBookingId, setCardBookingId] = useState<string | null>(null);
  const [cardIntent, setCardIntent] = useState<BookingPaymentIntentResponse | null>(null);

  const canPay =
    lines.length > 0 &&
    preview !== null &&
    !previewLoading &&
    !previewError &&
    preview.totalCents > 0 &&
    processing === null;

  const stripeReady = isStripeConfigured();

  const finishSale = useCallback(
    (bookingId: string, payment: 'cash' | 'card') => {
      clearCart();
      router.push(buildSuccessUrl(bookingId, payment));
    },
    [clearCart, router],
  );

  async function handleCash() {
    if (!preview || lines.length === 0) return;

    setCheckoutError(null);
    setProcessing('cash');

    try {
      const created = await createBookingFromCart(
        lines.map((line) => line.item),
        preview,
        'cash',
      );
      await payBookingCash(created.booking.id);
      finishSale(created.booking.id, 'cash');
    } catch (error: unknown) {
      setCheckoutError(saleApiErrorMessage(error, labels.checkoutErrorLabel));
    } finally {
      setProcessing(null);
    }
  }

  async function handleCard() {
    if (!preview || lines.length === 0 || !stripeReady) return;

    setCheckoutError(null);
    setProcessing('card');

    try {
      const created = await createBookingFromCart(
        lines.map((line) => line.item),
        preview,
        'stripe',
      );
      const intent = await createCardPaymentIntent(created.booking.id);
      setCardBookingId(created.booking.id);
      setCardIntent(intent);
    } catch (error: unknown) {
      setCheckoutError(saleApiErrorMessage(error, labels.checkoutErrorLabel));
    } finally {
      setProcessing(null);
    }
  }

  function closeCardSheet() {
    setCardBookingId(null);
    setCardIntent(null);
  }

  function handleCardPaid() {
    if (!cardBookingId) return;
    const bookingId = cardBookingId;
    closeCardSheet();
    finishSale(bookingId, 'card');
  }

  if (lines.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mt-5 space-y-3 border-t border-atg-border pt-5">
        {!canPay && !previewError && (previewLoading || !preview) ? (
          <p className="text-center text-sm text-atg-muted">{labels.previewRequiredHint}</p>
        ) : null}

        {checkoutError ? (
          <p role="alert" className="text-sm text-red-600">
            {checkoutError}
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="primary"
            size="lg"
            fullWidth
            className="min-h-[3.5rem] text-base"
            disabled={!canPay}
            loading={processing === 'cash'}
            onClick={() => void handleCash()}
          >
            {processing === 'cash' ? labels.cashProcessingLabel : labels.cashLabel}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            fullWidth
            className="min-h-[3.5rem] text-base"
            disabled={!canPay || !stripeReady}
            loading={processing === 'card'}
            onClick={() => void handleCard()}
          >
            {processing === 'card' ? labels.cardProcessingLabel : labels.cardLabel}
          </Button>
        </div>

        {!stripeReady ? (
          <p className="text-center text-xs text-atg-muted">{labels.cardUnavailableLabel}</p>
        ) : null}
      </div>

      {cardBookingId && cardIntent ? (
        <SaleCardPaymentSheet
          open
          bookingId={cardBookingId}
          intent={cardIntent}
          onClose={closeCardSheet}
          onPaid={handleCardPaid}
        />
      ) : null}
    </>
  );
}
