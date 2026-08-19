'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { StatCard } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { tourGuidesKpis, type TourGuidesKpiKey } from '../../config/tour-guides-kpi';
import { useModuleStatCards } from '../../lib/auth/use-module-stat-cards';
import { getApiClient } from '../../lib/auth/api';
import { formatCount } from '../../lib/format-money';

type KpiCardState = {
  status: 'loading' | 'ready' | 'error';
  displayValue?: string;
  errorMessage?: string;
};

const initialCardState: KpiCardState = { status: 'loading' };

export function TourGuidesStatCards({ className }: { className?: string }) {
  const { dashboardKpi: getDashboardKpiErrorMessage } = useAdminErrorMessages();
  const { canLoad, loading: permissionsLoading, shouldRender } =
    useModuleStatCards('guides.read');
  const t = useTranslations('modules.tourGuides');
  const [cards, setCards] = useState<Record<TourGuidesKpiKey, KpiCardState>>(() => ({
    total: { ...initialCardState },
    active: { ...initialCardState },
    inactive: { ...initialCardState },
    internal: { ...initialCardState },
  }));

  useEffect(() => {
    if (permissionsLoading || !canLoad) return;

    let cancelled = false;
    const client = getApiClient();

    async function loadKpi(key: TourGuidesKpiKey): Promise<KpiCardState> {
      try {
        if (key === 'total') {
          const result = await client.listTourGuides({ page: 1, limit: 1 });
          return { status: 'ready', displayValue: formatCount(result.meta.total) };
        }
        if (key === 'active') {
          const result = await client.listTourGuides({
            page: 1,
            limit: 1,
            status: 'active',
          });
          return { status: 'ready', displayValue: formatCount(result.meta.total) };
        }
        if (key === 'inactive') {
          const result = await client.listTourGuides({
            page: 1,
            limit: 1,
            status: 'inactive',
          });
          return { status: 'ready', displayValue: formatCount(result.meta.total) };
        }
        const result = await client.listTourGuides({
          page: 1,
          limit: 1,
          type: 'internal',
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
        tourGuidesKpis.map(async (kpi) => [kpi.key, await loadKpi(kpi.key)] as const),
      );

      if (cancelled) return;

      setCards(Object.fromEntries(results) as Record<TourGuidesKpiKey, KpiCardState>);
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
        {tourGuidesKpis.map((kpi) => {
          const state = cards[kpi.key];
          return (
            <div key={kpi.key}>
              <StatCard
                label={t(kpi.labelKey)}
                subtitle={t(kpi.subtitleKey)}
                status={state.status}
                value={state.displayValue}
                errorMessage={state.errorMessage}
                icon={kpi.icon}
                iconClassName={kpi.iconClass}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
