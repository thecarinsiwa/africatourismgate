'use client';

import { Button } from '@africatourismgate/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { posSaleSuccessPageConfig } from '../config/sale';
import { getApiClient } from '../lib/auth/api';
import { waitForBookingConfirmed } from '../lib/sale/wait-booking-confirmed';

const {
  title,
  subtitle,
  pendingSubtitle,
  confirmingLabel,
  bookingLabel,
  paymentLabel,
  paymentCash,
  paymentCard,
  newSaleLabel,
  backToHomeLabel,
} = posSaleSuccessPageConfig;

function formatPaymentMethod(method: string | null): string {
  if (method === 'cash') return paymentCash;
  if (method === 'card') return paymentCard;
  return '—';
}

export function PosSaleSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const paymentMethod = searchParams.get('payment');

  const [status, setStatus] = useState<'loading' | 'confirmed' | 'pending'>('loading');
  const [displaySubtitle, setDisplaySubtitle] = useState<string>(subtitle);

  useEffect(() => {
    if (!bookingId) {
      setStatus('pending');
      setDisplaySubtitle(subtitle);
      return;
    }

    const id = bookingId;
    let cancelled = false;

    async function verify() {
      try {
        const detail = await getApiClient().getBooking(id);
        if (cancelled) return;

        if (detail.booking.status === 'confirmed') {
          setStatus('confirmed');
          setDisplaySubtitle(subtitle);
          return;
        }

        if (paymentMethod === 'card') {
          setStatus('loading');
          setDisplaySubtitle(confirmingLabel);
          const confirmed = await waitForBookingConfirmed(id);
          if (cancelled) return;
          if (confirmed) {
            setStatus('confirmed');
            setDisplaySubtitle(subtitle);
          } else {
            setStatus('pending');
            setDisplaySubtitle(pendingSubtitle);
          }
          return;
        }

        setStatus('pending');
        setDisplaySubtitle(pendingSubtitle);
      } catch {
        if (!cancelled) {
          setStatus('pending');
          setDisplaySubtitle(pendingSubtitle);
        }
      }
    }

    void verify();

    return () => {
      cancelled = true;
    };
  }, [bookingId, paymentMethod]);

  const showSpinner = status === 'loading' && Boolean(bookingId);

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
      <div
        className={`mb-8 flex h-16 w-16 items-center justify-center rounded-full text-3xl ${
          status === 'confirmed'
            ? 'bg-primary/15 text-primary'
            : 'bg-atg-surface text-atg-muted'
        }`}
        aria-hidden
      >
        {showSpinner ? (
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-atg-border border-t-primary" />
        ) : (
          '✓'
        )}
      </div>

      <h1 className="text-3xl font-bold text-atg-fg md:text-4xl">{title}</h1>
      <p className="mt-3 text-lg text-atg-muted">{displaySubtitle}</p>

      <dl className="pos-touch mt-10 w-full max-w-md space-y-4 rounded-2xl border border-atg-border bg-atg-elevated px-6 py-6 text-left">
        <div>
          <dt className="text-sm font-medium text-atg-muted">{bookingLabel}</dt>
          <dd className="mt-1 break-all font-mono text-base text-atg-fg">
            {bookingId ?? '—'}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-atg-muted">{paymentLabel}</dt>
          <dd className="mt-1 text-lg font-semibold text-atg-fg">
            {formatPaymentMethod(paymentMethod)}
          </dd>
        </div>
      </dl>

      <div className="pos-touch mt-10 flex w-full max-w-md flex-col gap-4 sm:flex-row">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          href="/sale"
          className="min-h-[3.5rem] text-lg"
        >
          {newSaleLabel}
        </Button>
        <Button
          variant="outline"
          size="lg"
          fullWidth
          href="/"
          className="min-h-[3.5rem] text-lg"
        >
          {backToHomeLabel}
        </Button>
      </div>

      {status === 'pending' && paymentMethod === 'card' ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-6"
          onClick={() => router.refresh()}
        >
          Actualiser
        </Button>
      ) : null}
    </div>
  );
}
