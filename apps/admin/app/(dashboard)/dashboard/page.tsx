import type { Metadata } from 'next';
import { DashboardPageContent } from '../../../components/dashboard-page-content';

export const metadata: Metadata = {
  title: 'Tableau de bord — Africa Tourism Gate Admin',
};

export default function DashboardPage() {
  return <DashboardPageContent />;
}
