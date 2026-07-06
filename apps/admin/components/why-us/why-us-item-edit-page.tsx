'use client';

import type { WhyUsItem } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { getApiClient } from '../../lib/auth/api';
import { WhyUsItemForm } from './why-us-item-form';

type WhyUsItemEditPageProps = {
  itemId: string;
};

export function WhyUsItemEditPage({ itemId }: WhyUsItemEditPageProps) {
  const { about: getAboutErrorMessage } = useAdminErrorMessages();
  const tCommonForm = useTranslations('modules.common.form');
  const t = useTranslations('modules.about.whyUs.items.edit');
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
    return <p className="text-sm text-muted-foreground">{tCommonForm('loading')}</p>;
  }

  if (state.status === 'error') {
    return <p className="text-sm text-destructive">{state.message}</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('pageTitle')}</h1>
      <WhyUsItemForm mode="edit" itemId={itemId} initialItem={state.item} />
    </div>
  );
}
