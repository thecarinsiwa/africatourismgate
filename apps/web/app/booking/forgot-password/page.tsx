import type { Metadata } from 'next';
import { BookingForgotPasswordPageContent } from '../../../components/reservations/booking-forgot-password-page-content';
import { buildPrivatePageMetadata } from '../../../lib/seo/metadata';

export function generateMetadata(): Promise<Metadata> {
  return buildPrivatePageMetadata(
    'booking',
    'forgotPassword',
    '/booking/forgot-password',
  );
}

export default function BookingForgotPasswordPage() {
  return <BookingForgotPasswordPageContent />;
}
