'use client';

import type { ExpenseRequest } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { AdminPageBackLink } from '../admin-page-back-link';
import { AdminIntroPage } from '../pages/admin-intro-page';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import { resolveUnknownApiError } from '../../lib/common-api-errors';
import { ExpenseRequestForm } from '../treasury/expense-request-form';

type ExpenseRequestEditPageProps = {
  expenseRequestId: string;
};

export function ExpenseRequestEditPage({
  expenseRequestId,
}: ExpenseRequestEditPageProps) {
  const tForm = useTranslations('modules.treasury.expenseRequests.form');
  const tPages = useTranslations('pages.tresorerie.besoins.id');
  const tCommon = useTranslations('modules.treasury.common');
  const tErrors = useTranslations('modules.treasury.errors');
  const tCommonErrors = useTranslations('common.errors');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; request: ExpenseRequest }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: tForm('editTitle'),
    entityLabel:
      state.status === 'ready'
        ? state.request.title.trim() || state.request.id.slice(0, 8)
        : undefined,
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const request = await getApiClient().getExpenseRequest(expenseRequestId);
        if (!cancelled) setState({ status: 'ready', request });
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
  }, [expenseRequestId, tCommonErrors, tErrors]);

  if (state.status === 'loading') {
    return (
      <div className="min-w-0">
        <div className="mb-4">
          <AdminPageBackLink href="/tresorerie/besoins" label={tPages('backLabel')} />
        </div>
        <p className="text-sm text-atg-muted">{tCommon('loading')}</p>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="min-w-0">
        <div className="mb-4">
          <AdminPageBackLink href="/tresorerie/besoins" label={tPages('backLabel')} />
        </div>
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      <AdminIntroPage
        routePath="tresorerie/besoins/id"
        backHref="/tresorerie/besoins"
        backLabelKey="backLabel"
      >
        <ExpenseRequestForm
          mode="edit"
          expenseRequestId={expenseRequestId}
          initialRequest={state.request}
        />
      </AdminIntroPage>
    </div>
  );
}
