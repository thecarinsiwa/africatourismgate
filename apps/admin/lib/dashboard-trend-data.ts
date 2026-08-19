// TODO(api): GET /dashboard/stats?period=30d — agrégation serveur recommandée.
// Limite actuelle : payments ignore dateFrom/status côté API (controller utilise PaginationQueryDto basique).

import type { BookingListItem, PaymentListItem } from '@africatourismgate/types';
import type { DashboardPeriod } from '../components/dashboard-period-context';
import { getApiClient } from './auth/api';
import { fetchAllPaginated } from './fetch-all-paginated';

export type TrendPoint = {
  date: string;
  bookings: number;
  revenueCents: number;
};

export type DashboardTrendResult = {
  points: TrendPoint[];
  currency: string;
};

export type DashboardTrendAccess = {
  canReadBookings: boolean;
  canReadPayments: boolean;
};

const PERIOD_DAYS: Record<DashboardPeriod, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

export { PERIOD_DAYS as DASHBOARD_PERIOD_DAYS };

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export type DashboardDateRange = {
  dateFrom: string;
  dateTo: string;
  days: string[];
};

export function getDashboardPeriodRange(period: DashboardPeriod): DashboardDateRange {
  const dayCount = PERIOD_DAYS[period];
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (dayCount - 1));

  const days: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    days.push(formatDateOnly(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return {
    dateFrom: formatDateOnly(start),
    dateTo: formatDateOnly(end),
    days,
  };
}

/** Période immédiatement précédente (même durée que `period`). */
export function getPreviousDashboardPeriodRange(
  period: DashboardPeriod,
): Pick<DashboardDateRange, 'dateFrom' | 'dateTo'> {
  const dayCount = PERIOD_DAYS[period];
  const current = getDashboardPeriodRange(period);
  const currentStart = new Date(`${current.dateFrom}T00:00:00.000Z`);
  const previousEnd = new Date(currentStart);
  previousEnd.setUTCDate(previousEnd.getUTCDate() - 1);
  const previousStart = new Date(previousEnd);
  previousStart.setUTCDate(previousStart.getUTCDate() - (dayCount - 1));

  return {
    dateFrom: formatDateOnly(previousStart),
    dateTo: formatDateOnly(previousEnd),
  };
}

function getPeriodRange(period: DashboardPeriod): DashboardDateRange {
  return getDashboardPeriodRange(period);
}

function isWithinRange(isoDate: string, dateFrom: string, dateTo: string): boolean {
  const day = isoDate.slice(0, 10);
  return day >= dateFrom && day <= dateTo;
}

export { isWithinRange as isDashboardDateInRange };

function bucketBookings(bookings: BookingListItem[], days: string[]): Map<string, number> {
  const counts = new Map<string, number>(days.map((day) => [day, 0]));
  for (const booking of bookings) {
    const day = booking.createdAt.slice(0, 10);
    if (counts.has(day)) {
      counts.set(day, (counts.get(day) ?? 0) + 1);
    }
  }
  return counts;
}

function bucketPayments(
  payments: PaymentListItem[],
  days: string[],
  dateFrom: string,
  dateTo: string,
): Map<string, number> {
  const totals = new Map<string, number>(days.map((day) => [day, 0]));
  for (const payment of payments) {
    if (payment.status !== 'succeeded') continue;
    if (!isWithinRange(payment.createdAt, dateFrom, dateTo)) continue;
    const day = payment.createdAt.slice(0, 10);
    if (totals.has(day)) {
      totals.set(day, (totals.get(day) ?? 0) + payment.amountCents);
    }
  }
  return totals;
}

export async function fetchDashboardTrend(
  period: DashboardPeriod,
  access: DashboardTrendAccess,
): Promise<DashboardTrendResult> {
  const client = getApiClient();
  const { dateFrom, dateTo } = getPeriodRange(period);

  const [bookings, payments] = await Promise.all([
    access.canReadBookings
      ? fetchAllPaginated((page, limit) =>
          client.listBookings({ page, limit, dateFrom, dateTo }),
        )
      : Promise.resolve([] as BookingListItem[]),
    access.canReadPayments
      ? fetchAllPaginated((page, limit) => client.listPayments({ page, limit }))
      : Promise.resolve([] as PaymentListItem[]),
  ]);

  return buildDashboardTrendResult(period, bookings, payments);
}

/** Construit la série tendance à partir de listes déjà chargées (batch dashboard). */
export function buildDashboardTrendResult(
  period: DashboardPeriod,
  bookings: BookingListItem[],
  payments: PaymentListItem[],
): DashboardTrendResult {
  const { dateFrom, dateTo, days } = getPeriodRange(period);

  const bookingCounts = bucketBookings(bookings, days);
  const revenueTotals = bucketPayments(payments, days, dateFrom, dateTo);

  const succeededInRange = payments.filter(
    (p) => p.status === 'succeeded' && isWithinRange(p.createdAt, dateFrom, dateTo),
  );
  const currency = succeededInRange[0]?.currency ?? payments[0]?.currency ?? 'CDF';

  const points = days.map((date) => ({
    date,
    bookings: bookingCounts.get(date) ?? 0,
    revenueCents: revenueTotals.get(date) ?? 0,
  }));

  return { points, currency };
}
