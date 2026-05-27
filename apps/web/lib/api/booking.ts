import {
  createApiClient,
  type BookingCheckoutPreview,
  type BookingCheckoutRequest,
  type BookingCheckoutSessionResponse,
  type BookingDetail,
} from '@africatourismgate/api-client';

function getApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api').replace(/\/$/, '');
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
