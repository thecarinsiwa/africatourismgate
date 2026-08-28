import { ApiHttpError } from '@africatourismgate/api-client';
import type {
  BookingCheckoutItem,
  BookingCheckoutPreview,
  BookingDetail,
  BookingPaymentIntentResponse,
  BookingPreferredPaymentMethod,
  BookingRequestResponse,
} from '@africatourismgate/types';
import { getValidApiClient } from '../auth/api';
import { requireSelectedOrganizationId } from '../auth/session';
import type { SaleManifestDraftEntry } from './types';

/** Motifs d’annulation POS (historique statut API). */
export const posAbandonCancelReasons = {
  cashPaymentFailed: 'Abandon caisse — échec paiement espèces',
  cardIntentFailed: 'Abandon caisse — échec préparation carte',
  cardSheetClosed: 'Abandon caisse — fermeture paiement carte',
  assistedApproveFailed: 'Abandon caisse — échec approbation assistée',
  manualAfterTimeout: 'Abandon caisse — annulation manuelle après délai',
} as const;

export type CheckoutCartOptions = {
  items: BookingCheckoutItem[];
  preview: BookingCheckoutPreview;
  preferredPaymentMethod: BookingPreferredPaymentMethod;
  customerUserId?: string | null;
  promoCode?: string | null;
  packageId?: string | null;
  manifestEntries?: SaleManifestDraftEntry[];
};

function buildCheckoutBody({
  items,
  preview,
  preferredPaymentMethod,
  customerUserId,
  promoCode,
  packageId,
}: CheckoutCartOptions) {
  const trimmedCustomerId = customerUserId?.trim();
  const trimmedPromoCode = promoCode?.trim();
  const trimmedPackageId = packageId?.trim();
  return {
    items,
    currency: preview.currency,
    preferredPaymentMethod,
    organizationId: requireSelectedOrganizationId(),
    ...(trimmedCustomerId ? { customerUserId: trimmedCustomerId } : {}),
    ...(trimmedPromoCode ? { promoCode: trimmedPromoCode } : {}),
    ...(trimmedPackageId ? { packageId: trimmedPackageId } : {}),
  };
}

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
  options: CheckoutCartOptions,
): Promise<BookingDetail> {
  const client = await getValidApiClient();
  return client.createBooking(buildCheckoutBody(options));
}

export async function requestBookingFromCart(
  options: CheckoutCartOptions,
): Promise<BookingRequestResponse> {
  const client = await getValidApiClient();
  return client.requestBooking(buildCheckoutBody(options));
}

export async function approveAssistedPosBooking(
  bookingId: string,
  totalCents: number,
): Promise<void> {
  const client = await getValidApiClient();
  await client.approveBooking(bookingId, { totalCents });
}

export async function saveBookingManifestEntries(
  bookingId: string,
  entries: SaleManifestDraftEntry[],
): Promise<void> {
  const validEntries = entries.filter((e) => e.fullName.trim().length > 0);
  if (validEntries.length === 0) return;

  const client = await getValidApiClient();
  for (let i = 0; i < validEntries.length; i++) {
    const entry = validEntries[i]!;
    await client.createBookingManifestEntry(bookingId, {
      fullName: entry.fullName.trim(),
      age: entry.age,
      sex: entry.sex,
      nationality: entry.nationality?.trim() || undefined,
      idNumber: entry.idNumber?.trim() || undefined,
      conditions: entry.conditions?.trim() || undefined,
      comment: entry.comment?.trim() || undefined,
      sortOrder: i,
    });
  }
}

/**
 * Crée la réservation (immédiate ou assistée) et enregistre le manifeste si renseigné.
 * Forfait assisté : request → approve staff → manifeste → retourne l’id pour paiement.
 */
export async function checkoutBookingFromCart(
  options: CheckoutCartOptions,
): Promise<string> {
  let bookingId: string;
  if (options.preview.bookingMode === 'assisted') {
    const requested = await requestBookingFromCart(options);
    try {
      await approveAssistedPosBooking(requested.bookingId, options.preview.totalCents);
    } catch (error: unknown) {
      try {
        await cancelAbandonedPosBooking(
          requested.bookingId,
          posAbandonCancelReasons.assistedApproveFailed,
        );
      } catch {
        // ignore cancel failure; surface original approve error
      }
      throw error;
    }
    bookingId = requested.bookingId;
  } else {
    const created = await createBookingFromCart(options);
    bookingId = created.booking.id;
  }

  if (options.manifestEntries && options.manifestEntries.length > 0) {
    try {
      await saveBookingManifestEntries(bookingId, options.manifestEntries);
    } catch (error: unknown) {
      // En cas d'échec sur la création du manifeste, on annule la réservation pour libérer le stock
      try {
        await cancelAbandonedPosBooking(
          bookingId,
          'Abandon caisse — échec enregistrement manifeste',
        );
      } catch {
        // ignore cancel failure; surface original manifest error
      }
      throw error;
    }
  }

  return bookingId;
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
