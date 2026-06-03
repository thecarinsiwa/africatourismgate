'use client';

import { Card, cn } from '@africatourismgate/ui';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { formatCount } from '../lib/format-money';
import { getApiClient } from '../lib/auth/api';

type PlatformMetric = {
  key: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  iconClass: string;
};

const metrics: PlatformMetric[] = [
  {
    key: 'organizations',
    label: 'Organisations',
    href: '/organisations',
    iconClass: 'bg-primary/10 text-primary',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
  },
  {
    key: 'properties',
    label: 'Hébergements',
    href: '/hebergements',
    iconClass: 'bg-primary/10 text-primary',
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
  {
    key: 'bookings',
    label: 'Réservations',
    href: '/reservations',
    iconClass: 'bg-primary/10 text-primary',
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
  {
    key: 'users',
    label: 'Utilisateurs',
    href: '/utilisateurs',
    iconClass: 'bg-primary/10 text-primary',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
  },
];

type CountsState = Record<string, { status: 'loading' | 'ready' | 'error'; value?: number }>;

export function DashboardPlatformOverview({ className }: { className?: string }) {
  const [counts, setCounts] = useState<CountsState>(() =>
    Object.fromEntries(metrics.map((m) => [m.key, { status: 'loading' }])),
  );

  useEffect(() => {
    let cancelled = false;
    const client = getApiClient();

    async function loadMetric(key: string) {
      try {
        let value = 0;
        if (key === 'organizations') value = await client.countOrganizations();
        else if (key === 'properties') value = await client.countProperties();
        else if (key === 'bookings') value = await client.countBookings();
        else if (key === 'users') value = await client.countUsers();
        return { status: 'ready' as const, value };
      } catch {
        return { status: 'error' as const };
      }
    }

    async function loadAll() {
      const results = await Promise.all(
        metrics.map(async (m) => [m.key, await loadMetric(m.key)] as const),
      );
      if (!cancelled) {
        setCounts(Object.fromEntries(results));
      }
    }

    void loadAll();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card variant="dashboard" padding="sm" className={className}>
      <h2 className="text-base font-semibold text-atg-fg">Vue plateforme</h2>
      <p className="mt-1 text-sm text-atg-muted">Organisations, hébergements et activité</p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map((metric) => {
          const state = counts[metric.key] ?? { status: 'loading' };
          return (
            <Link
              key={metric.key}
              href={metric.href}
              className={cn(
                'flex flex-col items-center rounded-lg border border-atg-border bg-atg-surface/50 p-4',
                'transition-colors hover:border-primary/30 hover:bg-atg-surface',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              )}
            >
              <span
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg',
                  metric.iconClass,
                )}
                aria-hidden
              >
                {metric.icon}
              </span>
              <span className="mt-3 text-xs text-atg-muted">{metric.label}</span>
              <span className="mt-1 text-lg font-bold text-atg-fg">
                {state.status === 'loading'
                  ? '—'
                  : state.status === 'error'
                    ? '!'
                    : formatCount(state.value ?? 0)}
              </span>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
