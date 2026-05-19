import type { Metadata } from 'next';
import { DashboardSectionPage } from '../../../components/dashboard-section-page';

export const metadata: Metadata = {
  title: 'Hébergements — Africa Tourism Gate Admin',
};

export default function HebergementsPage() {
  return <DashboardSectionPage title="Hébergements" />;
}
