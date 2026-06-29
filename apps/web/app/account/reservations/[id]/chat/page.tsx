'use client';

import { useSearchParams } from 'next/navigation';
import { AccountBookingDetail } from '../../../../../components/account/account-booking-detail';

type PageProps = {
  params: { id: string };
};

export default function AccountReservationChatPage({ params }: PageProps) {
  const searchParams = useSearchParams();
  const chatToken = searchParams.get('token');

  return (
    <AccountBookingDetail
      bookingId={params.id}
      scrollToConversation
      chatToken={chatToken}
    />
  );
}
