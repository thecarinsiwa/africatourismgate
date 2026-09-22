'use client';

import Link from 'next/link';
import { ApiHttpError } from '@africatourismgate/api-client';
import { Button, Spinner } from '@africatourismgate/ui';
import type {
  BookingDetail,
  PublicMobileMoneyCountry,
  PublicPaymentBankAccount,
} from '@africatourismgate/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAccountApiClient } from '../../lib/api/account';
import { listPublicPaymentBankAccounts } from '../../lib/api/public-payment-bank-accounts';
import { listPublicMobileMoneyConfig } from '../../lib/api/public-mobile-money';
import {
  bookingItemTypeLabels,
  bookingStatusLabels,
  formatBookingDateTime,
  formatBookingMoney,
  formatStayRange,
} from '../../lib/bookings/display';
import { localeToBcp47 } from '../../lib/i18n/locale-tag';
import type { Locale } from '../../lib/i18n/types';
import { useLocale, useMessages, useTranslations } from 'next-intl';
import type { Translations } from '../../lib/i18n/message-types';
import { GuideReviewInvitesSection } from './guide-review-invites-section';
import { BookingMessagesSection } from './booking-messages-section';
import { BookingReviewCard } from './booking-review-card';
import { BookingReviewForm } from './booking-review-form';
import { BookingStatusBadge } from './booking-status-badge';
import { BookingStatusTimeline, isAssistedBookingDetail } from './booking-status-timeline';
import { AccountBookingManifestSection } from './account-booking-manifest-section';
import { BookingIdentityDocumentsSection } from './booking-identity-documents-section';
import { BankTransferAccountsPanel } from '../reservations/bank-transfer-accounts-panel';
import { MobileMoneyInstructionsPanel } from '../reservations/mobile-money-instructions-panel';
import { PaymentProofPanel } from '../reservations/payment-proof-panel';

type Props = {
  bookingId: string;
  autoOpenChat?: boolean;
  chatToken?: string | null;
};

