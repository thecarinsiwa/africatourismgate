'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import type { AboutTimelineMilestone } from '@africatourismgate/types';
import { Skeleton } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { AdminIntroPage } from '../pages/admin-intro-page';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { TimelineMilestoneForm } from './timeline-milestone-form';

const ABOUT_TIMELINE_HUB_HREF = '/contenu/site?tab=about-timeline';

type TimelineMilestoneEditPageProps = {
  milestoneId: string;
};

export function TimelineMilestoneEditPage({ milestoneId }: TimelineMilestoneEditPageProps) {
  const { about: getAboutErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.about.timeline.edit');
  const tCommonForm = useTranslations('modules.common.form');
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
    return (
      <AdminIntroPage
        routePath="contenu/a-propos/timeline/id"
        backHref={ABOUT_TIMELINE_HUB_HREF}
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
        routePath="contenu/a-propos/timeline/id"
        backHref={ABOUT_TIMELINE_HUB_HREF}
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
      routePath="contenu/a-propos/timeline/id"
      backHref={ABOUT_TIMELINE_HUB_HREF}
      backLabelKey="backLabel"
    >
      <div className="min-w-0">
        <TimelineMilestoneForm
          mode="edit"
          milestoneId={milestoneId}
          initialMilestone={state.milestone}
        />
      </div>
    </AdminIntroPage>
  );
}
