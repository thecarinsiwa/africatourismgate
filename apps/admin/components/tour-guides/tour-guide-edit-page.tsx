'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import type { TourGuide } from '@africatourismgate/types';
import { Skeleton } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { AdminPageBackLink } from '../admin-page-back-link';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import { TourGuideForm } from './tour-guide-form';

type TourGuideEditPageProps = {
  guideId: string;
};

export function TourGuideEditPage({ guideId }: TourGuideEditPageProps) {
  const { tourGuides: getTourGuidesErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.tourGuides.detail');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; guide: TourGuide }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: t('title'),
    entityLabel: state.status === 'ready' ? state.guide.displayName : undefined,
  });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const guide = await getApiClient().getTourGuide(guideId);
      setState({ status: 'ready', guide });
    } catch (error) {
      setState({ status: 'error', message: getTourGuidesErrorMessage(error) });
    }
  }, [guideId, getTourGuidesErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  if (state.status === 'loading') {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-64 w-full max-w-2xl" />
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <AdminPageBackLink href="/guides" label={t('backLink')} />
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageBackLink href="/guides" label={t('backLink')} />
      <TourGuideForm
        mode="edit"
        guideId={guideId}
        initialGuide={state.guide}
        onUpdated={(guide) => setState({ status: 'ready', guide })}
      />
    </div>
  );
}
