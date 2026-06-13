'use client';

import { DashboardKpiCards } from './dashboard-kpi-cards';
import { DashboardPageHeader } from './dashboard-page-header';
import { DashboardPeriodProvider } from './dashboard-period-context';
import { DashboardPlatformOverview } from './dashboard-platform-overview';
import { DashboardQuickActions } from './dashboard-quick-actions';
import { DashboardRecentUsers } from './dashboard-recent-users';
import { DashboardTrendChart } from './dashboard-trend-chart';
import { DashboardUserStats } from './dashboard-user-stats';

export function DashboardPageContent() {
  return (
    <DashboardPeriodProvider>
      <div className="space-y-8">
        <DashboardPageHeader />

        <DashboardKpiCards />

        <DashboardTrendChart />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DashboardUserStats />
          <DashboardPlatformOverview />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DashboardQuickActions />
          <DashboardRecentUsers />
        </div>
      </div>
    </DashboardPeriodProvider>
  );
}
