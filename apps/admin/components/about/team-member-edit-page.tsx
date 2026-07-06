'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import type { TeamMember } from '@africatourismgate/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { TeamMemberForm } from './team-member-form';

type TeamMemberEditPageProps = {
  memberId: string;
};

export function TeamMemberEditPage({ memberId }: TeamMemberEditPageProps) {
  const { about: getAboutErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.about.team.edit');
  const tCommon = useTranslations('modules.common');
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
    return <p className="text-sm text-atg-muted">{tCommon('loading')}</p>;
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
        <Link href="/contenu/a-propos/equipe" className="text-sm font-medium text-primary">
          {tCommon('back.toList')}
        </Link>
      </div>
    );
  }

  return <TeamMemberForm mode="edit" memberId={memberId} initialMember={state.member} />;
}
