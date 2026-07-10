'use client';

import { useAdminErrorMessages } from '../lib/i18n/use-admin-error-messages';

import { StatCard } from '@africatourismgate/ui';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { dashboardKpis, type DashboardKpiKey } from '../config/dashboard-kpi';
import { isApiForbidden } from '../lib/auth/is-api-forbidden';
import { usePermissions } from '../lib/auth/use-permissions';
import { formatCount, formatMoney } from '../lib/format-money';
import { getApiClient } from '../lib/auth/api';

type KpiCardState = {
  status: 'loading' | 'ready' | 'error' | 'hidden';
  displayValue?: string;
  errorMessage?: string;
};

const initialCardState: KpiCardState = { status: 'loading' };

export function DashboardKpiCards({ className }: { className?: string }) {
  const { dashboardKpi: getDashboardKpiErrorMessage } = useAdminErrorMessages();
  const { hasPermission, loading: permissionsLoading } = usePermissions();
  const t = useTranslations('dashboard');

  const visibleKpis = useMemo(
    () => dashboardKpis.filter((kpi) => hasPermission(kpi.permission)),
    [hasPermission],
  );

  const [cards, setCards] = useState<Record<DashboardKpiKey, KpiCardState>>(() => ({
    users: { ...initialCardState },
    bookings: { ...initialCardState },
    revenue: { ...initialCardState },
    properties: { ...initialCardState },
  }));

  useEffect(() => {
    if (permissionsLoading || visibleKpis.length === 0) return;

    let cancelled = false;
    const client = getApiClient();

    async function loadKpi(key: DashboardKpiKey): Promise<KpiCardState> {
      try {
        if (key === 'users') {
          const total = await client.countUsers();
          return { status: 'ready', displayValue: formatCount(total) };
        }
        if (key === 'bookings') {
          const total = await client.countBookings();
          return { status: 'ready', displayValue: formatCount(total) };
        }
        if (key === 'properties') {
          const total = await client.countProperties();
          return { status: 'ready', displayValue: formatCount(total) };
        }
        const revenue = await client.getSucceededPaymentsRevenue();
        return {
          status: 'ready',
          displayValue: formatMoney(revenue.totalCents, revenue.currency),
        };
      } catch (error) {
        if (isApiForbidden(error)) {
          return { status: 'hidden' };
        }
        return {
          status: 'error',
          errorMessage: getDashboardKpiErrorMessage(error),
        };
      }
    }

    async function loadAll() {
      const results = await Promise.all(
        visibleKpis.map(async (kpi) => [kpi.key, await loadKpi(kpi.key)] as const),
      );

      if (cancelled) return;

      setCards((current) => ({
        ...current,
        ...Object.fromEntries(results),
      }));
    }

    void loadAll();

    return () => {
      cancelled = true;
    };
  }, [getDashboardKpiErrorMessage, permissionsLoading, visibleKpis]);

  if (permissionsLoading) {
    return null;
  }

  const renderableKpis = visibleKpis.filter((kpi) => cards[kpi.key].status !== 'hidden');

  if (renderableKpis.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {renderableKpis.map((kpi) => {
          const state = cards[kpi.key];
          const card = (
            <StatCard
              label={t(kpi.labelKey)}
              subtitle={t(kpi.subtitleKey)}
              status={state.status === 'hidden' ? 'loading' : state.status}
              value={state.displayValue}
              errorMessage={state.errorMessage}
              icon={kpi.icon}
              iconClassName={kpi.iconClass}
            />
          );

          if ('href' in kpi && kpi.href && state.status === 'ready') {
            return (
              <Link
                key={kpi.key}
                href={kpi.href}
                className="block rounded-xl transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {card}
              </Link>
            );
          }

          return <div key={kpi.key}>{card}</div>;
        })}
      </div>
    </div>
  );
}
