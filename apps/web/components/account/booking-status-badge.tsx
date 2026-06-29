import type { BookingStatus } from '@africatourismgate/types';
import {
  bookingStatusLabels,
  bookingStatusStyles,
} from '../../lib/bookings/display';

type Props = {
  status: BookingStatus;
  size?: 'sm' | 'md';
};

export function BookingStatusBadge({ status, size = 'md' }: Props) {
  const styles = bookingStatusStyles[status];
  const sizeClass =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs'
      : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClass} ${styles.badge}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${styles.dot}`} aria-hidden />
      {bookingStatusLabels[status] ?? status}
    </span>
  );
}
