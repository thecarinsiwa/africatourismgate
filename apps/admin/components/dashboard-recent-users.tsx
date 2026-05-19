'use client';

import { Card, cn } from '@africatourismgate/ui';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getDashboardKpiErrorMessage } from '../lib/dashboard-api-errors';
import { getApiClient } from '../lib/auth/api';
import type { UserStatus } from '@africatourismgate/types';

type RecentUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
};

const statusLabels: Record<UserStatus, string> = {
  active: 'Actif',
  suspended: 'Suspendu',
  deleted: 'Supprimé',
};

const statusStyles: Record<UserStatus, string> = {
  active: 'bg-primary/10 text-primary',
  suspended: 'bg-atg-border/80 text-atg-muted',
  deleted: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
};

function getInitials(firstName: string, lastName: string, email: string): string {
  const name = `${firstName} ${lastName}`.trim();
  if (name.length >= 2) {
    return name.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export function DashboardRecentUsers({ className }: { className?: string }) {
  const [state, setState] = useState<
    { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; users: RecentUser[] }
  >({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    const client = getApiClient();

    async function load() {
      try {
        const result = await client.listUsers({ page: 1, limit: 5 });
        if (cancelled) return;
        setState({ status: 'ready', users: result.data as RecentUser[] });
      } catch (error) {
        if (cancelled) return;
        setState({ status: 'error', message: getDashboardKpiErrorMessage(error) });
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card variant="dashboard" padding="sm" className={className}>
      <h2 className="text-base font-semibold text-atg-fg">Utilisateurs récents</h2>
      <p className="mt-1 text-sm text-atg-muted">Dernières inscriptions sur la plateforme</p>

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
        <p className="mt-5 text-sm text-atg-muted">Aucun utilisateur pour le moment.</p>
      ) : (
        <ul className="mt-5 space-y-2">
          {state.users.map((user) => (
            <li
              key={user.id}
              className="flex items-center gap-3 rounded-lg border border-atg-border bg-atg-surface/40 px-3 py-2.5"
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white"
                aria-hidden
              >
                {getInitials(user.firstName, user.lastName, user.email)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-atg-fg">{user.email}</p>
                <p className="truncate text-xs text-atg-muted">
                  {[user.firstName, user.lastName].filter(Boolean).join(' ') || '—'}
                </p>
              </div>
              <span
                className={cn(
                  'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium',
                  statusStyles[user.status],
                )}
              >
                {statusLabels[user.status]}
              </span>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/utilisateurs"
        className="mt-5 inline-block text-sm font-medium text-primary hover:text-primary-hover"
      >
        Voir tous les utilisateurs →
      </Link>
    </Card>
  );
}
