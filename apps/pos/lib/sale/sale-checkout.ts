import { ApiHttpError } from '@africatourismgate/api-client';
import type {
  BookingCheckoutItem,
  BookingCheckoutPreview,
  BookingDetail,
  BookingPaymentIntentResponse,
  BookingPreferredPaymentMethod,
} from '@africatourismgate/types';
import { getValidApiClient } from '../auth/api';
import { requireSelectedOrganizationId } from '../auth/session';

/** Motifs d’annulation POS (historique statut API). */
export const posAbandonCancelReasons = {
  cashPaymentFailed: 'Abandon caisse — échec paiement espèces',
  cardIntentFailed: 'Abandon caisse — échec préparation carte',
  cardSheetClosed: 'Abandon caisse — fermeture paiement carte',
  manualAfterTimeout: 'Abandon caisse — annulation manuelle après délai',
} as const;

export function saleApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiHttpError) {
    if (error.status === 400 && error.message && !error.message.startsWith('HTTP ')) {
      return error.message;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

/**
 * True when cancel is a no-op (already cancelled / statut non annulable).
 * Avoids surfacing a second error after a race or double-tap.
 */
function isBenignCancelError(error: unknown): boolean {
  if (!(error instanceof ApiHttpError) || error.status !== 400) {
    return false;
  }
  const message = error.message.toLowerCase();
  return (
    message.includes('impossible d\'annuler') ||
    message.includes('impossible d’annuler')
  );
}

/**
 * Annule un booking POS abandonné (`pending_payment` → `cancelled` + stock restauré).
 * Idempotent : un 400 « déjà annulé / statut non annulable » est traité comme succès.
 */
export async function cancelAbandonedPosBooking(
  bookingId: string,
  reason: string,
): Promise<void> {
  const trimmedId = bookingId.trim();
  if (!trimmedId) {
    return;
  }

  try {
    const client = await getValidApiClient();
    await client.cancelBooking(trimmedId, { reason });
  } catch (error: unknown) {
    if (isBenignCancelError(error)) {
      return;
    }
    throw error;
  }
}

export async function createBookingFromCart(
  items: BookingCheckoutItem[],
  preview: BookingCheckoutPreview,
  preferredPaymentMethod: BookingPreferredPaymentMethod,
  customerUserId?: string | null,
  promoCode?: string | null,
): Promise<BookingDetail> {
  const client = await getValidApiClient();
  const trimmedCustomerId = customerUserId?.trim();
  const trimmedPromoCode = promoCode?.trim();
  return client.createBooking({
    items,
    currency: preview.currency,
    preferredPaymentMethod,
    organizationId: requireSelectedOrganizationId(),
    ...(trimmedCustomerId ? { customerUserId: trimmedCustomerId } : {}),
    ...(trimmedPromoCode ? { promoCode: trimmedPromoCode } : {}),
  });
}

export async function payBookingCash(bookingId: string): Promise<BookingDetail> {
  const client = await getValidApiClient();
  return client.recordBookingCashPayment(bookingId);
}

export async function createCardPaymentIntent(
  bookingId: string,
): Promise<BookingPaymentIntentResponse> {
  const client = await getValidApiClient();
  return client.createBookingPaymentIntent(bookingId);
}

export function buildSuccessUrl(bookingId: string, payment: 'cash' | 'card'): string {
  const params = new URLSearchParams({
    bookingId,
    payment,
  });
  return `/sale/success?${params.toString()}`;
}
