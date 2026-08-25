'use client';

import { StatCard } from '@africatourismgate/ui';
import type { Donation } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { donationsKpis, type DonationsKpiKey } from '../../config/donations-kpi';
import { formatCount } from '../../lib/format-money';

type DonationsStatCardsProps = {
  donations: Donation[];
  loading: boolean;
  error?: string | null;
  className?: string;
};

type KpiCardState = {
  status: 'loading' | 'ready' | 'error';
  displayValue?: string;
  errorMessage?: string;
};

function computeStats(donations: Donation[]): Record<DonationsKpiKey, string> {
  const published = donations.filter((donation) => donation.status === 'published').length;
  const featured = donations.filter((donation) => donation.isNavbarFeatured).length;
  const locales = new Set(donations.map((donation) => donation.locale.trim()).filter(Boolean));

  return {
    total: formatCount(donations.length),
    published: formatCount(published),
    featured: formatCount(featured),
    locales: formatCount(locales.size),
  };
}

export function DonationsStatCards({
  donations,
  loading,
  error = null,
  className,
}: DonationsStatCardsProps) {
  const t = useTranslations('modules.settings.donations');

  const stats = useMemo(() => computeStats(donations), [donations]);

  const cards = useMemo<Record<DonationsKpiKey, KpiCardState>>(() => {
    if (loading) {
      return {
        total: { status: 'loading' },
        published: { status: 'loading' },
        featured: { status: 'loading' },
        locales: { status: 'loading' },
      };
    }

    if (error) {
      return {
        total: { status: 'error', errorMessage: error },
        published: { status: 'error', errorMessage: error },
        featured: { status: 'error', errorMessage: error },
        locales: { status: 'error', errorMessage: error },
      };
    }

    return {
      total: { status: 'ready', displayValue: stats.total },
      published: { status: 'ready', displayValue: stats.published },
      featured: { status: 'ready', displayValue: stats.featured },
      locales: { status: 'ready', displayValue: stats.locales },
    };
  }, [error, loading, stats]);

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {donationsKpis.map((kpi) => {
          const state = cards[kpi.key];
          return (
            <StatCard
              key={kpi.key}
              label={t(kpi.labelKey)}
              subtitle={t(kpi.subtitleKey)}
              status={state.status}
              value={state.displayValue}
              errorMessage={state.errorMessage}
              icon={kpi.icon}
              iconClassName={kpi.iconClass}
            />
          );
        })}
      </div>
    </div>
  );
}
