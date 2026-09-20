import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BookingVerifyPageContent } from '../../../components/reservations/booking-verify-page-content';
import { buildPrivatePageMetadata } from '../../../lib/seo/metadata';

export function generateMetadata(): Promise<Metadata> {
  return buildPrivatePageMetadata('booking', 'verify', '/booking/verify');
}

export default function BookingVerifyPage() {
  return (
    <Suspense>
      <BookingVerifyPageContent />
    </Suspense>
  );
}
