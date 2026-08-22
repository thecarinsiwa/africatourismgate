'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { StatCard, cn } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import {
  promotionsFiltersMatch,
  promotionsKpiListFilter,
  promotionsKpis,
  type PromotionsKpiKey,
  type PromotionsListFilter,
} from '../../config/promotions-kpi';
import { useModuleStatCards } from '../../lib/auth/use-module-stat-cards';
import { getApiClient } from '../../lib/auth/api';
import { formatCount } from '../../lib/format-money';

type KpiCardState = {
  status: 'loading' | 'ready' | 'error';
  displayValue?: string;
  errorMessage?: string;
};

const initialCardState: KpiCardState = { status: 'loading' };

type PromotionsStatCardsProps = {
  className?: string;
  listFilter: PromotionsListFilter;
  onListFilterChange: (filter: PromotionsListFilter) => void;
};

export function PromotionsStatCards({
  className,
  listFilter,
  onListFilterChange,
}: PromotionsStatCardsProps) {
  const { dashboardKpi: getDashboardKpiErrorMessage } = useAdminErrorMessages();
  const { canLoad, loading: permissionsLoading, shouldRender } =
    useModuleStatCards('promo_codes.read');
  const t = useTranslations('modules.promotions');
  const [cards, setCards] = useState<Record<PromotionsKpiKey, KpiCardState>>(() => ({
    total: { ...initialCardState },
    active: { ...initialCardState },
    inactive: { ...initialCardState },
    withDiscount: { ...initialCardState },
  }));

  useEffect(() => {
    if (permissionsLoading || !canLoad) return;

    let cancelled = false;
    const client = getApiClient();

    async function loadKpi(key: PromotionsKpiKey): Promise<KpiCardState> {
      try {
        const result = await client.listPromotions({
          page: 1,
          limit: 1,
          ...promotionsKpiListFilter[key],
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
        promotionsKpis.map(async (kpi) => [kpi.key, await loadKpi(kpi.key)] as const),
      );

      if (cancelled) return;

      setCards(Object.fromEntries(results) as Record<PromotionsKpiKey, KpiCardState>);
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
        {promotionsKpis.map((kpi) => {
          const state = cards[kpi.key];
          const kpiFilter = promotionsKpiListFilter[kpi.key];
          const isActive = promotionsFiltersMatch(listFilter, kpiFilter);
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
