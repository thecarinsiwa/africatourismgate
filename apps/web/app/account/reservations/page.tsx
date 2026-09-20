import type { Metadata } from 'next';
import { AccountBookingsList } from '../../../components/account/account-bookings-list';
import { buildPrivatePageMetadata } from '../../../lib/seo/metadata';

export function generateMetadata(): Promise<Metadata> {
  return buildPrivatePageMetadata('account', 'reservations', '/account/reservations');
}

export default function AccountReservationsPage() {
  return <AccountBookingsList />;
}
