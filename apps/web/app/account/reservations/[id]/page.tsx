import { AccountBookingDetail } from '../../../../components/account/account-booking-detail';

type PageProps = {
  params: { id: string };
};

export default function AccountReservationDetailPage({ params }: PageProps) {
  return <AccountBookingDetail bookingId={params.id} />;
}
