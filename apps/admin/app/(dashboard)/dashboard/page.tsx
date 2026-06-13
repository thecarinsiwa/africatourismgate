import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../components/admin-page-intro';
import { DashboardKpiCards } from '../../../components/dashboard-kpi-cards';
import { DashboardPlatformOverview } from '../../../components/dashboard-platform-overview';
import { DashboardQuickActions } from '../../../components/dashboard-quick-actions';
import { DashboardRecentUsers } from '../../../components/dashboard-recent-users';
import { DashboardUserStats } from '../../../components/dashboard-user-stats';

export const metadata: Metadata = {
  title: 'Tableau de bord — Africa Tourism Gate Admin',
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <AdminPageIntro description={"Vue d&apos;ensemble de votre plateforme Africa Tourism Gate"} className="md:text-base" />

      <DashboardKpiCards />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DashboardUserStats />
        <DashboardPlatformOverview />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DashboardQuickActions />
        <DashboardRecentUsers />
      </div>
    </div>
  );
}
