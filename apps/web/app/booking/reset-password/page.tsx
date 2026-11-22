import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BookingResetPasswordPageContent } from '../../../components/reservations/booking-reset-password-page-content';
import { buildPrivatePageMetadata } from '../../../lib/seo/metadata';

export function generateMetadata(): Promise<Metadata> {
  return buildPrivatePageMetadata(
    'booking',
    'resetPassword',
    '/booking/reset-password',
  );
}

export default function BookingResetPasswordPage() {
  return (
    <Suspense>
      <BookingResetPasswordPageContent />
    </Suspense>
  );
}
