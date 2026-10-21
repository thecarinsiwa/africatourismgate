'use client';

import {
  Card,
  DataTable,
  DataTablePagination,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { JournalLine } from '@africatourismgate/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { resolveUnknownApiError } from '../../lib/common-api-errors';
import { formatMoney } from '../../lib/format-money';
import { useFormatDateTime } from '../../lib/i18n/use-module-labels';
import { useDataTablePaginationLabels } from '../../lib/i18n/use-pagination-labels';
import {
  AccountingBooksFilters,
  EMPTY_ACCOUNTING_BOOKS_FILTERS,
  type AccountingBooksFilterValues,
} from './accounting-books-filters';

const PAGE_SIZE = 50;
const DEFAULT_CURRENCY = 'XOF';

type GeneralLedgerListProps = {
  initialAccountId?: string;
};

export function GeneralLedgerList({
  initialAccountId = '',
}: GeneralLedgerListProps) {
  const t = useTranslations('modules.treasury.accounting.generalLedger');
  const tColumns = useTranslations(
    'modules.treasury.accounting.generalLedger.columns',
  );
  const tCommon = useTranslations('modules.common');
  const tDataTable = useTranslations('modules.common.dataTable');
  const tErrors = useTranslations('modules.treasury.errors');
  const tCommonErrors = useTranslations('common.errors');
  const formatDate = useFormatDateTime('short');
  const paginationLabels = useDataTablePaginationLabels();
  const emptyDash = tCommon('empty.dash');

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<AccountingBooksFilterValues>(() => ({
    ...EMPTY_ACCOUNTING_BOOKS_FILTERS,
    accountId: initialAccountId,
  }));

  useEffect(() => {
    if (!initialAccountId) return;
    setFilters((prev) =>
      prev.accountId === initialAccountId
        ? prev
        : { ...prev, accountId: initialAccountId },
    );
  }, [initialAccountId]);
  const [canRead, setCanRead] = useState(true);
  const [state, setState] = useState<
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        lines: JournalLine[];
        total: number;
        totalPages: number;
        currency: string;
      }
  >({ status: 'idle' });

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

  const load = useCallback(async () => {
    if (!canRead) {
      setState({ status: 'error', message: t('accessDenied') });
      return;
    }
    if (!filters.accountId) {
      setState({ status: 'idle' });
      return;
    }
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listJournalLines({
        page,
        limit: PAGE_SIZE,
        accountId: filters.accountId,
        organizationId: filters.organizationId || undefined,
        exerciseId: filters.exerciseId || undefined,
        periodId: filters.periodId || undefined,
        journalId: filters.journalId || undefined,
        postedOnly: true,
      });
      setState({
        status: 'ready',
        lines: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
        currency: DEFAULT_CURRENCY,
      });
    } catch (error) {
      setState({
        status: 'error',
        message: resolveUnknownApiError(error, commonErrorMessages),
      });
    }
  }, [canRead, page, filters, t, commonErrorMessages]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleFiltersChange = (next: AccountingBooksFilterValues) => {
    setFilters(next);
    setPage(1);
  };

  const columns = useMemo<ColumnDef<JournalLine>[]>(
    () => [
      {
        id: 'entryDate',
        header: tColumns('entryDate'),
        cell: ({ row }) =>
          row.original.entryDate
            ? formatDate(row.original.entryDate)
            : emptyDash,
      },
      {
        id: 'entryNumber',
        header: tColumns('entryNumber'),
        cell: ({ row }) =>
          row.original.journalEntryId ? (
            <Link
              href={`/tresorerie/comptabilite/journal/${row.original.journalEntryId}`}
              className="font-medium text-primary hover:underline"
            >
              {row.original.entryNumber ?? row.original.journalEntryId}
            </Link>
          ) : (
            emptyDash
          ),
      },
      {
        id: 'journal',
        header: tColumns('journal'),
        cell: ({ row }) => row.original.journalCode ?? emptyDash,
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
            ? formatMoney(row.original.debitCents, DEFAULT_CURRENCY)
            : emptyDash,
      },
      {
        id: 'credit',
        header: tColumns('credit'),
        align: 'right',
        cell: ({ row }) =>
          row.original.creditCents > 0
            ? formatMoney(row.original.creditCents, DEFAULT_CURRENCY)
            : emptyDash,
      },
    ],
    [tColumns, formatDate, emptyDash],
  );

  if (!canRead && state.status === 'error') {
    return (
      <Card className="p-6">
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {t('accessDenied')}
        </p>
      </Card>
    );
  }

  const lines = state.status === 'ready' ? state.lines : [];
  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';

  return (
    <div className="space-y-4">
      <AccountingBooksFilters
        values={filters}
        onChange={handleFiltersChange}
        showJournal
        showAccount
        accountRequired
      />

      {state.status === 'idle' ? (
        <Card className="p-6">
          <p className="text-sm text-atg-muted">{t('selectAccount')}</p>
        </Card>
      ) : null}

      {isError ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.message}
        </p>
      ) : null}

      {state.status === 'loading' || state.status === 'ready' ? (
        <>
          <Card variant="dashboard" padding="none" className="overflow-hidden">
            <DataTable
              columns={columns}
              data={lines}
              getRowId={(row) => row.id}
              isLoading={isLoading}
              emptyMessage={t('emptyDefault')}
              aria-label={t('ariaLabel')}
              loadingMessage={tDataTable('loading')}
            />
          </Card>
          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              totalPages={state.totalPages}
              totalItems={state.total}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              labels={paginationLabels}
              itemLabel={t('pagination.item')}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
