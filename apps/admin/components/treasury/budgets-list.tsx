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
import type {
  Budget,
  BudgetPeriodType,
  BudgetScopeType,
} from '@africatourismgate/types';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { resolveUnknownApiError } from '../../lib/common-api-errors';
import { formatMoney } from '../../lib/format-money';
import {
  useBudgetPeriodFilterOptions,
  useBudgetPeriodLabels,
  useBudgetScopeFilterOptions,
  useBudgetScopeLabels,
} from '../../lib/i18n/use-module-labels';
import { useDataTablePaginationLabels } from '../../lib/i18n/use-pagination-labels';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

const SCOPE_BADGE: Record<BudgetScopeType, DataTableBadgeVariant> = {
  general: 'muted',
  activity: 'default',
  product: 'success',
};

export function BudgetsList() {
  const t = useTranslations('modules.treasury.budgets.list');
  const tColumns = useTranslations('modules.treasury.budgets.list.columns');
  const tCommon = useTranslations('modules.common');
  const tDataTable = useTranslations('modules.common.dataTable');
  const tActions = useTranslations('common.actions');
  const tErrors = useTranslations('modules.treasury.errors');
  const tCommonErrors = useTranslations('common.errors');
  const locale = useLocale();
  const paginationLabels = useDataTablePaginationLabels();
  const periodLabels = useBudgetPeriodLabels();
  const periodFilterOptions = useBudgetPeriodFilterOptions();
  const scopeLabels = useBudgetScopeLabels();
  const scopeFilterOptions = useBudgetScopeFilterOptions();

  const [page, setPage] = useState(1);
  const [periodType, setPeriodType] = useState<'' | BudgetPeriodType>('');
  const [scopeType, setScopeType] = useState<'' | BudgetScopeType>('');
  const [year, setYear] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [canRead, setCanRead] = useState(true);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        items: Budget[];
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
      const yearNum = year.trim() ? Number.parseInt(year.trim(), 10) : undefined;
      const result = await getApiClient().listBudgets({
        page,
        limit: PAGE_SIZE,
        periodType: periodType || undefined,
        scopeType: scopeType || undefined,
        year: Number.isFinite(yearNum) ? yearNum : undefined,
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
  }, [
    canRead,
    page,
    periodType,
    scopeType,
    year,
    search,
    t,
    commonErrorMessages,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  const activeFilterCount = [
    search !== '',
    periodType !== '',
    scopeType !== '',
    year.trim() !== '',
  ].filter(Boolean).length;
  const hasFilters = activeFilterCount > 0;

  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    setSearch('');
    setPeriodType('');
    setScopeType('');
    setYear('');
    setPage(1);
  }, []);

  const formatPeriod = useCallback(
    (item: Budget) => {
      const period = periodLabels[item.periodType] ?? item.periodType;
      if (item.periodType === 'monthly' && item.month != null) {
        try {
          const monthLabel = new Intl.DateTimeFormat(locale, {
            month: 'long',
          }).format(new Date(2000, item.month - 1, 1));
          return `${period} — ${monthLabel} ${item.year}`;
        } catch {
          return `${period} — ${item.month}/${item.year}`;
        }
      }
      return `${period} — ${item.year}`;
    },
    [locale, periodLabels],
  );

  const renderActions = useCallback(
    (item: Budget) => (
      <DataTableActions className="opacity-90 transition-opacity group-hover:opacity-100">
        <DataTableActionButton
          action="view"
          label={tActions('view')}
          href={`/tresorerie/budgets/${item.id}/voir`}
        />
        <DataTableActionButton
          action="edit"
          label={tActions('edit')}
          href={`/tresorerie/budgets/${item.id}`}
        />
      </DataTableActions>
    ),
    [tActions],
  );

  const columns = useMemo<ColumnDef<Budget, unknown>[]>(
    () => [
      {
        accessorKey: 'label',
        header: tColumns('label'),
        cell: ({ row }) => (
          <span className="font-medium text-atg-fg">{row.original.label}</span>
        ),
      },
      {
        id: 'period',
        header: tColumns('period'),
        cell: ({ row }) => formatPeriod(row.original),
      },
      {
        accessorKey: 'scopeType',
        header: tColumns('scope'),
        cell: ({ row }) => {
          const value = row.original.scopeType;
          return (
            <DataTableBadge variant={SCOPE_BADGE[value] ?? 'muted'}>
              {scopeLabels[value] ?? value}
            </DataTableBadge>
          );
        },
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
        accessorKey: 'year',
        header: tColumns('year'),
        meta: { hideOnMobile: true },
        cell: ({ row }) => row.original.year,
      },
      {
        id: 'actions',
        header: tCommon('columns.actions'),
        enableSorting: false,
        meta: { isActions: true },
        cell: ({ row }) => renderActions(row.original),
      },
    ],
    [formatPeriod, renderActions, scopeLabels, tColumns, tCommon],
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
                label={tColumns('period')}
                value={periodType}
                options={periodFilterOptions}
                onChange={(e) => {
                  setPeriodType(e.target.value as '' | BudgetPeriodType);
                  setPage(1);
                }}
              />
            </div>
            <div className="w-full sm:w-44">
              <Select
                label={tColumns('scope')}
                value={scopeType}
                options={scopeFilterOptions}
                onChange={(e) => {
                  setScopeType(e.target.value as '' | BudgetScopeType);
                  setPage(1);
                }}
              />
            </div>
            <div className="w-full sm:w-28">
              <Input
                label={tColumns('year')}
                name="year"
                type="number"
                inputMode="numeric"
                value={year}
                onChange={(e) => {
                  setYear(e.target.value);
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
              itemLabel={tCommon('pagination.budget')}
              labels={paginationLabels}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
