'use client';

import Link from 'next/link';
import { Button } from '@africatourismgate/ui';
import type { BookingDetail, BookingStatus } from '@africatourismgate/types';
import { useCallback, useEffect, useState } from 'react';
import { getAccountApiClient } from '../../lib/api/account';
import {
  bookingItemTypeLabels,
  bookingStatusLabels,
  bookingStatusStyles,
  formatBookingDateTime,
  formatBookingMoney,
  formatStayRange,
} from '../../lib/bookings/display';
import { localeToBcp47 } from '../../lib/i18n/locale-tag';
import { useLocale, useTranslations } from '../../lib/i18n/locale-provider';
import { BookingReviewCard } from './booking-review-card';
import { BookingReviewForm } from './booking-review-form';

type Props = {
  bookingId: string;
};

function StatusBadge({ status }: { status: BookingStatus }) {
  const styles = bookingStatusStyles[status];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${styles.badge}`}
    >
      <span className={`h-2 w-2 rounded-full ${styles.dot}`} aria-hidden />
      {bookingStatusLabels[status] ?? status}
    </span>
  );
}

export function AccountBookingDetail({ bookingId }: Props) {
  const t = useTranslations();
  const { locale } = useLocale();
  const localeTag = localeToBcp47(locale);

  const [detail, setDetail] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const client = await getAccountApiClient();
      const data = await client.getBooking(bookingId);
      if ('booking' in data && 'items' in data) {
        setDetail(data as BookingDetail);
      } else {
        setError(t.account.reservations.notFound);
      }
    } catch {
      setError(t.account.reservations.loadError);
    } finally {
      setLoading(false);
    }
  }, [bookingId, t.account.reservations.loadError, t.account.reservations.notFound]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handlePay() {
    setActionError(null);
    setPaying(true);
    try {
      const client = await getAccountApiClient();
      const session = await client.createBookingCheckoutSession(bookingId);
      window.location.href = session.url;
    } catch {
      setActionError(t.account.reservations.detail.payError);
      setPaying(false);
    }
  }

  async function handleCancel() {
    if (!window.confirm(t.account.reservations.detail.cancelConfirm)) return;
    setActionError(null);
    setCancelling(true);
    try {
      const client = await getAccountApiClient();
      const updated = await client.cancelBooking(bookingId);
      setDetail(updated);
    } catch {
      setActionError(t.account.reservations.detail.cancelError);
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-600 dark:text-atg-muted">{t.account.loading}</p>;
  }

  if (error || !detail) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error ?? t.account.reservations.notFound}
        </p>
        <Link href="/account/reservations" className="text-sm text-primary hover:underline">
          ← {t.account.reservations.back}
        </Link>
      </div>
    );
  }

  const { booking, items, totalCents, currency, review, canReview } = detail;
  const d = t.account.reservations.detail;
  const canPay = booking.status === 'pending_payment';
  const canCancel =
    booking.status === 'pending_payment' || booking.status === 'confirmed';

  return (
    <div className="space-y-6">
      <Link
        href="/account/reservations"
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        ← {t.account.reservations.back}
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-atg-muted">
            {t.account.reservations.reference}
          </p>
          <p className="mt-1 font-mono text-sm text-gray-900 dark:text-white">{booking.id}</p>
          <p className="mt-2 text-sm text-gray-600 dark:text-atg-muted">
            {t.account.reservations.detail.bookedOn}{' '}
            {formatBookingDateTime(booking.createdAt, localeTag)}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-atg-border dark:bg-white/5">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-atg-muted">
            {t.account.reservations.status}
          </p>
          <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
            {bookingStatusLabels[booking.status]}
          </p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-atg-border dark:bg-white/5">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-atg-muted">
            {t.account.reservations.detail.itemsCount}
          </p>
          <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
            {items.length}
          </p>
        </div>
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 sm:col-span-2 lg:col-span-1">
          <p className="text-xs font-medium uppercase tracking-wide text-primary/80">
            {t.account.reservations.total}
          </p>
          <p className="mt-1 text-xl font-bold text-primary">
            {formatBookingMoney(totalCents, currency)}
          </p>
        </div>
      </div>

      {(canPay || canCancel) && (
        <div className="flex flex-wrap gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-atg-border dark:bg-white/5">
          <p className="w-full text-sm font-medium text-gray-900 dark:text-white">
            {t.account.reservations.detail.actions}
          </p>
          {canPay ? (
            <Button type="button" onClick={() => void handlePay()} disabled={paying}>
              {paying ? t.account.reservations.detail.paying : t.account.reservations.detail.payNow}
            </Button>
          ) : null}
          {canCancel ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleCancel()}
              disabled={cancelling}
              className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-950/40"
            >
              {cancelling
                ? t.account.reservations.detail.cancelling
                : t.account.reservations.detail.cancelBooking}
            </Button>
          ) : null}
        </div>
      )}

      {actionError ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {actionError}
        </p>
      ) : null}

      {review ? (
        <BookingReviewCard
          review={review}
          localeTag={localeTag}
          labels={{
            yourReview: d.yourReview,
          }}
        />
      ) : canReview ? (
        <BookingReviewForm
          bookingId={bookingId}
          labels={{
            leaveReview: d.leaveReview,
            leaveReviewHint: d.leaveReviewHint,
            reviewRating: d.reviewRating,
            reviewTitle: d.reviewTitle,
            reviewTitlePlaceholder: d.reviewTitlePlaceholder,
            reviewBody: d.reviewBody,
            reviewBodyPlaceholder: d.reviewBodyPlaceholder,
            submitReview: d.submitReview,
            submittingReview: d.submittingReview,
            reviewSubmitError: d.reviewSubmitError,
            reviewRatingRequired: d.reviewRatingRequired,
            ratingAria: (n) => d.reviewStarAria.replace('{n}', String(n)),
          }}
          onSubmitted={(submitted) => {
            setDetail((prev) =>
              prev
                ? { ...prev, review: submitted, canReview: false }
                : prev,
            );
          }}
        />
      ) : null}

      <section>
        <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
          {t.account.reservations.detail.itemsTitle}
        </h3>
        {items.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-atg-muted">
            {t.account.reservations.detail.noItems}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-atg-border">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 dark:border-atg-border dark:bg-white/5">
                <tr>
                  <th className="px-4 py-3 font-medium">{t.account.reservations.detail.item}</th>
                  <th className="px-4 py-3 font-medium">{t.account.reservations.detail.dates}</th>
                  <th className="px-4 py-3 font-medium">{t.account.reservations.detail.quantity}</th>
                  <th className="px-4 py-3 font-medium text-right">
                    {t.account.reservations.detail.lineTotal}
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const lineTotal = item.unitPriceCents * item.quantity;
                  const typeLabel =
                    bookingItemTypeLabels[item.itemType] ?? item.itemType;
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 last:border-0 dark:border-atg-border"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.titleSnapshot || typeLabel}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-atg-muted">
                          {typeLabel}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-white/80">
                        {formatStayRange(item.startDate, item.endDate, localeTag)}
                      </td>
                      <td className="px-4 py-3">{item.quantity}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatBookingMoney(lineTotal, currency)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t border-gray-200 bg-gray-50 dark:border-atg-border dark:bg-white/5">
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white"
                  >
                    {t.account.reservations.total}
                  </td>
                  <td className="px-4 py-3 text-right text-base font-bold text-primary">
                    {formatBookingMoney(totalCents, currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
