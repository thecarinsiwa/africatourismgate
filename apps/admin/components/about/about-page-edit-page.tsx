'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import type { AboutPage } from '@africatourismgate/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { AboutPageForm } from './about-page-form';

type AboutPageEditPageProps = {
  pageId: string;
};

export function AboutPageEditPage({ pageId }: AboutPageEditPageProps) {
  const { about: getAboutErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.about.pages.edit');
  const tCommon = useTranslations('modules.common');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; page: AboutPage }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: t('pageTitle'),
    entityLabel: state.status === 'ready' ? state.page.title : undefined,
  });

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getAboutPage(pageId)
      .then((page) => {
        if (!cancelled) setState({ status: 'ready', page });
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ status: 'error', message: getAboutErrorMessage(error) });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [pageId, getAboutErrorMessage]);

  if (state.status === 'loading') {
    return <p className="text-sm text-atg-muted">{tCommon('loading')}</p>;
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
        <Link href="/contenu/a-propos/pages" className="text-sm font-medium text-primary">
          {tCommon('back.toList')}
        </Link>
      </div>
    );
  }

  return <AboutPageForm mode="edit" pageId={pageId} initialPage={state.page} />;
}
