'use client';

import { Card, Skeleton } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { fetchDashboardTrend, type TrendPoint } from '../lib/dashboard-trend-data';
import { formatMoney } from '../lib/format-money';
import { useDashboardPeriod } from './dashboard-period-context';

type ChartState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; points: TrendPoint[]; currency: string };

const CHART_WIDTH = 640;
const CHART_HEIGHT = 220;
const PADDING = { top: 16, right: 48, bottom: 28, left: 40 };

function buildPath(values: number[], max: number, plotWidth: number, plotHeight: number): string {
  if (values.length === 0) return '';
  const safeMax = max > 0 ? max : 1;
  const step = values.length > 1 ? plotWidth / (values.length - 1) : 0;

  return values
    .map((value, index) => {
      const x = PADDING.left + index * step;
      const y = PADDING.top + plotHeight - (value / safeMax) * plotHeight;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

function buildAreaPath(
  values: number[],
  max: number,
  plotWidth: number,
  plotHeight: number,
): string {
  const line = buildPath(values, max, plotWidth, plotHeight);
  if (!line) return '';
  const step = values.length > 1 ? plotWidth / (values.length - 1) : 0;
  const lastX = PADDING.left + (values.length - 1) * step;
  const baseY = PADDING.top + plotHeight;
  return `${line} L ${lastX.toFixed(1)} ${baseY} L ${PADDING.left} ${baseY} Z`;
}

function formatAxisDate(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00.000Z`);
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function formatCompactCount(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(value);
}

function formatCompactMoney(cents: number, currency: string): string {
  const amount = cents / 100;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}k`;
  return formatMoney(cents, currency).replace(/\s/g, '');
}

export function DashboardTrendChart({ className }: { className?: string }) {
  const t = useTranslations('dashboard.chart');
  const { period } = useDashboardPeriod();
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

  const chartData = useMemo(() => {
    if (state.status !== 'ready') return null;

    const bookings = state.points.map((p) => p.bookings);
    const revenue = state.points.map((p) => p.revenueCents);
    const maxBookings = Math.max(...bookings, 1);
    const maxRevenue = Math.max(...revenue, 1);
    const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right;
    const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
    const hasData = bookings.some((v) => v > 0) || revenue.some((v) => v > 0);

    const labelStep = Math.max(1, Math.ceil(state.points.length / 6));

    return {
      bookings,
      revenue,
      maxBookings,
      maxRevenue,
      plotWidth,
      plotHeight,
      hasData,
      labelStep,
      bookingsPath: buildPath(bookings, maxBookings, plotWidth, plotHeight),
      revenuePath: buildPath(revenue, maxRevenue, plotWidth, plotHeight),
      bookingsArea: buildAreaPath(bookings, maxBookings, plotWidth, plotHeight),
      revenueArea: buildAreaPath(revenue, maxRevenue, plotWidth, plotHeight),
    };
  }, [state]);

  return (
    <Card variant="dashboard" padding="sm" className={className}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-atg-fg">{t('title')}</h2>
          <p className="mt-1 text-sm text-atg-muted">{t('subtitle')}</p>
        </div>
        {state.status === 'ready' && chartData?.hasData ? (
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-2 text-atg-muted">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden />
              {t('bookings')}
            </span>
            <span className="inline-flex items-center gap-2 text-atg-muted">
              <span className="h-2.5 w-2.5 rounded-full bg-atg-success" aria-hidden />
              {t('revenue')}
            </span>
          </div>
        ) : null}
      </div>

      <div className="mt-5">
        {state.status === 'loading' ? (
          <div className="space-y-3" aria-busy="true">
            <Skeleton className="h-[220px] w-full rounded-lg" />
            <p className="text-sm text-atg-muted">{t('loading')}</p>
          </div>
        ) : state.status === 'error' ? (
          <p className="py-12 text-center text-sm text-red-600 dark:text-red-400" role="alert">
            {t('error')}
          </p>
        ) : !chartData?.hasData ? (
          <p className="py-12 text-center text-sm text-atg-muted">{t('empty')}</p>
        ) : (
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              className="h-auto w-full min-w-[320px] text-atg-muted"
              role="img"
              aria-label={t('ariaLabel')}
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Grille horizontale */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = PADDING.top + chartData.plotHeight * (1 - ratio);
                return (
                  <line
                    key={ratio}
                    x1={PADDING.left}
                    y1={y}
                    x2={CHART_WIDTH - PADDING.right}
                    y2={y}
                    className="stroke-atg-border"
                    strokeWidth={1}
                  />
                );
              })}

              {/* Aire réservations */}
              <path
                d={chartData.bookingsArea}
                className="fill-primary/15"
              />
              {/* Aire revenus */}
              <path
                d={chartData.revenueArea}
                className="fill-atg-success/10"
              />

              {/* Courbe réservations */}
              <path
                d={chartData.bookingsPath}
                fill="none"
                className="stroke-primary"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Courbe revenus */}
              <path
                d={chartData.revenuePath}
                fill="none"
                className="stroke-atg-success"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Axe Y gauche — réservations */}
              <text x={4} y={PADDING.top + 4} className="fill-atg-muted text-[9px]">
                {formatCompactCount(chartData.maxBookings)}
              </text>
              <text x={4} y={PADDING.top + chartData.plotHeight} className="fill-atg-muted text-[9px]">
                0
              </text>

              {/* Axe Y droit — revenus */}
              <text
                x={CHART_WIDTH - 4}
                y={PADDING.top + 4}
                textAnchor="end"
                className="fill-atg-muted text-[9px]"
              >
                {formatCompactMoney(chartData.maxRevenue, state.currency)}
              </text>
              <text
                x={CHART_WIDTH - 4}
                y={PADDING.top + chartData.plotHeight}
                textAnchor="end"
                className="fill-atg-muted text-[9px]"
              >
                0
              </text>

              {/* Labels axe X */}
              {state.points.map((point, index) => {
                if (index % chartData.labelStep !== 0 && index !== state.points.length - 1) {
                  return null;
                }
                const step =
                  state.points.length > 1 ? chartData.plotWidth / (state.points.length - 1) : 0;
                const x = PADDING.left + index * step;
                return (
                  <text
                    key={point.date}
                    x={x}
                    y={CHART_HEIGHT - 6}
                    textAnchor="middle"
                    className="fill-atg-muted text-[9px]"
                  >
                    {formatAxisDate(point.date)}
                  </text>
                );
              })}
            </svg>

            <table className="sr-only">
              <caption>{t('ariaLabel')}</caption>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">{t('bookings')}</th>
                  <th scope="col">{t('revenue')}</th>
                </tr>
              </thead>
              <tbody>
                {state.points.map((point) => (
                  <tr key={point.date}>
                    <td>{point.date}</td>
                    <td>{point.bookings}</td>
                    <td>{formatMoney(point.revenueCents, state.currency)}</td>
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
