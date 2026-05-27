import {
  createApiClient,
} from '@africatourismgate/api-client';
import type {
  BookingCheckoutPreview,
  BookingCheckoutRequest,
  BookingCheckoutSessionResponse,
  BookingDetail,
} from '@africatourismgate/types';

function getApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? '/api').replace(/\/$/, '');
}

function createBookingClient(accessToken: string) {
  return createApiClient({
    baseUrl: getApiBaseUrl(),
    accessToken,
  });
}

export function previewBookingCheckout(
  accessToken: string,
  payload: BookingCheckoutRequest,
): Promise<BookingCheckoutPreview> {
  return createBookingClient(accessToken).previewBookingCheckout(payload);
}

export function createBooking(
  accessToken: string,
  payload: BookingCheckoutRequest,
): Promise<BookingDetail> {
  return createBookingClient(accessToken).createBooking(payload);
}

export function createBookingCheckoutSession(
  accessToken: string,
  bookingId: string,
): Promise<BookingCheckoutSessionResponse> {
  return createBookingClient(accessToken).createBookingCheckoutSession(bookingId);
}

export function getBooking(accessToken: string, bookingId: string): Promise<BookingDetail> {
  return createBookingClient(accessToken).getBooking(bookingId);
}
