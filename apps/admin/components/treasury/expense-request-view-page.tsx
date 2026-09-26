'use client';

import {
  Button,
  Card,
  DataTableBadge,
  Skeleton,
  type DataTableBadgeVariant,
} from '@africatourismgate/ui';
import type {
  ExpenseRequest,
  ExpenseRequestStatus,
  ExpenseRequestStatusHistoryEntry,
} from '@africatourismgate/types';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { resolveUnknownApiError } from '../../lib/common-api-errors';
import { formatMoney } from '../../lib/format-money';
import {
  useExpenseRequestStatusLabels,
  useFormatDateTime,
} from '../../lib/i18n/use-module-labels';
import { AdminPageBackLink } from '../admin-page-back-link';
import { PermissionGate } from '../permission-gate';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { ExpenseRequestWorkflowActions } from './expense-request-workflow-actions';
import { ExpenseRequestWorkflowTimeline } from './expense-request-workflow-timeline';

const STATUS_BADGE: Record<ExpenseRequestStatus, DataTableBadgeVariant> = {
  draft: 'muted',
  submitted: 'default',
  validated: 'success',
  authorized: 'success',
  rejected: 'danger',
  cancelled: 'muted',
  closed: 'warning',
};

type ExpenseRequestViewPageProps = {
  expenseRequestId: string;
};

function ProfileField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-atg-muted">
        {label}
      </dt>
      <dd className="mt-0.5 break-words text-sm font-medium text-atg-fg">{value}</dd>
    </div>
  );
}

function toIsoString(value: string | Date | null | undefined): string | null {
  if (value == null) return null;
  if (typeof value === 'string') return value;
  return value.toISOString();
}

