'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Card, Input, Modal, useToast } from '@africatourismgate/ui';
import type { BookingPaymentProof } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { fetchBookingPaymentProofBlobAdmin } from '../../lib/booking-payment-proofs';
import { formatMoney } from '../../lib/format-money';

type Props = {
  bookingId: string;
  proofs: BookingPaymentProof[];
  currency: string;
  canReview: boolean;
  onUpdated: () => Promise<void>;
  embedded?: boolean;
};

export function BookingPaymentProofsPanel({
  bookingId,
  proofs,
  currency,
  canReview,
  onUpdated,
  embedded = false,
}: Props) {
  const { bookings: getBookingsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.bookings.paymentProofs');
  const tActions = useTranslations('common.actions');
  const { toast } = useToast();
  const noteId = useId();

  const [loading, setLoading] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [resubmitProof, setResubmitProof] = useState<BookingPaymentProof | null>(
    null,
  );
  const [rejectProof, setRejectProof] = useState<BookingPaymentProof | null>(null);
  const [staffNote, setStaffNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const sorted = useMemo(
    () =>
      [...proofs].sort(
        (a, b) =>
          a.paymentMethod.localeCompare(b.paymentMethod) ||
          b.version - a.version,
      ),
    [proofs],
  );

  async function runAction(action: () => Promise<void>, successMessage: string) {
    setError(null);
    setLoading(true);
    try {
      await action();
      await onUpdated();
      toast({ variant: 'success', message: successMessage });
    } catch (err) {
      setError(getBookingsErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleView(proof: BookingPaymentProof) {
    setViewingId(proof.id);
    try {
      const blob = await fetchBookingPaymentProofBlobAdmin(bookingId, proof.id);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      setError(getBookingsErrorMessage(err));
    } finally {
      setViewingId(null);
    }
  }

  const content = (
    <>
      {embedded ? null : (
        <div>
          <h2 className="text-lg font-semibold text-atg-fg">{t('title')}</h2>
          <p className="mt-1 text-sm text-atg-muted">{t('subtitle')}</p>
        </div>
      )}

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      {sorted.length === 0 ? (
        <p className="text-sm text-atg-muted">{t('empty')}</p>
      ) : (
        <ul className="space-y-3">
          {sorted.map((proof) => (
            <li
              key={proof.id}
              className="rounded-lg border border-atg-border bg-atg-surface/50 p-3 dark:bg-black/10"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-atg-fg">
                    {t(`methods.${proof.paymentMethod}`)} · v{proof.version}
                  </p>
                  <p className="truncate text-xs text-atg-muted">
                    {proof.originalFilename}
                  </p>
                  <p className="mt-1 text-sm">
                    {t('statusLabel')}: {t(`statuses.${proof.status}`)}
                  </p>
                  {proof.amountCents != null ? (
                    <p className="mt-1 text-sm text-atg-fg">
                      {t('amountLabel')}: {formatMoney(proof.amountCents, currency)}
                    </p>
                  ) : null}
                  {proof.staffNote ? (
                    <p className="mt-2 text-sm text-atg-muted">{proof.staffNote}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={viewingId === proof.id || loading}
                    onClick={() => void handleView(proof)}
                  >
                    {viewingId === proof.id ? t('viewing') : t('view')}
                  </Button>
                  {canReview &&
                  (proof.status === 'pending_review' ||
                    proof.status === 'resubmit_requested') ? (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        disabled={loading}
                        onClick={() =>
                          void runAction(
                            async () => {
                              await getApiClient().approveBookingPaymentProof(
                                bookingId,
                                proof.id,
                              );
                            },
                            t('approveSuccess'),
                          )
                        }
                      >
                        {t('approve')}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={loading}
                        onClick={() => {
                          setResubmitProof(proof);
                          setStaffNote('');
                        }}
                      >
                        {t('requestResubmit')}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={loading}
                        className="!text-red-600"
                        onClick={() => {
                          setRejectProof(proof);
                          setStaffNote('');
                        }}
                      >
                        {t('reject')}
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={Boolean(resubmitProof)}
        onOpenChange={(open) => {
          if (!loading && !open) setResubmitProof(null);
        }}
        title={t('resubmitDialogTitle')}
        description={t('resubmitDialogDescription')}
        showClose
      >
        <label className="block text-sm" htmlFor={noteId}>
          <span className="font-medium text-atg-fg">{t('staffNoteLabel')}</span>
          <Input
            id={noteId}
            className="mt-1"
            value={staffNote}
            onChange={(e) => setStaffNote(e.target.value)}
            placeholder={t('staffNotePlaceholder')}
          />
        </label>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => setResubmitProof(null)}
          >
            {tActions('cancel')}
          </Button>
          <Button
            type="button"
            disabled={!staffNote.trim() || loading}
            onClick={() => {
              if (!resubmitProof) return;
              void runAction(
                async () => {
                  await getApiClient().requestBookingPaymentProofResubmit(
                    bookingId,
                    resubmitProof.id,
                    { staffNote: staffNote.trim() },
                  );
                },
                t('resubmitSuccess'),
              ).then(() => setResubmitProof(null));
            }}
          >
            {t('resubmitConfirm')}
          </Button>
        </div>
      </Modal>

      <Modal
        open={Boolean(rejectProof)}
        onOpenChange={(open) => {
          if (!loading && !open) setRejectProof(null);
        }}
        title={t('rejectDialogTitle')}
        description={t('rejectDialogDescription')}
        showClose
      >
        <label className="block text-sm" htmlFor={`${noteId}-reject`}>
          <span className="font-medium text-atg-fg">{t('staffNoteLabel')}</span>
          <Input
            id={`${noteId}-reject`}
            className="mt-1"
            value={staffNote}
            onChange={(e) => setStaffNote(e.target.value)}
            placeholder={t('staffNotePlaceholder')}
          />
        </label>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => setRejectProof(null)}
          >
            {tActions('cancel')}
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={loading}
            onClick={() => {
              if (!rejectProof) return;
              void runAction(
                async () => {
                  await getApiClient().rejectBookingPaymentProof(
                    bookingId,
                    rejectProof.id,
                    { staffNote: staffNote.trim() || undefined },
                  );
                },
                t('rejectSuccess'),
              ).then(() => setRejectProof(null));
            }}
          >
            {t('rejectConfirm')}
          </Button>
        </div>
      </Modal>
    </>
  );

  if (embedded) {
    return <div className="space-y-4">{content}</div>;
  }

  return (
    <Card variant="dashboard" padding="md" className="space-y-4">
      {content}
    </Card>
  );
}
