'use client';

import {
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
  DataTablePagination,
  FilterBar,
  Input,
  Select,
  type ColumnDef,
  type DataTableBadgeVariant,
} from '@africatourismgate/ui';
import type { FundExit, FundExitStatus } from '@africatourismgate/types';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { resolveUnknownApiError } from '../../lib/common-api-errors';
import { formatMoney } from '../../lib/format-money';
import {
  useFundExitStatusFilterOptions,
  useFundExitStatusLabels,
  useTreasuryPaymentMethodLabels,
} from '../../lib/i18n/use-module-labels';
import { useDataTablePaginationLabels } from '../../lib/i18n/use-pagination-labels';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

const STATUS_BADGE: Record<FundExitStatus, DataTableBadgeVariant> = {
  draft: 'muted',
  disbursed: 'default',
  recorded: 'success',
  voided: 'danger',
};

export function FundExitsList() {
  const t = useTranslations('modules.treasury.exits.list');
  const tColumns = useTranslations('modules.treasury.exits.list.columns');
  const tCommon = useTranslations('modules.common');
  const tDataTable = useTranslations('modules.common.dataTable');
  const tActions = useTranslations('common.actions');
  const tErrors = useTranslations('modules.treasury.errors');
  const tCommonErrors = useTranslations('common.errors');
  const locale = useLocale();
  const paginationLabels = useDataTablePaginationLabels();
  const statusLabels = useFundExitStatusLabels();
  const statusFilterOptions = useFundExitStatusFilterOptions();
  const paymentMethodLabels = useTreasuryPaymentMethodLabels();
  const emptyDash = tCommon('empty.dash');

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<'' | FundExitStatus>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [canRead, setCanRead] = useState(true);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        items: FundExit[];
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
        setCanRead(me.isSuperAdmin || me.permissions.includes('treasury.read'));
      })
      .catch(() => {
        if (!cancelled) setCanRead(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const query = searchInput.trim();
    const timer = window.setTimeout(() => {
      setSearch((prev) => {
        if (prev !== query) setPage(1);
        return query;
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const load = useCallback(async () => {
    if (!canRead) {
      setState({ status: 'error', message: t('accessDenied') });
      return;
    }
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listFundExits({
        page,
        limit: PAGE_SIZE,
        status: status || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        search: search || undefined,
      });
      setState({
        status: 'ready',
        items: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({
        status: 'error',
        message: resolveUnknownApiError(error, commonErrorMessages, {
          useParseApiMessage: true,
          forbidden: t('accessDenied'),
        }),
      });
    }
  }, [canRead, page, status, dateFrom, dateTo, search, t, commonErrorMessages]);

  useEffect(() => {
    void load();
  }, [load]);

  const activeFilterCount = [
    search !== '',
    status !== '',
    dateFrom !== '',
    dateTo !== '',
  ].filter(Boolean).length;
  const hasFilters = activeFilterCount > 0;

  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    setSearch('');
    setStatus('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  }, []);

  const formatDate = useCallback(
    (value: string) => {
      try {
        return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(
          new Date(`${value.slice(0, 10)}T12:00:00`),
        );
      } catch {
        return value;
      }
    },
    [locale],
  );

  const renderActions = useCallback(
    (item: FundExit) => (
      <DataTableActions className="opacity-90 transition-opacity group-hover:opacity-100">
        <DataTableActionButton
          action="view"
          label={tActions('view')}
          href={`/tresorerie/sorties/${item.id}/voir`}
        />
        {item.status !== 'voided' ? (
          <DataTableActionButton
            action="edit"
            label={tActions('edit')}
            href={`/tresorerie/sorties/${item.id}`}
          />
        ) : null}
      </DataTableActions>
    ),
    [tActions],
  );

  const columns = useMemo<ColumnDef<FundExit, unknown>[]>(
    () => [
      {
        accessorKey: 'operationDate',
        header: tColumns('date'),
        cell: ({ row }) => formatDate(row.original.operationDate),
      },
      {
        accessorKey: 'amountCents',
        header: tColumns('amount'),
        cell: ({ row }) => (
          <span className="whitespace-nowrap tabular-nums">
            {formatMoney(row.original.amountCents, row.original.currency)}
          </span>
        ),
      },
      {
        accessorKey: 'expenseRequestId',
        header: tColumns('expenseRequest'),
        meta: { hideOnMobile: true },
        cell: ({ row }) => (
          <code className="font-mono text-xs">
            {row.original.expenseRequestId.slice(0, 8)}…
          </code>
        ),
      },
      {
        accessorKey: 'paymentMethod',
        header: tColumns('paymentMethod'),
        meta: { hideOnMobile: true },
        cell: ({ row }) =>
          paymentMethodLabels[row.original.paymentMethod] ??
          row.original.paymentMethod,
      },
      {
        accessorKey: 'status',
        header: tColumns('status'),
        cell: ({ row }) => {
          const value = row.original.status;
          return (
            <DataTableBadge variant={STATUS_BADGE[value] ?? 'muted'}>
              {statusLabels[value] ?? value}
            </DataTableBadge>
          );
        },
      },
      {
        id: 'bookings',
        header: tColumns('bookings'),
        meta: { hideOnMobile: true },
        cell: ({ row }) =>
          row.original.bookingIds?.length
            ? String(row.original.bookingIds.length)
            : emptyDash,
      },
      {
        id: 'actions',
        header: tCommon('columns.actions'),
        enableSorting: false,
        meta: { isActions: true },
        cell: ({ row }) => renderActions(row.original),
      },
    ],
    [
      emptyDash,
      formatDate,
      paymentMethodLabels,
      renderActions,
      statusLabels,
      tColumns,
      tCommon,
    ],
  );

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const items = state.status === 'ready' ? state.items : [];
  const emptyMessage = hasFilters ? t('emptyFiltered') : t('emptyDefault');

  return (
    <div className="space-y-4">
      <FilterBar
        mobileVariant="drawer"
        activeCount={activeFilterCount}
        onClear={handleClearFilters}
        clearLabel={tCommon('filters.clearAll')}
        applyLabel={tCommon('filters.apply')}
        toggleLabel={tCommon('filters.toggle')}
        filters={
          <>
            <div className="min-w-[200px] flex-1 sm:max-w-md">
              <Input
                name="search"
                type="search"
                placeholder={t('searchPlaceholder')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label={t('searchAria')}
              />
            </div>
            <div className="w-full sm:w-44">
              <Select
                label={tColumns('status')}
                value={status}
                options={statusFilterOptions}
                onChange={(e) => {
                  setStatus(e.target.value as '' | FundExitStatus);
                  setPage(1);
                }}
              />
            </div>
            <div className="w-full sm:w-40">
              <Input
                label={tCommon('filters.dateFrom')}
                name="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="w-full sm:w-40">
              <Input
                label={tCommon('filters.dateTo')}
                name="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </>
        }
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
              data={items}
              isLoading={isLoading}
              loadingMessage={tDataTable('loading')}
              emptyMessage={emptyMessage}
              emptyVariant={hasFilters ? 'search' : 'default'}
              expandRowLabel={tDataTable('expandRow')}
              collapseRowLabel={tDataTable('collapseRow')}
              expandRowAriaLabel={tDataTable('expandRowAria')}
              getRowId={(row) => row.id}
              aria-label={t('ariaLabel')}
            />
          </Card>

          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel={tCommon('pagination.fundExit')}
              labels={paginationLabels}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
