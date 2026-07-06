'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import type { AboutResource } from '@africatourismgate/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { AboutResourceForm } from './about-resource-form';

type AboutResourceEditPageProps = {
  resourceId: string;
};

export function AboutResourceEditPage({ resourceId }: AboutResourceEditPageProps) {
  const { about: getAboutErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.about.resources.edit');
  const tCommon = useTranslations('modules.common');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; resource: AboutResource }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: t('pageTitle'),
    entityLabel: state.status === 'ready' ? state.resource.title : undefined,
  });

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getAboutResource(resourceId)
      .then((resource) => {
        if (!cancelled) setState({ status: 'ready', resource });
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ status: 'error', message: getAboutErrorMessage(error) });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [resourceId, getAboutErrorMessage]);

  if (state.status === 'loading') {
    return <p className="text-sm text-atg-muted">{tCommon('loading')}</p>;
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
        <Link href="/contenu/a-propos/ressources" className="text-sm font-medium text-primary">
          {tCommon('back.toList')}
        </Link>
      </div>
    );
  }

  return (
    <AboutResourceForm mode="edit" resourceId={resourceId} initialResource={state.resource} />
  );
}
