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

type RentalAgenciesStatCardsProps = {
  refreshKey?: number;
  className?: string;
};

const totalIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    />
  </svg>
);

const withAddressIcon = (
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

const withDestinationIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
    />
  </svg>
);

export function RentalAgenciesStatCards({
  refreshKey = 0,
  className,
}: RentalAgenciesStatCardsProps) {
  const { locations: getLocationsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.locations.referential.agencies.stats');
  const [total, setTotal] = useState<CardState>(initial);
  const [withAddress, setWithAddress] = useState<CardState>(initial);
  const [withDestination, setWithDestination] = useState<CardState>(initial);

  useEffect(() => {
    let cancelled = false;
    const client = getApiClient();

    setTotal({ ...initial });
    setWithAddress({ ...initial });
    setWithDestination({ ...initial });

    async function loadOne(
      filter?: { hasAddress?: boolean; hasDestination?: boolean },
    ): Promise<CardState> {
      try {
        const result = await client.listRentalAgencies({
          page: 1,
          limit: 1,
          ...filter,
        });
        return { status: 'ready', displayValue: formatCount(result.meta.total) };
      } catch (error) {
        return { status: 'error', errorMessage: getLocationsErrorMessage(error) };
      }
    }

    void (async () => {
      const [all, address, destination] = await Promise.all([
        loadOne(),
        loadOne({ hasAddress: true }),
        loadOne({ hasDestination: true }),
      ]);
      if (cancelled) return;
      setTotal(all);
      setWithAddress(address);
      setWithDestination(destination);
    })();

    return () => {
      cancelled = true;
    };
  }, [getLocationsErrorMessage, refreshKey]);

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
          iconClassName="bg-atg-warning-light text-atg-warning"
        />
        <StatCard
          label={t('withAddress.label')}
          subtitle={t('withAddress.subtitle')}
          status={withAddress.status}
          value={withAddress.displayValue}
          errorMessage={withAddress.errorMessage}
          icon={withAddressIcon}
          iconClassName="bg-atg-success-light text-atg-success"
        />
        <StatCard
          label={t('withDestination.label')}
          subtitle={t('withDestination.subtitle')}
          status={withDestination.status}
          value={withDestination.displayValue}
          errorMessage={withDestination.errorMessage}
          icon={withDestinationIcon}
          iconClassName="bg-atg-info-light text-atg-info"
        />
      </div>
    </div>
  );
}
