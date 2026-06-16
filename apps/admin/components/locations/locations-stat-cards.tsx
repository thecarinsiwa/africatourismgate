'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { StatCard } from '@africatourismgate/ui';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { locationsKpis, type LocationsKpiKey } from '../../config/locations-kpi';
import { getApiClient } from '../../lib/auth/api';
import { formatCount } from '../../lib/format-money';

type KpiCardState = {
  status: 'loading' | 'ready' | 'error';
  displayValue?: string;
  errorMessage?: string;
};

const initialCardState: KpiCardState = { status: 'loading' };

export function LocationsStatCards({ className }: { className?: string }) {
  const { dashboardKpi: getDashboardKpiErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.locations');
  const [cards, setCards] = useState<Record<LocationsKpiKey, KpiCardState>>(() => ({
    vehicles: { ...initialCardState },
    categories: { ...initialCardState },
    agencies: { ...initialCardState },
  }));

  useEffect(() => {
    let cancelled = false;
    const client = getApiClient();

    async function loadKpi(key: LocationsKpiKey): Promise<KpiCardState> {
      try {
        if (key === 'vehicles') {
          const result = await client.listVehicles({ page: 1, limit: 1 });
          return { status: 'ready', displayValue: formatCount(result.meta.total) };
        }
        if (key === 'categories') {
          const result = await client.listVehicleCategories({ page: 1, limit: 1 });
          return { status: 'ready', displayValue: formatCount(result.meta.total) };
        }
        const result = await client.listRentalAgencies({ page: 1, limit: 1 });
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
        locationsKpis.map(async (kpi) => [kpi.key, await loadKpi(kpi.key)] as const),
      );

      if (cancelled) return;

      setCards(Object.fromEntries(results) as Record<LocationsKpiKey, KpiCardState>);
    }

    void loadAll();

    return () => {
      cancelled = true;
    };
  }, [getDashboardKpiErrorMessage]);

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {locationsKpis.map((kpi) => {
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
