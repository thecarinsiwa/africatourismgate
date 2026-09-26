'use client';

import {
  Card,
  DataTable,
  DataTableBadge,
  DataTablePagination,
  type ColumnDef,
  type DataTableBadgeVariant,
} from '@africatourismgate/ui';
import type { JournalEntry, JournalEntryStatus } from '@africatourismgate/types';
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

const PAGE_SIZE = 20;

const STATUS_BADGE: Record<JournalEntryStatus, DataTableBadgeVariant> = {
  draft: 'muted',
  posted: 'success',
  reversed: 'warning',
};

export function JournalEntriesList() {
  const t = useTranslations('modules.treasury.accounting.journal');
  const tColumns = useTranslations('modules.treasury.accounting.journal.columns');
  const tStatuses = useTranslations('modules.treasury.accounting.entryStatuses');
  const tCommon = useTranslations('modules.common');
  const tDataTable = useTranslations('modules.common.dataTable');
  const tErrors = useTranslations('modules.treasury.errors');
  const tCommonErrors = useTranslations('common.errors');
  const formatDate = useFormatDateTime('short');
  const paginationLabels = useDataTablePaginationLabels();
  const emptyDash = tCommon('empty.dash');

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<AccountingBooksFilterValues>(
    EMPTY_ACCOUNTING_BOOKS_FILTERS,
  );
  const [canRead, setCanRead] = useState(true);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        entries: JournalEntry[];
        total: number;
        totalPages: number;
      }
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

  const load = useCallback(async () => {
    if (!canRead) {
      setState({ status: 'error', message: t('accessDenied') });
      return;
    }
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listJournalEntries({
        page,
        limit: PAGE_SIZE,
        organizationId: filters.organizationId || undefined,
        exerciseId: filters.exerciseId || undefined,
        periodId: filters.periodId || undefined,
        journalId: filters.journalId || undefined,
        accountId: filters.accountId || undefined,
        includeLines: false,
      });
      setState({
        status: 'ready',
        entries: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
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

  const columns = useMemo<ColumnDef<JournalEntry>[]>(
    () => [
      {
        id: 'entryNumber',
        header: tColumns('entryNumber'),
        cell: ({ row }) => (
          <Link
            href={`/tresorerie/comptabilite/journal/${row.original.id}`}
            className="font-medium text-primary hover:underline"
          >
            {row.original.entryNumber}
          </Link>
        ),
      },
      {
        id: 'entryDate',
        header: tColumns('entryDate'),
        cell: ({ row }) => formatDate(row.original.entryDate) || emptyDash,
      },
      {
        id: 'description',
        header: tColumns('description'),
        cell: ({ row }) => row.original.description || emptyDash,
      },
      {
        id: 'status',
        header: tColumns('status'),
        cell: ({ row }) => (
          <DataTableBadge variant={STATUS_BADGE[row.original.status]}>
            {tStatuses(row.original.status)}
          </DataTableBadge>
        ),
      },
      {
        id: 'debit',
        header: tColumns('debit'),
        align: 'right',
        cell: ({ row }) =>
          row.original.totalDebitCents != null
            ? formatMoney(row.original.totalDebitCents, row.original.currency)
            : emptyDash,
      },
      {
        id: 'credit',
        header: tColumns('credit'),
        align: 'right',
        cell: ({ row }) =>
          row.original.totalCreditCents != null
            ? formatMoney(row.original.totalCreditCents, row.original.currency)
            : emptyDash,
      },
    ],
    [tColumns, tStatuses, formatDate, emptyDash],
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

  const entries = state.status === 'ready' ? state.entries : [];
  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const hasFilters = Boolean(
    filters.organizationId ||
      filters.exerciseId ||
      filters.periodId ||
      filters.journalId ||
      filters.accountId,
  );

  return (
    <div className="space-y-4">
      <AccountingBooksFilters
        values={filters}
        onChange={handleFiltersChange}
        showJournal
        showAccount
      />

      {isError ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.message}
        </p>
      ) : (
        <>
          <Card variant="dashboard" padding="none" className="overflow-hidden">
            <DataTable
              columns={columns}
              data={entries}
              getRowId={(row) => row.id}
              isLoading={isLoading}
              emptyMessage={
                hasFilters ? t('emptyFiltered') : t('emptyDefault')
              }
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
      )}
    </div>
  );
}
