'use client';

import { useAdminErrorMessages } from '../lib/i18n/use-admin-error-messages';

import { StatCard, type StatCardChange } from '@africatourismgate/ui';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { useDashboardPeriod } from './dashboard-period-context';
import { dashboardKpis, type DashboardKpiKey } from '../config/dashboard-kpi';
import { isApiForbidden } from '../lib/auth/is-api-forbidden';
import { usePermissions } from '../lib/auth/use-permissions';
import {
  fetchDashboardKpiData,
  formatKpiChangePercent,
  type DashboardKpiChange,
} from '../lib/dashboard-kpi-data';
import { formatCount, formatMoney } from '../lib/format-money';

type KpiCardState = {
  status: 'loading' | 'ready' | 'error' | 'hidden';
  displayValue?: string;
  change?: DashboardKpiChange;
  errorMessage?: string;
};

const initialCardState: KpiCardState = { status: 'loading' };

function kpiSubtitleKey(key: DashboardKpiKey): string {
  if (key === 'bookings' || key === 'revenue') {
    return `kpi.${key}.subtitlePeriod`;
  }
  const config = dashboardKpis.find((kpi) => kpi.key === key);
  return config?.subtitleKey ?? `kpi.${key}.subtitle`;
}

function toStatCardChange(
  change: DashboardKpiChange | undefined,
  locale: string,
  label: string,
): StatCardChange | undefined {
  if (!change) {
    return undefined;
  }

  return {
    direction: change.direction,
    formattedPercent: formatKpiChangePercent(change, locale),
    label,
  };
}

export function DashboardKpiCards({ className }: { className?: string }) {
  const { dashboardKpi: getDashboardKpiErrorMessage } = useAdminErrorMessages();
  const { hasPermission, loading: permissionsLoading } = usePermissions();
  const { period } = useDashboardPeriod();
  const locale = useLocale();
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

    async function loadKpi(key: DashboardKpiKey): Promise<KpiCardState> {
      try {
        const data = await fetchDashboardKpiData(key, period);
        const displayValue =
          key === 'revenue'
            ? formatMoney(data.rawValue, data.currency ?? 'CDF')
            : formatCount(data.rawValue);

        const showChange = key === 'bookings' || key === 'revenue';

        return {
          status: 'ready',
          displayValue,
          change: showChange ? data.change : undefined,
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
      setCards((current) => {
        const next = { ...current };
        for (const kpi of visibleKpis) {
          next[kpi.key] = { status: 'loading' };
        }
        return next;
      });

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
  }, [getDashboardKpiErrorMessage, permissionsLoading, period, visibleKpis]);

  if (permissionsLoading) {
    return null;
  }

  const renderableKpis = visibleKpis.filter((kpi) => cards[kpi.key].status !== 'hidden');

  if (renderableKpis.length === 0) {
    return null;
  }

  const changeLabel = t('kpi.change.vsPreviousPeriod');

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {renderableKpis.map((kpi) => {
          const state = cards[kpi.key];
          const card = (
            <StatCard
              label={t(kpi.labelKey)}
              subtitle={t(kpiSubtitleKey(kpi.key))}
              status={state.status === 'hidden' ? 'loading' : state.status}
              value={state.displayValue}
              change={toStatCardChange(state.change, locale, changeLabel)}
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
