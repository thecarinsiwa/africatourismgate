import type { Metadata } from 'next';
import { DashboardSectionPage } from '../../../components/dashboard-section-page';

export const metadata: Metadata = {
  title: 'Organisations — Africa Tourism Gate Admin',
};

export default function OrganisationsPage() {
  return <DashboardSectionPage title="Organisations" />;
}
