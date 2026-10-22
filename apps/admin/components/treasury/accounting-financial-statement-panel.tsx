'use client';

import { Card, DataTable, type ColumnDef } from '@africatourismgate/ui';
import type {
  AccountingBalanceRow,
  AccountingFinancialStatement,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { resolveUnknownApiError } from '../../lib/common-api-errors';
import { formatMoney } from '../../lib/format-money';
import { useOrganizationCurrency } from '../../lib/treasury/use-organization-currency';
import { useDefaultCurrency } from '../organization-currency-provider';
import {
  AccountingBooksFilters,
  EMPTY_ACCOUNTING_BOOKS_FILTERS,
  type AccountingBooksFilterValues,
} from './accounting-books-filters';

type Kind = 'balance_sheet' | 'income_statement';

type Props = {
  kind: Kind;
};

export function AccountingFinancialStatementPanel({ kind }: Props) {
  const t = useTranslations(
    kind === 'balance_sheet'
      ? 'modules.treasury.accounting.balanceSheet'
      : 'modules.treasury.accounting.incomeStatement',
  );
  const tColumns = useTranslations(
    'modules.treasury.accounting.balance.columns',
  );
  const tErrors = useTranslations('modules.treasury.errors');
  const tCommonErrors = useTranslations('common.errors');

  const [filters, setFilters] = useState<AccountingBooksFilterValues>(
    EMPTY_ACCOUNTING_BOOKS_FILTERS,
  );
  const defaultCurrency = useDefaultCurrency();
  const orgCurrency =
    useOrganizationCurrency(filters.organizationId || undefined) ?? defaultCurrency;
  const [canRead, setCanRead] = useState(true);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; statement: AccountingFinancialStatement }
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
            me.permissions.includes('accounting.reports.read') ||
            me.permissions.includes('accounting.journal.read') ||
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
      const query = {
        organizationId: filters.organizationId || undefined,
        exerciseId: filters.exerciseId || undefined,
        periodId: filters.periodId || undefined,
      };
      const statement =
        kind === 'balance_sheet'
          ? await getApiClient().getAccountingBalanceSheet(query)
          : await getApiClient().getAccountingIncomeStatement(query);
      setState({ status: 'ready', statement });
    } catch (error) {
      setState({
        status: 'error',
        message: resolveUnknownApiError(error, commonErrorMessages),
      });
    }
  }, [canRead, filters, kind, t, commonErrorMessages]);

  useEffect(() => {
    void load();
  }, [load]);

  const currency =
    (state.status === 'ready' ? state.statement.currency : null) ?? orgCurrency;

  const rowColumns = useMemo<ColumnDef<AccountingBalanceRow>[]>(
    () => [
      {
        id: 'classNumber',
        header: tColumns('class'),
        cell: ({ row }) => row.original.classNumber,
      },
      {
        id: 'account',
        header: tColumns('account'),
        cell: ({ row }) =>
          `${row.original.accountCode} — ${row.original.accountLabel}`,
      },
      {
        id: 'debit',
        header: tColumns('debit'),
        cell: ({ row }) => formatMoney(row.original.debitCents, currency),
      },
      {
        id: 'credit',
        header: tColumns('credit'),
        cell: ({ row }) => formatMoney(row.original.creditCents, currency),
      },
      {
        id: 'balance',
        header: tColumns('balance'),
        cell: ({ row }) => formatMoney(row.original.balanceCents, currency),
      },
    ],
    [currency, tColumns],
  );

  return (
    <div className="space-y-4">
      <AccountingBooksFilters
        values={filters}
        onChange={setFilters}
        showJournal={false}
        showAccount={false}
      />

      {state.status === 'loading' ? (
        <p className="text-sm text-atg-muted">{t('loading')}</p>
      ) : null}
      {state.status === 'error' ? (
        <p className="text-sm text-red-600" role="alert">
          {state.message}
        </p>
      ) : null}

      {state.status === 'ready' ? (
        <>
          <Card variant="dashboard" padding="sm">
            <p className="text-sm text-atg-muted">{t('netLabel')}</p>
            <p className="text-lg font-semibold text-atg-fg">
              {formatMoney(state.statement.netCents, currency)}
            </p>
          </Card>

          {state.statement.sections.map((section) => (
            <div key={section.label} className="space-y-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-sm font-semibold text-atg-fg">
                  {section.label}
                </h3>
                <p className="text-sm text-atg-muted">
                  {t('sectionTotal')}:{' '}
                  {formatMoney(section.totalCents, currency)}
                </p>
              </div>
              <Card
                variant="dashboard"
                padding="none"
                className="overflow-hidden"
              >
                <DataTable
                  columns={rowColumns}
                  data={section.rows}
                  getRowId={(row) => row.accountId}
                  emptyMessage={t('emptySection')}
                  aria-label={section.label}
                />
              </Card>
            </div>
          ))}
        </>
      ) : null}
    </div>
  );
}
