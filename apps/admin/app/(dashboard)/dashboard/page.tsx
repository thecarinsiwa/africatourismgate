import type { Metadata } from 'next';
import { DashboardSectionPage } from '../../../components/dashboard-section-page';

export const metadata: Metadata = {
  title: 'Tableau de bord — Africa Tourism Gate Admin',
};

export default function DashboardPage() {
  return (
    <DashboardSectionPage
      title="Tableau de bord"
      description="Bienvenue sur votre espace d'administration."
    />
  );
}
