'use client';

import Link from 'next/link';
import { Button } from '@africatourismgate/ui';
import type { BookingDetail } from '@africatourismgate/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAccountApiClient } from '../../lib/api/account';
import {
  bookingItemTypeLabels,
  bookingStatusLabels,
  formatBookingDateTime,
  formatBookingMoney,
  formatStayRange,
} from '../../lib/bookings/display';
import { localeToBcp47 } from '../../lib/i18n/locale-tag';
import { useLocale, useTranslations } from '../../lib/i18n/locale-provider';
import { GuideReviewInvitesSection } from './guide-review-invites-section';
import { BookingMessagesSection } from './booking-messages-section';
import { BookingReviewCard } from './booking-review-card';
import { BookingReviewForm } from './booking-review-form';
import { BookingStatusBadge } from './booking-status-badge';
import { BookingStatusTimeline, isAssistedBookingDetail } from './booking-status-timeline';

type Props = {
  bookingId: string;
  scrollToConversation?: boolean;
  chatToken?: string | null;
};

export function AccountBookingDetail({
  bookingId,
  scrollToConversation = false,
  chatToken = null,
}: Props) {
  const t = useTranslations();
  const { locale } = useLocale();
  const localeTag = localeToBcp47(locale);

  const [detail, setDetail] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [reviewJustPublished, setReviewJustPublished] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const client = await getAccountApiClient();
      const data = await client.getBooking(bookingId);
      if ('booking' in data && 'items' in data) {
        setDetail(data);
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

  useEffect(() => {
    if (!scrollToConversation || loading) {
      return;
    }
    const timer = window.setTimeout(() => {
      document.getElementById('conversation')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    return () => window.clearTimeout(timer);
  }, [scrollToConversation, loading]);

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

  const assisted = useMemo(() => {
    if (!detail) return false;
    return isAssistedBookingDetail(detail.booking.status, detail.statusHistory ?? []);
  }, [detail]);

  if (loading) {
    return <p className="text-sm text-atg-muted">{t.account.loading}</p>;
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

  const { booking, items, totalCents, currency, review, canReview, statusHistory, paymentInvited, guideReviewInvites } =
    detail;
  const d = t.account.reservations.detail;
  const isAssisted = assisted;
  const canProceedToPayment =
    booking.status === 'pending_payment' && Boolean(paymentInvited);
  const canPayImmediate = booking.status === 'pending_payment' && !isAssisted;
  const showPayActions = canProceedToPayment || canPayImmediate;
  const canCancel =
    booking.status === 'pending_payment' || booking.status === 'confirmed';
  const canReplyToMessages =
    booking.status !== 'cancelled' && booking.status !== 'refunded';

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
          <p className="text-xs font-medium uppercase tracking-wide text-atg-muted">
            {t.account.reservations.reference}
          </p>
          <p className="mt-1 font-mono text-sm text-atg-fg">{booking.id}</p>
          <p className="mt-2 text-sm text-atg-muted">
            {d.bookedOn} {formatBookingDateTime(booking.createdAt, localeTag)}
          </p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <BookingStatusTimeline
        currentStatus={booking.status}
        createdAt={booking.createdAt}
        history={statusHistory}
        paymentInvited={paymentInvited}
        localeTag={localeTag}
        labels={{
          title: d.timelineTitle,
          placeholder: d.timelinePlaceholder,
          stepCreated: d.timelineStepCreated,
          stepPending: d.timelineStepPending,
          stepConfirmed: d.timelineStepConfirmed,
          stepCancelled: d.timelineStepCancelled,
          stepRefunded: d.timelineStepRefunded,
          stepRequest: d.timelineStepRequest,
          stepValidation: d.timelineStepValidation,
          stepDiscussion: d.timelineStepDiscussion,
          stepPayment: d.timelineStepPayment,
          current: d.timelineCurrent,
          upcoming: d.timelineUpcoming,
        }}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-atg-border bg-atg-surface p-4 dark:border-atg-border dark:bg-white/5">
          <p className="text-xs font-medium uppercase tracking-wide text-atg-muted">
            {t.account.reservations.status}
          </p>
          <p className="mt-1 text-sm font-semibold text-atg-fg">
            {bookingStatusLabels[booking.status]}
          </p>
        </div>
        <div className="rounded-lg border border-atg-border bg-atg-surface p-4 dark:border-atg-border dark:bg-white/5">
          <p className="text-xs font-medium uppercase tracking-wide text-atg-muted">
            {d.itemsCount}
          </p>
          <p className="mt-1 text-sm font-semibold text-atg-fg">{items.length}</p>
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

      {isAssisted ? (
        <BookingMessagesSection
          bookingId={bookingId}
          localeTag={localeTag}
          chatToken={chatToken}
          canReply={canReplyToMessages}
        />
      ) : null}

      {(showPayActions || canCancel || (isAssisted && booking.status === 'pending_payment')) && (
        <div className="flex flex-wrap gap-3 rounded-lg border border-atg-border bg-atg-surface p-4 dark:border-atg-border dark:bg-white/5">
          <p className="w-full text-sm font-medium text-atg-fg">{d.actions}</p>
          {canProceedToPayment ? (
            <Button type="button" onClick={() => void handlePay()} disabled={paying}>
              {paying ? d.paying : d.proceedToPayment}
            </Button>
          ) : null}
          {canPayImmediate ? (
            <Button type="button" onClick={() => void handlePay()} disabled={paying}>
              {paying ? d.paying : d.payNow}
            </Button>
          ) : null}
          {isAssisted && booking.status === 'pending_payment' && !paymentInvited ? (
            <p className="w-full text-sm text-atg-muted">{d.paymentInvitePending}</p>
          ) : null}
          {canCancel ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleCancel()}
              disabled={cancelling}
              className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-950/40"
            >
              {cancelling ? d.cancelling : d.cancelBooking}
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
          showPublishedBanner={reviewJustPublished}
          labels={{
            yourReview: d.yourReview,
            reviewPublished: d.reviewPublished,
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
            reviewCharCount: d.reviewCharCount,
            ratingAria: (n) => d.reviewStarAria.replace('{n}', String(n)),
          }}
          onSubmitted={(submitted) => {
            setReviewJustPublished(true);
            setDetail((prev) =>
              prev ? { ...prev, review: submitted, canReview: false } : prev,
            );
          }}
        />
      ) : null}

      {guideReviewInvites && guideReviewInvites.length > 0 ? (
        <GuideReviewInvitesSection
          bookingId={bookingId}
          invites={guideReviewInvites}
          localeTag={localeTag}
          labels={{
            sectionTitle: d.guideReviews.sectionTitle,
            sectionHint: d.guideReviews.sectionHint,
            rolePrimary: d.guideReviews.rolePrimary,
            roleSecondary: d.guideReviews.roleSecondary,
            leaveReview: d.guideReviews.leaveReview,
            leaveReviewHint: d.guideReviews.leaveReviewHint,
            reviewRating: d.reviewRating,
            reviewTitle: d.reviewTitle,
            reviewTitlePlaceholder: d.reviewTitlePlaceholder,
            reviewBody: d.reviewBody,
            reviewBodyPlaceholder: d.reviewBodyPlaceholder,
            submitReview: d.guideReviews.submitReview,
            submittingReview: d.submittingReview,
            reviewSubmitError: d.reviewSubmitError,
            reviewRatingRequired: d.reviewRatingRequired,
            reviewCharCount: d.reviewCharCount,
            yourReview: d.guideReviews.yourReview,
            reviewPublished: d.guideReviews.reviewPublished,
            ratingAria: (n) => d.reviewStarAria.replace('{n}', String(n)),
          }}
          onInviteUpdated={(assignmentId, updated) => {
            setDetail((prev) =>
              prev
                ? {
                    ...prev,
                    guideReviewInvites: (prev.guideReviewInvites ?? []).map((invite) =>
                      invite.assignmentId === assignmentId ? updated : invite,
                    ),
                  }
                : prev,
            );
          }}
        />
      ) : null}

      <section>
        <h3 className="mb-3 text-base font-semibold text-atg-fg">{d.itemsTitle}</h3>
        {items.length === 0 ? (
          <p className="text-sm text-atg-muted">{d.noItems}</p>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {items.map((item) => {
                const lineTotal = item.unitPriceCents * item.quantity;
                const typeLabel = bookingItemTypeLabels[item.itemType] ?? item.itemType;
                return (
                  <article
                    key={item.id}
                    className="rounded-lg border border-atg-border bg-atg-surface p-4 dark:border-atg-border dark:bg-white/5"
                  >
                    <p className="font-medium text-atg-fg">
                      {item.titleSnapshot || typeLabel}
                    </p>
                    <p className="mt-0.5 text-xs text-atg-muted">{typeLabel}</p>
                    <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <dt className="text-xs text-atg-muted">{d.dates}</dt>
                        <dd className="text-atg-fg">
                          {formatStayRange(item.startDate, item.endDate, localeTag)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-atg-muted">{d.quantity}</dt>
                        <dd className="text-atg-fg">{item.quantity}</dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-xs text-atg-muted">{d.lineTotal}</dt>
                        <dd className="font-semibold text-primary">
                          {formatBookingMoney(lineTotal, currency)}
                        </dd>
                      </div>
                    </dl>
                  </article>
                );
              })}
              <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
                <span className="font-semibold text-atg-fg">{t.account.reservations.total}</span>
                <span className="text-base font-bold text-primary">
                  {formatBookingMoney(totalCents, currency)}
                </span>
              </div>
            </div>

            <div className="hidden overflow-x-auto rounded-lg border border-atg-border md:block dark:border-atg-border">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-atg-border bg-atg-surface dark:border-atg-border dark:bg-white/5">
                  <tr>
                    <th className="px-4 py-3 font-medium">{d.item}</th>
                    <th className="px-4 py-3 font-medium">{d.dates}</th>
                    <th className="px-4 py-3 font-medium">{d.quantity}</th>
                    <th className="px-4 py-3 font-medium text-right">{d.lineTotal}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const lineTotal = item.unitPriceCents * item.quantity;
                    const typeLabel = bookingItemTypeLabels[item.itemType] ?? item.itemType;
                    return (
                      <tr
                        key={item.id}
                        className="border-b border-atg-border last:border-0 dark:border-atg-border"
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-atg-fg">
                            {item.titleSnapshot || typeLabel}
                          </p>
                          <p className="mt-0.5 text-xs text-atg-muted">{typeLabel}</p>
                        </td>
                        <td className="px-4 py-3 text-atg-fg/80">
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
                <tfoot className="border-t border-atg-border bg-atg-surface dark:border-atg-border dark:bg-white/5">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right font-semibold text-atg-fg">
                      {t.account.reservations.total}
                    </td>
                    <td className="px-4 py-3 text-right text-base font-bold text-primary">
                      {formatBookingMoney(totalCents, currency)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
