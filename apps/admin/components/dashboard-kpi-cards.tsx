'use client';

import { StatCard, type StatCardChange } from '@africatourismgate/ui';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { dashboardKpis, type DashboardKpiKey } from '../config/dashboard-kpi';
import {
  formatKpiChangePercent,
  type DashboardKpiChange,
} from '../lib/dashboard-kpi-data';
import { formatCount, formatMoney } from '../lib/format-money';
import { useDashboardData } from './dashboard-data-context';
import { usePermissions } from '../lib/auth/use-permissions';

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
  const { hasPermission, loading: permissionsLoading } = usePermissions();
  const { kpis, dataLoading } = useDashboardData();
  const locale = useLocale();
  const t = useTranslations('dashboard');

  const visibleKpis = useMemo(
    () => dashboardKpis.filter((kpi) => hasPermission(kpi.permission)),
    [hasPermission],
  );

  const dataLoadingState = permissionsLoading || dataLoading;

  const displayKpis = useMemo(() => {
    if (permissionsLoading) {
      return dashboardKpis;
    }
    if (dataLoadingState) {
      return visibleKpis;
    }
    return visibleKpis.filter((kpi) => kpis[kpi.key].status !== 'hidden');
  }, [dataLoadingState, kpis, permissionsLoading, visibleKpis]);

  if (!permissionsLoading && !dataLoadingState && displayKpis.length === 0) {
    return null;
  }

  const changeLabel = t('kpi.change.vsPreviousPeriod');

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {displayKpis.map((kpi) => {
          const slot = permissionsLoading ? { status: 'loading' as const } : kpis[kpi.key];
          const cardStatus =
            dataLoadingState || slot.status === 'loading'
              ? 'loading'
              : slot.status === 'error'
                ? 'error'
                : slot.status === 'ready'
                  ? 'ready'
                  : 'loading';

          const displayValue =
            slot.status === 'ready'
              ? kpi.key === 'revenue'
                ? formatMoney(slot.data.rawValue, slot.data.currency ?? 'CDF')
                : formatCount(slot.data.rawValue)
              : undefined;

          const change =
            slot.status === 'ready' && (kpi.key === 'bookings' || kpi.key === 'revenue')
              ? slot.data.change
              : undefined;

          const card = (
            <StatCard
              label={t(kpi.labelKey)}
              subtitle={t(kpiSubtitleKey(kpi.key))}
              status={cardStatus}
              value={displayValue}
              change={toStatCardChange(change, locale, changeLabel)}
              errorMessage={slot.status === 'error' ? slot.errorMessage : undefined}
              icon={kpi.icon}
              iconClassName={kpi.iconClass}
            />
          );

          if ('href' in kpi && kpi.href && slot.status === 'ready') {
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
