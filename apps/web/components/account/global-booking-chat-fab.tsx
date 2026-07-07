'use client';

import { usePathname } from 'next/navigation';
import { localeToBcp47 } from '../../lib/i18n/locale-tag';
import { useLocale } from '../../lib/i18n/locale-provider';
import { useActiveAssistedBooking } from '../../hooks/use-active-assisted-booking';
import { BookingMessagesSection } from './booking-messages-section';

const RESERVATION_DETAIL_ROUTE = /^\/account\/reservations\/[^/]+(\/chat)?$/;

export function GlobalBookingChatFab() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const localeTag = localeToBcp47(locale);
  const booking = useActiveAssistedBooking();

  if (!booking || RESERVATION_DETAIL_ROUTE.test(pathname)) {
    return null;
  }

  return (
    <BookingMessagesSection
      bookingId={booking.id}
      localeTag={localeTag}
      canReply={booking.canReply}
      initialUnreadCount={booking.unreadCount}
    />
  );
}
