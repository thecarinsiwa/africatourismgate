'use client';

import { StatCard, cn } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import {
  supportFiltersMatch,
  supportKpiListFilter,
  supportKpis,
  type SupportKpiKey,
  type SupportListFilter,
} from '../../config/support-kpi';
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

type SupportStatCardsProps = {
  className?: string;
  refreshKey?: number;
  listFilter: SupportListFilter;
  onListFilterChange: (filter: SupportListFilter) => void;
};

export function SupportStatCards({
  className,
  refreshKey = 0,
  listFilter,
  onListFilterChange,
}: SupportStatCardsProps) {
  const { dashboardKpi: getDashboardKpiErrorMessage } = useAdminErrorMessages();
  const { canLoad, loading: permissionsLoading, shouldRender } =
    useModuleStatCards('support_tickets.read');
  const t = useTranslations('modules.support');
  const [cards, setCards] = useState<Record<SupportKpiKey, KpiCardState>>(() => ({
    total: { ...initialCardState },
    open: { ...initialCardState },
    pending: { ...initialCardState },
    resolved: { ...initialCardState },
    closed: { ...initialCardState },
  }));

  useEffect(() => {
    if (permissionsLoading || !canLoad) return;

    let cancelled = false;
    const client = getApiClient();

    async function loadKpi(key: SupportKpiKey): Promise<KpiCardState> {
      try {
        const result = await client.listSupportTickets({
          page: 1,
          limit: 1,
          ...supportKpiListFilter[key],
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
        supportKpis.map(async (kpi) => [kpi.key, await loadKpi(kpi.key)] as const),
      );
      if (cancelled) return;
      setCards(Object.fromEntries(results) as Record<SupportKpiKey, KpiCardState>);
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
        {supportKpis.map((kpi) => {
          const state = cards[kpi.key];
          const kpiFilter = supportKpiListFilter[kpi.key];
          const isActive = supportFiltersMatch(listFilter, kpiFilter);
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
