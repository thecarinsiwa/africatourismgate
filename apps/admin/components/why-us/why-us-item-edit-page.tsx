'use client';

import type { WhyUsItem } from '@africatourismgate/types';
import { Skeleton } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { getApiClient } from '../../lib/auth/api';
import { AdminIntroPage } from '../pages/admin-intro-page';
import { WhyUsItemForm } from './why-us-item-form';

const WHY_US_HUB_HREF = '/contenu/site?tab=why-us';

type WhyUsItemEditPageProps = {
  itemId: string;
};

export function WhyUsItemEditPage({ itemId }: WhyUsItemEditPageProps) {
  const { about: getAboutErrorMessage } = useAdminErrorMessages();
  const tCommonForm = useTranslations('modules.common.form');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; item: WhyUsItem }
  >({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getWhyUsItem(itemId)
      .then((item) => {
        if (!cancelled) setState({ status: 'ready', item });
      })
      .catch((error) => {
        if (!cancelled) setState({ status: 'error', message: getAboutErrorMessage(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [getAboutErrorMessage, itemId]);

  if (state.status === 'loading') {
    return (
      <AdminIntroPage
        routePath="contenu/pourquoi-nous/id"
        backHref={WHY_US_HUB_HREF}
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
        routePath="contenu/pourquoi-nous/id"
        backHref={WHY_US_HUB_HREF}
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
      routePath="contenu/pourquoi-nous/id"
      backHref={WHY_US_HUB_HREF}
      backLabelKey="backLabel"
    >
      <div className="min-w-0">
        <WhyUsItemForm mode="edit" itemId={itemId} initialItem={state.item} />
      </div>
    </AdminIntroPage>
  );
}
