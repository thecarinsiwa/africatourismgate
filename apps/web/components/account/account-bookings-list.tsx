'use client';

import Link from 'next/link';
import type { BookingListItem, BookingStatus } from '@africatourismgate/types';
import { useCallback, useEffect, useState } from 'react';
import { getAccountApiClient } from '../../lib/api/account';
import { useTranslations } from '../../lib/i18n/locale-provider';

const statusLabels: Record<BookingStatus, string> = {
  draft: 'Brouillon',
  pending_payment: 'En attente',
  confirmed: 'Confirmée',
  cancelled: 'Annulée',
  refunded: 'Remboursée',
};

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

function formatMoney(cents: number, currency: string): string {
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

export function AccountBookingsList() {
  const t = useTranslations();
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
    return <p className="text-sm text-gray-600 dark:text-atg-muted">{t.account.loading}</p>;
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
      <p className="text-sm text-gray-600 dark:text-atg-muted">{t.account.reservations.empty}</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-atg-border">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 dark:border-atg-border dark:bg-white/5">
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
              className="border-b border-gray-100 last:border-0 dark:border-atg-border"
            >
              <td className="px-4 py-3 font-mono text-xs">{booking.id.slice(0, 8)}…</td>
              <td className="px-4 py-3">{formatDateTime(booking.createdAt)}</td>
              <td className="px-4 py-3">{statusLabels[booking.status] ?? booking.status}</td>
              <td className="px-4 py-3">
                {formatMoney(booking.totalCents, booking.currency)}
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
