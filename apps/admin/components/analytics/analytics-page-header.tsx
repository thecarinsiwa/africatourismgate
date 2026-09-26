'use client';

import { Button, PageHeader } from '@africatourismgate/ui';
import type { AnalyticsPeriod } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import {
  DASHBOARD_PERIODS,
  useDashboardPeriod,
  type DashboardPeriod,
} from '../dashboard-period-context';

export function AnalyticsPageHeader() {
  const t = useTranslations('modules.analytics');
  const { period, setPeriod } = useDashboardPeriod();

  return (
    <PageHeader
      title={t('title')}
      description={t('description')}
      actions={
        <div
          role="tablist"
          aria-label={t('period.label')}
          className="inline-flex rounded-lg border border-atg-border bg-atg-surface/50 p-1"
        >
          {DASHBOARD_PERIODS.map((value) => (
            <Button
              key={value}
              type="button"
              role="tab"
              aria-selected={period === value}
              variant={period === value ? 'primary' : 'ghost'}
              size="sm"
              className="min-w-[4.5rem]"
              onClick={() => setPeriod(value as DashboardPeriod)}
            >
              {t(`period.${value as AnalyticsPeriod}`)}
            </Button>
          ))}
        </div>
      }
    />
  );
}
