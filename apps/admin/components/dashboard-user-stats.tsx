'use client';

import { useAdminErrorMessages } from '../lib/i18n/use-admin-error-messages';

import { Card, cn } from '@africatourismgate/ui';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { formatCount } from '../lib/format-money';
import { getApiClient } from '../lib/auth/api';
import type { UserStatus } from '@africatourismgate/types';

type UserListItem = {
  status: UserStatus;
};

type StatsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; active: number; suspended: number; total: number };

const statRowDefs = [
  {
    key: 'active' as const,
    labelKey: 'active' as const,
    iconClass: 'bg-primary/10 text-primary',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  {
    key: 'suspended' as const,
    labelKey: 'suspended' as const,
    iconClass: 'bg-atg-border/60 text-atg-muted',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
        />
      </svg>
    ),
  },
  {
    key: 'total' as const,
    labelKey: 'total' as const,
    iconClass: 'bg-primary/10 text-primary',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
];

export function DashboardUserStats({ className }: { className?: string }) {
  const { dashboardKpi: getDashboardKpiErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('dashboard');
  const tStats = useTranslations('dashboard.userStats');
  const [stats, setStats] = useState<StatsState>({ status: 'loading' });

  const statRows = useMemo(
    () => statRowDefs.map((row) => ({ ...row, label: tStats(row.labelKey) })),
    [tStats],
  );

  useEffect(() => {
    let cancelled = false;
    const client = getApiClient();

    async function load() {
      try {
        const [total, page] = await Promise.all([
          client.countUsers(),
          client.listUsers({ page: 1, limit: 100 }),
        ]);

        if (cancelled) return;

        const users = page.data as UserListItem[];
        setStats({
          status: 'ready',
          active: users.filter((u) => u.status === 'active').length,
          suspended: users.filter((u) => u.status === 'suspended').length,
          total,
        });
      } catch (error) {
        if (cancelled) return;
        setStats({ status: 'error', message: getDashboardKpiErrorMessage(error) });
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [getDashboardKpiErrorMessage]);

  const values =
    stats.status === 'ready'
      ? { active: stats.active, suspended: stats.suspended, total: stats.total }
      : null;

  return (
    <Card variant="dashboard" padding="sm" className={className}>
      <h2 className="text-base font-semibold text-atg-fg">{tStats('title')}</h2>
      <p className="mt-1 text-sm text-atg-muted">{tStats('subtitle')}</p>

      <ul className="mt-5 space-y-3">
        {statRows.map((row) => (
          <li key={row.key} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg',
                  row.iconClass,
                )}
                aria-hidden
              >
                {row.icon}
              </span>
              <span className="text-sm text-atg-muted">{row.label}</span>
            </div>
            {stats.status === 'loading' ? (
              <span className="text-sm font-semibold text-atg-fg">—</span>
            ) : stats.status === 'error' ? (
              <span className="text-xs text-red-600 dark:text-red-400">{t('errorLabel')}</span>
            ) : (
              <span className="text-sm font-semibold text-atg-fg">
                {formatCount(values![row.key])}
              </span>
            )}
          </li>
        ))}
      </ul>

      {stats.status === 'error' ? (
        <p className="mt-3 text-xs text-red-600 dark:text-red-400" role="alert">
          {stats.message}
        </p>
      ) : null}

      <Link
        href="/utilisateurs"
        className="mt-5 inline-block text-sm font-medium text-primary hover:text-primary-hover"
      >
        {t('viewAllUsers')}
      </Link>
    </Card>
  );
}
