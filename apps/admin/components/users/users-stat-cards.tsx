'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { StatCard } from '@africatourismgate/ui';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { usersKpis, type UsersKpiKey } from '../../config/users-kpi';
import { formatCount } from '../../lib/format-money';
import { getApiClient } from '../../lib/auth/api';

type KpiCardState = {
  status: 'loading' | 'ready' | 'error';
  displayValue?: string;
  errorMessage?: string;
};

const initialCardState: KpiCardState = { status: 'loading' };

export function UsersStatCards({ className }: { className?: string }) {
  const { dashboardKpi: getDashboardKpiErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.users');
  const [cards, setCards] = useState<Record<UsersKpiKey, KpiCardState>>(() => ({
    total: { ...initialCardState },
    active: { ...initialCardState },
    suspended: { ...initialCardState },
    employees: { ...initialCardState },
  }));

  useEffect(() => {
    let cancelled = false;
    const client = getApiClient();

    async function loadKpi(key: UsersKpiKey): Promise<KpiCardState> {
      try {
        if (key === 'total') {
          const total = await client.countUsers();
          return { status: 'ready', displayValue: formatCount(total) };
        }
        if (key === 'active') {
          const result = await client.listUsers({ page: 1, limit: 1, status: 'active' });
          return { status: 'ready', displayValue: formatCount(result.meta.total) };
        }
        if (key === 'suspended') {
          const result = await client.listUsers({ page: 1, limit: 1, status: 'suspended' });
          return { status: 'ready', displayValue: formatCount(result.meta.total) };
        }
        const result = await client.listEmployees({ page: 1, limit: 1 });
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
        usersKpis.map(async (kpi) => [kpi.key, await loadKpi(kpi.key)] as const),
      );

      if (cancelled) return;

      setCards(Object.fromEntries(results) as Record<UsersKpiKey, KpiCardState>);
    }

    void loadAll();

    return () => {
      cancelled = true;
    };
  }, [getDashboardKpiErrorMessage]);

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {usersKpis.map((kpi) => {
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
