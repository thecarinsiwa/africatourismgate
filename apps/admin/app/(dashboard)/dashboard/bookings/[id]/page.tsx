import type { Metadata } from 'next';
import { BookingDetailPage } from '../../../../../components/bookings/booking-detail-page';

type PageProps = {
  params: { id: string };
};

export const metadata: Metadata = {
  title: 'Détail réservation — Africa Tourism Gate Admin',
};

export default function BookingDetailRoutePage({ params }: PageProps) {
  return <BookingDetailPage bookingId={params.id} />;
}
