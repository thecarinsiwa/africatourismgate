'use client';

import {
  Card,
  DataTable,
  DataTableBadge,
  Skeleton,
  type ColumnDef,
  type DataTableBadgeVariant,
} from '@africatourismgate/ui';
import type {
  JournalEntry,
  JournalEntryStatus,
  JournalLine,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { AdminPageBackLink } from '../admin-page-back-link';
import { getApiClient } from '../../lib/auth/api';
import { resolveUnknownApiError } from '../../lib/common-api-errors';
import { formatMoney } from '../../lib/format-money';
import { useFormatDateTime } from '../../lib/i18n/use-module-labels';
import { AccountingBooksSubnav } from './accounting-books-subnav';

const STATUS_BADGE: Record<JournalEntryStatus, DataTableBadgeVariant> = {
  draft: 'muted',
  posted: 'success',
  reversed: 'warning',
};

type JournalEntryDetailProps = {
  entryId: string;
};

export function JournalEntryDetail({ entryId }: JournalEntryDetailProps) {
  const t = useTranslations('modules.treasury.accounting.journalDetail');
  const tColumns = useTranslations(
    'modules.treasury.accounting.journalDetail.columns',
  );
  const tStatuses = useTranslations('modules.treasury.accounting.entryStatuses');
  const tSources = useTranslations('modules.treasury.accounting.entrySources');
  const tCommon = useTranslations('modules.common');
  const tDataTable = useTranslations('modules.common.dataTable');
  const tErrors = useTranslations('modules.treasury.errors');
  const tCommonErrors = useTranslations('common.errors');
  const tPages = useTranslations('pages.tresorerie.comptabilite.journal.id');
  const formatDate = useFormatDateTime('short');
  const emptyDash = tCommon('empty.dash');

  const [canRead, setCanRead] = useState(true);
  const [accountLabels, setAccountLabels] = useState<
    Record<string, string>
  >({});
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; entry: JournalEntry }
  >({ status: 'loading' });

  const commonErrorMessages = useMemo(
    () => ({
      network: tCommonErrors('network'),
      forbidden: tErrors('forbidden'),
      generic: tErrors('loadFailed'),
      apiStatus: (code: number) => tCommonErrors('apiStatus', { status: code }),
      accessDenied: t('accessDenied'),
    }),
    [t, tCommonErrors, tErrors],
  );

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getAuthMe()
      .then((me) => {
        if (cancelled) return;
        setCanRead(
          me.isSuperAdmin ||
            me.permissions.includes('treasury.accounting_link.read'),
        );
      })
      .catch(() => {
        if (!cancelled) setCanRead(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!canRead) {
      setState({ status: 'error', message: t('accessDenied') });
      return;
    }
    let cancelled = false;
    setState({ status: 'loading' });
    void getApiClient()
      .getJournalEntry(entryId)
      .then(async (entry) => {
        if (cancelled) return;
        setState({ status: 'ready', entry });
        try {
          const accounts = await getApiClient().listChartOfAccounts({
            organizationId: entry.organizationId,
            page: 1,
            limit: 500,
          });
          if (cancelled) return;
          const map: Record<string, string> = {};
          for (const a of accounts.data) {
            map[a.id] = `${a.code} — ${a.label}`;
          }
          setAccountLabels(map);
        } catch {
          if (!cancelled) setAccountLabels({});
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState({
            status: 'error',
            message: resolveUnknownApiError(error, commonErrorMessages),
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [entryId, canRead, t, commonErrorMessages]);

  const columns = useMemo<ColumnDef<JournalLine>[]>(
    () => [
      {
        id: 'lineNo',
        header: tColumns('lineNo'),
        cell: ({ row }) => row.original.lineNo,
      },
      {
        id: 'account',
        header: tColumns('account'),
        cell: ({ row }) => {
          const code = row.original.accountCode;
          const label = row.original.accountLabel;
          if (code && label) return `${code} — ${label}`;
          return accountLabels[row.original.accountId] ?? row.original.accountId;
        },
      },
      {
        id: 'label',
        header: tColumns('label'),
        cell: ({ row }) => row.original.label || emptyDash,
      },
      {
        id: 'debit',
        header: tColumns('debit'),
        align: 'right',
        cell: ({ row }) =>
          row.original.debitCents > 0
            ? formatMoney(
                row.original.debitCents,
                state.status === 'ready' ? state.entry.currency : 'XOF',
              )
            : emptyDash,
      },
      {
        id: 'credit',
        header: tColumns('credit'),
        align: 'right',
        cell: ({ row }) =>
          row.original.creditCents > 0
            ? formatMoney(
                row.original.creditCents,
                state.status === 'ready' ? state.entry.currency : 'XOF',
              )
            : emptyDash,
      },
    ],
    [tColumns, emptyDash, state, accountLabels],
  );

  if (state.status === 'loading') {
    return (
      <div className="min-w-0 space-y-6">
        <AccountingBooksSubnav />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="min-w-0 space-y-6">
        <AccountingBooksSubnav />
        <AdminPageBackLink
          href="/tresorerie/comptabilite/journal"
          label={tPages('backLabel')}
        />
        <Card className="p-6">
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {state.message}
          </p>
        </Card>
      </div>
    );
  }

  const { entry } = state;
  const lines = entry.lines ?? [];

  return (
    <div className="min-w-0 space-y-6">
      <AccountingBooksSubnav />
      <AdminPageBackLink
        href="/tresorerie/comptabilite/journal"
        label={tPages('backLabel')}
      />

      <div>
        <h1 className="text-2xl font-semibold text-atg-fg">
          {entry.entryNumber}
        </h1>
        <p className="mt-1 text-sm text-atg-muted">{entry.description}</p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted">
            {t('fields.entryDate')}
          </dt>
          <dd className="mt-1 text-sm text-atg-fg">
            {formatDate(entry.entryDate) || emptyDash}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted">
            {t('fields.status')}
          </dt>
          <dd className="mt-1">
            <DataTableBadge variant={STATUS_BADGE[entry.status]}>
              {tStatuses(entry.status)}
            </DataTableBadge>
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted">
            {t('fields.source')}
          </dt>
          <dd className="mt-1 text-sm text-atg-fg">
            {tSources(entry.source)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted">
            {t('fields.currency')}
          </dt>
          <dd className="mt-1 text-sm text-atg-fg">{entry.currency}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted">
            {t('fields.totalDebit')}
          </dt>
          <dd className="mt-1 text-sm font-medium text-atg-fg">
            {formatMoney(
              entry.totalDebitCents ??
                lines.reduce((s, l) => s + l.debitCents, 0),
              entry.currency,
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted">
            {t('fields.totalCredit')}
          </dt>
          <dd className="mt-1 text-sm font-medium text-atg-fg">
            {formatMoney(
              entry.totalCreditCents ??
                lines.reduce((s, l) => s + l.creditCents, 0),
              entry.currency,
            )}
          </dd>
        </div>
      </dl>

      <Card variant="dashboard" padding="none" className="overflow-hidden">
        <DataTable
          columns={columns}
          data={lines}
          getRowId={(row) => row.id}
          emptyMessage={t('emptyLines')}
          aria-label={t('linesAriaLabel')}
          loadingMessage={tDataTable('loading')}
        />
      </Card>
    </div>
  );
}
