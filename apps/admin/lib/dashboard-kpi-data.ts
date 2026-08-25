// TODO(api): GET /dashboard/stats?period=30d — agrégation serveur recommandée pour KPIs et deltas.
// users/properties : pas de filtre dateFrom côté API — totaux globaux sans variation.

import type { PaymentListItem } from '@africatourismgate/types';
import type { DashboardKpiKey } from '../config/dashboard-kpi';
import type { DashboardPeriod } from '../components/dashboard-period-context';
import { getApiClient } from './auth/api';
import { fetchAllPaginated } from './fetch-all-paginated';
import {
  getDashboardPeriodRange,
  getPreviousDashboardPeriodRange,
  isDashboardDateInRange,
} from './dashboard-trend-data';

export type DashboardKpiChangeDirection = 'up' | 'down' | 'flat';

export type DashboardKpiChange = {
  percent: number;
  direction: DashboardKpiChangeDirection;
};

export type DashboardKpiData = {
  /** Valeur brute (count ou cents) pour tests / futur endpoint. */
  rawValue: number;
  displayValue: string;
  change?: DashboardKpiChange;
  currency?: string;
};

export function computeKpiChange(current: number, previous: number): DashboardKpiChange {
  if (current === 0 && previous === 0) {
    return { percent: 0, direction: 'flat' };
  }

  const delta = ((current - previous) / Math.max(previous, 1)) * 100;
  const rounded = Math.round(delta * 10) / 10;

  if (Math.abs(rounded) < 0.5) {
    return { percent: 0, direction: 'flat' };
  }

  return {
    percent: Math.abs(rounded),
    direction: rounded > 0 ? 'up' : 'down',
  };
}

export function formatKpiChangePercent(
  change: DashboardKpiChange,
  locale: string,
): string {
  const formatted = change.percent.toLocaleString(locale, { maximumFractionDigits: 1 });

  if (change.direction === 'flat') {
    return `0 %`;
  }

  const sign = change.direction === 'up' ? '+' : '-';
  return `${sign}${formatted} %`;
}

async function countBookingsInRange(dateFrom: string, dateTo: string): Promise<number> {
  const client = getApiClient();
  const result = await client.listBookings({ page: 1, limit: 1, dateFrom, dateTo });
  return result.meta.total;
}

async function sumSucceededRevenueInRange(
  dateFrom: string,
  dateTo: string,
): Promise<{ totalCents: number; currency: string }> {
  const client = getApiClient();
  const payments = await fetchAllPaginated<PaymentListItem>((page, limit) =>
    client.listPayments({ page, limit }),
  );

  let totalCents = 0;
  let currency = 'CDF';

  for (const payment of payments) {
    if (payment.status !== 'succeeded') continue;
    if (!isDashboardDateInRange(payment.createdAt, dateFrom, dateTo)) continue;
    if (totalCents === 0) {
      currency = payment.currency || currency;
    }
    totalCents += payment.amountCents;
  }

  return { totalCents, currency };
}

async function fetchBookingsKpi(period: DashboardPeriod): Promise<DashboardKpiData> {
  const current = getDashboardPeriodRange(period);
  const previous = getPreviousDashboardPeriodRange(period);

  const [currentCount, previousCount] = await Promise.all([
    countBookingsInRange(current.dateFrom, current.dateTo),
    countBookingsInRange(previous.dateFrom, previous.dateTo),
  ]);

  return {
    rawValue: currentCount,
    displayValue: String(currentCount),
    change: computeKpiChange(currentCount, previousCount),
  };
}

async function fetchRevenueKpi(period: DashboardPeriod): Promise<DashboardKpiData> {
  const current = getDashboardPeriodRange(period);
  const previous = getPreviousDashboardPeriodRange(period);

  const [currentRevenue, previousRevenue] = await Promise.all([
    sumSucceededRevenueInRange(current.dateFrom, current.dateTo),
    sumSucceededRevenueInRange(previous.dateFrom, previous.dateTo),
  ]);

  return {
    rawValue: currentRevenue.totalCents,
    displayValue: String(currentRevenue.totalCents),
    currency: currentRevenue.currency,
    change: computeKpiChange(currentRevenue.totalCents, previousRevenue.totalCents),
  };
}

async function fetchTotalKpi(key: 'users' | 'properties'): Promise<DashboardKpiData> {
  const client = getApiClient();
  const total =
    key === 'users' ? await client.countUsers() : await client.countProperties();

  return {
    rawValue: total,
    displayValue: String(total),
  };
}

export async function fetchDashboardKpiData(
  key: DashboardKpiKey,
  period: DashboardPeriod,
): Promise<DashboardKpiData> {
  if (key === 'bookings') {
    return fetchBookingsKpi(period);
  }
  if (key === 'revenue') {
    return fetchRevenueKpi(period);
  }
  return fetchTotalKpi(key);
}
