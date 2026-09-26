'use client';

import type { FundExit } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { AdminPageBackLink } from '../admin-page-back-link';
import { AdminIntroPage } from '../pages/admin-intro-page';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import { resolveUnknownApiError } from '../../lib/common-api-errors';
import { FundExitAttachmentsSection } from './fund-exit-attachments-section';
import { FundExitForm } from './fund-exit-form';

type FundExitEditPageProps = {
  fundExitId: string;
};

export function FundExitEditPage({ fundExitId }: FundExitEditPageProps) {
  const tForm = useTranslations('modules.treasury.exits.form');
  const tPages = useTranslations('pages.tresorerie.sorties.id');
  const tCommon = useTranslations('modules.treasury.common');
  const tErrors = useTranslations('modules.treasury.errors');
  const tCommonErrors = useTranslations('common.errors');
  const [canWrite, setCanWrite] = useState(false);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; exit: FundExit }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: tForm('editTitle'),
    entityLabel:
      state.status === 'ready'
        ? state.exit.reference?.trim() || state.exit.id.slice(0, 8)
        : undefined,
  });

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getAuthMe()
      .then((me) => {
        if (!cancelled) {
          setCanWrite(
            me.isSuperAdmin || me.permissions.includes('treasury.exits.write'),
          );
        }
      })
      .catch(() => {
        if (!cancelled) setCanWrite(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const exit = await getApiClient().getFundExit(fundExitId);
        if (!cancelled) setState({ status: 'ready', exit });
      } catch (error) {
        if (!cancelled) {
          setState({
            status: 'error',
            message: resolveUnknownApiError(
              error,
              {
                network: tCommonErrors('network'),
                forbidden: tErrors('forbidden'),
                generic: tErrors('loadFailed'),
                apiStatus: (status: number) =>
                  tCommonErrors('apiStatus', { status }),
              },
              { useParseApiMessage: true, notFound: tErrors('notFound') },
            ),
          });
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [fundExitId, tCommonErrors, tErrors]);

  if (state.status === 'loading') {
    return (
      <div className="min-w-0">
        <div className="mb-4">
          <AdminPageBackLink href="/tresorerie/sorties" label={tPages('backLabel')} />
        </div>
        <p className="text-sm text-atg-muted">{tCommon('loading')}</p>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="min-w-0">
        <div className="mb-4">
          <AdminPageBackLink href="/tresorerie/sorties" label={tPages('backLabel')} />
        </div>
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      </div>
    );
  }

  const { exit } = state;

  return (
    <div className="min-w-0 space-y-6">
      <AdminIntroPage
        routePath="tresorerie/sorties/id"
        backHref="/tresorerie/sorties"
        backLabelKey="backLabel"
      >
        <div className="space-y-6">
          <FundExitAttachmentsSection
            fundExitId={fundExitId}
            initialAttachments={exit.attachments ?? []}
            canWrite={canWrite && exit.status !== 'voided'}
            onChanged={(attachments) =>
              setState({ status: 'ready', exit: { ...exit, attachments } })
            }
          />
          <FundExitForm
            mode="edit"
            fundExitId={fundExitId}
            initialExit={exit}
          />
        </div>
      </AdminIntroPage>
    </div>
  );
}
