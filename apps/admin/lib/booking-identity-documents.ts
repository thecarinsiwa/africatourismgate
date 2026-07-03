import type {
  BookingIdentityDocument,
  BookingIdentityDocumentType,
} from '@africatourismgate/types';
import { ApiHttpError } from '@africatourismgate/api-client';
import { resolveApiBaseUrl } from './auth/api';
import { getSession } from './auth/session';

export async function uploadBookingIdentityDocumentAdmin(
  bookingId: string,
  file: File,
  documentType: BookingIdentityDocumentType,
): Promise<BookingIdentityDocument> {
  const session = getSession();
  if (!session?.accessToken) {
    throw new Error('Not authenticated');
  }
  const form = new FormData();
  form.append('file', file);
  form.append('documentType', documentType);

  const res = await fetch(
    `${resolveApiBaseUrl()}/bookings/${encodeURIComponent(bookingId)}/identity-documents`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.accessToken}` },
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

export async function fetchBookingIdentityDocumentBlobAdmin(
  bookingId: string,
  documentId: string,
): Promise<Blob> {
  const session = getSession();
  if (!session?.accessToken) {
    throw new Error('Not authenticated');
  }
  const res = await fetch(
    `${resolveApiBaseUrl()}/bookings/${encodeURIComponent(bookingId)}/identity-documents/${encodeURIComponent(documentId)}/file`,
    { headers: { Authorization: `Bearer ${session.accessToken}` } },
  );
  if (!res.ok) {
    throw new ApiHttpError(res.status, res.statusText, undefined, res.statusText);
  }
  return res.blob();
}
