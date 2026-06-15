'use client';

import { StatCard } from '@africatourismgate/ui';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cruisesKpis, type CruisesKpiKey } from '../../config/cruises-kpi';
import { getApiClient } from '../../lib/auth/api';
import { getDashboardKpiErrorMessage } from '../../lib/dashboard-api-errors';
import { formatCount } from '../../lib/format-money';

type KpiCardState = {
  status: 'loading' | 'ready' | 'error';
  displayValue?: string;
  errorMessage?: string;
};

const initialCardState: KpiCardState = { status: 'loading' };

export function CruisesStatCards({ className }: { className?: string }) {
  const [cards, setCards] = useState<Record<CruisesKpiKey, KpiCardState>>(() => ({
    sailings: { ...initialCardState },
    ships: { ...initialCardState },
    lines: { ...initialCardState },
    ports: { ...initialCardState },
  }));

  useEffect(() => {
    let cancelled = false;
    const client = getApiClient();

    async function loadKpi(key: CruisesKpiKey): Promise<KpiCardState> {
      try {
        if (key === 'sailings') {
          const result = await client.listCruiseSailings({ page: 1, limit: 1 });
          return { status: 'ready', displayValue: formatCount(result.meta.total) };
        }
        if (key === 'ships') {
          const result = await client.listShips({ page: 1, limit: 1 });
          return { status: 'ready', displayValue: formatCount(result.meta.total) };
        }
        if (key === 'lines') {
          const result = await client.listCruiseLines({ page: 1, limit: 1 });
          return { status: 'ready', displayValue: formatCount(result.meta.total) };
        }
        const result = await client.listCruisePorts({ page: 1, limit: 1 });
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
        cruisesKpis.map(async (kpi) => [kpi.key, await loadKpi(kpi.key)] as const),
      );

      if (cancelled) return;

      setCards(Object.fromEntries(results) as Record<CruisesKpiKey, KpiCardState>);
    }

    void loadAll();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cruisesKpis.map((kpi) => {
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
