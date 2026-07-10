'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { StatCard } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { destinationsKpis, type DestinationsKpiKey } from '../../config/destinations-kpi';
import { useModuleStatCards } from '../../lib/auth/use-module-stat-cards';
import { getApiClient } from '../../lib/auth/api';
import { formatCount } from '../../lib/format-money';

type KpiCardState = {
  status: 'loading' | 'ready' | 'error';
  displayValue?: string;
  errorMessage?: string;
};

const initialCardState: KpiCardState = { status: 'loading' };

async function countDistinctCountries(): Promise<number> {
  const client = getApiClient();
  const countries = new Set<string>();
  let page = 1;
  let totalPages = 1;

  do {
    const result = await client.listDestinations({ page, limit: 100 });
    for (const destination of result.data) {
      countries.add(destination.countryCode);
    }
    totalPages = result.meta.totalPages;
    page += 1;
  } while (page <= totalPages);

  return countries.size;
}

export function DestinationsStatCards({ className }: { className?: string }) {
  const { dashboardKpi: getDashboardKpiErrorMessage } = useAdminErrorMessages();
  const { canLoad, loading: permissionsLoading, shouldRender } = useModuleStatCards('destinations.read');
  const t = useTranslations('modules.destinations');
  const [cards, setCards] = useState<Record<DestinationsKpiKey, KpiCardState>>(() => ({
    destinations: { ...initialCardState },
    pois: { ...initialCardState },
    countries: { ...initialCardState },
  }));

  useEffect(() => {
    if (permissionsLoading || !canLoad) return;

    let cancelled = false;
    const client = getApiClient();

    async function loadKpi(key: DestinationsKpiKey): Promise<KpiCardState> {
      try {
        if (key === 'destinations') {
          const result = await client.listDestinations({ page: 1, limit: 1 });
          return { status: 'ready', displayValue: formatCount(result.meta.total) };
        }
        if (key === 'pois') {
          const result = await client.listPointsOfInterest({ page: 1, limit: 1 });
          return { status: 'ready', displayValue: formatCount(result.meta.total) };
        }
        const count = await countDistinctCountries();
        return { status: 'ready', displayValue: formatCount(count) };
      } catch (error) {
        return {
          status: 'error',
          errorMessage: getDashboardKpiErrorMessage(error),
        };
      }
    }

    async function loadAll() {
      const results = await Promise.all(
        destinationsKpis.map(async (kpi) => [kpi.key, await loadKpi(kpi.key)] as const),
      );

      if (cancelled) return;

      setCards(Object.fromEntries(results) as Record<DestinationsKpiKey, KpiCardState>);
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {destinationsKpis.map((kpi) => {
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
