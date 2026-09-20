import type { Metadata } from 'next';
import { BookingLogoutPageContent } from '../../../components/reservations/booking-logout-page-content';
import { buildPrivatePageMetadata } from '../../../lib/seo/metadata';

export function generateMetadata(): Promise<Metadata> {
  return buildPrivatePageMetadata('booking', 'logout', '/booking/logout');
}

export default function BookingLogoutPage() {
  return <BookingLogoutPageContent />;
}
