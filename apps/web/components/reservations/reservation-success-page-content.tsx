'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { BookingDetail } from '@africatourismgate/types';
import { getBooking } from '../../lib/api/booking';
import { ensureClientAccessToken } from '../../lib/auth/client-session';
import { formatHotelPrice } from '../../lib/hotels/listings';
import { useTranslations } from '../../lib/i18n/locale-provider';
import { CheckoutPageShell } from './checkout-page-shell';

export function ReservationSuccessPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const ck = t.checkout;
  const s = ck.success;

  const bookingId = searchParams.get('booking_id');
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

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
    setStatus('loading');
    void ensureClientAccessToken()
      .then((token) => {
        if (!token) {
          const next = encodeURIComponent(`${pathname}?${searchParams.toString()}`);
          router.replace(`/booking/login?next=${next}`);
          return;
        }
        return getBooking(token, bookingId)
          .then((data) => {
            if (!cancelled) {
              setBooking(data);
              setStatus('ready');
            }
          })
          .catch(() => {
            if (!cancelled) {
              setStatus('error');
            }
          });
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [bookingId, pathname, router, searchParams]);

  return (
    <CheckoutPageShell
      title={s.title}
      currentStep="confirmation"
      stepperLabels={stepperLabels}
    >
      <div className="mt-6 rounded-xl border border-green-200 bg-atg-elevated p-6 dark:border-green-900/40 dark:bg-atg-elevated">
        <p className="text-sm text-atg-muted">{s.subtitle}</p>

        <div className="mt-5 space-y-2 text-sm text-atg-fg">
          <p>
            <span className="font-semibold">{s.bookingIdLabel}</span> {bookingId ?? 'non fourni'}
          </p>
          {status === 'loading' && <p className="text-atg-muted">{s.verifying}</p>}
          {status === 'ready' && booking && (
            <>
              <p>
                <span className="font-semibold">{s.statusLabel}</span> {booking.booking.status}
              </p>
              <p>
                <span className="font-semibold">{s.totalLabel}</span>{' '}
                {formatHotelPrice(booking.totalCents, booking.currency)}
              </p>
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
            <li>• {s.nextStepEmail}</li>
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
