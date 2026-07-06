'use client';

import type { HappyCustomersStat } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { getApiClient } from '../../lib/auth/api';
import { HappyCustomersStatForm } from './happy-customers-stat-form';

type HappyCustomersStatEditPageProps = {
  statId: string;
};

export function HappyCustomersStatEditPage({ statId }: HappyCustomersStatEditPageProps) {
  const { about: getAboutErrorMessage } = useAdminErrorMessages();
  const tCommonForm = useTranslations('modules.common.form');
  const t = useTranslations('modules.about.happyCustomers.stats.edit');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; stat: HappyCustomersStat }
  >({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getHappyCustomersStat(statId)
      .then((stat) => {
        if (!cancelled) setState({ status: 'ready', stat });
      })
      .catch((error) => {
        if (!cancelled) setState({ status: 'error', message: getAboutErrorMessage(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [getAboutErrorMessage, statId]);

  if (state.status === 'loading') {
    return <p className="text-sm text-muted-foreground">{tCommonForm('loading')}</p>;
  }

  if (state.status === 'error') {
    return <p className="text-sm text-destructive">{state.message}</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('pageTitle')}</h1>
      <HappyCustomersStatForm mode="edit" statId={statId} initialStat={state.stat} />
    </div>
  );
}
