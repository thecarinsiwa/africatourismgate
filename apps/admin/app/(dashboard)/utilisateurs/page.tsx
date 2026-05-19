import type { Metadata } from 'next';
import { DashboardSectionPage } from '../../../components/dashboard-section-page';

export const metadata: Metadata = {
  title: 'Utilisateurs — Africa Tourism Gate Admin',
};

export default function UtilisateursPage() {
  return <DashboardSectionPage title="Utilisateurs" />;
}
