import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { BookingDetailPage } from '../../../../../components/bookings/booking-detail-page';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('dashboard/bookings/id');
}

export default function BookingDetailRoutePage({ params }: PageProps) {
  return <BookingDetailPage bookingId={params.id} />;
}
