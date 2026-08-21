'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { StatCard } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { formatCount } from '../../lib/format-money';

type CardState = {
  status: 'loading' | 'ready' | 'error';
  displayValue?: string;
  errorMessage?: string;
};

const initial: CardState = { status: 'loading' };

type AirportsStatCardsProps = {
  refreshKey?: number;
  className?: string;
};

const totalIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
    />
  </svg>
);

const withCoordsIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
    />
  </svg>
);

const withoutCoordsIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
    />
  </svg>
);

export function AirportsStatCards({ refreshKey = 0, className }: AirportsStatCardsProps) {
  const { vols: getVolsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.flights.referential.airports.stats');
  const [total, setTotal] = useState<CardState>(initial);
  const [withCoordinates, setWithCoordinates] = useState<CardState>(initial);
  const [withoutCoordinates, setWithoutCoordinates] = useState<CardState>(initial);

  useEffect(() => {
    let cancelled = false;
    const client = getApiClient();

    setTotal({ ...initial });
    setWithCoordinates({ ...initial });
    setWithoutCoordinates({ ...initial });

    async function loadOne(hasCoordinates?: boolean): Promise<CardState> {
      try {
        const result = await client.listAirports({
          page: 1,
          limit: 1,
          ...(hasCoordinates === undefined ? {} : { hasCoordinates }),
        });
        return { status: 'ready', displayValue: formatCount(result.meta.total) };
      } catch (error) {
        return { status: 'error', errorMessage: getVolsErrorMessage(error) };
      }
    }

    void (async () => {
      const [all, yes, no] = await Promise.all([
        loadOne(),
        loadOne(true),
        loadOne(false),
      ]);
      if (cancelled) return;
      setTotal(all);
      setWithCoordinates(yes);
      setWithoutCoordinates(no);
    })();

    return () => {
      cancelled = true;
    };
  }, [getVolsErrorMessage, refreshKey]);

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label={t('total.label')}
          subtitle={t('total.subtitle')}
          status={total.status}
          value={total.displayValue}
          errorMessage={total.errorMessage}
          icon={totalIcon}
          iconClassName="bg-atg-success-light text-atg-success"
        />
        <StatCard
          label={t('withCoordinates.label')}
          subtitle={t('withCoordinates.subtitle')}
          status={withCoordinates.status}
          value={withCoordinates.displayValue}
          errorMessage={withCoordinates.errorMessage}
          icon={withCoordsIcon}
          iconClassName="bg-atg-info-light text-atg-info"
        />
        <StatCard
          label={t('withoutCoordinates.label')}
          subtitle={t('withoutCoordinates.subtitle')}
          status={withoutCoordinates.status}
          value={withoutCoordinates.displayValue}
          errorMessage={withoutCoordinates.errorMessage}
          icon={withoutCoordsIcon}
          iconClassName="bg-atg-warning-light text-atg-warning"
        />
      </div>
    </div>
  );
}
