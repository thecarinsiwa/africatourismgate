'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { StatCard } from '@africatourismgate/ui';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { bookingItemsKpis, type BookingItemsKpiKey } from '../../config/bookings-kpi';
import { useModuleStatCards } from '../../lib/auth/use-module-stat-cards';
import { getApiClient } from '../../lib/auth/api';
import { formatCount } from '../../lib/format-money';

type KpiCardState = {
  status: 'loading' | 'ready' | 'error';
  displayValue?: string;
  errorMessage?: string;
};

const initialCardState: KpiCardState = { status: 'loading' };

export function BookingItemsStatCards({ className }: { className?: string }) {
  const { dashboardKpi: getDashboardKpiErrorMessage } = useAdminErrorMessages();
  const { canLoad, loading: permissionsLoading, shouldRender } = useModuleStatCards('bookings.read');
  const t = useTranslations('modules.bookings');
  const [cards, setCards] = useState<Record<BookingItemsKpiKey, KpiCardState>>(() => ({
    total: { ...initialCardState },
    confirmed: { ...initialCardState },
    pending_payment: { ...initialCardState },
    bookings: { ...initialCardState },
  }));

  useEffect(() => {
    if (permissionsLoading || !canLoad) return;

    let cancelled = false;
    const client = getApiClient();

    async function loadKpi(key: BookingItemsKpiKey): Promise<KpiCardState> {
      try {
        if (key === 'bookings') {
          const total = await client.countBookings();
          return { status: 'ready', displayValue: formatCount(total) };
        }
        const result = await client.listBookingItems({
          page: 1,
          limit: 1,
          status: key === 'total' ? undefined : key,
        });
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
        bookingItemsKpis.map(async (kpi) => [kpi.key, await loadKpi(kpi.key)] as const),
      );

      if (cancelled) return;

      setCards(Object.fromEntries(results) as Record<BookingItemsKpiKey, KpiCardState>);
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
        {bookingItemsKpis.map((kpi) => {
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
