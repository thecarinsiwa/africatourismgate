'use client';

import Link from 'next/link';
import type { BookingListItem, BookingStatus } from '@africatourismgate/types';
import { EmptyState } from '@africatourismgate/ui';
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

const PENDING_STATUSES = new Set<BookingStatus>(['draft', 'pending_approval', 'pending_payment']);
const CANCELLED_STATUSES = new Set<BookingStatus>(['cancelled', 'refunded']);

function matchesFilter(status: BookingStatus, filter: StatusFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'confirmed') return status === 'confirmed';
  if (filter === 'pending') return PENDING_STATUSES.has(status);
  if (filter === 'cancelled') return CANCELLED_STATUSES.has(status);
  return true;
}

function BookingsEmptyIcon() {
  return (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function AccountBookingsEmptyState({
  title,
  description,
  browseLabel,
  showBrowse,
}: {
  title: string;
  description?: string;
  browseLabel: string;
  showBrowse: boolean;
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={<BookingsEmptyIcon />}
      action={
        showBrowse ? (
          <Link
            href="/#search"
            className="inline-flex min-h-[44px] items-center rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white hover:bg-primary-hover"
          >
            {browseLabel}
          </Link>
        ) : undefined
      }
      className="rounded-2xl border-atg-border bg-atg-elevated dark:bg-atg-elevated"
    />
  );
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

  const pendingReviewCount = useMemo(
    () => bookings.filter((b) => b.canReview).length,
    [bookings],
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
      <AccountBookingsEmptyState
        title={t.account.reservations.empty}
        description={t.account.reservations.emptyDescription}
        browseLabel={t.account.reservations.emptyBrowse}
        showBrowse
      />
    );
  }

  return (
    <div className="space-y-4">
      {pendingReviewCount > 0 ? (
        <div
          className="rounded-xl border border-primary/30 bg-primary/5 p-4 dark:border-primary/40 dark:bg-primary/10"
          role="status"
        >
          <p className="text-sm text-atg-fg">
            {t.account.reservations.reviewPrompt.replace(
              '{count}',
              String(pendingReviewCount),
            )}
          </p>
        </div>
      ) : null}

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
              className={`min-h-[44px] rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
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
        <AccountBookingsEmptyState
          title={t.account.reservations.emptyFilter}
          browseLabel={t.account.reservations.emptyBrowse}
          showBrowse={false}
        />
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
                    <div className="flex flex-wrap items-center gap-2">
                      <BookingStatusBadge status={booking.status} size="sm" />
                      {booking.actionRequired ? (
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
                          {t.account.reservations.actionRequired}
                        </span>
                      ) : null}
                      {booking.canReview ? (
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary dark:bg-primary/20">
                          {t.account.reservations.leaveReviewCta}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatBookingMoney(booking.totalCents, booking.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                      {booking.canReview ? (
                        <Link
                          href={`/account/reservations/${booking.id}#booking-review`}
                          className="inline-flex min-h-[44px] items-center font-semibold text-primary hover:underline"
                        >
                          {t.account.reservations.leaveReviewCta}
                        </Link>
                      ) : null}
                      <Link
                        href={`/account/reservations/${booking.id}`}
                        className={`inline-flex min-h-[44px] items-center hover:underline ${
                          booking.canReview
                            ? 'font-medium text-atg-muted hover:text-primary'
                            : 'font-medium text-primary'
                        }`}
                      >
                        {t.account.reservations.view}
                      </Link>
                    </div>
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
