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

type VehicleRoutesStatCardsProps = {
  refreshKey?: number;
  className?: string;
};

const totalIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
    />
  </svg>
);

const vehiclesIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M8 17h8M8 17a2 2 0 01-2-2V9a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2M8 17v1a1 1 0 001 1h6a1 1 0 001-1v-1M9 9h.01M15 9h.01"
    />
  </svg>
);

const citiesIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

export function VehicleRoutesStatCards({
  refreshKey = 0,
  className,
}: VehicleRoutesStatCardsProps) {
  const { locations: getLocationsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.locations.referential.routes.stats');
  const [total, setTotal] = useState<CardState>(initial);
  const [vehiclesCovered, setVehiclesCovered] = useState<CardState>(initial);
  const [cityPairs, setCityPairs] = useState<CardState>(initial);

  useEffect(() => {
    let cancelled = false;
    const client = getApiClient();

    setTotal({ ...initial });
    setVehiclesCovered({ ...initial });
    setCityPairs({ ...initial });

    void (async () => {
      try {
        const result = await client.listVehicleRoutes({ page: 1, limit: 100 });
        if (cancelled) return;

        const vehicleIds = new Set(result.data.map((route) => route.vehicleId));
        const pairs = new Set(
          result.data.map(
            (route) =>
              `${route.departureCity.trim().toLowerCase()}→${route.arrivalCity.trim().toLowerCase()}`,
          ),
        );

        setTotal({ status: 'ready', displayValue: formatCount(result.meta.total) });
        setVehiclesCovered({
          status: 'ready',
          displayValue: formatCount(vehicleIds.size),
        });
        setCityPairs({ status: 'ready', displayValue: formatCount(pairs.size) });
      } catch (error) {
        if (cancelled) return;
        const errorMessage = getLocationsErrorMessage(error);
        setTotal({ status: 'error', errorMessage });
        setVehiclesCovered({ status: 'error', errorMessage });
        setCityPairs({ status: 'error', errorMessage });
      }
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
          iconClassName="bg-atg-info-light text-atg-info"
        />
        <StatCard
          label={t('vehicles.label')}
          subtitle={t('vehicles.subtitle')}
          status={vehiclesCovered.status}
          value={vehiclesCovered.displayValue}
          errorMessage={vehiclesCovered.errorMessage}
          icon={vehiclesIcon}
          iconClassName="bg-atg-success-light text-atg-success"
        />
        <StatCard
          label={t('cityPairs.label')}
          subtitle={t('cityPairs.subtitle')}
          status={cityPairs.status}
          value={cityPairs.displayValue}
          errorMessage={cityPairs.errorMessage}
          icon={citiesIcon}
          iconClassName="bg-atg-warning-light text-atg-warning"
        />
      </div>
    </div>
  );
}
