import type { Metadata } from 'next';
import { ReservationCancelPageContent } from '../../../components/reservations/reservation-cancel-page-content';
import { buildPrivatePageMetadata } from '../../../lib/seo/metadata';

export function generateMetadata(): Promise<Metadata> {
  return buildPrivatePageMetadata('booking', 'cancel', '/booking/cancel');
}

export default function BookingCancelPage() {
  return <ReservationCancelPageContent />;
}
