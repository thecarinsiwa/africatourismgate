'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { StatCard } from '@africatourismgate/ui';
import type { UserSession } from '@africatourismgate/types';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { sessionsKpis, type SessionsKpiKey } from '../../config/sessions-kpi';
import { formatCount } from '../../lib/format-money';
import { useModuleStatCards } from '../../lib/auth/use-module-stat-cards';
import { getApiClient } from '../../lib/auth/api';

type KpiCardState = {
  status: 'loading' | 'ready' | 'error';
  displayValue?: string;
  errorMessage?: string;
};

const initialCardState: KpiCardState = { status: 'loading' };

function isSessionExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() <= Date.now();
}

async function listAllSessions(userId?: string): Promise<UserSession[]> {
  const client = getApiClient();
  const first = await client.listUserSessions({
    page: 1,
    limit: 100,
    userId,
  });
  const rows = [...first.data];
  for (let page = 2; page <= first.meta.totalPages; page += 1) {
    const next = await client.listUserSessions({
      page,
      limit: 100,
      userId,
    });
    rows.push(...next.data);
  }
  return rows;
}

export function UserSessionsStatCards({ className }: { className?: string }) {
  const { dashboardKpi: getDashboardKpiErrorMessage } = useAdminErrorMessages();
  const { canLoad, loading: permissionsLoading, shouldRender } =
    useModuleStatCards('users.read');
  const t = useTranslations('modules.users');
  const searchParams = useSearchParams();
  const userIdFilter = searchParams.get('userId')?.trim() || undefined;

  const [cards, setCards] = useState<Record<SessionsKpiKey, KpiCardState>>(() => ({
    total: { ...initialCardState },
    active: { ...initialCardState },
    expired: { ...initialCardState },
    users: { ...initialCardState },
  }));

  useEffect(() => {
    if (permissionsLoading || !canLoad) return;

    let cancelled = false;

    async function loadAll() {
      setCards({
        total: { ...initialCardState },
        active: { ...initialCardState },
        expired: { ...initialCardState },
        users: { ...initialCardState },
      });

      try {
        const sessions = await listAllSessions(userIdFilter);
        if (cancelled) return;

        const nowExpired = sessions.filter((session) =>
          isSessionExpired(session.expiresAt),
        ).length;
        const active = sessions.length - nowExpired;
        const uniqueUsers = new Set(sessions.map((session) => session.userId)).size;

        setCards({
          total: { status: 'ready', displayValue: formatCount(sessions.length) },
          active: { status: 'ready', displayValue: formatCount(active) },
          expired: { status: 'ready', displayValue: formatCount(nowExpired) },
          users: { status: 'ready', displayValue: formatCount(uniqueUsers) },
        });
      } catch (error) {
        if (cancelled) return;
        const errorMessage = getDashboardKpiErrorMessage(error);
        setCards({
          total: { status: 'error', errorMessage },
          active: { status: 'error', errorMessage },
          expired: { status: 'error', errorMessage },
          users: { status: 'error', errorMessage },
        });
      }
    }

    void loadAll();

    return () => {
      cancelled = true;
    };
  }, [canLoad, getDashboardKpiErrorMessage, permissionsLoading, userIdFilter]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {sessionsKpis.map((kpi) => {
          const state = cards[kpi.key];
          const card = (
            <StatCard
              label={t(kpi.labelKey)}
              subtitle={t(kpi.subtitleKey)}
              status={state.status}
              value={state.displayValue}
              errorMessage={state.errorMessage}
              icon={kpi.icon}
              iconClassName={kpi.iconClass}
            />
          );

          if ('href' in kpi && kpi.href && state.status === 'ready' && !userIdFilter) {
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
