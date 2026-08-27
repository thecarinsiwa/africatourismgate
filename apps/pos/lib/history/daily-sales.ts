import { ApiHttpError } from '@africatourismgate/api-client';
import type { BookingListItem, BookingPreferredPaymentMethod } from '@africatourismgate/types';
import { getValidApiClient } from '../auth/api';
import { posHistoryPageConfig } from '../../config/history';

const LIST_LIMIT = 50;

/** Date locale YYYY-MM-DD pour les filtres API du jour. */
export function getLocalTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatClientName(item: BookingListItem): string {
  const name = `${item.clientFirstName} ${item.clientLastName}`.trim();
  return name || item.clientEmail;
}

export function formatBookingShortId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

export function paymentMethodToSuccessQuery(
  method: BookingPreferredPaymentMethod | null | undefined,
): 'cash' | 'card' {
  return method === 'cash' ? 'cash' : 'card';
}

export function buildHistoryDetailUrl(
  bookingId: string,
  method: BookingPreferredPaymentMethod | null | undefined,
): string {
  const payment = paymentMethodToSuccessQuery(method);
  const params = new URLSearchParams({ bookingId, payment });
  return `/sale/success?${params.toString()}`;
}

export async function fetchTodaySales(createdByUserId: string): Promise<BookingListItem[]> {
  const today = getLocalTodayIsoDate();
  const client = await getValidApiClient();
  const response = await client.listBookings({
    dateFrom: today,
    dateTo: today,
    createdByUserId,
    sortOrder: 'desc',
    limit: LIST_LIMIT,
    page: 1,
  });
  return response.data;
}

export function historyErrorMessage(error: unknown): string {
  if (error instanceof ApiHttpError) {
    if (error.status === 403) {
      return 'Accès refusé à l’historique des ventes.';
    }
    if (error.message && !error.message.startsWith('HTTP ')) {
      return error.message;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return posHistoryPageConfig.errorLabel;
}
