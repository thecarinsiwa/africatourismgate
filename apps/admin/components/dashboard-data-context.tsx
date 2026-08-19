'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { dashboardKpis, type DashboardKpiKey } from '../config/dashboard-kpi';
import { isApiForbidden } from '../lib/auth/is-api-forbidden';
import { useAdminErrorMessages } from '../lib/i18n/use-admin-error-messages';
import { fetchDashboardBatch } from '../lib/dashboard-batch-data';
import type { DashboardKpiData } from '../lib/dashboard-kpi-data';
import type { DashboardTrendResult } from '../lib/dashboard-trend-data';
import { usePermissions } from '../lib/auth/use-permissions';
import { useDashboardPeriod } from './dashboard-period-context';

export type DashboardKpiSlotState =
  | { status: 'loading' }
  | { status: 'hidden' }
  | { status: 'ready'; data: DashboardKpiData }
  | { status: 'error'; errorMessage: string };

export type DashboardTrendSlotState =
  | { status: 'loading' }
  | { status: 'hidden' }
  | { status: 'ready'; result: DashboardTrendResult }
  | { status: 'error' };

type DashboardDataContextValue = {
  permissionsLoading: boolean;
  dataLoading: boolean;
  kpis: Record<DashboardKpiKey, DashboardKpiSlotState>;
  trend: DashboardTrendSlotState;
};

function buildLoadingKpis(visibleKeys: DashboardKpiKey[]): Record<DashboardKpiKey, DashboardKpiSlotState> {
  return {
    users: visibleKeys.includes('users') ? { status: 'loading' } : { status: 'hidden' },
    bookings: visibleKeys.includes('bookings') ? { status: 'loading' } : { status: 'hidden' },
    revenue: visibleKeys.includes('revenue') ? { status: 'loading' } : { status: 'hidden' },
    properties: visibleKeys.includes('properties') ? { status: 'loading' } : { status: 'hidden' },
  };
}

function buildKpiSlot(
  key: DashboardKpiKey,
  visibleKeys: DashboardKpiKey[],
  data: Partial<Record<DashboardKpiKey, DashboardKpiData>>,
  forbidden: boolean,
  errorMessage: string,
): DashboardKpiSlotState {
  if (!visibleKeys.includes(key)) {
    return { status: 'hidden' };
  }
  if (forbidden) {
    return { status: 'hidden' };
  }
  const kpiData = data[key];
  if (kpiData) {
    return { status: 'ready', data: kpiData };
  }
  return { status: 'error', errorMessage };
}

const DashboardDataContext = createContext<DashboardDataContextValue | null>(null);

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const { period } = useDashboardPeriod();
  const { hasPermission, loading: permissionsLoading } = usePermissions();
  const { dashboardKpi: getDashboardKpiErrorMessage } = useAdminErrorMessages();

  const visibleKpiKeys = useMemo(
    () =>
      dashboardKpis
        .filter((kpi) => hasPermission(kpi.permission))
        .map((kpi) => kpi.key),
    [hasPermission],
  );

  const canReadBookings = hasPermission('bookings.read');
  const canReadPayments = hasPermission('payments.read');
  const canShowTrend = canReadBookings || canReadPayments;

  const [dataLoading, setDataLoading] = useState(true);
  const [kpis, setKpis] = useState<Record<DashboardKpiKey, DashboardKpiSlotState>>(() =>
    buildLoadingKpis([]),
  );
  const [trend, setTrend] = useState<DashboardTrendSlotState>({ status: 'loading' });

  useEffect(() => {
    if (permissionsLoading) {
      return;
    }

    let cancelled = false;

    setDataLoading(true);
    setKpis(buildLoadingKpis(visibleKpiKeys));
    setTrend(canShowTrend ? { status: 'loading' } : { status: 'hidden' });

    if (visibleKpiKeys.length === 0 && !canShowTrend) {
      setDataLoading(false);
      return;
    }

    void fetchDashboardBatch(period, {
      kpiKeys: visibleKpiKeys,
      canReadBookings,
      canReadPayments,
    })
      .then((batch) => {
        if (cancelled) return;

        setKpis({
          users: buildKpiSlot('users', visibleKpiKeys, batch.kpis, false, ''),
          bookings: buildKpiSlot('bookings', visibleKpiKeys, batch.kpis, false, ''),
          revenue: buildKpiSlot('revenue', visibleKpiKeys, batch.kpis, false, ''),
          properties: buildKpiSlot('properties', visibleKpiKeys, batch.kpis, false, ''),
        });

        if (!canShowTrend) {
          setTrend({ status: 'hidden' });
        } else if (batch.trend) {
          setTrend({ status: 'ready', result: batch.trend });
        } else {
          setTrend({ status: 'error' });
        }
      })
      .catch((error) => {
        if (cancelled) return;

        const forbidden = isApiForbidden(error);
        const message = getDashboardKpiErrorMessage(error);

        setKpis({
          users: buildKpiSlot('users', visibleKpiKeys, {}, forbidden, message),
          bookings: buildKpiSlot('bookings', visibleKpiKeys, {}, forbidden, message),
          revenue: buildKpiSlot('revenue', visibleKpiKeys, {}, forbidden, message),
          properties: buildKpiSlot('properties', visibleKpiKeys, {}, forbidden, message),
        });

        setTrend(
          !canShowTrend ? { status: 'hidden' } : forbidden ? { status: 'hidden' } : { status: 'error' },
        );
      })
      .finally(() => {
        if (!cancelled) {
          setDataLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    canReadBookings,
    canReadPayments,
    canShowTrend,
    getDashboardKpiErrorMessage,
    period,
    permissionsLoading,
    visibleKpiKeys,
  ]);

  const value = useMemo(
    () => ({
      permissionsLoading,
      dataLoading,
      kpis,
      trend,
    }),
    [dataLoading, kpis, permissionsLoading, trend],
  );

  return (
    <DashboardDataContext.Provider value={value}>{children}</DashboardDataContext.Provider>
  );
}

export function useDashboardData(): DashboardDataContextValue {
  const context = useContext(DashboardDataContext);
  if (!context) {
    throw new Error('useDashboardData must be used within DashboardDataProvider');
  }
  return context;
}

export function useDashboardKpi(key: DashboardKpiKey): DashboardKpiSlotState {
  return useDashboardData().kpis[key];
}

export function useDashboardTrendData(): DashboardTrendSlotState {
  return useDashboardData().trend;
}
