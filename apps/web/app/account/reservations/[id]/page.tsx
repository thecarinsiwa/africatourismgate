import type { Metadata } from 'next';
import { AccountBookingDetail } from '../../../../components/account/account-booking-detail';
import { buildPrivatePageMetadata } from '../../../../lib/seo/metadata';

type PageProps = {
  params: { id: string };
};

export function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return buildPrivatePageMetadata(
    'account',
    'reservationDetail',
    `/account/reservations/${params.id}`,
  );
}

export default function AccountReservationDetailPage({ params }: PageProps) {
  return <AccountBookingDetail bookingId={params.id} />;
}
