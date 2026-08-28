'use client';

import type { BookingPaymentIntentResponse } from '@africatourismgate/types';
import { Button } from '@africatourismgate/ui';
import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import { posSalePageConfig } from '../../config/sale';
import { useSaleCart } from '../../lib/sale/cart-context';
import { isStripeConfigured } from '../../lib/sale/stripe-publishable';
import {
  buildSuccessUrl,
  cancelAbandonedPosBooking,
  checkoutBookingFromCart,
  createCardPaymentIntent,
  payBookingCash,
  posAbandonCancelReasons,
  saleApiErrorMessage,
} from '../../lib/sale/sale-checkout';
import { SaleCardPaymentSheet } from './sale-card-payment-sheet';

const { payment: labels } = posSalePageConfig;

export function SalePaymentBar() {
  const router = useRouter();
  const {
    lines,
    preview,
    previewLoading,
    previewError,
    customer,
    appliedPromoCode,
    cartPackageId,
    clearCart,
    setIsCheckingOut,
  } = useSaleCart();
  const isSubmittingRef = useRef(false);
  const [processing, setProcessing] = useState<'cash' | 'card' | null>(null);
  const [closingCard, setClosingCard] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [cardBookingId, setCardBookingId] = useState<string | null>(null);
  const [cardIntent, setCardIntent] = useState<BookingPaymentIntentResponse | null>(null);

  const canPay =
    lines.length > 0 &&
    preview !== null &&
    !previewLoading &&
    !previewError &&
    preview.totalCents > 0 &&
    processing === null &&
    !closingCard &&
    !cardBookingId;

  const stripeReady = isStripeConfigured();

  const finishSale = useCallback(
    (bookingId: string, payment: 'cash' | 'card') => {
      clearCart();
      setIsCheckingOut(false);
      router.push(buildSuccessUrl(bookingId, payment));
    },
    [clearCart, router, setIsCheckingOut],
  );

  const clearCardSheet = useCallback(() => {
    setCardBookingId(null);
    setCardIntent(null);
    setIsCheckingOut(false);
  }, [setIsCheckingOut]);

  function checkoutOptions(preferredPaymentMethod: 'cash' | 'stripe') {
    return {
      items: lines.map((line) => line.item),
      preview: preview!,
      preferredPaymentMethod,
      customerUserId: customer?.id,
      promoCode: appliedPromoCode,
      packageId: cartPackageId,
    };
  }

  async function handleCash() {
    if (!preview || lines.length === 0 || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setCheckoutError(null);
    setProcessing('cash');
    setIsCheckingOut(true);
    let createdBookingId: string | null = null;

    try {
      createdBookingId = await checkoutBookingFromCart(checkoutOptions('cash'));
      await payBookingCash(createdBookingId);
      finishSale(createdBookingId, 'cash');
    } catch (error: unknown) {
      if (createdBookingId) {
        try {
          await cancelAbandonedPosBooking(
            createdBookingId,
            posAbandonCancelReasons.cashPaymentFailed,
          );
          setCheckoutError(
            `${saleApiErrorMessage(error, labels.checkoutErrorLabel)}. ${labels.abandonStockReleasedHint}`,
          );
        } catch (cancelError: unknown) {
          setCheckoutError(
            `${saleApiErrorMessage(error, labels.checkoutErrorLabel)}. ${saleApiErrorMessage(cancelError, labels.cancelAbandonErrorLabel)}`,
          );
        }
      } else {
        setCheckoutError(saleApiErrorMessage(error, labels.checkoutErrorLabel));
      }
      setIsCheckingOut(false);
    } finally {
      isSubmittingRef.current = false;
      setProcessing(null);
    }
  }

  async function handleCard() {
    if (!preview || lines.length === 0 || !stripeReady || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setCheckoutError(null);
    setProcessing('card');
    setIsCheckingOut(true);
    let createdBookingId: string | null = null;

    try {
      createdBookingId = await checkoutBookingFromCart(checkoutOptions('stripe'));
      const intent = await createCardPaymentIntent(createdBookingId);
      setCardBookingId(createdBookingId);
      setCardIntent(intent);
    } catch (error: unknown) {
      if (createdBookingId) {
        try {
          await cancelAbandonedPosBooking(
            createdBookingId,
            posAbandonCancelReasons.cardIntentFailed,
          );
          setCheckoutError(
            `${saleApiErrorMessage(error, labels.checkoutErrorLabel)}. ${labels.abandonStockReleasedHint}`,
          );
        } catch (cancelError: unknown) {
          setCheckoutError(
            `${saleApiErrorMessage(error, labels.checkoutErrorLabel)}. ${saleApiErrorMessage(cancelError, labels.cancelAbandonErrorLabel)}`,
          );
        }
      } else {
        setCheckoutError(saleApiErrorMessage(error, labels.checkoutErrorLabel));
      }
      setIsCheckingOut(false);
    } finally {
      isSubmittingRef.current = false;
      setProcessing(null);
    }
  }

  async function abandonCardSheet() {
    const bookingId = cardBookingId;
    if (!bookingId || closingCard) return;

    setClosingCard(true);
    setCheckoutError(null);

    try {
      await cancelAbandonedPosBooking(bookingId, posAbandonCancelReasons.cardSheetClosed);
      clearCardSheet();
    } catch (error: unknown) {
      setCheckoutError(saleApiErrorMessage(error, labels.cancelAbandonErrorLabel));
    } finally {
      setClosingCard(false);
    }
  }

  function handleCardPaid() {
    if (!cardBookingId) return;
    const bookingId = cardBookingId;
    clearCardSheet();
    finishSale(bookingId, 'card');
  }

  if (lines.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mt-5 space-y-3 border-t border-atg-border pt-5">
        {!canPay && !previewError && (previewLoading || !preview) && !cardBookingId ? (
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
          closing={closingCard}
          onClose={() => void abandonCardSheet()}
          onPaid={handleCardPaid}
        />
      ) : null}
    </>
  );
}
