'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { StatCard, cn } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import {
  paymentsKpiStatusFilter,
  paymentsKpis,
  type PaymentsKpiKey,
} from '../../config/payments-kpi';
import { useModuleStatCards } from '../../lib/auth/use-module-stat-cards';
import { getApiClient } from '../../lib/auth/api';
import { formatCount, formatMoney } from '../../lib/format-money';
import type { PaymentsStatusFilter } from './payments-list';

type KpiCardState = {
  status: 'loading' | 'ready' | 'error';
  displayValue?: string;
  errorMessage?: string;
};

const initialCardState: KpiCardState = { status: 'loading' };

type PaymentsStatCardsProps = {
  className?: string;
  statusFilter: PaymentsStatusFilter;
  onStatusFilterChange: (filter: PaymentsStatusFilter) => void;
};

export function PaymentsStatCards({
  className,
  statusFilter,
  onStatusFilterChange,
}: PaymentsStatCardsProps) {
  const { dashboardKpi: getDashboardKpiErrorMessage } = useAdminErrorMessages();
  const { canLoad, loading: permissionsLoading, shouldRender } = useModuleStatCards('payments.read');
  const t = useTranslations('modules.payments');
  const [cards, setCards] = useState<Record<PaymentsKpiKey, KpiCardState>>(() => ({
    total: { ...initialCardState },
    succeeded: { ...initialCardState },
    pending: { ...initialCardState },
    revenue: { ...initialCardState },
  }));

  useEffect(() => {
    if (permissionsLoading || !canLoad) return;

    let cancelled = false;
    const client = getApiClient();

    async function loadKpi(key: PaymentsKpiKey): Promise<KpiCardState> {
      try {
        if (key === 'revenue') {
          const revenue = await client.getSucceededPaymentsRevenue();
          return {
            status: 'ready',
            displayValue: formatMoney(revenue.totalCents, revenue.currency),
          };
        }

        const status =
          key === 'total' ? undefined : key === 'succeeded' ? 'succeeded' : 'pending';

        const result = await client.listPayments({
          page: 1,
          limit: 1,
          status,
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
        paymentsKpis.map(async (kpi) => [kpi.key, await loadKpi(kpi.key)] as const),
      );

      if (cancelled) return;

      setCards(Object.fromEntries(results) as Record<PaymentsKpiKey, KpiCardState>);
    }

    void loadAll();

    return () => {
      cancelled = true;
    };
  }, [canLoad, getDashboardKpiErrorMessage, permissionsLoading]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {paymentsKpis.map((kpi) => {
          const state = cards[kpi.key];
          const kpiFilter = paymentsKpiStatusFilter[kpi.key];
          const isActive = statusFilter === kpiFilter;
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
              onClick={() => onStatusFilterChange(kpiFilter)}
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
