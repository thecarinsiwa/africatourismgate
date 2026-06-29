'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { AlertDialog, Button, Card, Input, useToast } from '@africatourismgate/ui';
import type { BookingStatus } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';

type BookingAssistedApprovalPanelProps = {
  bookingId: string;
  status: BookingStatus;
  totalCents: number;
  currency: string;
  canApprove: boolean;
  onUpdated: () => Promise<void>;
};

export function BookingAssistedApprovalPanel({
  bookingId,
  status,
  totalCents,
  currency,
  canApprove,
  onUpdated,
}: BookingAssistedApprovalPanelProps) {
  const { bookings: getBookingsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.bookings.approval');
  const tActions = useTranslations('common.actions');
  const { toast } = useToast();
  const rejectReasonId = useId();
  const approveReasonId = useId();

  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [approveReason, setApproveReason] = useState('');
  const [adjustedTotal, setAdjustedTotal] = useState(() => (totalCents / 100).toFixed(2));

  useEffect(() => {
    setAdjustedTotal((totalCents / 100).toFixed(2));
  }, [totalCents]);

  if (!canApprove) {
    return null;
  }

  if (status !== 'pending_approval' && status !== 'pending_payment') {
    return null;
  }

  async function runAction(action: () => Promise<void>, onSuccess?: () => void) {
    setActionError(null);
    setLoading(true);
    try {
      await action();
      await onUpdated();
      onSuccess?.();
    } catch (error) {
      setActionError(getBookingsErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove() {
    const parsedTotal = Number.parseFloat(adjustedTotal.replace(',', '.'));
    const totalCentsOverride =
      Number.isFinite(parsedTotal) && parsedTotal > 0
        ? Math.round(parsedTotal * 100)
        : undefined;

    await runAction(
      async () => {
        await getApiClient().approveBooking(bookingId, {
          reason: approveReason.trim() || undefined,
          ...(totalCentsOverride !== undefined && totalCentsOverride !== totalCents
            ? { totalCents: totalCentsOverride }
            : {}),
        });
      },
      () => {
        setApproveDialogOpen(false);
        setApproveReason('');
        toast({ variant: 'success', message: t('approveSuccess') });
      },
    );
  }

  async function handleReject() {
    await runAction(
      async () => {
        await getApiClient().rejectBooking(bookingId, {
          reason: rejectReason.trim() || undefined,
        });
      },
      () => {
        setRejectDialogOpen(false);
        setRejectReason('');
        toast({ variant: 'success', message: t('rejectSuccess') });
      },
    );
  }

  async function handleInvitePayment() {
    await runAction(async () => {
      const session = await getApiClient().inviteBookingPayment(bookingId);
      toast({
        variant: 'success',
        message: t('inviteSuccess', { url: session.url }),
      });
    });
  }

  return (
    <>
      <Card variant="dashboard" padding="md" className="space-y-4 border-primary/20">
        <h2 className="text-lg font-semibold text-atg-fg">{t('title')}</h2>
        <p className="text-sm text-atg-muted">{t('intro')}</p>

        {actionError ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {actionError}
          </p>
        ) : null}

        {status === 'pending_approval' ? (
          <div className="space-y-4">
            <Input
              label={t('totalLabel', { currency })}
              name="adjustedTotal"
              type="text"
              inputMode="decimal"
              value={adjustedTotal}
              onChange={(e) => setAdjustedTotal(e.target.value)}
              hint={t('totalHint')}
            />
            <div>
              <label htmlFor={approveReasonId} className="mb-1 block text-sm font-medium text-atg-fg">
                {t('reasonLabel')}
              </label>
              <textarea
                id={approveReasonId}
                rows={2}
                value={approveReason}
                onChange={(e) => setApproveReason(e.target.value)}
                className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg"
                placeholder={t('reasonPlaceholder')}
              />
            </div>
            <div>
              <label htmlFor={rejectReasonId} className="mb-1 block text-sm font-medium text-atg-fg">
                {t('rejectReasonLabel')}
              </label>
              <textarea
                id={rejectReasonId}
                rows={2}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg"
                placeholder={t('rejectReasonPlaceholder')}
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                type="button"
                variant="primary"
                disabled={loading}
                onClick={() => setApproveDialogOpen(true)}
              >
                {t('approve')}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="!border-red-300 !text-red-700 hover:!bg-red-50 dark:!text-red-400"
                disabled={loading}
                onClick={() => setRejectDialogOpen(true)}
              >
                {t('reject')}
              </Button>
            </div>
          </div>
        ) : null}

        {status === 'pending_payment' ? (
          <Button
            type="button"
            variant="primary"
            disabled={loading}
            loading={loading}
            onClick={() => void handleInvitePayment()}
          >
            {t('invitePayment')}
          </Button>
        ) : null}
      </Card>

      <AlertDialog
        open={approveDialogOpen}
        onOpenChange={(open) => {
          if (!loading) setApproveDialogOpen(open);
        }}
        title={t('approveDialog.title')}
        description={t('approveDialog.description')}
        confirmLabel={t('approve')}
        cancelLabel={tActions('cancel')}
        loading={loading}
        onConfirm={() => void handleApprove()}
        onCancel={() => setApproveDialogOpen(false)}
      />

      <AlertDialog
        open={rejectDialogOpen}
        onOpenChange={(open) => {
          if (!loading) setRejectDialogOpen(open);
        }}
        title={t('rejectDialog.title')}
        description={
          rejectReason.trim()
            ? t('rejectDialog.descriptionWithReason', { reason: rejectReason.trim() })
            : t('rejectDialog.description')
        }
        confirmLabel={t('reject')}
        cancelLabel={tActions('cancel')}
        variant="danger"
        loading={loading}
        onConfirm={() => void handleReject()}
        onCancel={() => setRejectDialogOpen(false)}
      />
    </>
  );
}
