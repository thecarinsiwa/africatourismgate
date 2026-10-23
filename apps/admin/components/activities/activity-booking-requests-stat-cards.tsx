'use client';

import { StatCard, cn } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import {
  activityBookingRequestsKpiListFilter,
  activityBookingRequestsFiltersMatch,
  activityBookingRequestsKpis,
  type ActivityBookingRequestsKpiKey,
  type ActivityBookingRequestsListFilter,
} from '../../config/activity-booking-requests-kpi';
import { getApiClient } from '../../lib/auth/api';
import { useModuleStatCards } from '../../lib/auth/use-module-stat-cards';
import { formatCount } from '../../lib/format-money';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

type KpiCardState = {
  status: 'loading' | 'ready' | 'error';
  displayValue?: string;
  errorMessage?: string;
};

const initialCardState: KpiCardState = { status: 'loading' };

type ActivityBookingRequestsStatCardsProps = {
  className?: string;
  refreshKey?: number;
  listFilter: ActivityBookingRequestsListFilter;
  onListFilterChange: (filter: ActivityBookingRequestsListFilter) => void;
};

export function ActivityBookingRequestsStatCards({
  className,
  refreshKey = 0,
  listFilter,
  onListFilterChange,
}: ActivityBookingRequestsStatCardsProps) {
  const { dashboardKpi: getDashboardKpiErrorMessage } = useAdminErrorMessages();
  const { canLoad, loading: permissionsLoading, shouldRender } =
    useModuleStatCards('activities.read');
  const t = useTranslations('modules.activities');
  const [cards, setCards] = useState<Record<ActivityBookingRequestsKpiKey, KpiCardState>>(
    () => ({
      total: { ...initialCardState },
      pending: { ...initialCardState },
      contacted: { ...initialCardState },
      confirmed: { ...initialCardState },
      cancelled: { ...initialCardState },
    }),
  );

  useEffect(() => {
    if (permissionsLoading || !canLoad) return;

    let cancelled = false;
    const client = getApiClient();

    async function loadKpi(key: ActivityBookingRequestsKpiKey): Promise<KpiCardState> {
      try {
        const result = await client.listActivityBookingRequests({
          page: 1,
          limit: 1,
          ...activityBookingRequestsKpiListFilter[key],
        });
        return { status: 'ready', displayValue: formatCount(result.meta.total) };
      } catch (error) {
        return {
          status: 'error',
          errorMessage: getDashboardKpiErrorMessage(error),
        };
      }
    }

    async function loadAll() {
      const results = await Promise.all(
        activityBookingRequestsKpis.map(
          async (kpi) => [kpi.key, await loadKpi(kpi.key)] as const,
        ),
      );
      if (cancelled) return;
      setCards(
        Object.fromEntries(results) as Record<ActivityBookingRequestsKpiKey, KpiCardState>,
      );
    }

    void loadAll();
    return () => {
      cancelled = true;
    };
  }, [canLoad, getDashboardKpiErrorMessage, permissionsLoading, refreshKey]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {activityBookingRequestsKpis.map((kpi) => {
          const state = cards[kpi.key];
          const kpiFilter = activityBookingRequestsKpiListFilter[kpi.key];
          const isActive = activityBookingRequestsFiltersMatch(listFilter, kpiFilter);
          const card = (
            <StatCard
              label={t(kpi.labelKey)}
              subtitle={t(kpi.subtitleKey)}
              status={state.status}
              value={state.displayValue}
              errorMessage={state.errorMessage}
              icon={kpi.icon}
              iconClassName={kpi.iconClass}
            />
          );

          if (state.status !== 'ready') {
            return <div key={kpi.key}>{card}</div>;
          }

          return (
            <button
              key={kpi.key}
              type="button"
              aria-pressed={isActive}
              onClick={() => onListFilterChange(kpiFilter)}
              className={cn(
                'block w-full rounded-xl text-left transition-opacity hover:opacity-90',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-atg-bg',
                isActive && 'ring-2 ring-primary ring-offset-2 ring-offset-atg-bg',
              )}
            >
              {card}
            </button>
          );
        })}
      </div>
    </div>
  );
}
