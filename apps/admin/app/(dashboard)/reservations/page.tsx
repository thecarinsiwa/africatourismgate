import type { Metadata } from 'next';
import { DashboardSectionPage } from '../../../components/dashboard-section-page';

export const metadata: Metadata = {
  title: 'Réservations — Africa Tourism Gate Admin',
};

export default function ReservationsPage() {
  return <DashboardSectionPage title="Réservations" />;
}
