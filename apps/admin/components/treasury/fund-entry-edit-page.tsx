'use client';

import type { FundEntry } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { AdminPageBackLink } from '../admin-page-back-link';
import { AdminIntroPage } from '../pages/admin-intro-page';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import { resolveUnknownApiError } from '../../lib/common-api-errors';
import { FundEntryAttachmentsSection } from '../treasury/fund-entry-attachments-section';
import { FundEntryForm } from '../treasury/fund-entry-form';

type FundEntryEditPageProps = {
  fundEntryId: string;
};

export function FundEntryEditPage({ fundEntryId }: FundEntryEditPageProps) {
  const tForm = useTranslations('modules.treasury.entries.form');
  const tPages = useTranslations('pages.tresorerie.entrees.id');
  const tCommon = useTranslations('modules.treasury.common');
  const tErrors = useTranslations('modules.treasury.errors');
  const tCommonErrors = useTranslations('common.errors');
  const [canWrite, setCanWrite] = useState(false);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; entry: FundEntry }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: tForm('editTitle'),
    entityLabel:
      state.status === 'ready'
        ? (state.entry.reference?.trim() || state.entry.id.slice(0, 8))
        : undefined,
  });

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getAuthMe()
      .then((me) => {
        if (!cancelled) {
          setCanWrite(
            me.isSuperAdmin || me.permissions.includes('treasury.entries.write'),
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
        const entry = await getApiClient().getFundEntry(fundEntryId);
        if (!cancelled) setState({ status: 'ready', entry });
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
  }, [fundEntryId, tCommonErrors, tErrors]);

  if (state.status === 'loading') {
    return (
      <div className="min-w-0">
        <div className="mb-4">
          <AdminPageBackLink href="/tresorerie/entrees" label={tPages('backLabel')} />
        </div>
        <p className="text-sm text-atg-muted">{tCommon('loading')}</p>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="min-w-0">
        <div className="mb-4">
          <AdminPageBackLink href="/tresorerie/entrees" label={tPages('backLabel')} />
        </div>
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      </div>
    );
  }

  const { entry } = state;

  return (
    <div className="min-w-0 space-y-6">
      <AdminIntroPage
        routePath="tresorerie/entrees/id"
        backHref="/tresorerie/entrees"
        backLabelKey="backLabel"
      >
        <div className="space-y-6">
          <FundEntryAttachmentsSection
            fundEntryId={fundEntryId}
            initialAttachments={entry.attachments ?? []}
            canWrite={canWrite && entry.status !== 'voided'}
            onChanged={(attachments) =>
              setState({ status: 'ready', entry: { ...entry, attachments } })
            }
          />
          <FundEntryForm
            mode="edit"
            fundEntryId={fundEntryId}
            initialEntry={entry}
          />
        </div>
      </AdminIntroPage>
    </div>
  );
}
