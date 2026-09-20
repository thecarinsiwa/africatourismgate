'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type {
  BookingDetail,
  BookingStatus,
  PublicMobileMoneyCountry,
  PublicPaymentBankAccount,
} from '@africatourismgate/types';
import { Spinner } from '@africatourismgate/ui';
import { getBooking, syncBookingPayment } from '../../lib/api/booking';
import { listPublicPaymentBankAccounts } from '../../lib/api/public-payment-bank-accounts';
import { listPublicMobileMoneyConfig } from '../../lib/api/public-mobile-money';
import { ensureClientAccessToken } from '../../lib/auth/client-session';
import { formatHotelPrice } from '../../lib/hotels/listings';
import { useMessages } from 'next-intl';
import type { Translations } from '../../lib/i18n/translations';
import { BankTransferAccountsPanel } from './bank-transfer-accounts-panel';
import { MobileMoneyInstructionsPanel } from './mobile-money-instructions-panel';
import { PaymentProofPanel } from './payment-proof-panel';
import { CheckoutPageShell } from './checkout-page-shell';

const CONFIRMED: BookingStatus = 'confirmed';
const POLL_INTERVAL_MS = 500;
const POLL_MAX_ATTEMPTS = 30;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function isOfflinePayment(
  paymentParam: string | null,
  preferred: string | null | undefined,
): boolean {
  return (
    paymentParam === 'cash' ||
    paymentParam === 'bank_transfer' ||
    paymentParam === 'mobile_money' ||
    preferred === 'cash' ||
    preferred === 'bank_transfer' ||
    preferred === 'mobile_money'
  );
}

