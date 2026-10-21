'use client';

import {
  Card,
  DataTable,
  type ColumnDef,
} from '@africatourismgate/ui';
import type {
  AccountingBalanceRow,
  AccountingBalanceSummary,
} from '@africatourismgate/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { resolveUnknownApiError } from '../../lib/common-api-errors';
import { formatMoney } from '../../lib/format-money';
import {
  AccountingBooksFilters,
  EMPTY_ACCOUNTING_BOOKS_FILTERS,
  type AccountingBooksFilterValues,
} from './accounting-books-filters';

const DEFAULT_CURRENCY = 'XOF';

export function AccountingBalancePanel() {
  const t = useTranslations('modules.treasury.accounting.balance');
  const tColumns = useTranslations(
    'modules.treasury.accounting.balance.columns',
  );
  const tCommon = useTranslations('modules.common');
  const tDataTable = useTranslations('modules.common.dataTable');
  const tErrors = useTranslations('modules.treasury.errors');
  const tCommonErrors = useTranslations('common.errors');
  const emptyDash = tCommon('empty.dash');

  const [filters, setFilters] = useState<AccountingBooksFilterValues>(
    EMPTY_ACCOUNTING_BOOKS_FILTERS,
  );
  const [canRead, setCanRead] = useState(true);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; summary: AccountingBalanceSummary }
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
      const summary = await getApiClient().getAccountingBalance({
        organizationId: filters.organizationId || undefined,
        exerciseId: filters.exerciseId || undefined,
        periodId: filters.periodId || undefined,
        journalId: filters.journalId || undefined,
      });
      setState({ status: 'ready', summary });
    } catch (error) {
      setState({
        status: 'error',
        message: resolveUnknownApiError(error, commonErrorMessages),
      });
    }
  }, [canRead, filters, t, commonErrorMessages]);

  useEffect(() => {
    void load();
  }, [load]);

  const columns = useMemo<ColumnDef<AccountingBalanceRow>[]>(
    () => [
      {
        id: 'classNumber',
        header: tColumns('class'),
        cell: ({ row }) => row.original.classNumber,
      },
      {
        id: 'account',
        header: tColumns('account'),
        cell: ({ row }) => (
          <Link
            href={`/tresorerie/comptabilite/grand-livre?accountId=${row.original.accountId}`}
            className="font-medium text-primary hover:underline"
          >
            {row.original.accountCode} — {row.original.accountLabel}
          </Link>
        ),
      },
      {
        id: 'debit',
        header: tColumns('debit'),
        align: 'right',
        cell: ({ row }) =>
          formatMoney(row.original.debitCents, DEFAULT_CURRENCY),
      },
      {
        id: 'credit',
        header: tColumns('credit'),
        align: 'right',
        cell: ({ row }) =>
          formatMoney(row.original.creditCents, DEFAULT_CURRENCY),
      },
      {
        id: 'balance',
        header: tColumns('balance'),
        align: 'right',
        cell: ({ row }) =>
          formatMoney(row.original.balanceCents, DEFAULT_CURRENCY),
      },
    ],
    [tColumns],
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

  const rows = state.status === 'ready' ? state.summary.rows : [];
  const totals = state.status === 'ready' ? state.summary.totals : null;
  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const hasFilters = Boolean(
    filters.organizationId ||
      filters.exerciseId ||
      filters.periodId ||
      filters.journalId,
  );

  return (
    <div className="space-y-4">
      <AccountingBooksFilters
        values={filters}
        onChange={setFilters}
        showJournal
        showAccount={false}
      />

      {totals ? (
        <dl className="grid gap-4 sm:grid-cols-3">
          <Card variant="dashboard" padding="sm">
            <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted">
              {t('totals.debit')}
            </dt>
            <dd className="mt-1 text-lg font-semibold text-atg-fg">
              {formatMoney(totals.debitCents, DEFAULT_CURRENCY)}
            </dd>
          </Card>
          <Card variant="dashboard" padding="sm">
            <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted">
              {t('totals.credit')}
            </dt>
            <dd className="mt-1 text-lg font-semibold text-atg-fg">
              {formatMoney(totals.creditCents, DEFAULT_CURRENCY)}
            </dd>
          </Card>
          <Card variant="dashboard" padding="sm">
            <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted">
              {t('totals.balance')}
            </dt>
            <dd className="mt-1 text-lg font-semibold text-atg-fg">
              {formatMoney(totals.balanceCents, DEFAULT_CURRENCY)}
            </dd>
          </Card>
        </dl>
      ) : null}

      {isError ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.message}
        </p>
      ) : (
        <Card variant="dashboard" padding="none" className="overflow-hidden">
          <DataTable
            columns={columns}
            data={rows}
            getRowId={(row) => row.accountId}
            isLoading={isLoading}
            emptyMessage={
              hasFilters ? t('emptyFiltered') : t('emptyDefault')
            }
            aria-label={t('ariaLabel')}
            loadingMessage={tDataTable('loading')}
          />
        </Card>
      )}

      {totals && Math.abs(totals.debitCents - totals.creditCents) > 0 ? (
        <p className="text-sm text-amber-700 dark:text-amber-300" role="status">
          {t('unbalancedHint', {
            delta: formatMoney(
              Math.abs(totals.debitCents - totals.creditCents),
              DEFAULT_CURRENCY,
            ),
          })}
        </p>
      ) : null}

      {!isLoading && !isError && rows.length === 0 ? (
        <p className="sr-only">{emptyDash}</p>
      ) : null}
    </div>
  );
}
