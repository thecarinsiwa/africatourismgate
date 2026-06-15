import type { DataTableBadgeVariant } from '@africatourismgate/ui';
import type { BookingStatus } from '@africatourismgate/types';

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  draft: 'Brouillon',
  pending_payment: 'En attente de paiement',
  confirmed: 'Confirmée',
  cancelled: 'Annulée',
  refunded: 'Remboursée',
};

export const BOOKING_STATUS_VARIANTS: Record<BookingStatus, DataTableBadgeVariant> = {
  draft: 'muted',
  pending_payment: 'warning',
  confirmed: 'success',
  cancelled: 'danger',
  refunded: 'default',
};

export const BOOKING_STATUSES = Object.keys(BOOKING_STATUS_LABELS) as BookingStatus[];

export function getBookingStatusLabel(status: BookingStatus): string {
  return BOOKING_STATUS_LABELS[status];
}

export function getBookingStatusVariant(status: BookingStatus): DataTableBadgeVariant {
  return BOOKING_STATUS_VARIANTS[status];
}

export function getBookingStatusFilterOptions(allLabel = 'Tous') {
  return [
    { value: '', label: allLabel },
    ...BOOKING_STATUSES.map((status) => ({
      value: status,
      label: BOOKING_STATUS_LABELS[status],
    })),
  ];
}
