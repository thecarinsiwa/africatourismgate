'use client';

import type { GapMediaItem } from '@africatourismgate/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { GapMediaItemForm } from './gap-media-item-form';

type GapMediaItemEditPageProps = {
  mediaItemId: string;
};

export function GapMediaItemEditPage({ mediaItemId }: GapMediaItemEditPageProps) {
  const { gap: getGapErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.gap.media.edit');
  const tCommon = useTranslations('modules.common');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; item: GapMediaItem }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: t('pageTitle'),
    entityLabel: state.status === 'ready' ? state.item.title : undefined,
  });

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getGapMediaItem(mediaItemId)
      .then((item) => {
        if (!cancelled) setState({ status: 'ready', item });
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ status: 'error', message: getGapErrorMessage(error) });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [mediaItemId, getGapErrorMessage]);

  if (state.status === 'loading') {
    return <p className="text-sm text-atg-muted">{tCommon('loading')}</p>;
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
        <Link href="/gap/medias" className="text-sm font-medium text-primary">
          {tCommon('back.toList')}
        </Link>
      </div>
    );
  }

  return (
    <GapMediaItemForm mode="edit" mediaItemId={mediaItemId} initialMediaItem={state.item} />
  );
}