export function ReservationSuccessPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const messages = useMessages();
  const ck = (messages as { checkout: Translations['checkout'] }).checkout;
  const account = (messages as { account: Translations['account'] }).account;
  const s = ck.success;

  const bookingId = searchParams.get('booking_id');
  const paymentParam = searchParams.get('payment');
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [bankAccounts, setBankAccounts] = useState<PublicPaymentBankAccount[]>([]);
  const [mobileMoneyCountries, setMobileMoneyCountries] = useState<
    PublicMobileMoneyCountry[]
  >([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'confirming' | 'ready' | 'error'>(
    'idle',
  );

  const stepperLabels = useMemo(
    () => ({
      stepperAriaLabel: ck.stepperAriaLabel,
      cart: ck.stepCart,
      recap: ck.stepRecap,
      payment: ck.stepPayment,
      confirmation: ck.stepConfirmation,
      cancelled: ck.stepCancelled,
    }),
    [ck],
  );

  useEffect(() => {
    let cancelled = false;
    if (!bookingId) return;

    async function resolveBookingStatus(accessToken: string): Promise<BookingDetail | null> {
      let detail = await getBooking(accessToken, bookingId!);
      if (detail.booking.status === CONFIRMED) {
        return detail;
      }

      const offline = isOfflinePayment(
        paymentParam,
        detail.booking.preferredPaymentMethod,
      );
      if (offline || detail.booking.status !== 'pending_payment') {
        return detail;
      }

      try {
        detail = await syncBookingPayment(accessToken, bookingId!);
        if (detail.booking.status === CONFIRMED) {
          return detail;
        }
      } catch {
        // webhook may still be in flight; polling continues below
      }

      for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt += 1) {
        if (cancelled) return null;
        await sleep(POLL_INTERVAL_MS);
        detail = await getBooking(accessToken, bookingId!);
        if (detail.booking.status === CONFIRMED) {
          return detail;
        }
      }

      return detail;
    }

    setStatus('loading');
    void ensureClientAccessToken()
      .then(async (token) => {
        if (!token) {
          const next = encodeURIComponent(`${pathname}?${searchParams.toString()}`);
          router.replace(`/booking/login?next=${next}`);
          return;
        }

        setStatus('confirming');
        const data = await resolveBookingStatus(token);
        if (!cancelled) {
          if (data) {
            setBooking(data);
            setStatus('ready');
          } else {
            setStatus('error');
          }
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [bookingId, pathname, paymentParam, router, searchParams]);

  const prefersBankTransfer =
    paymentParam === 'bank_transfer' ||
    booking?.booking.preferredPaymentMethod === 'bank_transfer';
  const prefersMobileMoney =
    paymentParam === 'mobile_money' ||
    booking?.booking.preferredPaymentMethod === 'mobile_money';

  useEffect(() => {
    if (!prefersBankTransfer || status !== 'ready') return;
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
  }, [prefersBankTransfer, status]);

  useEffect(() => {
    if (!prefersMobileMoney || status !== 'ready') return;
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
  }, [prefersMobileMoney, status]);

  const isConfirmed = booking?.booking.status === CONFIRMED;
  const isCashPending =
    !isConfirmed &&
    (paymentParam === 'cash' || booking?.booking.preferredPaymentMethod === 'cash') &&
    booking?.booking.status === 'pending_payment';
  const isBankTransferPending =
    !isConfirmed && prefersBankTransfer && booking?.booking.status === 'pending_payment';
  const isMobileMoneyPending =
    !isConfirmed && prefersMobileMoney && booking?.booking.status === 'pending_payment';
  const isOfflinePending =
    isCashPending || isBankTransferPending || isMobileMoneyPending;
  const isPendingPayment = booking?.booking.status === 'pending_payment' && !isOfflinePending;

  const pageTitle = isConfirmed
    ? s.titleConfirmed
    : isMobileMoneyPending
      ? s.titleMobileMoneyPending
      : isBankTransferPending
        ? s.titleBankTransferPending
        : isCashPending
          ? s.titleCashPending
          : s.title;
  const pageSubtitle = isConfirmed
    ? s.subtitleConfirmed
    : isMobileMoneyPending
      ? s.subtitleMobileMoneyPending
      : isBankTransferPending
        ? s.subtitleBankTransferPending
        : isCashPending
          ? s.subtitleCashPending
          : s.subtitle;

  return (
    <CheckoutPageShell
      title={pageTitle}
      currentStep="confirmation"
      stepperLabels={stepperLabels}
    >
      <div className="mt-6 rounded-xl border border-green-200 bg-atg-elevated p-6 dark:border-green-900/40 dark:bg-atg-elevated">
        <p className="text-sm text-atg-muted">{pageSubtitle}</p>

        <div className="mt-5 space-y-2 text-sm text-atg-fg">
          <p>
            <span className="font-semibold">{s.bookingIdLabel}</span> {bookingId ?? 'non fourni'}
          </p>
          {(status === 'loading' || status === 'confirming') && (
            <div className="flex items-center gap-2.5 py-2 text-atg-muted">
              <Spinner size="sm" variant="primary" />
              <span>{s.verifying}</span>
            </div>
          )}
          {status === 'ready' && booking && (
            <>
              <p>
                <span className="font-semibold">{s.statusLabel}</span>{' '}
                {isConfirmed
                  ? s.statusConfirmed
                  : isMobileMoneyPending
                    ? s.statusMobileMoneyPending
                    : isBankTransferPending
                      ? s.statusBankTransferPending
                      : isCashPending
                        ? s.statusCashPending
                        : isPendingPayment
                          ? s.statusPendingPayment
                          : booking.booking.status}
              </p>
              <p>
                <span className="font-semibold">{s.totalLabel}</span>{' '}
                {formatHotelPrice(booking.totalCents, booking.currency)}
              </p>
              {(booking.paidCents > 0 ||
                booking.balanceCents > 0 ||
                isPendingPayment) && (
                <>
                  <p>
                    <span className="font-semibold">{s.paidLabel}</span>{' '}
                    {formatHotelPrice(booking.paidCents ?? 0, booking.currency)}
                  </p>
                  <p>
                    <span className="font-semibold">{s.balanceLabel}</span>{' '}
                    {formatHotelPrice(
                      booking.balanceCents ??
                        Math.max(0, booking.totalCents - (booking.paidCents ?? 0)),
                      booking.currency,
                    )}
                  </p>
                  {isPendingPayment &&
                  (booking.depositRequiredCents ?? booking.totalCents) <
                    booking.totalCents &&
                  (booking.paidCents ?? 0) === 0 ? (
                    <p>
                      <span className="font-semibold">{s.depositDueLabel}</span>{' '}
                      {formatHotelPrice(
                        Math.min(
                          booking.depositRequiredCents ?? booking.totalCents,
                          booking.balanceCents ?? booking.totalCents,
                        ),
                        booking.currency,
                      )}
                    </p>
                  ) : null}
                </>
              )}
              {isPendingPayment &&
              ((booking.depositRequiredCents ?? booking.totalCents) <
                booking.totalCents ||
                (booking.paidCents ?? 0) > 0) ? (
                <aside className="mt-3 rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
                  <p className="font-semibold">{s.cancellationPolicyTitle}</p>
                  <p className="mt-1 text-sm opacity-90">{s.cancellationPolicyBody}</p>
                </aside>
              ) : null}
              {isCashPending ? (
                <p className="text-amber-700 dark:text-amber-300">{s.statusCashPendingHint}</p>
              ) : null}
              {isBankTransferPending ? (
                <p className="text-amber-700 dark:text-amber-300">
                  {s.statusBankTransferPendingHint}
                </p>
              ) : null}
              {isMobileMoneyPending ? (
                <p className="text-amber-700 dark:text-amber-300">
                  {s.statusMobileMoneyPendingHint}
                </p>
              ) : null}
              {isPendingPayment ? (
                <p className="text-amber-700 dark:text-amber-300">{s.statusPendingHint}</p>
              ) : null}
            </>
          )}
          {status === 'error' && (
            <p className="text-amber-700 dark:text-amber-300">{s.statusUnavailable}</p>
          )}
        </div>

        {isBankTransferPending && booking && bookingId ? (
          <div className="mt-5 space-y-3">
            <BankTransferAccountsPanel
              accounts={bankAccounts}
              bookingRef={bookingId}
              labels={{
                title: ck.bankTransferAccountsTitle,
                empty: ck.bankTransferAccountsEmpty,
                holder: ck.bankTransferHolder,
                accountNumber: ck.bankTransferAccountNumber,
                swift: ck.bankTransferSwift,
                currency: ck.bankTransferCurrency,
                referenceHint: ck.bankTransferReferenceHint,
              }}
            />
            <PaymentProofPanel
              bookingId={bookingId}
              bookingStatus={booking.booking.status}
              paymentMethod="bank_transfer"
              proofs={booking.paymentProofs ?? []}
              currency={booking.currency}
              labels={account.reservations.detail.paymentProofs}
              onUpdated={async () => {
                const token = await ensureClientAccessToken();
                if (!token) return;
                const data = await getBooking(token, bookingId);
                setBooking(data);
              }}
            />
          </div>
        ) : null}

        {isMobileMoneyPending && booking && bookingId ? (
          <div className="mt-5 space-y-3">
            <MobileMoneyInstructionsPanel
              countries={mobileMoneyCountries}
              bookingRef={bookingId}
              labels={{
                title: ck.mobileMoneyTitle,
                empty: ck.mobileMoneyEmpty,
                country: ck.mobileMoneyCountry,
                operator: ck.mobileMoneyOperator,
                phone: ck.mobileMoneyPhone,
                label: ck.mobileMoneyLabel,
                referenceHint: ck.mobileMoneyReferenceHint,
                selectCountry: ck.mobileMoneySelectCountry,
                selectOperator: ck.mobileMoneySelectOperator,
              }}
            />
            <PaymentProofPanel
              bookingId={bookingId}
              bookingStatus={booking.booking.status}
              paymentMethod="mobile_money"
              proofs={booking.paymentProofs ?? []}
              currency={booking.currency}
              labels={account.reservations.detail.paymentProofs}
              onUpdated={async () => {
                const token = await ensureClientAccessToken();
                if (!token) return;
                const data = await getBooking(token, bookingId);
                setBooking(data);
              }}
            />
          </div>
        ) : null}

        <section className="mt-6 rounded-lg bg-atg-surface px-4 py-3 dark:bg-atg-surface">
          <h2 className="text-sm font-bold uppercase tracking-wide text-atg-fg">
            {s.nextStepsTitle}
          </h2>
          <ul className="mt-2 space-y-1 text-sm text-atg-muted">
            {isMobileMoneyPending ? (
              <li>• {s.nextStepMobileMoney}</li>
            ) : isBankTransferPending ? (
              <li>• {s.nextStepBankTransfer}</li>
            ) : isCashPending ? (
              <li>• {s.nextStepCash}</li>
            ) : (
              <li>• {s.nextStepEmail}</li>
            )}
            <li>• {s.nextStepAccount}</li>
          </ul>
        </section>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            {s.backHome}
          </Link>
          <Link
            href="/account/reservations"
            className="inline-flex min-h-[44px] items-center rounded-lg border border-atg-border px-4 py-2 text-sm font-semibold text-atg-fg hover:bg-atg-surface dark:border-atg-border dark:hover:bg-white/5"
          >
            {s.viewAccount}
          </Link>
          <Link
            href="/hotels"
            className="inline-flex min-h-[44px] items-center rounded-lg border border-atg-border px-4 py-2 text-sm font-semibold text-atg-fg hover:bg-atg-surface dark:border-atg-border dark:hover:bg-white/5"
          >
            {s.browseHotels}
          </Link>
          <Link
            href="/booking/logout"
            className="inline-flex min-h-[44px] items-center rounded-lg border border-atg-border px-4 py-2 text-sm font-semibold text-atg-fg hover:bg-atg-surface dark:border-atg-border dark:hover:bg-white/5"
          >
            {s.signOut}
          </Link>
        </div>
      </div>
    </CheckoutPageShell>
  );
}
