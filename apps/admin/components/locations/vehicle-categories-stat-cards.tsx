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

type VehicleCategoriesStatCardsProps = {
  refreshKey?: number;
  className?: string;
};

const totalIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"
    />
  </svg>
);

const withModelIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M8 17h8M8 17a2 2 0 01-2-2V9a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2M8 17v1a1 1 0 001 1h6a1 1 0 001-1v-1M9 9h.01M15 9h.01"
    />
  </svg>
);

const withoutModelIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
    />
  </svg>
);

export function VehicleCategoriesStatCards({
  refreshKey = 0,
  className,
}: VehicleCategoriesStatCardsProps) {
  const { locations: getLocationsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.locations.referential.categories.stats');
  const [total, setTotal] = useState<CardState>(initial);
  const [withExampleModel, setWithExampleModel] = useState<CardState>(initial);
  const [withoutExampleModel, setWithoutExampleModel] = useState<CardState>(initial);

  useEffect(() => {
    let cancelled = false;
    const client = getApiClient();

    setTotal({ ...initial });
    setWithExampleModel({ ...initial });
    setWithoutExampleModel({ ...initial });

    async function loadOne(hasExampleModel?: boolean): Promise<CardState> {
      try {
        const result = await client.listVehicleCategories({
          page: 1,
          limit: 1,
          ...(hasExampleModel === undefined ? {} : { hasExampleModel }),
        });
        return { status: 'ready', displayValue: formatCount(result.meta.total) };
      } catch (error) {
        return { status: 'error', errorMessage: getLocationsErrorMessage(error) };
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
      setWithExampleModel(yes);
      setWithoutExampleModel(no);
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
          iconClassName="bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300"
        />
        <StatCard
          label={t('withExampleModel.label')}
          subtitle={t('withExampleModel.subtitle')}
          status={withExampleModel.status}
          value={withExampleModel.displayValue}
          errorMessage={withExampleModel.errorMessage}
          icon={withModelIcon}
          iconClassName="bg-atg-success-light text-atg-success"
        />
        <StatCard
          label={t('withoutExampleModel.label')}
          subtitle={t('withoutExampleModel.subtitle')}
          status={withoutExampleModel.status}
          value={withoutExampleModel.displayValue}
          errorMessage={withoutExampleModel.errorMessage}
          icon={withoutModelIcon}
          iconClassName="bg-atg-warning-light text-atg-warning"
        />
      </div>
    </div>
  );
}
