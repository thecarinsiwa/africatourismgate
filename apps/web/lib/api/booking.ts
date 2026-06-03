import {
  createApiClient,
} from '@africatourismgate/api-client';
import type {
  BookingCheckoutPreview,
  BookingCheckoutRequest,
  BookingCheckoutSessionResponse,
  BookingDetail,
  CreateBookingReviewRequest,
  Review,
} from '@africatourismgate/types';

function getApiBaseUrl(): string {
  const defaultApiUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://app-africatourismgate.org/api'
      : 'http://localhost:3000/api';
  return (process.env.NEXT_PUBLIC_API_URL ?? defaultApiUrl).replace(/\/$/, '');
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

export function getBookingReview(
  accessToken: string,
  bookingId: string,
): Promise<Review | null> {
  return createBookingClient(accessToken).getBookingReview(bookingId);
}

export function createBookingReview(
  accessToken: string,
  bookingId: string,
  payload: CreateBookingReviewRequest,
): Promise<Review> {
  return createBookingClient(accessToken).createBookingReview(bookingId, payload);
}
