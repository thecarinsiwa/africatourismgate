'use client';

import Link from 'next/link';
import type { BookingListItem, BookingStatus } from '@africatourismgate/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAccountApiClient } from '../../lib/api/account';
import {
  formatBookingDateTime,
  formatBookingMoney,
} from '../../lib/bookings/display';
import { localeToBcp47 } from '../../lib/i18n/locale-tag';
import { useLocale, useTranslations } from '../../lib/i18n/locale-provider';
import { BookingStatusBadge } from './booking-status-badge';

type StatusFilter = 'all' | 'confirmed' | 'pending' | 'cancelled';

const PENDING_STATUSES = new Set<BookingStatus>(['draft', 'pending_payment']);
const CANCELLED_STATUSES = new Set<BookingStatus>(['cancelled', 'refunded']);

function matchesFilter(status: BookingStatus, filter: StatusFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'confirmed') return status === 'confirmed';
  if (filter === 'pending') return PENDING_STATUSES.has(status);
  if (filter === 'cancelled') return CANCELLED_STATUSES.has(status);
  return true;
}

export function AccountBookingsList() {
  const t = useTranslations();
  const { locale } = useLocale();
  const localeTag = localeToBcp47(locale);
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const client = await getAccountApiClient();
      const result = await client.listBookings({ limit: 50 });
      setBookings(result.data);
    } catch {
      setError(t.account.reservations.loadError);
    } finally {
      setLoading(false);
    }
  }, [t.account.reservations.loadError]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredBookings = useMemo(
    () => bookings.filter((b) => matchesFilter(b.status, statusFilter)),
    [bookings, statusFilter],
  );

  const filterOptions: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: t.account.reservations.filterAll },
    { id: 'confirmed', label: t.account.reservations.filterConfirmed },
    { id: 'pending', label: t.account.reservations.filterPending },
    { id: 'cancelled', label: t.account.reservations.filterCancelled },
  ];

  if (loading) {
    return <p className="text-sm text-atg-muted">{t.account.loading}</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400" role="alert">
        {error}
      </p>
    );
  }

  if (bookings.length === 0) {
    return (
      <p className="text-sm text-atg-muted">{t.account.reservations.empty}</p>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label={t.account.reservations.filterAria}
      >
        {filterOptions.map((option) => {
          const active = statusFilter === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setStatusFilter(option.id)}
              className={`min-h-[36px] rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary text-white shadow-sm'
                  : 'border border-atg-border bg-atg-surface text-atg-fg hover:border-primary/40 dark:border-atg-border dark:bg-white/5'
              }`}
              aria-pressed={active}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {filteredBookings.length === 0 ? (
        <p className="text-sm text-atg-muted">{t.account.reservations.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-atg-border dark:border-atg-border">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-atg-border bg-atg-surface dark:border-atg-border dark:bg-white/5">
              <tr>
                <th className="px-4 py-3 font-medium">{t.account.reservations.reference}</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">
                  {t.account.reservations.date}
                </th>
                <th className="px-4 py-3 font-medium">{t.account.reservations.status}</th>
                <th className="px-4 py-3 font-medium">{t.account.reservations.total}</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-b border-atg-border last:border-0 dark:border-atg-border"
                >
                  <td className="px-4 py-3 font-mono text-xs">
                    {booking.id.slice(0, 8)}…
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    {formatBookingDateTime(booking.createdAt, localeTag)}
                  </td>
                  <td className="px-4 py-3">
                    <BookingStatusBadge status={booking.status} size="sm" />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatBookingMoney(booking.totalCents, booking.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/account/reservations/${booking.id}`}
                      className="inline-flex min-h-[36px] items-center font-medium text-primary hover:underline"
                    >
                      {t.account.reservations.view}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
