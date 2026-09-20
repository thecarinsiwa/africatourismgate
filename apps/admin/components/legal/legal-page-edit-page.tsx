'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import type { LegalPage } from '@africatourismgate/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { LegalPageForm } from './legal-page-form';

type LegalPageEditPageProps = {
  pageId: string;
};

export function LegalPageEditPage({ pageId }: LegalPageEditPageProps) {
  const { about: getLegalErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.legal.pages.edit');
  const tCommon = useTranslations('modules.common');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; page: LegalPage }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: t('pageTitle'),
    entityLabel: state.status === 'ready' ? state.page.title : undefined,
  });

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getLegalPage(pageId)
      .then((page) => {
        if (!cancelled) setState({ status: 'ready', page });
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ status: 'error', message: getLegalErrorMessage(error) });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [pageId, getLegalErrorMessage]);

  if (state.status === 'loading') {
    return <p className="text-sm text-atg-muted">{tCommon('loading')}</p>;
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
        <Link href="/contenu/legal" className="text-sm font-medium text-primary">
          {tCommon('back.toList')}
        </Link>
      </div>
    );
  }

  return <LegalPageForm mode="edit" pageId={pageId} initialPage={state.page} />;
}
