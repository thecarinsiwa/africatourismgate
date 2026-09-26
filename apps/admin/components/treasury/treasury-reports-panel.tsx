'use client';

import {
  Button,
  Card,
  DataTable,
  FilterBar,
  Select,
  Skeleton,
  useToast,
  type ColumnDef,
} from '@africatourismgate/ui';
import type {
  TreasuryReportDimensionBucket,
  TreasuryReportsByDimension,
  TreasuryReportsSummary,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getApiClient } from '../../lib/auth/api';
import { resolveUnknownApiError } from '../../lib/common-api-errors';
import { formatMoney } from '../../lib/format-money';
import {
  useFundEntrySourceLabels,
  useTreasuryPaymentMethodLabels,
} from '../../lib/i18n/use-module-labels';
import { downloadTreasuryOperationsCsv } from '../../lib/treasury-reports-export';
import { useChartTheme } from '../../lib/use-chart-theme';

const CURRENCY_FILTER_OPTIONS = [
  '',
  'XOF',
  'XAF',
  'EUR',
  'USD',
  'MAD',
  'GHS',
  'NGN',
] as const;

function defaultDateFrom(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}-01`;
}

function defaultDateTo(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function moneyOrDash(
  cents: number | null | undefined,
  currency: string | null | undefined,
  dash: string,
): string {
  if (cents == null || !currency) return dash;
  return formatMoney(cents, currency);
}

type PanelData = {
  summary: TreasuryReportsSummary;
  bySource: TreasuryReportsByDimension;
  byPaymentMethod: TreasuryReportsByDimension;
};

export function TreasuryReportsPanel() {
  const t = useTranslations('modules.treasury.reports');
  const tColumns = useTranslations('modules.treasury.reports.columns');
  const tCommon = useTranslations('modules.common');
  const tExportCommon = useTranslations('modules.common.exportCsv');
  const tDataTable = useTranslations('modules.common.dataTable');
  const tErrors = useTranslations('modules.treasury.errors');
  const tCommonErrors = useTranslations('common.errors');
  const sourceLabels = useFundEntrySourceLabels();
  const paymentLabels = useTreasuryPaymentMethodLabels();
  const chartTheme = useChartTheme();
  const emptyDash = tCommon('empty.dash');
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  const [dateFrom, setDateFrom] = useState(defaultDateFrom);
  const [dateTo, setDateTo] = useState(defaultDateTo);
  const [currency, setCurrency] = useState('');
  const [applied, setApplied] = useState({
    dateFrom: defaultDateFrom(),
    dateTo: defaultDateTo(),
    currency: undefined as string | undefined,
  });
  const [canRead, setCanRead] = useState(true);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; data: PanelData }
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
          me.isSuperAdmin || me.permissions.includes('treasury.reports.read'),
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
      const client = getApiClient();
      const base = {
        dateFrom: applied.dateFrom,
        dateTo: applied.dateTo,
        currency: applied.currency,
      };
      const [summary, bySource, byPaymentMethod] = await Promise.all([
        client.getTreasuryReportsSummary(base),
        client.getTreasuryReportsByDimension({
          ...base,
          groupBy: 'source',
        }),
        client.getTreasuryReportsByDimension({
          ...base,
          groupBy: 'paymentMethod',
        }),
      ]);
      setState({
        status: 'ready',
        data: { summary, bySource, byPaymentMethod },
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
  }, [applied, canRead, commonErrorMessages, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const currencyOptions = useMemo(
    () =>
      CURRENCY_FILTER_OPTIONS.map((code) => ({
        value: code,
        label: code === '' ? t('filters.currencyAll') : code,
      })),
    [t],
  );

  const handleApply = useCallback(() => {
    if (!dateFrom || !dateTo) return;
    setApplied({
      dateFrom: dateFrom.slice(0, 10),
      dateTo: dateTo.slice(0, 10),
      currency: currency || undefined,
    });
  }, [dateFrom, dateTo, currency]);

  const handleClear = useCallback(() => {
    const from = defaultDateFrom();
    const to = defaultDateTo();
    setDateFrom(from);
    setDateTo(to);
    setCurrency('');
    setApplied({ dateFrom: from, dateTo: to, currency: undefined });
  }, []);

  const handleExportCsv = useCallback(async () => {
    setExporting(true);
    try {
      await downloadTreasuryOperationsCsv({
        type: 'all',
        dateFrom: applied.dateFrom,
        dateTo: applied.dateTo,
        currency: applied.currency,
        realizedOnly: true,
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
          forbidden: t('accessDenied'),
        }),
        variant: 'error',
      });
    } finally {
      setExporting(false);
    }
  }, [applied, toast, tExportCommon, tErrors, t, commonErrorMessages]);

  const activeFilterCount = [
    applied.currency != null,
    applied.dateFrom !== defaultDateFrom() ||
      applied.dateTo !== defaultDateTo(),
  ].filter(Boolean).length;

  const displayCurrency =
    state.status === 'ready' ? state.data.summary.currency : applied.currency ?? null;

  const bucketColumns = useMemo<
    ColumnDef<TreasuryReportDimensionBucket, unknown>[]
  >(
    () => [
      {
        accessorKey: 'key',
        header: tColumns('dimension'),
        cell: ({ row }) => {
          const key = row.original.key;
          return (
            <span className="font-medium text-atg-fg">
              {sourceLabels[key as keyof typeof sourceLabels] ??
                paymentLabels[key as keyof typeof paymentLabels] ??
                key}
            </span>
          );
        },
      },
      {
        accessorKey: 'entriesCents',
        header: tColumns('entries'),
        cell: ({ row }) => (
          <span className="whitespace-nowrap tabular-nums">
            {moneyOrDash(row.original.entriesCents, displayCurrency, emptyDash)}
          </span>
        ),
      },
      {
        accessorKey: 'entriesCount',
        header: tColumns('entriesCount'),
        meta: { hideOnMobile: true },
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.entriesCount}</span>
        ),
      },
      {
        accessorKey: 'exitsCents',
        header: tColumns('exits'),
        cell: ({ row }) => (
          <span className="whitespace-nowrap tabular-nums">
            {moneyOrDash(row.original.exitsCents, displayCurrency, emptyDash)}
          </span>
        ),
      },
      {
        accessorKey: 'exitsCount',
        header: tColumns('exitsCount'),
        meta: { hideOnMobile: true },
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.exitsCount}</span>
        ),
      },
    ],
    [tColumns, sourceLabels, paymentLabels, displayCurrency, emptyDash],
  );

  const chartData = useMemo(() => {
    if (state.status !== 'ready') return [];
    return state.data.byPaymentMethod.buckets.map((b) => ({
      key: b.key,
      label:
        paymentLabels[b.key as keyof typeof paymentLabels] ?? b.key,
      entries: b.entriesCents / 100,
      exits: b.exitsCents / 100,
    }));
  }, [state, paymentLabels]);

  if (!canRead) {
    return (
      <Card className="p-6">
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {t('accessDenied')}
        </p>
      </Card>
    );
  }

  const summary = state.status === 'ready' ? state.data.summary : null;
  const isLoading = state.status === 'loading';

  return (
    <div className="space-y-6">
      <FilterBar
        mobileVariant="drawer"
        activeCount={activeFilterCount}
        onClear={handleClear}
        onApply={handleApply}
        clearLabel={tCommon('filters.clearAll')}
        applyLabel={t('filters.apply')}
        toggleLabel={tCommon('filters.toggle')}
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            loading={exporting}
            disabled={exporting || isLoading}
            onClick={() => void handleExportCsv()}
          >
            {t('exportCsv')}
          </Button>
        }
        filters={
          <>
            <div>
              <label className="mb-1 block text-xs font-medium text-atg-muted">
                {t('filters.dateFrom')}
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-atg-muted">
                {t('filters.dateTo')}
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm"
              />
            </div>
            <div className="w-full sm:w-44">
              <Select
                label={t('filters.currency')}
                value={currency}
                options={currencyOptions}
                onChange={(e) => setCurrency(e.target.value)}
              />
            </div>
          </>
        }
      />

      {state.status === 'error' ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading || !summary ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))
        ) : (
          <>
            <Card variant="dashboard" padding="md" className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-atg-muted">
                {t('kpi.entries')}
              </p>
              <p className="text-lg font-semibold tabular-nums text-atg-fg">
                {summary.currency
                  ? formatMoney(summary.entries.totalCents, summary.currency)
                  : t('kpi.multiCurrency')}
              </p>
              <p className="text-xs text-atg-muted">
                {t('kpi.count', { count: summary.entries.count })}
              </p>
            </Card>
            <Card variant="dashboard" padding="md" className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-atg-muted">
                {t('kpi.exits')}
              </p>
              <p className="text-lg font-semibold tabular-nums text-atg-fg">
                {summary.currency
                  ? formatMoney(summary.exits.totalCents, summary.currency)
                  : t('kpi.multiCurrency')}
              </p>
              <p className="text-xs text-atg-muted">
                {t('kpi.count', { count: summary.exits.count })}
              </p>
            </Card>
            <Card variant="dashboard" padding="md" className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-atg-muted">
                {t('kpi.net')}
              </p>
              <p className="text-lg font-semibold tabular-nums text-atg-fg">
                {summary.netCents != null && summary.currency
                  ? formatMoney(summary.netCents, summary.currency)
                  : t('kpi.netUnavailable')}
              </p>
              <p className="text-xs text-atg-muted">{t('kpi.netHint')}</p>
            </Card>
            <Card variant="dashboard" padding="md" className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-atg-muted">
                {t('kpi.period')}
              </p>
              <p className="text-sm font-medium tabular-nums text-atg-fg">
                {summary.dateFrom} → {summary.dateTo}
              </p>
              <p className="text-xs text-atg-muted">
                {summary.currency ?? t('filters.currencyAll')}
              </p>
            </Card>
          </>
        )}
      </div>

      {summary && !summary.currency ? (
        <Card variant="dashboard" padding="md">
          <h3 className="mb-3 text-sm font-semibold text-atg-fg">
            {t('byCurrencyTitle')}
          </h3>
          {(() => {
            const currencies = new Set([
              ...(summary.entries.byCurrency?.map((b) => b.currency) ?? []),
              ...(summary.exits.byCurrency?.map((b) => b.currency) ?? []),
            ]);
            if (currencies.size === 0) {
              return (
                <p className="text-sm text-atg-muted">{t('empty')}</p>
              );
            }
            return (
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from(currencies)
                  .sort()
                  .map((code) => {
                  const entry = summary.entries.byCurrency?.find(
                    (b) => b.currency === code,
                  );
                  const exit = summary.exits.byCurrency?.find(
                    (b) => b.currency === code,
                  );
                  return (
                    <li
                      key={code}
                      className="rounded-lg border border-atg-border/70 px-3 py-2 text-sm"
                    >
                      <p className="font-mono font-medium">{code}</p>
                      <p className="tabular-nums text-atg-muted">
                        {t('kpi.entries')}:{' '}
                        {formatMoney(entry?.totalCents ?? 0, code)}
                      </p>
                      <p className="tabular-nums text-atg-muted">
                        {t('kpi.exits')}:{' '}
                        {formatMoney(exit?.totalCents ?? 0, code)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            );
          })()}
        </Card>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-atg-fg">
          {t('sections.bySource')}
        </h2>
        <Card variant="dashboard" padding="none" className="overflow-hidden">
          <DataTable
            columns={bucketColumns}
            data={
              state.status === 'ready' ? state.data.bySource.buckets : []
            }
            isLoading={isLoading}
            loadingMessage={tDataTable('loading')}
            emptyMessage={t('empty')}
            expandRowLabel={tDataTable('expandRow')}
            collapseRowLabel={tDataTable('collapseRow')}
            expandRowAriaLabel={tDataTable('expandRowAria')}
            getRowId={(row) => `source-${row.key}`}
            aria-label={t('sections.bySource')}
          />
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-atg-fg">
          {t('sections.byPaymentMethod')}
        </h2>
        <Card variant="dashboard" padding="none" className="overflow-hidden">
          <DataTable
            columns={bucketColumns}
            data={
              state.status === 'ready'
                ? state.data.byPaymentMethod.buckets
                : []
            }
            isLoading={isLoading}
            loadingMessage={tDataTable('loading')}
            emptyMessage={t('empty')}
            expandRowLabel={tDataTable('expandRow')}
            collapseRowLabel={tDataTable('collapseRow')}
            expandRowAriaLabel={tDataTable('expandRowAria')}
            getRowId={(row) => `pm-${row.key}`}
            aria-label={t('sections.byPaymentMethod')}
          />
        </Card>
      </section>

      {chartData.length > 0 && displayCurrency ? (
        <Card variant="dashboard" padding="md" className="space-y-3">
          <h2 className="text-lg font-semibold text-atg-fg">
            {t('sections.chartPaymentMethod')}
          </h2>
          <p className="text-xs text-atg-muted">
            {t('chartUnit', { currency: displayCurrency })}
          </p>
          <div className="h-72 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={chartTheme.grid}
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: chartTheme.tick, fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: chartTheme.grid }}
                />
                <YAxis
                  tick={{ fill: chartTheme.tick, fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend />
                <Bar
                  dataKey="entries"
                  name={t('kpi.entries')}
                  fill={chartTheme.bookings || '#0d9488'}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="exits"
                  name={t('kpi.exits')}
                  fill={chartTheme.revenue || '#f59e0b'}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
