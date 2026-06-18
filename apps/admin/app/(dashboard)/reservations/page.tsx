import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../lib/i18n/admin-page-i18n';
import { ReservationsPageContent } from '../../../components/pages/reservations-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('reservations');
}

export default function Page() {
  return <ReservationsPageContent />;
}
