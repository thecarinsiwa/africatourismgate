'use client';

import { StatCard } from '@africatourismgate/ui';
import { useEffect, useState } from 'react';
import { packagesKpis, type PackagesKpiKey } from '../../config/packages-kpi';
import { getApiClient } from '../../lib/auth/api';
import { getDashboardKpiErrorMessage } from '../../lib/dashboard-api-errors';
import { formatCount } from '../../lib/format-money';

type KpiCardState = {
  status: 'loading' | 'ready' | 'error';
  displayValue?: string;
  errorMessage?: string;
};

const initialCardState: KpiCardState = { status: 'loading' };

export function PackagesStatCards({ className }: { className?: string }) {
  const [cards, setCards] = useState<Record<PackagesKpiKey, KpiCardState>>(() => ({
    packages: { ...initialCardState },
    active: { ...initialCardState },
    items: { ...initialCardState },
    photos: { ...initialCardState },
  }));

  useEffect(() => {
    let cancelled = false;
    const client = getApiClient();

    async function loadKpi(key: PackagesKpiKey): Promise<KpiCardState> {
      try {
        if (key === 'packages') {
          const result = await client.listPackages({ page: 1, limit: 1 });
          return { status: 'ready', displayValue: formatCount(result.meta.total) };
        }
        if (key === 'active') {
          const result = await client.listPackages({ page: 1, limit: 1, active: true });
          return { status: 'ready', displayValue: formatCount(result.meta.total) };
        }
        if (key === 'items') {
          const result = await client.listPackageItems({ page: 1, limit: 1 });
          return { status: 'ready', displayValue: formatCount(result.meta.total) };
        }
        const result = await client.listPackageImages({ page: 1, limit: 1 });
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
        packagesKpis.map(async (kpi) => [kpi.key, await loadKpi(kpi.key)] as const),
      );

      if (cancelled) return;

      setCards(Object.fromEntries(results) as Record<PackagesKpiKey, KpiCardState>);
    }

    void loadAll();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {packagesKpis.map((kpi) => {
          const state = cards[kpi.key];
          return (
            <div key={kpi.key}>
              <StatCard
                label={kpi.label}
                subtitle={kpi.subtitle}
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
