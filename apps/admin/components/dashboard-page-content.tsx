'use client';

import type { ReactNode } from 'react';
import { DashboardKpiCards } from './dashboard-kpi-cards';
import { DashboardPageHeader } from './dashboard-page-header';
import { DashboardPeriodProvider } from './dashboard-period-context';
import { DashboardPlatformOverview } from './dashboard-platform-overview';
import { DashboardQuickActions } from './dashboard-quick-actions';
import { DashboardRecentUsers } from './dashboard-recent-users';
import { DashboardTrendChart } from './dashboard-trend-chart';
import { DashboardUserStats } from './dashboard-user-stats';

function DashboardTwoColumnSection({ children }: { children: ReactNode }) {
  const items = Array.isArray(children)
    ? children.filter((child) => child !== null && child !== false)
    : children
      ? [children]
      : [];

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      className={
        items.length === 1
          ? 'grid grid-cols-1 gap-6'
          : 'grid grid-cols-1 gap-6 lg:grid-cols-2'
      }
    >
      {items}
    </div>
  );
}

export function DashboardPageContent() {
  return (
    <DashboardPeriodProvider>
      <div className="space-y-8">
        <DashboardPageHeader />

        <DashboardKpiCards />

        <DashboardTrendChart />

        <DashboardTwoColumnSection>
          <DashboardUserStats />
          <DashboardPlatformOverview />
        </DashboardTwoColumnSection>

        <DashboardTwoColumnSection>
          <DashboardQuickActions />
          <DashboardRecentUsers />
        </DashboardTwoColumnSection>
      </div>
    </DashboardPeriodProvider>
  );
}
