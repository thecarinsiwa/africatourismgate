'use client';

import Link from 'next/link';
import type { BookingListItem } from '@africatourismgate/types';
import { useCallback, useEffect, useState } from 'react';
import { getAccountApiClient } from '../../lib/api/account';
import {
  bookingStatusLabels,
  formatBookingDateTime,
  formatBookingMoney,
} from '../../lib/bookings/display';
import { localeToBcp47 } from '../../lib/i18n/locale-tag';
import { useLocale, useTranslations } from '../../lib/i18n/locale-provider';

export function AccountBookingsList() {
  const t = useTranslations();
  const { locale } = useLocale();
  const localeTag = localeToBcp47(locale);
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <div className="overflow-x-auto rounded-lg border border-atg-border dark:border-atg-border">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-atg-border bg-atg-surface dark:border-atg-border dark:bg-white/5">
          <tr>
            <th className="px-4 py-3 font-medium">{t.account.reservations.reference}</th>
            <th className="px-4 py-3 font-medium">{t.account.reservations.date}</th>
            <th className="px-4 py-3 font-medium">{t.account.reservations.status}</th>
            <th className="px-4 py-3 font-medium">{t.account.reservations.total}</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr
              key={booking.id}
              className="border-b border-atg-border last:border-0 dark:border-atg-border"
            >
              <td className="px-4 py-3 font-mono text-xs">{booking.id.slice(0, 8)}…</td>
              <td className="px-4 py-3">{formatBookingDateTime(booking.createdAt, localeTag)}</td>
              <td className="px-4 py-3">{bookingStatusLabels[booking.status] ?? booking.status}</td>
              <td className="px-4 py-3">
                {formatBookingMoney(booking.totalCents, booking.currency)}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/account/reservations/${booking.id}`}
                  className="text-primary hover:underline"
                >
                  {t.account.reservations.view}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
