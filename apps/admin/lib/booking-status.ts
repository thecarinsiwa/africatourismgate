import type { DataTableBadgeVariant } from '@africatourismgate/ui';
import type { BookingStatus } from '@africatourismgate/types';

export const BOOKING_STATUS_VARIANTS: Record<BookingStatus, DataTableBadgeVariant> = {
  draft: 'muted',
  pending_approval: 'default',
  pending_payment: 'warning',
  confirmed: 'success',
  cancelled: 'danger',
  refunded: 'default',
};

export const BOOKING_STATUSES: BookingStatus[] = [
  'draft',
  'pending_approval',
  'pending_payment',
  'confirmed',
  'cancelled',
  'refunded',
];

export function getBookingStatusVariant(status: BookingStatus): DataTableBadgeVariant {
  return BOOKING_STATUS_VARIANTS[status];
}

export function getBookingStatusLabel(
  status: BookingStatus,
  labels: Record<BookingStatus, string>,
): string {
  return labels[status];
}
