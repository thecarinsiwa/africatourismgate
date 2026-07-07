'use client';

import type { GapActivity } from '@africatourismgate/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { GapActivityForm } from './gap-activity-form';

type GapActivityEditPageProps = {
  activityId: string;
};

export function GapActivityEditPage({ activityId }: GapActivityEditPageProps) {
  const { gap: getGapErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.gap.activities.edit');
  const tCommon = useTranslations('modules.common');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; activity: GapActivity }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: t('pageTitle'),
    entityLabel: state.status === 'ready' ? state.activity.title : undefined,
  });

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getGapActivity(activityId)
      .then((activity) => {
        if (!cancelled) setState({ status: 'ready', activity });
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ status: 'error', message: getGapErrorMessage(error) });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [activityId, getGapErrorMessage]);

  if (state.status === 'loading') {
    return <p className="text-sm text-atg-muted">{tCommon('loading')}</p>;
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
        <Link href="/gap/activites" className="text-sm font-medium text-primary">
          {tCommon('back.toList')}
        </Link>
      </div>
    );
  }

  return <GapActivityForm mode="edit" activityId={activityId} initialActivity={state.activity} />;
}
