import { ApiHttpError } from '@africatourismgate/api-client';
import { resolveApiBaseUrl } from './auth/api';
import { getSession } from './auth/session';

export async function fetchBookingPaymentProofBlobAdmin(
  bookingId: string,
  proofId: string,
): Promise<Blob> {
  const session = getSession();
  if (!session?.accessToken) {
    throw new Error('Not authenticated');
  }
  const res = await fetch(
    `${resolveApiBaseUrl()}/bookings/${encodeURIComponent(bookingId)}/payment-proofs/${encodeURIComponent(proofId)}/file`,
    { headers: { Authorization: `Bearer ${session.accessToken}` } },
  );
  if (!res.ok) {
    throw new ApiHttpError(res.status, res.statusText, undefined, res.statusText);
  }
  return res.blob();
}
