'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { BookingDetail, BookingStatus } from '@africatourismgate/types';
import { Spinner } from '@africatourismgate/ui';
import { getBooking, syncBookingPayment } from '../../lib/api/booking';
import { ensureClientAccessToken } from '../../lib/auth/client-session';
import { formatHotelPrice } from '../../lib/hotels/listings';
import { useTranslations } from '../../lib/i18n/locale-provider';
import { CheckoutPageShell } from './checkout-page-shell';

const CONFIRMED: BookingStatus = 'confirmed';
const POLL_INTERVAL_MS = 500;
const POLL_MAX_ATTEMPTS = 30;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function ReservationSuccessPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const ck = t.checkout;
  const s = ck.success;

  const bookingId = searchParams.get('booking_id');
  const paymentParam = searchParams.get('payment');
  const [booking, setBooking] = useState<BookingDetail | null>(null);
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

      const isCash =
        paymentParam === 'cash' || detail.booking.preferredPaymentMethod === 'cash';
      if (isCash || detail.booking.status !== 'pending_payment') {
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

  const isConfirmed = booking?.booking.status === CONFIRMED;
  const isCashPending =
    !isConfirmed &&
    (paymentParam === 'cash' ||
      booking?.booking.preferredPaymentMethod === 'cash') &&
    booking?.booking.status === 'pending_payment';
  const isPendingPayment = booking?.booking.status === 'pending_payment' && !isCashPending;

  const pageTitle = isConfirmed
    ? s.titleConfirmed
    : isCashPending
      ? s.titleCashPending
      : s.title;
  const pageSubtitle = isConfirmed
    ? s.subtitleConfirmed
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
              {isCashPending ? (
                <p className="text-amber-700 dark:text-amber-300">{s.statusCashPendingHint}</p>
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

        <section className="mt-6 rounded-lg bg-atg-surface px-4 py-3 dark:bg-atg-surface">
          <h2 className="text-sm font-bold uppercase tracking-wide text-atg-fg">
            {s.nextStepsTitle}
          </h2>
          <ul className="mt-2 space-y-1 text-sm text-atg-muted">
            {isCashPending ? <li>• {s.nextStepCash}</li> : <li>• {s.nextStepEmail}</li>}
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
