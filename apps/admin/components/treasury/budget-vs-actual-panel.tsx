'use client';

import {
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
  FilterBar,
  Input,
  Select,
  type ColumnDef,
  type DataTableBadgeVariant,
} from '@africatourismgate/ui';
import type {
  BudgetPeriodType,
  BudgetScopeType,
  BudgetVsActualRow,
  BudgetVsActualSummary,
} from '@africatourismgate/types';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { resolveUnknownApiError } from '../../lib/common-api-errors';
import { formatMoney } from '../../lib/format-money';
import {
  useBudgetPeriodFilterOptions,
  useBudgetPeriodLabels,
  useBudgetScopeLabels,
} from '../../lib/i18n/use-module-labels';

const CURRENCY_FILTER_OPTIONS = ['', 'XOF', 'XAF', 'EUR', 'USD', 'MAD', 'GHS', 'NGN'] as const;

export function BudgetVsActualPanel() {
  const t = useTranslations('modules.treasury.budgets.vsActual');
  const tColumns = useTranslations('modules.treasury.budgets.vsActual.columns');
  const tCommon = useTranslations('modules.common');
  const tDataTable = useTranslations('modules.common.dataTable');
  const tActions = useTranslations('common.actions');
  const tErrors = useTranslations('modules.treasury.errors');
  const tCommonErrors = useTranslations('common.errors');
  const locale = useLocale();
  const periodLabels = useBudgetPeriodLabels();
  const periodFilterOptions = useBudgetPeriodFilterOptions();
  const scopeLabels = useBudgetScopeLabels();

  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(String(currentYear));
  const [month, setMonth] = useState('');
  const [currency, setCurrency] = useState('');
  const [periodType, setPeriodType] = useState<'' | BudgetPeriodType>('');
  const [applied, setApplied] = useState({
    year: currentYear,
    month: undefined as number | undefined,
    currency: undefined as string | undefined,
    periodType: undefined as BudgetPeriodType | undefined,
  });
  const [canRead, setCanRead] = useState(true);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; summary: BudgetVsActualSummary }
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

  const load = useCallback(async () => {
    if (!canRead) {
      setState({ status: 'error', message: t('accessDenied') });
      return;
    }
    setState({ status: 'loading' });
    try {
      const summary = await getApiClient().getBudgetsVsActual({
        year: applied.year,
        month: applied.month,
        currency: applied.currency,
        periodType: applied.periodType,
      });
      setState({ status: 'ready', summary });
    } catch (error) {
      setState({
        status: 'error',
        message: resolveUnknownApiError(error, commonErrorMessages, {
          useParseApiMessage: true,
          forbidden: t('accessDenied'),
        }),
      });
    }
  }, [applied, canRead, commonErrorMessages, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const monthOptions = useMemo(() => {
    const opts = [{ value: '', label: t('filterMonthAll') }];
    for (let m = 1; m <= 12; m += 1) {
      let label = String(m);
      try {
        label = new Intl.DateTimeFormat(locale, { month: 'long' }).format(
          new Date(2000, m - 1, 1),
        );
      } catch {
        /* keep numeric */
      }
      opts.push({ value: String(m), label });
    }
    return opts;
  }, [locale, t]);

  const currencyOptions = useMemo(
    () =>
      CURRENCY_FILTER_OPTIONS.map((code) => ({
        value: code,
        label: code === '' ? t('filterCurrencyAll') : code,
      })),
    [t],
  );

  const handleApply = useCallback(() => {
    const yearNum = Number.parseInt(year.trim(), 10);
    if (!Number.isFinite(yearNum)) return;
    const monthNum = month ? Number.parseInt(month, 10) : undefined;
    setApplied({
      year: yearNum,
      month: Number.isFinite(monthNum) ? monthNum : undefined,
      currency: currency || undefined,
      periodType: periodType || undefined,
    });
  }, [year, month, currency, periodType]);

  const handleClear = useCallback(() => {
    const y = new Date().getFullYear();
    setYear(String(y));
    setMonth('');
    setCurrency('');
    setPeriodType('');
    setApplied({
      year: y,
      month: undefined,
      currency: undefined,
      periodType: undefined,
    });
  }, []);

  const formatPeriod = useCallback(
    (row: BudgetVsActualRow) => {
      const period = periodLabels[row.periodType] ?? row.periodType;
      if (row.periodType === 'monthly' && row.month != null) {
        try {
          const monthLabel = new Intl.DateTimeFormat(locale, {
            month: 'long',
          }).format(new Date(2000, row.month - 1, 1));
          return `${period} — ${monthLabel} ${row.year}`;
        } catch {
          return `${period} — ${row.month}/${row.year}`;
        }
      }
      return `${period} — ${row.year}`;
    },
    [locale, periodLabels],
  );

  const formatVariance = useCallback(
    (cents: number, currencyCode: string) => {
      const formatted = formatMoney(Math.abs(cents), currencyCode);
      if (cents < 0) return `−${formatted}`;
      if (cents > 0) return `+${formatted}`;
      return formatted;
    },
    [],
  );

  const columns = useMemo<ColumnDef<BudgetVsActualRow, unknown>[]>(
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
        meta: { hideOnMobile: true },
        cell: ({ row }) => {
          const value = row.original.scopeType as BudgetScopeType;
          return scopeLabels[value] ?? value;
        },
      },
      {
        accessorKey: 'plannedCents',
        header: tColumns('planned'),
        cell: ({ row }) => (
          <span className="whitespace-nowrap tabular-nums">
            {formatMoney(row.original.plannedCents, row.original.currency)}
          </span>
        ),
      },
      {
        accessorKey: 'actualCents',
        header: tColumns('actual'),
        cell: ({ row }) => (
          <span className="whitespace-nowrap tabular-nums">
            {formatMoney(row.original.actualCents, row.original.currency)}
          </span>
        ),
      },
      {
        accessorKey: 'varianceCents',
        header: tColumns('variance'),
        cell: ({ row }) => {
          const v = row.original.varianceCents;
          const color =
            v < 0
              ? 'text-red-600 dark:text-red-400'
              : v > 0
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-atg-fg';
          return (
            <span className={`whitespace-nowrap tabular-nums ${color}`}>
              {formatVariance(v, row.original.currency)}
            </span>
          );
        },
      },
      {
        id: 'status',
        header: tColumns('status'),
        cell: ({ row }) => {
          const over = row.original.overBudget;
          const variant: DataTableBadgeVariant = over ? 'danger' : 'success';
          return (
            <DataTableBadge variant={variant}>
              {over ? t('statusOver') : t('statusOk')}
            </DataTableBadge>
          );
        },
      },
      {
        id: 'actions',
        header: tCommon('columns.actions'),
        enableSorting: false,
        meta: { isActions: true },
        cell: ({ row }) => (
          <DataTableActions>
            <DataTableActionButton
              action="view"
              label={tActions('view')}
              href={`/tresorerie/budgets/${row.original.budgetId}/voir`}
            />
          </DataTableActions>
        ),
      },
    ],
    [
      formatPeriod,
      formatVariance,
      scopeLabels,
      t,
      tActions,
      tColumns,
      tCommon,
    ],
  );

  const activeFilterCount = [
    month !== '',
    currency !== '',
    periodType !== '',
    year !== String(currentYear),
  ].filter(Boolean).length;

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const summary = state.status === 'ready' ? state.summary : null;
  const rows = summary?.rows ?? [];
  const totals = summary?.totals;

  // Devise d'affichage des totaux : filtre ou première ligne
  const totalsCurrency =
    applied.currency || rows[0]?.currency || 'XOF';

  return (
    <div className="space-y-4">
      <p className="text-sm text-atg-muted">{t('hint')}</p>

      <FilterBar
        mobileVariant="drawer"
        activeCount={activeFilterCount}
        onClear={handleClear}
        clearLabel={tCommon('filters.clearAll')}
        applyLabel={t('apply')}
        toggleLabel={tCommon('filters.toggle')}
        onApply={handleApply}
        filters={
          <>
            <div className="w-full sm:w-28">
              <Input
                label={t('filterYear')}
                name="year"
                type="number"
                inputMode="numeric"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
              />
            </div>
            <div className="w-full sm:w-44">
              <Select
                label={t('filterMonth')}
                value={month}
                options={monthOptions}
                onChange={(e) => setMonth(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-40">
              <Select
                label={t('filterCurrency')}
                value={currency}
                options={currencyOptions}
                onChange={(e) => setCurrency(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-44">
              <Select
                label={t('filterPeriodType')}
                value={periodType}
                options={periodFilterOptions}
                onChange={(e) =>
                  setPeriodType(e.target.value as '' | BudgetPeriodType)
                }
              />
            </div>
          </>
        }
      />

      {isError ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.message}
        </p>
      ) : null}

      {totals && !isError ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card variant="dashboard" className="p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-atg-muted">
              {t('planned')}
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-atg-fg">
              {formatMoney(totals.plannedCents, totalsCurrency)}
            </p>
          </Card>
          <Card variant="dashboard" className="p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-atg-muted">
              {t('actual')}
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-atg-fg">
              {formatMoney(totals.actualCents, totalsCurrency)}
            </p>
          </Card>
          <Card variant="dashboard" className="p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-atg-muted">
              {t('variance')}
            </p>
            <p
              className={`mt-1 text-lg font-semibold tabular-nums ${
                totals.varianceCents < 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-atg-fg'
              }`}
            >
              {formatVariance(totals.varianceCents, totalsCurrency)}
            </p>
          </Card>
          <Card variant="dashboard" className="p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-atg-muted">
              {t('overBudget')}
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-atg-fg">
              {totals.overBudgetCount}
            </p>
          </Card>
        </div>
      ) : null}

      {totals && totals.overBudgetCount > 0 && !isError ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
        >
          {t('alertOverBudget', { count: totals.overBudgetCount })}
        </div>
      ) : null}

      {!isError ? (
        <Card variant="dashboard" padding="none" className="overflow-hidden">
          <DataTable
            columns={columns}
            data={rows}
            isLoading={isLoading}
            loadingMessage={tDataTable('loading')}
            emptyMessage={t('empty')}
            emptyVariant="default"
            expandRowLabel={tDataTable('expandRow')}
            collapseRowLabel={tDataTable('collapseRow')}
            expandRowAriaLabel={tDataTable('expandRowAria')}
            getRowId={(row) => row.budgetId}
            aria-label={t('title')}
          />
        </Card>
      ) : null}
    </div>
  );
}
