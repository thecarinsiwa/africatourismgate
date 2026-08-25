'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { StatCard } from '@africatourismgate/ui';
import type { Permission } from '@africatourismgate/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { permissionsKpis, type PermissionsKpiKey } from '../../config/permissions-kpi';
import { formatCount } from '../../lib/format-money';
import { useModuleStatCards } from '../../lib/auth/use-module-stat-cards';
import { getApiClient } from '../../lib/auth/api';

type KpiCardState = {
  status: 'loading' | 'ready' | 'error';
  displayValue?: string;
  errorMessage?: string;
};

const initialCardState: KpiCardState = { status: 'loading' };

async function listAllPermissions(): Promise<Permission[]> {
  const client = getApiClient();
  const first = await client.listPermissions({ page: 1, limit: 100 });
  const rows = [...first.data];
  for (let page = 2; page <= first.meta.totalPages; page += 1) {
    const next = await client.listPermissions({ page, limit: 100 });
    rows.push(...next.data);
  }
  return rows;
}

export function PermissionsStatCards({ className }: { className?: string }) {
  const { dashboardKpi: getDashboardKpiErrorMessage } = useAdminErrorMessages();
  const { canLoad, loading: permissionsLoading, shouldRender } =
    useModuleStatCards('permissions.read');
  const t = useTranslations('modules.rbac.permissions');
  const [cards, setCards] = useState<Record<PermissionsKpiKey, KpiCardState>>(() => ({
    total: { ...initialCardState },
    domains: { ...initialCardState },
    actions: { ...initialCardState },
    roles: { ...initialCardState },
  }));

  useEffect(() => {
    if (permissionsLoading || !canLoad) return;

    let cancelled = false;
    const client = getApiClient();

    async function loadAll() {
      try {
        const [permissions, rolesResult] = await Promise.all([
          listAllPermissions(),
          client.listRoles({ page: 1, limit: 1, includeSystem: true }),
        ]);

        if (cancelled) return;

        const domains = new Set(permissions.map((permission) => permission.resource));
        const actions = new Set(permissions.map((permission) => permission.action));

        setCards({
          total: {
            status: 'ready',
            displayValue: formatCount(permissions.length),
          },
          domains: {
            status: 'ready',
            displayValue: formatCount(domains.size),
          },
          actions: {
            status: 'ready',
            displayValue: formatCount(actions.size),
          },
          roles: {
            status: 'ready',
            displayValue: formatCount(rolesResult.meta.total),
          },
        });
      } catch (error) {
        if (cancelled) return;
        const errorMessage = getDashboardKpiErrorMessage(error);
        setCards({
          total: { status: 'error', errorMessage },
          domains: { status: 'error', errorMessage },
          actions: { status: 'error', errorMessage },
          roles: { status: 'error', errorMessage },
        });
      }
    }

    void loadAll();

    return () => {
      cancelled = true;
    };
  }, [canLoad, getDashboardKpiErrorMessage, permissionsLoading]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {permissionsKpis.map((kpi) => {
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
