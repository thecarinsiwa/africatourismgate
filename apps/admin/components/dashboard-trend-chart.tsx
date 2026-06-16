'use client';

import { Card, Skeleton } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
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
import { fetchDashboardTrend, type TrendPoint } from '../lib/dashboard-trend-data';
import { formatMoney } from '../lib/format-money';
import { useFormatChartAxisDate } from '../lib/i18n/use-module-labels';
import { useChartTheme } from '../lib/use-chart-theme';
import { useDashboardPeriod } from './dashboard-period-context';

type ChartState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; points: TrendPoint[]; currency: string };

type ChartRow = {
  date: string;
  label: string;
  bookings: number;
  revenue: number;
  revenueCents: number;
};

function formatYAxisTick(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
  return String(value);
}

type TooltipPayload = {
  payload?: ChartRow;
};

function ChartTooltip({
  active,
  payload,
  bookingsLabel,
  revenueLabel,
  currency,
  bookingsColor,
  revenueColor,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  bookingsLabel: string;
  revenueLabel: string;
  currency: string;
  bookingsColor: string;
  revenueColor: string;
}) {
  if (!active || !payload?.[0]?.payload) return null;
  const row = payload[0].payload;

  return (
    <div className="rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-atg-fg">{row.label}</p>
      <p className="mt-1 text-atg-muted">
        <span
          className="inline-block h-2 w-2 rounded-sm"
          style={{ backgroundColor: bookingsColor }}
          aria-hidden
        />{' '}
        {bookingsLabel} : <span className="font-semibold text-atg-fg">{row.bookings}</span>
      </p>
      <p className="mt-0.5 text-atg-muted">
        <span
          className="inline-block h-2 w-2 rounded-sm"
          style={{ backgroundColor: revenueColor }}
          aria-hidden
        />{' '}
        {revenueLabel} :{' '}
        <span className="font-semibold text-atg-fg">
          {formatMoney(row.revenueCents, currency)}
        </span>
      </p>
    </div>
  );
}

function ChartLegend({
  bookingsLabel,
  revenueLabel,
  bookingsColor,
  revenueColor,
}: {
  bookingsLabel: string;
  revenueLabel: string;
  bookingsColor: string;
  revenueColor: string;
}) {
  return (
    <ul className="mt-2 flex items-center justify-center gap-6 text-xs text-atg-muted">
      <li className="inline-flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-sm"
          style={{ backgroundColor: bookingsColor }}
          aria-hidden
        />
        {bookingsLabel}
      </li>
      <li className="inline-flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-sm"
          style={{ backgroundColor: revenueColor }}
          aria-hidden
        />
        {revenueLabel}
      </li>
    </ul>
  );
}

export function DashboardTrendChart({ className }: { className?: string }) {
  const t = useTranslations('dashboard.chart');
  const { period } = useDashboardPeriod();
  const chartTheme = useChartTheme();
  const formatAxisDate = useFormatChartAxisDate();
  const [state, setState] = useState<ChartState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState({ status: 'loading' });
      try {
        const { points, currency } = await fetchDashboardTrend(period);
        if (cancelled) return;
        setState({ status: 'ready', points, currency });
      } catch {
        if (!cancelled) setState({ status: 'error' });
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [period]);

  const rows = useMemo<ChartRow[] | null>(() => {
    if (state.status !== 'ready') return null;
    return state.points.map((point) => ({
      date: point.date,
      label: formatAxisDate(point.date),
      bookings: point.bookings,
      revenue: point.revenueCents / 100,
      revenueCents: point.revenueCents,
    }));
  }, [formatAxisDate, state]);

  const hasData = useMemo(
    () => rows?.some((row) => row.bookings > 0 || row.revenue > 0) ?? false,
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
        {state.status === 'loading' ? (
          <div className="space-y-3" aria-busy="true">
            <Skeleton className="h-[280px] w-full rounded-lg" />
            <p className="text-sm text-atg-muted">{t('loading')}</p>
          </div>
        ) : state.status === 'error' ? (
          <p className="py-16 text-center text-sm text-atg-danger" role="alert">
            {t('error')}
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
                      bookingsLabel={t('bookings')}
                      revenueLabel={t('revenue')}
                      currency={state.currency}
                      bookingsColor={chartTheme.bookings}
                      revenueColor={chartTheme.revenue}
                    />
                  }
                />
                <Bar
                  dataKey="bookings"
                  name={t('bookings')}
                  stackId="activity"
                  fill={chartTheme.bookings}
                  radius={[0, 0, 0, 0]}
                  maxBarSize={48}
                />
                <Bar
                  dataKey="revenue"
                  name={t('revenue')}
                  stackId="activity"
                  fill={chartTheme.revenue}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                />
                <Legend
                  content={
                    <ChartLegend
                      bookingsLabel={t('bookings')}
                      revenueLabel={t('revenue')}
                      bookingsColor={chartTheme.bookings}
                      revenueColor={chartTheme.revenue}
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
                  <th scope="col">{t('bookings')}</th>
                  <th scope="col">{t('revenue')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.date}>
                    <td>{row.date}</td>
                    <td>{row.bookings}</td>
                    <td>{formatMoney(row.revenueCents, state.currency)}</td>
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