export function ExpenseRequestViewPage({
  expenseRequestId,
}: ExpenseRequestViewPageProps) {
  const t = useTranslations('modules.treasury.expenseRequests.detail');
  const tFields = useTranslations('modules.treasury.expenseRequests.form.fields');
  const tList = useTranslations('modules.treasury.expenseRequests.list.columns');
  const tPages = useTranslations('pages.tresorerie.besoins.id.voir');
  const tCommon = useTranslations('modules.common');
  const tDates = useTranslations('modules.common.dates');
  const tErrors = useTranslations('modules.treasury.errors');
  const tCommonErrors = useTranslations('common.errors');
  const statusLabels = useExpenseRequestStatusLabels();
  const formatDateTime = useFormatDateTime('short');
  const locale = useLocale();
  const emptyDash = tCommon('empty.dash');

  const [request, setRequest] = useState<ExpenseRequest | null>(null);
  const [history, setHistory] = useState<ExpenseRequestStatusHistoryEntry[]>([]);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready' }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready' && request != null,
    title: t('title'),
    entityLabel:
      request?.title?.trim() ||
      (request ? request.id.slice(0, 8) : undefined),
  });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const client = getApiClient();
      const [data, statusHistory] = await Promise.all([
        client.getExpenseRequest(expenseRequestId),
        client.listExpenseRequestStatusHistory(expenseRequestId).catch(() => []),
      ]);
      setRequest(data);
      setHistory(statusHistory);
      setState({ status: 'ready' });
    } catch (error) {
      setState({
        status: 'error',
        message: resolveUnknownApiError(
          error,
          {
            network: tCommonErrors('network'),
            forbidden: tErrors('forbidden'),
            generic: tErrors('loadFailed'),
            apiStatus: (status: number) => tCommonErrors('apiStatus', { status }),
          },
          { useParseApiMessage: true, notFound: tErrors('notFound') },
        ),
      });
    }
  }, [expenseRequestId, tCommonErrors, tErrors]);

  useEffect(() => {
    void load();
  }, [load]);

  const refreshHistory = useCallback(async () => {
    try {
      const statusHistory =
        await getApiClient().listExpenseRequestStatusHistory(expenseRequestId);
      setHistory(statusHistory);
    } catch {
      /* keep previous history */
    }
  }, [expenseRequestId]);

  const handleTransitioned = useCallback(
    (updated: ExpenseRequest) => {
      setRequest(updated);
      void refreshHistory();
    },
    [refreshHistory],
  );

  const formatDate = useCallback(
    (value: string | null) => {
      if (!value) return emptyDash;
      try {
        return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(
          new Date(`${value.slice(0, 10)}T12:00:00`),
        );
      } catch {
        return value;
      }
    },
    [emptyDash, locale],
  );

  const backLabel = tPages('backLabel');
  const editHref = `/tresorerie/besoins/${expenseRequestId}`;

  if (state.status === 'loading') {
    return (
      <div className="min-w-0 space-y-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (state.status === 'error' || !request) {
    return (
      <div className="min-w-0 space-y-4">
        <AdminPageBackLink href="/tresorerie/besoins" label={backLabel} />
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.status === 'error' ? state.message : tErrors('notFound')}
        </p>
      </div>
    );
  }

  const updatedAt = toIsoString(request.updatedAt);
  const isDraft = request.status === 'draft';

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <AdminPageBackLink href="/tresorerie/besoins" label={backLabel} />
        <div className="flex flex-wrap gap-2">
          <PermissionGate permission="treasury.expense_requests.create">
            {isDraft ? (
              <Button href={editHref} variant="primary" className="w-full sm:w-auto">
                {t('editButton')}
              </Button>
            ) : null}
          </PermissionGate>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold text-atg-fg sm:text-2xl">
            {request.title}
          </h1>
          <DataTableBadge variant={STATUS_BADGE[request.status] ?? 'muted'}>
            {statusLabels[request.status] ?? request.status}
          </DataTableBadge>
        </div>
        <p className="font-mono text-xs text-atg-muted">{request.id}</p>
      </div>

      <ExpenseRequestWorkflowActions
        expenseRequest={request}
        onTransitioned={handleTransitioned}
      />

      <Card variant="dashboard" padding="md">
        <ExpenseRequestWorkflowTimeline
          currentStatus={request.status}
          history={history}
        />
      </Card>

      <Card variant="dashboard" padding="md">
        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <ProfileField
            label={tList('amount')}
            value={
              <span className="tabular-nums">
                {formatMoney(request.requestedAmountCents, request.currency)}
              </span>
            }
          />
          <ProfileField label={tFields('currency')} value={request.currency} />
          <ProfileField
            label={tFields('neededByDate')}
            value={formatDate(request.neededByDate)}
          />
          <ProfileField
            label={tList('status')}
            value={statusLabels[request.status] ?? request.status}
          />
          <ProfileField
            label={t('createdBy')}
            value={
              request.requestedByUserId || request.createdByUserId ? (
                <code className="font-mono text-xs">
                  {request.requestedByUserId ?? request.createdByUserId}
                </code>
              ) : (
                emptyDash
              )
            }
          />
          <ProfileField
            label={tDates('createdAt')}
            value={formatDateTime(request.createdAt)}
          />
          <ProfileField
            label={tDates('updatedAt')}
            value={updatedAt ? formatDateTime(updatedAt) : emptyDash}
          />
          <div className="min-w-0 sm:col-span-2 lg:col-span-3">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-atg-muted">
              {tFields('description')}
            </dt>
            <dd className="mt-0.5 whitespace-pre-wrap text-sm font-medium text-atg-fg">
              {request.description.trim() || emptyDash}
            </dd>
          </div>
          {request.rejectionReason ? (
            <div className="min-w-0 sm:col-span-2 lg:col-span-3">
              <dt className="text-[11px] font-medium uppercase tracking-wide text-atg-muted">
                {t('rejectionReason')}
              </dt>
              <dd className="mt-0.5 whitespace-pre-wrap text-sm font-medium text-atg-fg">
                {request.rejectionReason}
              </dd>
            </div>
          ) : null}
        </dl>
      </Card>

      <Card variant="dashboard" padding="md">
        <h2 className="mb-2 text-sm font-semibold text-atg-fg">{t('linkedExits')}</h2>
        <p className="text-sm text-atg-muted">{t('linkedExitsEmpty')}</p>
      </Card>
    </div>
  );
}
