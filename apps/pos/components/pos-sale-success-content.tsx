'use client';

import { Button } from '@africatourismgate/ui';
import type { BookingAdminDetail } from '@africatourismgate/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { posSaleSuccessPageConfig } from '../config/sale';
import { PosReceipt, printPosReceipt } from './sale/pos-receipt';
import { getApiClient } from '../lib/auth/api';
import { getSession, type PosStoredSession } from '../lib/auth/session';
import { fetchPublicBranding } from '../lib/public-branding';
import {
  buildReceiptData,
  type PosReceiptData,
} from '../lib/sale/receipt';
import { downloadPosReceiptPdf } from '../lib/sale/receipt-pdf';
import {
  cancelAbandonedPosBooking,
  posAbandonCancelReasons,
  saleApiErrorMessage,
} from '../lib/sale/sale-checkout';
import { waitForBookingConfirmed } from '../lib/sale/wait-booking-confirmed';

const {
  title,
  subtitle,
  timeoutSubtitle,
  timeoutHint,
  confirmingLabel,
  bookingLabel,
  paymentLabel,
  paymentCash,
  paymentCard,
  newSaleLabel,
  backToHomeLabel,
  refreshLabel,
  cancelPendingLabel,
  cancelPendingProcessingLabel,
  cancelPendingErrorLabel,
  confirmedMeanwhileLabel,
  receiptTitle,
  printReceiptLabel,
  downloadPdfLabel,
  downloadPdfHint,
  downloadPdfProcessingLabel,
  downloadPdfErrorLabel,
  emailFieldLabel,
  emailReceiptLabel,
  emailPlaceholder,
  emailInvalid,
  emailSendingLabel,
  emailSentHint,
  emailSendErrorLabel,
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

/** Pré-remplit l’e-mail client si la réservation est liée à un compte (pas walk-in caissier). */
function resolveDefaultReceiptEmail(
  detail: BookingAdminDetail,
  session: PosStoredSession | null,
): string {
  const sessionUserId = session?.user?.id?.trim();
  const clientId = detail.client.id?.trim();
  if (sessionUserId && clientId === sessionUserId) {
    return '';
  }
  return detail.client.email?.trim() || '';
}

function applyDefaultReceiptEmail(
  detail: BookingAdminDetail,
  setCustomerEmail: (value: string | ((current: string) => string)) => void,
): void {
  const session = getSession();
  setCustomerEmail((current) => current || resolveDefaultReceiptEmail(detail, session));
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
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailSendError, setEmailSendError] = useState<string | null>(null);
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [pdfDownloadError, setPdfDownloadError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

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
        applyDefaultReceiptEmail(detail, setCustomerEmail);

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
            applyDefaultReceiptEmail(refreshed, setCustomerEmail);
            setStatus('confirmed');
            setDisplaySubtitle(subtitle);
          } else {
            setStatus('pending');
            setDisplaySubtitle(timeoutSubtitle);
          }
          return;
        }

        setStatus('pending');
        setDisplaySubtitle(timeoutSubtitle);
      } catch {
        if (!cancelled) {
          setStatus('pending');
          setDisplaySubtitle(timeoutSubtitle);
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
      const session = getSession();
      const branding = await fetchPublicBranding({
        organizationSlug: session?.selectedOrganizationSlug ?? null,
      });
      if (cancelled) return;

      setReceiptData(
        buildReceiptData(
          bookingDetail!,
          session,
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
  const showPendingCancel =
    status === 'pending' &&
    Boolean(bookingId) &&
    (bookingDetail?.booking.status === 'pending_payment' || bookingDetail === null);

  async function handleEmailReceipt() {
    if (!bookingId || emailSending) return;

    if (!isValidEmail(customerEmail)) {
      setEmailError(emailInvalid);
      return;
    }

    setEmailError(null);
    setEmailSendError(null);
    setEmailSending(true);

    try {
      const result = await getApiClient().sendBookingReceiptEmail(bookingId, {
        to: customerEmail.trim(),
      });
      if (result.sent) {
        setEmailSent(true);
      } else {
        setEmailSent(false);
        setEmailSendError(emailSendErrorLabel);
      }
    } catch (error: unknown) {
      setEmailSent(false);
      setEmailSendError(saleApiErrorMessage(error, emailSendErrorLabel));
    } finally {
      setEmailSending(false);
    }
  }

  async function handleDownloadPdf() {
    if (!bookingId || pdfDownloading) return;

    setPdfDownloadError(null);
    setPdfDownloading(true);

    try {
      await downloadPosReceiptPdf(bookingId);
    } catch (error: unknown) {
      setPdfDownloadError(saleApiErrorMessage(error, downloadPdfErrorLabel));
    } finally {
      setPdfDownloading(false);
    }
  }

  async function handleCancelPending() {
    if (!bookingId || cancelling) return;

    setCancelling(true);
    setCancelError(null);
    setInfoMessage(null);

    try {
      const latest = await getApiClient().getBooking(bookingId);
      if (latest.booking.status === 'confirmed') {
        setBookingDetail(latest);
        applyDefaultReceiptEmail(latest, setCustomerEmail);
        setStatus('confirmed');
        setDisplaySubtitle(subtitle);
        setInfoMessage(confirmedMeanwhileLabel);
        return;
      }

      await cancelAbandonedPosBooking(bookingId, posAbandonCancelReasons.manualAfterTimeout);
      router.push('/');
    } catch (error: unknown) {
      try {
        const latest = await getApiClient().getBooking(bookingId);
        if (latest.booking.status === 'confirmed') {
          setBookingDetail(latest);
          applyDefaultReceiptEmail(latest, setCustomerEmail);
          setStatus('confirmed');
          setDisplaySubtitle(subtitle);
          setInfoMessage(confirmedMeanwhileLabel);
          return;
        }
      } catch {
        // keep cancel error below
      }
      setCancelError(saleApiErrorMessage(error, cancelPendingErrorLabel));
    } finally {
      setCancelling(false);
    }
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

        {status === 'pending' ? (
          <p className="mt-2 text-sm text-atg-muted">{timeoutHint}</p>
        ) : null}

        {infoMessage ? (
          <p className="mt-3 text-sm text-primary" role="status">
            {infoMessage}
          </p>
        ) : null}

        {cancelError ? (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {cancelError}
          </p>
        ) : null}

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
            <Button
              type="button"
              variant="outline"
              size="lg"
              fullWidth
              className="min-h-[3.5rem] text-lg"
              disabled={pdfDownloading || !bookingId}
              loading={pdfDownloading}
              onClick={() => void handleDownloadPdf()}
            >
              {pdfDownloading ? downloadPdfProcessingLabel : downloadPdfLabel}
            </Button>
            <p className="text-center text-xs text-atg-muted">{downloadPdfHint}</p>
            {pdfDownloadError ? (
              <p className="text-center text-sm text-red-600" role="alert">
                {pdfDownloadError}
              </p>
            ) : null}

            <div className="rounded-xl border border-atg-border bg-atg-elevated p-4">
              <label
                htmlFor="receipt-email"
                className="mb-2 block text-sm font-medium text-atg-fg"
              >
                {emailFieldLabel}
              </label>
              <input
                id="receipt-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={emailPlaceholder}
                value={customerEmail}
                disabled={emailSending}
                onChange={(event) => {
                  setCustomerEmail(event.target.value);
                  setEmailError(null);
                  setEmailSendError(null);
                  setEmailSent(false);
                }}
                className="min-h-[3rem] w-full rounded-lg border border-atg-border bg-atg-surface px-3 py-2 text-base text-atg-fg disabled:opacity-60"
              />
              {emailError ? (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {emailError}
                </p>
              ) : null}
              {emailSendError ? (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {emailSendError}
                </p>
              ) : null}
              <Button
                type="button"
                variant="outline"
                size="lg"
                fullWidth
                className="mt-3 min-h-[3.25rem] text-base"
                disabled={emailSending || !isValidEmail(customerEmail)}
                loading={emailSending}
                onClick={() => void handleEmailReceipt()}
              >
                {emailSending ? emailSendingLabel : emailReceiptLabel}
              </Button>
              {emailSent ? (
                <p className="mt-2 text-sm text-primary" role="status">
                  {emailSentHint}
                </p>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {showPendingCancel ? (
        <div className="pos-no-print pos-touch mt-8 w-full max-w-md space-y-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            fullWidth
            className="min-h-[3.5rem] text-lg"
            disabled={cancelling}
            loading={cancelling}
            onClick={() => void handleCancelPending()}
          >
            {cancelling ? cancelPendingProcessingLabel : cancelPendingLabel}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            fullWidth
            disabled={cancelling}
            onClick={() => router.refresh()}
          >
            {refreshLabel}
          </Button>
        </div>
      ) : null}

      <div className="pos-no-print pos-touch mt-10 flex w-full max-w-md flex-col gap-4 sm:flex-row">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          href="/sale"
          className="min-h-[3.5rem] text-lg"
          disabled={cancelling}
        >
          {newSaleLabel}
        </Button>
        <Button
          variant="outline"
          size="lg"
          fullWidth
          href="/"
          className="min-h-[3.5rem] text-lg"
          disabled={cancelling}
        >
          {backToHomeLabel}
        </Button>
      </div>
    </div>
  );
}
