'use client';

import { useAdminErrorMessages } from '../lib/i18n/use-admin-error-messages';

import { Avatar, Card, DataTableBadge } from '@africatourismgate/ui';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { isApiForbidden } from '../lib/auth/is-api-forbidden';
import { usePermissions } from '../lib/auth/use-permissions';
import { getApiClient } from '../lib/auth/api';
import type { UserStatus } from '@africatourismgate/types';

type RecentUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
};

const statusVariants: Record<UserStatus, 'success' | 'warning' | 'danger'> = {
  active: 'success',
  suspended: 'warning',
  deleted: 'danger',
};

export function DashboardRecentUsers({ className }: { className?: string }) {
  const { dashboardKpi: getDashboardKpiErrorMessage } = useAdminErrorMessages();
  const { hasPermission, loading: permissionsLoading } = usePermissions();
  const t = useTranslations('dashboard');
  const tRecent = useTranslations('dashboard.recentUsers');
  const tStatus = useTranslations('dashboard.recentUsers.status');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'hidden' }
    | { status: 'error'; message: string }
    | { status: 'ready'; users: RecentUser[] }
  >({ status: 'loading' });

  const statusLabels = useMemo(
    (): Record<UserStatus, string> => ({
      active: tStatus('active'),
      suspended: tStatus('suspended'),
      deleted: tStatus('deleted'),
    }),
    [tStatus],
  );

  const canRead = hasPermission('users.read');

  useEffect(() => {
    if (permissionsLoading || !canRead) return;

    let cancelled = false;
    const client = getApiClient();

    async function load() {
      try {
        const result = await client.listUsers({ page: 1, limit: 5 });
        if (cancelled) return;
        setState({ status: 'ready', users: result.data as RecentUser[] });
      } catch (error) {
        if (cancelled) return;
        if (isApiForbidden(error)) {
          setState({ status: 'hidden' });
          return;
        }
        setState({ status: 'error', message: getDashboardKpiErrorMessage(error) });
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [canRead, getDashboardKpiErrorMessage, permissionsLoading]);

  if (permissionsLoading || !canRead || state.status === 'hidden') {
    return null;
  }

  return (
    <Card variant="dashboard" padding="sm" className={className}>
      <h2 className="text-base font-semibold text-atg-fg">{tRecent('title')}</h2>
      <p className="mt-1 text-sm text-atg-muted">{tRecent('subtitle')}</p>

      {state.status === 'loading' ? (
        <ul className="mt-5 space-y-3" aria-busy="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3 rounded-lg border border-atg-border p-3">
              <span className="h-10 w-10 animate-pulse rounded-full bg-atg-border" />
              <span className="h-4 flex-1 animate-pulse rounded bg-atg-border" />
            </li>
          ))}
        </ul>
      ) : state.status === 'error' ? (
        <p className="mt-5 text-sm text-red-600 dark:text-red-400" role="alert">
          {state.message}
        </p>
      ) : state.users.length === 0 ? (
        <p className="mt-5 text-sm text-atg-muted">{tRecent('empty')}</p>
      ) : (
        <ul className="mt-5 space-y-2">
          {state.users.map((user) => (
            <li
              key={user.id}
              className="flex items-center gap-3 rounded-lg border border-atg-border bg-atg-surface/40 px-3 py-2.5"
            >
              <Avatar
                email={user.email}
                firstName={user.firstName}
                lastName={user.lastName}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-atg-fg">{user.email}</p>
                <p className="truncate text-xs text-atg-muted">
                  {[user.firstName, user.lastName].filter(Boolean).join(' ') || '—'}
                </p>
              </div>
              <DataTableBadge variant={statusVariants[user.status]}>
                {statusLabels[user.status]}
              </DataTableBadge>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/utilisateurs"
        className="mt-5 inline-block text-sm font-medium text-primary hover:text-primary-hover"
      >
        {t('viewAllUsers')}
      </Link>
    </Card>
  );
}
