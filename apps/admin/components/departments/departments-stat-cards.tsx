'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { StatCard } from '@africatourismgate/ui';
import type { Department } from '@africatourismgate/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { departmentsKpis, type DepartmentsKpiKey } from '../../config/departments-kpi';
import { formatCount } from '../../lib/format-money';
import { useModuleStatCards } from '../../lib/auth/use-module-stat-cards';
import { getApiClient } from '../../lib/auth/api';

type KpiCardState = {
  status: 'loading' | 'ready' | 'error';
  displayValue?: string;
  errorMessage?: string;
};

const initialCardState: KpiCardState = { status: 'loading' };

async function listAllDepartments(): Promise<Department[]> {
  const client = getApiClient();
  const first = await client.listDepartments({ page: 1, limit: 100 });
  const rows = [...first.data];
  for (let page = 2; page <= first.meta.totalPages; page += 1) {
    const next = await client.listDepartments({ page, limit: 100 });
    rows.push(...next.data);
  }
  return rows;
}

export function DepartmentsStatCards({ className }: { className?: string }) {
  const { dashboardKpi: getDashboardKpiErrorMessage } = useAdminErrorMessages();
  const { canLoad, loading: permissionsLoading, shouldRender } =
    useModuleStatCards('departments.read');
  const t = useTranslations('modules.departments');
  const [cards, setCards] = useState<Record<DepartmentsKpiKey, KpiCardState>>(() => ({
    total: { ...initialCardState },
    organizations: { ...initialCardState },
    withDescription: { ...initialCardState },
    employees: { ...initialCardState },
  }));

  useEffect(() => {
    if (permissionsLoading || !canLoad) return;

    let cancelled = false;
    const client = getApiClient();

    async function loadAll() {
      try {
        const [departments, employeesResult] = await Promise.all([
          listAllDepartments(),
          client.listEmployees({ page: 1, limit: 1 }),
        ]);

        if (cancelled) return;

        const organizationIds = new Set(
          departments.map((department) => department.organizationId),
        );
        const withDescription = departments.filter((department) =>
          Boolean(department.description?.trim()),
        ).length;

        setCards({
          total: {
            status: 'ready',
            displayValue: formatCount(departments.length),
          },
          organizations: {
            status: 'ready',
            displayValue: formatCount(organizationIds.size),
          },
          withDescription: {
            status: 'ready',
            displayValue: formatCount(withDescription),
          },
          employees: {
            status: 'ready',
            displayValue: formatCount(employeesResult.meta.total),
          },
        });
      } catch (error) {
        if (cancelled) return;
        const errorMessage = getDashboardKpiErrorMessage(error);
        setCards({
          total: { status: 'error', errorMessage },
          organizations: { status: 'error', errorMessage },
          withDescription: { status: 'error', errorMessage },
          employees: { status: 'error', errorMessage },
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
        {departmentsKpis.map((kpi) => {
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
