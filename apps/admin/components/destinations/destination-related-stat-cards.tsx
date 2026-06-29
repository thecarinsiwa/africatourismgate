'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { StatCard } from '@africatourismgate/ui';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import {
  destinationsRelatedKpis,
  type DestinationsRelatedKpiKey,
} from '../../config/destinations-related-kpi';
import { getApiClient } from '../../lib/auth/api';
import { formatCount } from '../../lib/format-money';

type KpiCardState = {
  status: 'loading' | 'ready' | 'error';
  displayValue?: string;
  errorMessage?: string;
};

const initialCardState: KpiCardState = { status: 'loading' };

type DestinationRelatedStatCardsProps = {
  destinationId: string;
  className?: string;
};

export function DestinationRelatedStatCards({
  destinationId,
  className,
}: DestinationRelatedStatCardsProps) {
  const { dashboardKpi: getDashboardKpiErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.destinations');
  const [cards, setCards] = useState<Record<DestinationsRelatedKpiKey, KpiCardState>>(() => ({
    properties: { ...initialCardState },
    activities: { ...initialCardState },
    packages: { ...initialCardState },
  }));

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      setCards({
        properties: { status: 'loading' },
        activities: { status: 'loading' },
        packages: { status: 'loading' },
      });

      try {
        const counts = await getApiClient().getDestinationRelatedCounts(destinationId);
        if (cancelled) return;

        setCards({
          properties: { status: 'ready', displayValue: formatCount(counts.properties) },
          activities: { status: 'ready', displayValue: formatCount(counts.activities) },
          packages: { status: 'ready', displayValue: formatCount(counts.packages) },
        });
      } catch (error) {
        if (cancelled) return;

        const message = getDashboardKpiErrorMessage(error);
        setCards({
          properties: { status: 'error', errorMessage: message },
          activities: { status: 'error', errorMessage: message },
          packages: { status: 'error', errorMessage: message },
        });
      }
    }

    void loadAll();

    return () => {
      cancelled = true;
    };
  }, [destinationId, getDashboardKpiErrorMessage]);

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {destinationsRelatedKpis.map((kpi) => {
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

          if (kpi.href && state.status === 'ready') {
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
