'use client';

import type {
  AnalyticsPeriod,
  AnalyticsSummary,
  AnalyticsTopPages,
  AnalyticsTrend,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { fetchAnalyticsPageData } from '../../lib/analytics/fetch-analytics-data';
import { usePermissions } from '../../lib/auth/use-permissions';
import { AnalyticsKpiCards } from '../analytics/analytics-kpi-cards';
import { AnalyticsPageHeader } from '../analytics/analytics-page-header';
import { AnalyticsTopPagesTable } from '../analytics/analytics-top-pages';
import { AnalyticsTrendChart } from '../analytics/analytics-trend-chart';
import {
  DashboardPeriodProvider,
  useDashboardPeriod,
} from '../dashboard-period-context';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'ready';
      summary: AnalyticsSummary;
      trend: AnalyticsTrend;
      topPages: AnalyticsTopPages;
    };

function AnalyticsPageBody() {
  const t = useTranslations('modules.analytics');
  const tCommon = useTranslations('common.errors');
  const { period } = useDashboardPeriod();
  const { hasPermission, loading: permissionsLoading } = usePermissions();
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    if (permissionsLoading) {
      return;
    }

    if (!hasPermission('analytics.read')) {
      setState({ status: 'error', message: t('error.forbidden') });
      return;
    }

    let cancelled = false;
    setState({ status: 'loading' });

    void fetchAnalyticsPageData(period as AnalyticsPeriod, {
      network: tCommon('network'),
      forbiddenDetail: t('error.forbidden'),
      loadFailed: t('error.loadFailed'),
    })
      .then((data) => {
        if (!cancelled) {
          setState({ status: 'ready', ...data });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            status: 'error',
            message:
              error instanceof Error ? error.message : t('error.loadFailed'),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [hasPermission, period, permissionsLoading, t, tCommon]);

  const status =
    permissionsLoading || state.status === 'loading'
      ? 'loading'
      : state.status === 'error'
        ? 'error'
        : 'ready';

  const errorMessage = state.status === 'error' ? state.message : undefined;
  const summary = state.status === 'ready' ? state.summary : null;
  const trend = state.status === 'ready' ? state.trend : null;
  const topPages = state.status === 'ready' ? state.topPages : null;

  return (
    <div className="space-y-8">
      <AnalyticsPageHeader />
      <AnalyticsKpiCards status={status} summary={summary} errorMessage={errorMessage} />
      <AnalyticsTrendChart status={status} trend={trend} errorMessage={errorMessage} />
      <AnalyticsTopPagesTable
        status={status}
        topPages={topPages}
        errorMessage={errorMessage}
      />
    </div>
  );
}

export function AnalyticsPageContent() {
  return (
    <DashboardPeriodProvider>
      <AnalyticsPageBody />
    </DashboardPeriodProvider>
  );
}
