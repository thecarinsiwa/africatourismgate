'use client';

import Link from 'next/link';
import type { BookingDetail } from '@africatourismgate/types';
import { useEffect, useState } from 'react';
import { getAccountApiClient } from '../../lib/api/account';
import { useTranslations } from '../../lib/i18n/locale-provider';

type Props = {
  bookingId: string;
};

export function AccountBookingDetail({ bookingId }: Props) {
  const t = useTranslations();
  const [detail, setDetail] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const client = await getAccountApiClient();
        const data = await client.getBooking(bookingId);
        if (!mounted) return;
        if ('booking' in data && 'items' in data) {
          setDetail(data as BookingDetail);
        } else {
          setError(t.account.reservations.notFound);
        }
      } catch {
        if (mounted) setError(t.account.reservations.loadError);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, [bookingId, t.account.reservations.loadError]);

  if (loading) {
    return <p className="text-sm text-gray-600 dark:text-atg-muted">{t.account.loading}</p>;
  }

  if (error || !detail) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400" role="alert">
        {error ?? t.account.reservations.notFound}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <Link href="/account/reservations" className="text-sm text-primary hover:underline">
        ← {t.account.reservations.back}
      </Link>
      <div className="rounded-lg border border-gray-200 p-4 dark:border-atg-border">
        <p className="text-sm text-gray-600 dark:text-atg-muted">
          {t.account.reservations.reference}:{' '}
          <span className="font-mono">{detail.booking.id}</span>
        </p>
        <p className="mt-2 text-sm">
          {t.account.reservations.status}: <strong>{detail.booking.status}</strong>
        </p>
        <p className="mt-2 text-sm">
          {t.account.reservations.total}:{' '}
          <strong>
            {(detail.totalCents / 100).toFixed(2)} {detail.currency}
          </strong>
        </p>
        {detail.items.length > 0 && (
          <ul className="mt-4 space-y-2 border-t border-gray-100 pt-4 dark:border-atg-border">
            {detail.items.map((item) => (
              <li key={item.id} className="text-sm text-gray-700 dark:text-white/80">
                {item.itemType} — {item.quantity} × {(item.unitPriceCents / 100).toFixed(2)}{' '}
                {detail.currency}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
