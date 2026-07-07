'use client';

import type { GapImpactStat } from '@africatourismgate/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { GapImpactStatForm } from './gap-impact-stat-form';

type GapImpactStatEditPageProps = {
  statId: string;
};

export function GapImpactStatEditPage({ statId }: GapImpactStatEditPageProps) {
  const { gap: getGapErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.gap.impact.edit');
  const tCommon = useTranslations('modules.common');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; stat: GapImpactStat }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: t('pageTitle'),
    entityLabel: state.status === 'ready' ? state.stat.label : undefined,
  });

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getGapImpactStat(statId)
      .then((stat) => {
        if (!cancelled) setState({ status: 'ready', stat });
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ status: 'error', message: getGapErrorMessage(error) });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [statId, getGapErrorMessage]);

  if (state.status === 'loading') {
    return <p className="text-sm text-atg-muted">{tCommon('loading')}</p>;
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
        <Link href="/gap/impact" className="text-sm font-medium text-primary">
          {tCommon('back.toList')}
        </Link>
      </div>
    );
  }

  return <GapImpactStatForm mode="edit" statId={statId} initialStat={state.stat} />;
}
