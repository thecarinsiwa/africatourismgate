'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import type { TeamMember } from '@africatourismgate/types';
import { Skeleton } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { AdminIntroPage } from '../pages/admin-intro-page';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { TeamMemberForm } from './team-member-form';

const ABOUT_TEAM_HUB_HREF = '/contenu/site?tab=about-team';

type TeamMemberEditPageProps = {
  memberId: string;
};

export function TeamMemberEditPage({ memberId }: TeamMemberEditPageProps) {
  const { about: getAboutErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.about.team.edit');
  const tCommonForm = useTranslations('modules.common.form');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; member: TeamMember }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: t('pageTitle'),
    entityLabel: state.status === 'ready' ? state.member.name : undefined,
  });

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getTeamMember(memberId)
      .then((member) => {
        if (!cancelled) setState({ status: 'ready', member });
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ status: 'error', message: getAboutErrorMessage(error) });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [memberId, getAboutErrorMessage]);

  if (state.status === 'loading') {
    return (
      <AdminIntroPage
        routePath="contenu/a-propos/equipe/id"
        backHref={ABOUT_TEAM_HUB_HREF}
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
        routePath="contenu/a-propos/equipe/id"
        backHref={ABOUT_TEAM_HUB_HREF}
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
      routePath="contenu/a-propos/equipe/id"
      backHref={ABOUT_TEAM_HUB_HREF}
      backLabelKey="backLabel"
    >
      <div className="min-w-0">
        <TeamMemberForm mode="edit" memberId={memberId} initialMember={state.member} />
      </div>
    </AdminIntroPage>
  );
}
