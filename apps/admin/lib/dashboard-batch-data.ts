// Agrégation batch dashboard — une passe API partagée entre KPIs et graphique tendance.

import type { BookingListItem, PaymentListItem } from '@africatourismgate/types';
import type { DashboardKpiKey } from '../config/dashboard-kpi';
import type { DashboardPeriod } from '../components/dashboard-period-context';
import {
  computeKpiChange,
  type DashboardKpiData,
} from './dashboard-kpi-data';
import {
  buildDashboardTrendResult,
  getDashboardPeriodRange,
  getPreviousDashboardPeriodRange,
  isDashboardDateInRange,
  type DashboardTrendResult,
} from './dashboard-trend-data';
import { getApiClient } from './auth/api';
import { fetchAllPaginated } from './fetch-all-paginated';

export type DashboardBatchAccess = {
  kpiKeys: DashboardKpiKey[];
  canReadBookings: boolean;
  canReadPayments: boolean;
};

export type DashboardBatchResult = {
  kpis: Partial<Record<DashboardKpiKey, DashboardKpiData>>;
  trend: DashboardTrendResult | null;
};

function sumSucceededRevenueInPayments(
  payments: PaymentListItem[],
  dateFrom: string,
  dateTo: string,
): { totalCents: number; currency: string } {
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

async function countBookingsInRange(dateFrom: string, dateTo: string): Promise<number> {
  const client = getApiClient();
  const result = await client.listBookings({ page: 1, limit: 1, dateFrom, dateTo });
  return result.meta.total;
}

export async function fetchDashboardBatch(
  period: DashboardPeriod,
  access: DashboardBatchAccess,
): Promise<DashboardBatchResult> {
  const client = getApiClient();
  const current = getDashboardPeriodRange(period);
  const previous = getPreviousDashboardPeriodRange(period);

  const needsBookingsData = access.canReadBookings;
  const needsPaymentsData = access.canReadPayments;

  const bookingsTask = needsBookingsData
    ? fetchAllPaginated<BookingListItem>((page, limit) =>
        client.listBookings({
          page,
          limit,
          dateFrom: current.dateFrom,
          dateTo: current.dateTo,
        }),
      )
    : Promise.resolve([] as BookingListItem[]);

  const previousBookingsCountTask =
    access.canReadBookings && access.kpiKeys.includes('bookings')
      ? countBookingsInRange(previous.dateFrom, previous.dateTo)
      : Promise.resolve(0);

  const paymentsTask = needsPaymentsData
    ? fetchAllPaginated<PaymentListItem>((page, limit) =>
        client.listPayments({ page, limit }),
      )
    : Promise.resolve([] as PaymentListItem[]);

  const usersTask = access.kpiKeys.includes('users')
    ? client.countUsers()
    : Promise.resolve(null);

  const propertiesTask = access.kpiKeys.includes('properties')
    ? client.countProperties()
    : Promise.resolve(null);

  const [bookings, previousBookingsCount, payments, usersTotal, propertiesTotal] =
    await Promise.all([
      bookingsTask,
      previousBookingsCountTask,
      paymentsTask,
      usersTask,
      propertiesTask,
    ]);

  const kpis: Partial<Record<DashboardKpiKey, DashboardKpiData>> = {};

  if (access.kpiKeys.includes('users') && usersTotal !== null) {
    kpis.users = {
      rawValue: usersTotal,
      displayValue: String(usersTotal),
    };
  }

  if (access.kpiKeys.includes('properties') && propertiesTotal !== null) {
    kpis.properties = {
      rawValue: propertiesTotal,
      displayValue: String(propertiesTotal),
    };
  }

  if (access.kpiKeys.includes('bookings') && access.canReadBookings) {
    const currentCount = bookings.length;
    kpis.bookings = {
      rawValue: currentCount,
      displayValue: String(currentCount),
      change: computeKpiChange(currentCount, previousBookingsCount),
    };
  }

  if (access.kpiKeys.includes('revenue') && access.canReadPayments) {
    const currentRevenue = sumSucceededRevenueInPayments(
      payments,
      current.dateFrom,
      current.dateTo,
    );
    const previousRevenue = sumSucceededRevenueInPayments(
      payments,
      previous.dateFrom,
      previous.dateTo,
    );

    kpis.revenue = {
      rawValue: currentRevenue.totalCents,
      displayValue: String(currentRevenue.totalCents),
      currency: currentRevenue.currency,
      change: computeKpiChange(currentRevenue.totalCents, previousRevenue.totalCents),
    };
  }

  const showTrend = access.canReadBookings || access.canReadPayments;
  const trend = showTrend ? buildDashboardTrendResult(period, bookings, payments) : null;

  return { kpis, trend };
}
