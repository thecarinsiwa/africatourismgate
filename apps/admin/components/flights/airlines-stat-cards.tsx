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

type AirlinesStatCardsProps = {
  refreshKey?: number;
  className?: string;
};

const totalIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
    />
  </svg>
);

const withLogoIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
    />
  </svg>
);

const withoutLogoIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
    />
  </svg>
);

export function AirlinesStatCards({ refreshKey = 0, className }: AirlinesStatCardsProps) {
  const { vols: getVolsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.flights.referential.airlines.stats');
  const [total, setTotal] = useState<CardState>(initial);
  const [withLogo, setWithLogo] = useState<CardState>(initial);
  const [withoutLogo, setWithoutLogo] = useState<CardState>(initial);

  useEffect(() => {
    let cancelled = false;
    const client = getApiClient();

    setTotal({ ...initial });
    setWithLogo({ ...initial });
    setWithoutLogo({ ...initial });

    async function loadOne(hasLogo?: boolean): Promise<CardState> {
      try {
        const result = await client.listAirlines({
          page: 1,
          limit: 1,
          ...(hasLogo === undefined ? {} : { hasLogo }),
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
      setWithLogo(yes);
      setWithoutLogo(no);
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
          iconClassName="bg-atg-warning-light text-atg-warning"
        />
        <StatCard
          label={t('withLogo.label')}
          subtitle={t('withLogo.subtitle')}
          status={withLogo.status}
          value={withLogo.displayValue}
          errorMessage={withLogo.errorMessage}
          icon={withLogoIcon}
          iconClassName="bg-atg-success-light text-atg-success"
        />
        <StatCard
          label={t('withoutLogo.label')}
          subtitle={t('withoutLogo.subtitle')}
          status={withoutLogo.status}
          value={withoutLogo.displayValue}
          errorMessage={withoutLogo.errorMessage}
          icon={withoutLogoIcon}
          iconClassName="bg-atg-info-light text-atg-info"
        />
      </div>
    </div>
  );
}
