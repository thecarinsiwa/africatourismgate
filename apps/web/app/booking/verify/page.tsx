import { Suspense } from 'react';
import { BookingVerifyPageContent } from '../../../components/reservations/booking-verify-page-content';

export default function BookingVerifyPage() {
  return (
    <Suspense>
      <BookingVerifyPageContent />
    </Suspense>
  );
}
