'use client';

import { Button } from '@africatourismgate/ui';
import type { BookingAdminDetail } from '@africatourismgate/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { posSaleSuccessPageConfig } from '../config/sale';
import { PosReceipt, printPosReceipt } from './sale/pos-receipt';
import { getApiClient } from '../lib/auth/api';
import { getSession } from '../lib/auth/session';
import { fetchPublicBranding } from '../lib/public-branding';
import {
  buildReceiptData,
  buildReceiptMailtoUrl,
  type PosReceiptData,
} from '../lib/sale/receipt';
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
  receiptTitle,
  printReceiptLabel,
  downloadPdfHint,
  emailReceiptLabel,
  emailPlaceholder,
  emailInvalid,
  emailSentHint,
} = posSaleSuccessPageConfig;

function formatPaymentMethod(method: string | null): string {
  if (method === 'cash') return paymentCash;
  if (method === 'card') return paymentCard;
  return '—';
}

function parsePaymentMethod(value: string | null): 'cash' | 'card' | null {
  if (value === 'cash' || value === 'card') return value;
  return null;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function PosSaleSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const paymentMethod = searchParams.get('payment');

  const [status, setStatus] = useState<'loading' | 'confirmed' | 'pending'>('loading');
  const [displaySubtitle, setDisplaySubtitle] = useState<string>(subtitle);
  const [bookingDetail, setBookingDetail] = useState<BookingAdminDetail | null>(null);
  const [receiptData, setReceiptData] = useState<PosReceiptData | null>(null);
  const [customerEmail, setCustomerEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);

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

        setBookingDetail(detail);
        setCustomerEmail((current) => current || detail.client.email || '');

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
            const refreshed = await getApiClient().getBooking(id);
            if (cancelled) return;
            setBookingDetail(refreshed);
            setCustomerEmail((current) => current || refreshed.client.email || '');
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

  useEffect(() => {
    if (status !== 'confirmed' || !bookingDetail) {
      setReceiptData(null);
      return;
    }

    let cancelled = false;

    async function loadReceipt() {
      const branding = await fetchPublicBranding();
      if (cancelled) return;

      setReceiptData(
        buildReceiptData(
          bookingDetail!,
          getSession(),
          branding,
          parsePaymentMethod(paymentMethod),
        ),
      );
    }

    void loadReceipt();

    return () => {
      cancelled = true;
    };
  }, [status, bookingDetail, paymentMethod]);

  const showSpinner = status === 'loading' && Boolean(bookingId);
  const showReceipt = status === 'confirmed' && receiptData !== null;

  const mailtoUrl = useMemo(() => {
    if (!receiptData || !isValidEmail(customerEmail)) return '';
    return buildReceiptMailtoUrl(customerEmail, receiptData);
  }, [customerEmail, receiptData]);

  function handleEmailReceipt() {
    if (!isValidEmail(customerEmail)) {
      setEmailError(emailInvalid);
      return;
    }
    setEmailError(null);
    const url = buildReceiptMailtoUrl(customerEmail, receiptData!);
    window.location.href = url;
  }

  return (
    <div className="flex flex-1 flex-col items-center py-8">
      <div className="pos-no-print flex w-full max-w-md flex-col items-center text-center">
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

        <dl className="pos-touch mt-10 w-full space-y-4 rounded-2xl border border-atg-border bg-atg-elevated px-6 py-6 text-left">
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
      </div>

      {showReceipt ? (
        <section className="mt-10 w-full max-w-md" aria-labelledby="receipt-heading">
          <h2
            id="receipt-heading"
            className="pos-no-print mb-4 text-center text-lg font-semibold text-atg-fg"
          >
            {receiptTitle}
          </h2>

          <PosReceipt data={receiptData} />

          <div className="pos-no-print pos-touch mt-6 space-y-4">
            <Button
              type="button"
              variant="primary"
              size="lg"
              fullWidth
              className="min-h-[3.5rem] text-lg"
              onClick={() => printPosReceipt()}
            >
              {printReceiptLabel}
            </Button>
            <p className="text-center text-xs text-atg-muted">{downloadPdfHint}</p>

            <div className="rounded-xl border border-atg-border bg-atg-elevated p-4">
              <label
                htmlFor="receipt-email"
                className="mb-2 block text-sm font-medium text-atg-fg"
              >
                {emailReceiptLabel}
              </label>
              <input
                id="receipt-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={emailPlaceholder}
                value={customerEmail}
                onChange={(event) => {
                  setCustomerEmail(event.target.value);
                  setEmailError(null);
                }}
                className="min-h-[3rem] w-full rounded-lg border border-atg-border bg-atg-surface px-3 py-2 text-base text-atg-fg"
              />
              {emailError ? (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {emailError}
                </p>
              ) : null}
              <Button
                type="button"
                variant="outline"
                size="lg"
                fullWidth
                className="mt-3 min-h-[3.25rem] text-base"
                disabled={!mailtoUrl}
                onClick={handleEmailReceipt}
              >
                {emailReceiptLabel}
              </Button>
              <p className="mt-2 text-xs text-atg-muted">{emailSentHint}</p>
            </div>
          </div>
        </section>
      ) : null}

      <div className="pos-no-print pos-touch mt-10 flex w-full max-w-md flex-col gap-4 sm:flex-row">
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
          className="pos-no-print mt-6"
          onClick={() => router.refresh()}
        >
          Actualiser
        </Button>
      ) : null}
    </div>
  );
}
