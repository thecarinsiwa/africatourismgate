'use client';

import { Card, cn } from '@africatourismgate/ui';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { dashboardKpis, type DashboardKpiKey } from '../config/dashboard-kpi';
import { getDashboardKpiErrorMessage } from '../lib/dashboard-api-errors';
import { formatCount, formatMoney } from '../lib/format-money';
import { getApiClient } from '../lib/auth/api';

type KpiCardState = {
  status: 'loading' | 'ready' | 'error';
  displayValue?: string;
  errorMessage?: string;
};

const initialCardState: KpiCardState = { status: 'loading' };

const kpiMeta: Record<
  DashboardKpiKey,
  { subtitle: string; icon: React.ReactNode; iconClass: string }
> = {
  users: {
    subtitle: 'Comptes enregistrés',
    iconClass: 'bg-atg-info-light text-atg-info',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
  bookings: {
    subtitle: 'Réservations totales',
    iconClass: 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  revenue: {
    subtitle: 'Paiements réussis',
    iconClass: 'bg-atg-success-light text-atg-success',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  properties: {
    subtitle: 'Hébergements publiés',
    iconClass: 'bg-atg-warning-light text-atg-warning',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
};

export function DashboardKpiCards({ className }: { className?: string }) {
  const [cards, setCards] = useState<Record<DashboardKpiKey, KpiCardState>>(() => ({
    users: { ...initialCardState },
    bookings: { ...initialCardState },
    revenue: { ...initialCardState },
    properties: { ...initialCardState },
  }));

  useEffect(() => {
    let cancelled = false;
    const client = getApiClient();

    async function loadKpi(key: DashboardKpiKey): Promise<KpiCardState> {
      try {
        if (key === 'users') {
          const total = await client.countUsers();
          return { status: 'ready', displayValue: formatCount(total) };
        }
        if (key === 'bookings') {
          const total = await client.countBookings();
          return { status: 'ready', displayValue: formatCount(total) };
        }
        if (key === 'properties') {
          const total = await client.countProperties();
          return { status: 'ready', displayValue: formatCount(total) };
        }
        const revenue = await client.getSucceededPaymentsRevenue();
        return {
          status: 'ready',
          displayValue: formatMoney(revenue.totalCents, revenue.currency),
        };
      } catch (error) {
        return {
          status: 'error',
          errorMessage: getDashboardKpiErrorMessage(error),
        };
      }
    }

    async function loadAll() {
      const results = await Promise.all(
        dashboardKpis.map(async (kpi) => [kpi.key, await loadKpi(kpi.key)] as const),
      );

      if (cancelled) return;

      setCards(Object.fromEntries(results) as Record<DashboardKpiKey, KpiCardState>);
    }

    void loadAll();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardKpis.map((kpi) => {
          const state = cards[kpi.key];
          const meta = kpiMeta[kpi.key];

          const content = (
            <Card variant="dashboard" padding="sm" className="h-full">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-atg-muted">{kpi.label}</p>
                  {state.status === 'loading' ? (
                    <p className="mt-2 text-3xl font-bold tracking-tight text-atg-fg" aria-busy="true">
                      —
                    </p>
                  ) : state.status === 'error' ? (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
                      {state.errorMessage}
                    </p>
                  ) : (
                    <p className="mt-2 text-3xl font-bold tracking-tight text-atg-fg">
                      {state.displayValue}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-atg-muted">{meta.subtitle}</p>
                </div>
                <span
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                    meta.iconClass,
                  )}
                  aria-hidden
                >
                  {meta.icon}
                </span>
              </div>
            </Card>
          );

          if ('href' in kpi && state.status === 'ready') {
            return (
              <Link
                key={kpi.key}
                href={kpi.href}
                className="block rounded-xl transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {content}
              </Link>
            );
          }

          return <div key={kpi.key}>{content}</div>;
        })}
      </div>
    </div>
  );
}
