'use client';

import { Card, Skeleton } from '@africatourismgate/ui';
import type { AnalyticsTrend } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
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
import { useFormatChartAxisDate } from '../../lib/i18n/use-module-labels';
import { useChartTheme } from '../../lib/use-chart-theme';

type ChartRow = {
  date: string;
  label: string;
  visitors: number;
  pageViews: number;
};

type TooltipPayload = {
  payload?: ChartRow;
};

function formatYAxisTick(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
  return String(value);
}

function ChartTooltip({
  active,
  payload,
  visitorsLabel,
  pageViewsLabel,
  visitorsColor,
  pageViewsColor,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  visitorsLabel: string;
  pageViewsLabel: string;
  visitorsColor: string;
  pageViewsColor: string;
}) {
  if (!active || !payload?.[0]?.payload) return null;
  const row = payload[0].payload;

  return (
    <div className="rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-atg-fg">{row.label}</p>
      <p className="mt-1 text-atg-muted">
        <span
          className="inline-block h-2 w-2 rounded-sm"
          style={{ backgroundColor: visitorsColor }}
          aria-hidden
        />{' '}
        {visitorsLabel} : <span className="font-semibold text-atg-fg">{row.visitors}</span>
      </p>
      <p className="mt-0.5 text-atg-muted">
        <span
          className="inline-block h-2 w-2 rounded-sm"
          style={{ backgroundColor: pageViewsColor }}
          aria-hidden
        />{' '}
        {pageViewsLabel} : <span className="font-semibold text-atg-fg">{row.pageViews}</span>
      </p>
    </div>
  );
}

function ChartLegend({
  visitorsLabel,
  pageViewsLabel,
  visitorsColor,
  pageViewsColor,
}: {
  visitorsLabel: string;
  pageViewsLabel: string;
  visitorsColor: string;
  pageViewsColor: string;
}) {
  return (
    <ul className="mt-2 flex items-center justify-center gap-6 text-xs text-atg-muted">
      <li className="inline-flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-sm"
          style={{ backgroundColor: visitorsColor }}
          aria-hidden
        />
        {visitorsLabel}
      </li>
      <li className="inline-flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-sm"
          style={{ backgroundColor: pageViewsColor }}
          aria-hidden
        />
        {pageViewsLabel}
      </li>
    </ul>
  );
}

export function AnalyticsTrendChart({
  status,
  trend,
  errorMessage,
  className,
}: {
  status: 'loading' | 'error' | 'ready';
  trend: AnalyticsTrend | null;
  errorMessage?: string;
  className?: string;
}) {
  const t = useTranslations('modules.analytics.chart');
  const chartTheme = useChartTheme();
  const formatAxisDate = useFormatChartAxisDate();

  const rows = useMemo<ChartRow[] | null>(() => {
    if (!trend) return null;
    return trend.points.map((point) => ({
      date: point.date,
      label: formatAxisDate(point.date),
      visitors: point.visitors,
      pageViews: point.pageViews,
    }));
  }, [formatAxisDate, trend]);

  const hasData = useMemo(
    () => rows?.some((row) => row.visitors > 0 || row.pageViews > 0) ?? false,
    [rows],
  );

  const xInterval = useMemo(() => {
    if (!rows) return 0;
    return Math.max(0, Math.ceil(rows.length / 8) - 1);
  }, [rows]);

  const chartKey = `${chartTheme.bookings}-${chartTheme.revenue}-${chartTheme.tick}`;

  return (
    <Card variant="dashboard" padding="sm" className={className}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-atg-fg">{t('title')}</h2>
      </div>

      <div className="mt-4">
        {status === 'loading' ? (
          <div className="space-y-3" aria-busy="true">
            <Skeleton className="h-[280px] w-full rounded-lg" />
            <p className="text-sm text-atg-muted">{t('loading')}</p>
          </div>
        ) : status === 'error' ? (
          <p className="py-16 text-center text-sm text-atg-danger" role="alert">
            {errorMessage ?? t('error')}
          </p>
        ) : !hasData || !rows ? (
          <p className="py-16 text-center text-sm text-atg-muted">{t('empty')}</p>
        ) : (
          <div className="w-full" role="img" aria-label={t('ariaLabel')}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                key={chartKey}
                data={rows}
                margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
                barCategoryGap="28%"
              >
                <CartesianGrid stroke={chartTheme.grid} vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: chartTheme.tick, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  interval={xInterval}
                />
                <YAxis
                  tick={{ fill: chartTheme.tick, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatYAxisTick}
                  width={36}
                />
                <Tooltip
                  cursor={{ fill: chartTheme.cursor }}
                  content={
                    <ChartTooltip
                      visitorsLabel={t('visitors')}
                      pageViewsLabel={t('pageViews')}
                      visitorsColor={chartTheme.bookings}
                      pageViewsColor={chartTheme.revenue}
                    />
                  }
                />
                <Bar
                  dataKey="visitors"
                  name={t('visitors')}
                  fill={chartTheme.bookings}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
                <Bar
                  dataKey="pageViews"
                  name={t('pageViews')}
                  fill={chartTheme.revenue}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
                <Legend
                  content={
                    <ChartLegend
                      visitorsLabel={t('visitors')}
                      pageViewsLabel={t('pageViews')}
                      visitorsColor={chartTheme.bookings}
                      pageViewsColor={chartTheme.revenue}
                    />
                  }
                />
              </BarChart>
            </ResponsiveContainer>

            <table className="sr-only">
              <caption>{t('ariaLabel')}</caption>
              <thead>
                <tr>
                  <th scope="col">{t('dateColumn')}</th>
                  <th scope="col">{t('visitors')}</th>
                  <th scope="col">{t('pageViews')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.date}>
                    <td>{row.date}</td>
                    <td>{row.visitors}</td>
                    <td>{row.pageViews}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
}
