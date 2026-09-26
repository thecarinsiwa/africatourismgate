'use client';

import {
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
  DataTablePagination,
  FilterBar,
  Input,
  Select,
  useToast,
  type ColumnDef,
} from '@africatourismgate/ui';
import type {
  FundEntry,
  FundEntrySource,
  FundEntryStatus,
} from '@africatourismgate/types';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { resolveUnknownApiError } from '../../lib/common-api-errors';
import { formatMoney } from '../../lib/format-money';
import {
  useFundEntrySourceFilterOptions,
  useFundEntrySourceLabels,
  useFundEntryStatusLabels,
  useTreasuryPaymentMethodLabels,
} from '../../lib/i18n/use-module-labels';
import { useDataTablePaginationLabels } from '../../lib/i18n/use-pagination-labels';
import { downloadTreasuryOperationsCsv } from '../../lib/treasury-reports-export';
import { PermissionGate } from '../permission-gate';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

const CURRENCY_OPTIONS = ['XOF', 'XAF', 'EUR', 'USD', 'MAD', 'GHS', 'NGN'] as const;

function formatBookingCount(count: number): string {
  return String(count);
}

export function FundEntriesList() {
  const t = useTranslations('modules.treasury.entries.list');
  const tColumns = useTranslations('modules.treasury.entries.list.columns');
  const tCommon = useTranslations('modules.common');
  const tExport = useTranslations('modules.treasury.reports');
  const tExportCommon = useTranslations('modules.common.exportCsv');
  const tDataTable = useTranslations('modules.common.dataTable');
  const tActions = useTranslations('common.actions');
  const tErrors = useTranslations('modules.treasury.errors');
  const tCommonErrors = useTranslations('common.errors');
  const locale = useLocale();
  const paginationLabels = useDataTablePaginationLabels();
  const sourceLabels = useFundEntrySourceLabels();
  const paymentMethodLabels = useTreasuryPaymentMethodLabels();
  const statusLabels = useFundEntryStatusLabels();
  const sourceFilterOptions = useFundEntrySourceFilterOptions();
  const emptyDash = tCommon('empty.dash');
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currency, setCurrency] = useState('');
  const [source, setSource] = useState<'' | FundEntrySource>('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [canRead, setCanRead] = useState(true);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        entries: FundEntry[];
        total: number;
        totalPages: number;
      }
  >({ status: 'loading' });

  const commonErrorMessages = useMemo(
    () => ({
      network: tCommonErrors('network'),
      forbidden: tErrors('forbidden'),
      generic: tErrors('loadFailed'),
      apiStatus: (status: number) => tCommonErrors('apiStatus', { status }),
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
          me.isSuperAdmin || me.permissions.includes('treasury.read'),
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
    const query = searchInput.trim();
    const timer = window.setTimeout(() => {
      setSearch((prev) => {
        if (prev !== query) {
          setPage(1);
        }
        return query;
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const currencyOptions = useMemo(
    () => [
      { value: '', label: tCommon('filters.allFeminine') },
      ...CURRENCY_OPTIONS.map((code) => ({ value: code, label: code })),
    ],
    [tCommon],
  );

  const load = useCallback(async () => {
    if (!canRead) {
      setState({ status: 'error', message: t('accessDenied') });
      return;
    }
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listFundEntries({
        page,
        limit: PAGE_SIZE,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        currency: currency || undefined,
        source: source || undefined,
        search: search || undefined,
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
        message: resolveUnknownApiError(error, commonErrorMessages, {
          useParseApiMessage: true,
          forbidden: t('accessDenied'),
        }),
      });
    }
  }, [
    canRead,
    page,
    dateFrom,
    dateTo,
    currency,
    source,
    search,
    t,
    commonErrorMessages,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  const activeFilterCount = [
    search !== '',
    dateFrom !== '',
    dateTo !== '',
    currency !== '',
    source !== '',
  ].filter(Boolean).length;
  const hasFilters = activeFilterCount > 0;

  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setCurrency('');
    setSource('');
    setPage(1);
  }, []);

  const handleExportCsv = useCallback(async () => {
    setExporting(true);
    try {
      await downloadTreasuryOperationsCsv({
        type: 'entries',
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        currency: currency || undefined,
        source: source || undefined,
        search: search || undefined,
        realizedOnly: false,
      });
      toast({
        title: tExportCommon('success'),
        message: tExportCommon('success'),
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: tErrors('loadFailed'),
        message: resolveUnknownApiError(error, commonErrorMessages, {
          useParseApiMessage: true,
          forbidden: tExport('accessDenied'),
        }),
        variant: 'error',
      });
    } finally {
      setExporting(false);
    }
  }, [
    dateFrom,
    dateTo,
    currency,
    source,
    search,
    toast,
    tExportCommon,
    tErrors,
    tExport,
    commonErrorMessages,
  ]);

  const formatDate = useCallback(
    (value: string) => {
      try {
        return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(
          new Date(`${value}T12:00:00`),
        );
      } catch {
        return value;
      }
    },
    [locale],
  );

  const renderActions = useCallback(
    (entry: FundEntry) => (
      <DataTableActions className="opacity-90 transition-opacity group-hover:opacity-100">
        <DataTableActionButton
          action="view"
          label={tActions('view')}
          href={`/tresorerie/entrees/${entry.id}/voir`}
        />
        {entry.status !== 'voided' ? (
          <DataTableActionButton
            action="edit"
            label={tActions('edit')}
            href={`/tresorerie/entrees/${entry.id}`}
          />
        ) : null}
      </DataTableActions>
    ),
    [tActions],
  );

  const columns = useMemo<ColumnDef<FundEntry, unknown>[]>(
    () => [
      {
        accessorKey: 'operationDate',
        header: tColumns('date'),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm tabular-nums">
            {formatDate(row.original.operationDate)}
          </span>
        ),
      },
      {
        accessorKey: 'amountCents',
        header: tColumns('amount'),
        cell: ({ row }) => (
          <span className="whitespace-nowrap font-medium tabular-nums">
            {formatMoney(row.original.amountCents, row.original.currency)}
          </span>
        ),
      },
      {
        accessorKey: 'currency',
        header: tColumns('currency'),
        meta: { hideOnMobile: true },
        cell: ({ row }) => (
          <span className="font-mono text-xs uppercase">
            {row.original.currency}
          </span>
        ),
      },
      {
        accessorKey: 'source',
        header: tColumns('source'),
        cell: ({ row }) => sourceLabels[row.original.source] ?? row.original.source,
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
        accessorKey: 'reference',
        header: tColumns('reference'),
        meta: { hideOnMobile: true },
        cell: ({ row }) => row.original.reference?.trim() || emptyDash,
      },
      {
        accessorKey: 'status',
        header: tColumns('status'),
        cell: ({ row }) => {
          const status = row.original.status as FundEntryStatus;
          return (
            <DataTableBadge
              variant={status === 'voided' ? 'danger' : 'success'}
            >
              {statusLabels[status] ?? status}
            </DataTableBadge>
          );
        },
      },
      {
        id: 'bookings',
        header: tColumns('bookings'),
        meta: { hideOnMobile: true },
        cell: ({ row }) =>
          formatBookingCount(row.original.bookingIds?.length ?? 0),
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
      sourceLabels,
      statusLabels,
      tColumns,
      tCommon,
    ],
  );

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const entries = state.status === 'ready' ? state.entries : [];
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
        actions={
          <PermissionGate permission="treasury.reports.read">
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={exporting}
              disabled={!canRead || exporting}
              onClick={() => void handleExportCsv()}
            >
              {tExport('exportCsv')}
            </Button>
          </PermissionGate>
        }
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
            <div className="w-full sm:w-36">
              <Select
                label={tColumns('currency')}
                value={currency}
                options={currencyOptions}
                onChange={(e) => {
                  setCurrency(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="w-full sm:w-52">
              <Select
                label={tColumns('source')}
                value={source}
                options={sourceFilterOptions}
                onChange={(e) => {
                  setSource(e.target.value as '' | FundEntrySource);
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
              data={entries}
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
              itemLabel={tCommon('pagination.fundEntry')}
              labels={paginationLabels}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
