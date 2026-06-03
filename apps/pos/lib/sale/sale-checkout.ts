import { ApiHttpError } from '@africatourismgate/api-client';
import type {
  BookingCheckoutItem,
  BookingCheckoutPreview,
  BookingDetail,
  BookingPaymentIntentResponse,
} from '@africatourismgate/types';
import { getValidApiClient } from '../auth/api';

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

export async function createBookingFromCart(
  items: BookingCheckoutItem[],
  preview: BookingCheckoutPreview,
): Promise<BookingDetail> {
  const client = await getValidApiClient();
  return client.createBooking({
    items,
    currency: preview.currency,
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
