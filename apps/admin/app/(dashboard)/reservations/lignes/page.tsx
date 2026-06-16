import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';
import { LignesReservationPageContent } from '../../../../components/pages/reservations-lignes-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('reservations/lignes');
}

export default function Page() {
  return <LignesReservationPageContent />;
}
