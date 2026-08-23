'use client';

import type { GapPage } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { GapPageForm } from './gap-page-form';

type GapPageEditPageProps = {
  pageId: string;
};

export function GapPageEditPage({ pageId }: GapPageEditPageProps) {
  const { gap: getGapErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.gap.pages.edit');
  const tCommon = useTranslations('modules.common');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; page: GapPage }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: t('pageTitle'),
    entityLabel: state.status === 'ready' ? state.page.title : undefined,
  });

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getGapPage(pageId)
      .then((page) => {
        if (!cancelled) setState({ status: 'ready', page });
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ status: 'error', message: getGapErrorMessage(error) });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [pageId, getGapErrorMessage]);

  if (state.status === 'loading') {
    return <p className="text-sm text-atg-muted">{tCommon('loading')}</p>;
  }

  if (state.status === 'error') {
    return (
      <p role="alert" className="text-sm text-red-600 dark:text-red-400">
        {state.message}
      </p>
    );
  }

  return <GapPageForm mode="edit" pageId={pageId} initialPage={state.page} />;
}
