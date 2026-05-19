import type { Metadata } from 'next';
import { DashboardSectionPage } from '../../../components/dashboard-section-page';

export const metadata: Metadata = {
  title: 'Paramètres — Africa Tourism Gate Admin',
};

export default function ParametresPage() {
  return <DashboardSectionPage title="Paramètres" />;
}
