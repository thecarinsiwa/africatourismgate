'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import type { AboutResource } from '@africatourismgate/types';
import { Skeleton } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { AdminIntroPage } from '../pages/admin-intro-page';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { AboutResourceForm } from './about-resource-form';

const ABOUT_RESOURCES_HUB_HREF = '/contenu/site?tab=about-resources';

type AboutResourceEditPageProps = {
  resourceId: string;
};

export function AboutResourceEditPage({ resourceId }: AboutResourceEditPageProps) {
  const { about: getAboutErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.about.resources.edit');
  const tCommonForm = useTranslations('modules.common.form');
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
    return (
      <AdminIntroPage
        routePath="contenu/a-propos/ressources/id"
        backHref={ABOUT_RESOURCES_HUB_HREF}
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
        routePath="contenu/a-propos/ressources/id"
        backHref={ABOUT_RESOURCES_HUB_HREF}
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
      routePath="contenu/a-propos/ressources/id"
      backHref={ABOUT_RESOURCES_HUB_HREF}
      backLabelKey="backLabel"
    >
      <div className="min-w-0">
        <AboutResourceForm
          mode="edit"
          resourceId={resourceId}
          initialResource={state.resource}
        />
      </div>
    </AdminIntroPage>
  );
}
