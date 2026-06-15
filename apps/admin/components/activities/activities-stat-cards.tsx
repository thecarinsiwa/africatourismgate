'use client';

import { StatCard } from '@africatourismgate/ui';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { activitiesKpis, type ActivitiesKpiKey } from '../../config/activities-kpi';
import { getApiClient } from '../../lib/auth/api';
import { getDashboardKpiErrorMessage } from '../../lib/dashboard-api-errors';
import { formatCount } from '../../lib/format-money';

type KpiCardState = {
  status: 'loading' | 'ready' | 'error';
  displayValue?: string;
  errorMessage?: string;
};

const initialCardState: KpiCardState = { status: 'loading' };

export function ActivitiesStatCards({ className }: { className?: string }) {
  const [cards, setCards] = useState<Record<ActivitiesKpiKey, KpiCardState>>(() => ({
    activities: { ...initialCardState },
    providers: { ...initialCardState },
    schedules: { ...initialCardState },
  }));

  useEffect(() => {
    let cancelled = false;
    const client = getApiClient();

    async function loadKpi(key: ActivitiesKpiKey): Promise<KpiCardState> {
      try {
        if (key === 'activities') {
          const result = await client.listActivities({ page: 1, limit: 1 });
          return { status: 'ready', displayValue: formatCount(result.meta.total) };
        }
        if (key === 'providers') {
          const result = await client.listActivityProviders({ page: 1, limit: 1 });
          return { status: 'ready', displayValue: formatCount(result.meta.total) };
        }
        const result = await client.listActivitySchedules({ page: 1, limit: 1 });
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
        activitiesKpis.map(async (kpi) => [kpi.key, await loadKpi(kpi.key)] as const),
      );

      if (cancelled) return;

      setCards(Object.fromEntries(results) as Record<ActivitiesKpiKey, KpiCardState>);
    }

    void loadAll();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {activitiesKpis.map((kpi) => {
          const state = cards[kpi.key];
          const card = (
            <StatCard
              label={kpi.label}
              subtitle={kpi.subtitle}
              status={state.status}
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
