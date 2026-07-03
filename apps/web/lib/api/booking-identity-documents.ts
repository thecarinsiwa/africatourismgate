import type {
  BookingIdentityDocument,
  BookingIdentityDocumentType,
} from '@africatourismgate/types';
import { ApiHttpError } from '@africatourismgate/api-client';
import { ensureClientAccessToken } from '../auth/client-session';

function getApiBaseUrl(): string {
  const defaultApiUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://app-africatourismgate.org/api'
      : 'http://localhost:3000/api';
  return (process.env.NEXT_PUBLIC_API_URL ?? defaultApiUrl).replace(/\/$/, '');
}

export async function uploadBookingIdentityDocument(
  bookingId: string,
  file: File,
  documentType: BookingIdentityDocumentType,
): Promise<BookingIdentityDocument> {
  const accessToken = await ensureClientAccessToken();
  if (!accessToken) {
    throw new Error('Not authenticated');
  }
  const form = new FormData();
  form.append('file', file);
  form.append('documentType', documentType);

  const res = await fetch(
    `${getApiBaseUrl()}/bookings/${encodeURIComponent(bookingId)}/identity-documents`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form,
    },
  );

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = undefined;
    }
    const message =
      body &&
      typeof body === 'object' &&
      typeof (body as { message?: unknown }).message === 'string'
        ? (body as { message: string }).message
        : res.statusText;
    throw new ApiHttpError(res.status, res.statusText, body, message);
  }

  return (await res.json()) as BookingIdentityDocument;
}

export async function fetchBookingIdentityDocumentBlob(
  bookingId: string,
  documentId: string,
): Promise<Blob> {
  const accessToken = await ensureClientAccessToken();
  if (!accessToken) {
    throw new Error('Not authenticated');
  }
  const res = await fetch(
    `${getApiBaseUrl()}/bookings/${encodeURIComponent(bookingId)}/identity-documents/${encodeURIComponent(documentId)}/file`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!res.ok) {
    throw new ApiHttpError(res.status, res.statusText, undefined, res.statusText);
  }
  return res.blob();
}
