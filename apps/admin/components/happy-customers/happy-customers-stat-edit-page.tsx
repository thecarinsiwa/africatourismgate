'use client';

import type { HappyCustomersStat } from '@africatourismgate/types';
import { Skeleton } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { getApiClient } from '../../lib/auth/api';
import { AdminIntroPage } from '../pages/admin-intro-page';
import { HappyCustomersStatForm } from './happy-customers-stat-form';

const HAPPY_CUSTOMERS_HUB_HREF = '/contenu/site?tab=happy-customers';

type HappyCustomersStatEditPageProps = {
  statId: string;
};

export function HappyCustomersStatEditPage({ statId }: HappyCustomersStatEditPageProps) {
  const { about: getAboutErrorMessage } = useAdminErrorMessages();
  const tCommonForm = useTranslations('modules.common.form');
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
    return (
      <AdminIntroPage
        routePath="contenu/clients-satisfaits/id"
        backHref={HAPPY_CUSTOMERS_HUB_HREF}
        backLabelKey="backLabel"
      >
        <Skeleton className="h-96 w-full max-w-2xl" />
        <p className="sr-only">{tCommonForm('loading')}</p>
      </AdminIntroPage>
    );
  }

  if (state.status === 'error') {
    return (
      <AdminIntroPage
        routePath="contenu/clients-satisfaits/id"
        backHref={HAPPY_CUSTOMERS_HUB_HREF}
        backLabelKey="backLabel"
      >
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      </AdminIntroPage>
    );
  }

  return (
    <AdminIntroPage
      routePath="contenu/clients-satisfaits/id"
      backHref={HAPPY_CUSTOMERS_HUB_HREF}
      backLabelKey="backLabel"
    >
      <div className="min-w-0">
        <HappyCustomersStatForm mode="edit" statId={statId} initialStat={state.stat} />
      </div>
    </AdminIntroPage>
  );
}