export function AccountBookingDetail({
  bookingId,
  autoOpenChat = false,
  chatToken = null,
}: Props) {
  const t = useTranslations('account');
  const tCheckout = useTranslations('checkout');
  const messages = useMessages();
  const account = (messages as { account: Translations['account'] }).account;
  const locale = useLocale();
  const localeTag = localeToBcp47(locale as Locale);

  const [detail, setDetail] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [reviewJustPublished, setReviewJustPublished] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<PublicPaymentBankAccount[]>([]);
  const [mobileMoneyCountries, setMobileMoneyCountries] = useState<
    PublicMobileMoneyCountry[]
  >([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const client = await getAccountApiClient();
      const data = await client.getBooking(bookingId);
      if ('booking' in data && 'items' in data) {
        setDetail(data);
      } else {
        setError(t('reservations.notFound'));
      }
    } catch {
      setError(t('reservations.loadError'));
    } finally {
      setLoading(false);
    }
  }, [bookingId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (
      !detail ||
      detail.booking.status !== 'pending_payment' ||
      detail.booking.preferredPaymentMethod !== 'bank_transfer'
    ) {
      return;
    }
    let cancelled = false;
    void listPublicPaymentBankAccounts()
      .then((accounts) => {
        if (!cancelled) setBankAccounts(accounts);
      })
      .catch(() => {
        if (!cancelled) setBankAccounts([]);
      });
    return () => {
      cancelled = true;
    };
  }, [detail]);

  useEffect(() => {
    if (
      !detail ||
      detail.booking.status !== 'pending_payment' ||
      detail.booking.preferredPaymentMethod !== 'mobile_money'
    ) {
      return;
    }
    let cancelled = false;
    void listPublicMobileMoneyConfig()
      .then((countries) => {
        if (!cancelled) setMobileMoneyCountries(countries);
      })
      .catch(() => {
        if (!cancelled) setMobileMoneyCountries([]);
      });
    return () => {
      cancelled = true;
    };
  }, [detail]);

  useEffect(() => {
    if (!detail || loading) return;
    if (typeof window === 'undefined') return;
    if (window.location.hash !== '#booking-review') return;
    if (!detail.canReview && !detail.review) return;

    requestAnimationFrame(() => {
      document.getElementById('booking-review')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }, [detail, loading]);

  async function handlePay() {
    setActionError(null);
    setPaying(true);
    try {
      const client = await getAccountApiClient();
      const session = await client.createBookingCheckoutSession(bookingId);
      window.location.href = session.url;
    } catch {
      setActionError(t('reservations.detail.payError'));
      setPaying(false);
    }
  }

  async function handleCancel() {
    if (!window.confirm(t('reservations.detail.cancelConfirm'))) return;
    setActionError(null);
    setCancelling(true);
    try {
      const client = await getAccountApiClient();
      const updated = await client.cancelBooking(bookingId);
      setDetail(updated);
    } catch {
      setActionError(t('reservations.detail.cancelError'));
    } finally {
      setCancelling(false);
    }
  }

  async function handleDownloadConfirmation() {
    setActionError(null);
    setDownloadingPdf(true);
    try {
      const client = await getAccountApiClient();
      const blob = await client.downloadBookingConfirmationPdf(bookingId);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `reservation-${bookingId.slice(0, 8)}.pdf`;
      anchor.rel = 'noopener';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
    } catch (err) {
      const message =
        err instanceof ApiHttpError &&
        err.message &&
        !err.message.startsWith('HTTP ')
          ? err.message
          : t('reservations.detail.downloadConfirmationError');
      setActionError(message);
    } finally {
      setDownloadingPdf(false);
    }
  }

  const assisted = useMemo(() => {
    if (!detail) return false;
    return isAssistedBookingDetail(detail.booking.status, detail.statusHistory ?? []);
  }, [detail]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="md" variant="primary" label={t('loading')} showLabel />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error ?? t('reservations.notFound')}
        </p>
        <Link href="/account/reservations" className="text-sm text-primary hover:underline">
          ← {t('reservations.back')}
        </Link>
      </div>
    );
  }

  const {
    booking,
    items,
    totalCents,
    currency,
    paidCents = 0,
    balanceCents = Math.max(0, totalCents - paidCents),
    depositRequiredCents = totalCents,
    review,
    canReview,
    statusHistory,
    paymentInvited,
    guideReviewInvites,
  } = detail;
  const d = account.reservations.detail;
  const dueNowCents =
    paidCents === 0 && depositRequiredCents < totalCents
      ? Math.min(depositRequiredCents, balanceCents)
      : balanceCents;
  const showPaymentBreakdown =
    booking.status === 'pending_payment' || paidCents > 0 || balanceCents > 0;
  const showCancellationPolicy =
    booking.status === 'pending_payment' &&
    (depositRequiredCents < totalCents || paidCents > 0);
  const isAssisted = assisted;
  const prefersCash = booking.preferredPaymentMethod === 'cash';
  const prefersBankTransfer = booking.preferredPaymentMethod === 'bank_transfer';
  const prefersMobileMoney = booking.preferredPaymentMethod === 'mobile_money';
  const prefersOfflinePayment =
    prefersCash || prefersBankTransfer || prefersMobileMoney;
  const canProceedToPayment =
    booking.status === 'pending_payment' && Boolean(paymentInvited) && !prefersOfflinePayment;
  const canPayImmediate =
    booking.status === 'pending_payment' && !isAssisted && !prefersOfflinePayment;
  const showPayActions = canProceedToPayment || canPayImmediate;
  const showCashPending = booking.status === 'pending_payment' && prefersCash;
  const showBankTransferPending = booking.status === 'pending_payment' && prefersBankTransfer;
  const showMobileMoneyPending = booking.status === 'pending_payment' && prefersMobileMoney;
  const canCancel =
    booking.status === 'pending_payment' || booking.status === 'confirmed';
  const canDownloadConfirmation = booking.status === 'confirmed';
  const canReplyToMessages =
    booking.status !== 'cancelled' && booking.status !== 'refunded';

  return (
    <div className="space-y-6">
      <Link
        href="/account/reservations"
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        ← {t('reservations.back')}
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-atg-muted">
            {t('reservations.reference')}
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-atg-border bg-atg-surface p-4 dark:border-atg-border dark:bg-white/5">
          <p className="text-xs font-medium uppercase tracking-wide text-atg-muted">
            {t('reservations.status')}
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
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-primary/80">
            {t('reservations.total')}
          </p>
          <p className="mt-1 text-xl font-bold text-primary">
            {formatBookingMoney(totalCents, currency)}
          </p>
        </div>
        {showPaymentBreakdown ? (
          <div className="rounded-lg border border-atg-border bg-atg-surface p-4 dark:border-atg-border dark:bg-white/5">
            <p className="text-xs font-medium uppercase tracking-wide text-atg-muted">
              {d.paidLabel}
            </p>
            <p className="mt-1 text-sm font-semibold text-atg-fg">
              {formatBookingMoney(paidCents, currency)}
            </p>
            <p className="mt-2 text-xs font-medium uppercase tracking-wide text-atg-muted">
              {d.balanceLabel}
            </p>
            <p className="mt-1 text-sm font-semibold text-atg-fg">
              {formatBookingMoney(balanceCents, currency)}
            </p>
            {booking.status === 'pending_payment' &&
            dueNowCents > 0 &&
            dueNowCents !== balanceCents ? (
              <>
                <p className="mt-2 text-xs font-medium uppercase tracking-wide text-primary/80">
                  {d.depositDueLabel}
                </p>
                <p className="mt-1 text-sm font-bold text-primary">
                  {formatBookingMoney(dueNowCents, currency)}
                </p>
              </>
            ) : null}
          </div>
        ) : null}
      </div>

      {showCancellationPolicy ? (
        <aside className="rounded-lg border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
          <p className="font-semibold">{d.cancellationPolicyTitle}</p>
          <p className="mt-1 text-amber-900/90 dark:text-amber-100/90">
            {d.cancellationPolicyBody}
          </p>
        </aside>
      ) : null}

      {isAssisted ? (
        <BookingMessagesSection
          bookingId={bookingId}
          localeTag={localeTag}
          chatToken={chatToken}
          canReply={canReplyToMessages}
          initialUnreadCount={detail.unreadStaffMessageCount ?? 0}
          autoOpen={autoOpenChat}
        />
      ) : null}

      <AccountBookingManifestSection
        bookingId={bookingId}
        bookingStatus={booking.status}
      />

      <BookingIdentityDocumentsSection
        bookingId={bookingId}
        bookingStatus={booking.status}
        documents={detail.identityDocuments ?? []}
        onUpdated={load}
      />

      {(showPayActions ||
        showCashPending ||
        showBankTransferPending ||
        showMobileMoneyPending ||
        canCancel ||
        canDownloadConfirmation ||
        (isAssisted && booking.status === 'pending_payment' && !prefersOfflinePayment)) && (
        <div className="flex flex-wrap gap-3 rounded-lg border border-atg-border bg-atg-surface p-4 dark:border-atg-border dark:bg-white/5">
          <p className="w-full text-sm font-medium text-atg-fg">{d.actions}</p>
          {showCashPending ? (
            <p className="w-full text-sm text-atg-muted">{d.cashPaymentPending}</p>
          ) : null}
          {showBankTransferPending ? (
            <div className="w-full space-y-3">
              <p className="text-sm text-atg-muted">{d.bankTransferPaymentPending}</p>
              <BankTransferAccountsPanel
                accounts={bankAccounts}
                bookingRef={booking.id}
                labels={{
                  title: tCheckout('bankTransferAccountsTitle'),
                  empty: tCheckout('bankTransferAccountsEmpty'),
                  holder: tCheckout('bankTransferHolder'),
                  accountNumber: tCheckout('bankTransferAccountNumber'),
                  swift: tCheckout('bankTransferSwift'),
                  currency: tCheckout('bankTransferCurrency'),
                  referenceHint: tCheckout('bankTransferReferenceHint'),
                }}
              />
              <PaymentProofPanel
                bookingId={booking.id}
                bookingStatus={booking.status}
                paymentMethod="bank_transfer"
                proofs={detail.paymentProofs ?? []}
                currency={detail.currency}
                labels={d.paymentProofs}
                onUpdated={async () => {
                  await load();
                }}
              />
            </div>
          ) : null}
          {showMobileMoneyPending ? (
            <div className="w-full space-y-3">
              <p className="text-sm text-atg-muted">{d.mobileMoneyPaymentPending}</p>
              <MobileMoneyInstructionsPanel
                countries={mobileMoneyCountries}
                bookingRef={booking.id}
                labels={{
                  title: tCheckout('mobileMoneyTitle'),
                  empty: tCheckout('mobileMoneyEmpty'),
                  country: tCheckout('mobileMoneyCountry'),
                  operator: tCheckout('mobileMoneyOperator'),
                  phone: tCheckout('mobileMoneyPhone'),
                  label: tCheckout('mobileMoneyLabel'),
                  referenceHint: tCheckout('mobileMoneyReferenceHint'),
                  selectCountry: tCheckout('mobileMoneySelectCountry'),
                  selectOperator: tCheckout('mobileMoneySelectOperator'),
                }}
              />
              <PaymentProofPanel
                bookingId={booking.id}
                bookingStatus={booking.status}
                paymentMethod="mobile_money"
                proofs={detail.paymentProofs ?? []}
                currency={detail.currency}
                labels={d.paymentProofs}
                onUpdated={async () => {
                  await load();
                }}
              />
            </div>
          ) : null}
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
          {canDownloadConfirmation ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleDownloadConfirmation()}
              disabled={downloadingPdf}
            >
              {downloadingPdf ? d.downloadingConfirmation : d.downloadConfirmation}
            </Button>
          ) : null}
          {isAssisted &&
          booking.status === 'pending_payment' &&
          !paymentInvited &&
          !prefersOfflinePayment ? (
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

      {review || canReview ? (
        <section id="booking-review" className="scroll-mt-24">
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
          ) : (
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
          )}
        </section>
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
                <span className="font-semibold text-atg-fg">{t('reservations.total')}</span>
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
                      {t('reservations.total')}
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
