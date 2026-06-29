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

/** Mirrors booking-engine updateBookingStatus transitions (excludes cancel → use cancel action). */
export function getManualBookingStatusTargets(current: BookingStatus): BookingStatus[] {
  if (current === 'pending_approval') {
    return [];
  }

  const targets: BookingStatus[] = [];

  if (current === 'pending_payment') {
    targets.push('confirmed');
  }

  const allowed: Partial<Record<BookingStatus, BookingStatus[]>> = {
    draft: ['pending_payment'],
    pending_payment: ['draft', 'refunded'],
    confirmed: ['refunded'],
    cancelled: ['refunded'],
  };

  for (const status of allowed[current] ?? []) {
    if (!targets.includes(status)) {
      targets.push(status);
    }
  }

  return targets;
}

export function defaultManualBookingStatusTarget(
  current: BookingStatus,
  allowed: BookingStatus[],
): BookingStatus {
  if (allowed.length === 0) {
    return current;
  }
  if (current === 'pending_payment' && allowed.includes('confirmed')) {
    return 'confirmed';
  }
  return allowed[0];
}
