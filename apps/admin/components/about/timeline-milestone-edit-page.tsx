'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import type { AboutTimelineMilestone } from '@africatourismgate/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { TimelineMilestoneForm } from './timeline-milestone-form';

type TimelineMilestoneEditPageProps = {
  milestoneId: string;
};

export function TimelineMilestoneEditPage({ milestoneId }: TimelineMilestoneEditPageProps) {
  const { about: getAboutErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.about.timeline.edit');
  const tCommon = useTranslations('modules.common');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; milestone: AboutTimelineMilestone }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: t('pageTitle'),
    entityLabel: state.status === 'ready' ? state.milestone.title : undefined,
  });

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getAboutTimelineMilestone(milestoneId)
      .then((milestone) => {
        if (!cancelled) setState({ status: 'ready', milestone });
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ status: 'error', message: getAboutErrorMessage(error) });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [milestoneId, getAboutErrorMessage]);

  if (state.status === 'loading') {
    return <p className="text-sm text-atg-muted">{tCommon('loading')}</p>;
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
        <Link href="/contenu/a-propos/timeline" className="text-sm font-medium text-primary">
          {tCommon('back.toList')}
        </Link>
      </div>
    );
  }

  return (
    <TimelineMilestoneForm
      mode="edit"
      milestoneId={milestoneId}
      initialMilestone={state.milestone}
    />
  );
}
