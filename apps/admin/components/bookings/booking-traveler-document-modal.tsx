'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  Button,
  DataTableBadge,
  Modal,
  Skeleton,
  Textarea,
  type DataTableBadgeVariant,
  useToast,
} from '@africatourismgate/ui';
import type {
  BookingIdentityDocument,
  BookingIdentityDocumentStatus,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { fetchBookingIdentityDocumentBlobAdmin } from '../../lib/booking-identity-documents';

const DOCUMENT_STATUS_VARIANTS: Record<
  BookingIdentityDocumentStatus,
  DataTableBadgeVariant
> = {
  pending_review: 'warning',
  approved: 'success',
  resubmit_requested: 'default',
  rejected: 'danger',
};

export type BookingTravelerDocumentModalProps = {
  bookingId: string;
  travelerName: string;
  travelerIndex: number;
  document: BookingIdentityDocument | null;
  canReview: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => Promise<void>;
};

export function BookingTravelerDocumentModal({
  bookingId,
  travelerName,
  travelerIndex,
  document,
  canReview,
  open,
  onOpenChange,
  onUpdated,
}: BookingTravelerDocumentModalProps) {
  const { bookings: getBookingsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.bookings.approval.documentModal');
  const tApproval = useTranslations('modules.bookings.approval');
  const tDoc = useTranslations('modules.bookings.identityDocuments');
  const tActions = useTranslations('common.actions');
  const { toast } = useToast();
  const emailNoteId = useId();
  const rejectNoteId = useId();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailNote, setEmailNote] = useState('');
  const [rejectNote, setRejectNote] = useState('');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const resetTransientState = useCallback(() => {
    setError(null);
    setEmailNote('');
    setRejectNote('');
    setRejectDialogOpen(false);
    setPreviewError(null);
  }, []);

  useEffect(() => {
    if (!open) {
      setPreviewUrl((current) => {
        if (current) {
          URL.revokeObjectURL(current);
        }
        return null;
      });
      setPreviewLoading(false);
      resetTransientState();
      return;
    }

    if (!document) {
      setPreviewUrl((current) => {
        if (current) {
          URL.revokeObjectURL(current);
        }
        return null;
      });
      setPreviewLoading(false);
      setPreviewError(null);
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;

    setPreviewLoading(true);
    setPreviewError(null);
    setPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return null;
    });

    void fetchBookingIdentityDocumentBlobAdmin(bookingId, document.id)
      .then((blob) => {
        if (cancelled) {
          return;
        }
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) {
          setPreviewError(t('previewError'));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setPreviewLoading(false);
        }
      });

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [bookingId, document, open, resetTransientState, t]);

  async function runAction(
    action: () => Promise<void>,
    successMessage: string,
    closeOnSuccess = false,
  ) {
    setError(null);
    setLoading(true);
    try {
      await action();
      await onUpdated();
      toast({ variant: 'success', message: successMessage });
      if (closeOnSuccess) {
        onOpenChange(false);
      }
    } catch (err) {
      setError(getBookingsErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestByEmail() {
    const name = travelerName.trim();
    if (!name) {
      setError(t('travelerNameRequired'));
      return;
    }

    await runAction(
      async () => {
        const result = await getApiClient().requestBookingIdentityDocumentUpload(bookingId, {
          travelerName: name,
          staffNote: emailNote.trim() || undefined,
          travelerIndex,
        });
        if (!result.sent) {
          throw new Error(t('emailNotSent'));
        }
      },
      t('requestByEmailSuccess'),
      true,
    );
  }

  async function handleApprove() {
    if (!document) {
      return;
    }

    await runAction(
      async () => {
        await getApiClient().approveBookingIdentityDocument(bookingId, document.id);
      },
      tDoc('approveSuccess'),
      true,
    );
  }

  async function handleRejectConfirm() {
    if (!document) {
      return false;
    }

    setError(null);
    setLoading(true);
    try {
      await getApiClient().rejectBookingIdentityDocument(bookingId, document.id, {
        staffNote: rejectNote.trim() || undefined,
      });
      await onUpdated();
      toast({ variant: 'success', message: t('rejectSuccess') });
      setRejectDialogOpen(false);
      onOpenChange(false);
      return true;
    } catch (err) {
      setError(getBookingsErrorMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  }

  const trimmedTravelerName = travelerName.trim() || tApproval('defaultTravelerName');
  const showReviewActions =
    canReview && document != null && document.status === 'pending_review';

  return (
    <>
      <Modal
        open={open}
        onOpenChange={(nextOpen) => {
          if (!loading) {
            onOpenChange(nextOpen);
          }
        }}
        title={t('title', { name: trimmedTravelerName })}
        description={t('description')}
        showClose
        className="flex max-h-[min(720px,90vh)] w-full max-w-2xl flex-col"
      >
        {error ? (
          <p role="alert" className="mb-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : null}

        {document ? (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <DataTableBadge variant={DOCUMENT_STATUS_VARIANTS[document.status]}>
              {tDoc(`statuses.${document.status}`)}
            </DataTableBadge>
            <span className="text-sm text-atg-muted">
              {tDoc(`types.${document.documentType}`)} · v{document.version}
            </span>
            <span className="truncate text-xs text-atg-muted">{document.originalFilename}</span>
          </div>
        ) : (
          <p className="mb-4 text-sm text-atg-muted">{t('empty')}</p>
        )}

        {document ? (
          <div className="mb-4 overflow-hidden rounded-lg border border-atg-border bg-atg-muted/10">
            {previewLoading ? (
              <div className="flex h-64 items-center justify-center p-4">
                <Skeleton className="h-full w-full rounded-lg" />
              </div>
            ) : previewError ? (
              <p className="p-6 text-sm text-red-600 dark:text-red-400" role="alert">
                {previewError}
              </p>
            ) : previewUrl ? (
              document.mimeType === 'application/pdf' ? (
                <iframe
                  src={previewUrl}
                  title={document.originalFilename}
                  className="h-[min(420px,50vh)] w-full bg-white"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt={document.originalFilename}
                  className="max-h-[min(420px,50vh)] w-full object-contain"
                />
              )
            ) : null}
          </div>
        ) : null}

        {!document || document.status === 'resubmit_requested' || document.status === 'rejected' ? (
          <div className="space-y-3 border-t border-atg-border pt-4">
            <Textarea
              id={emailNoteId}
              name="emailNote"
              label={t('emailNoteLabel')}
              rows={3}
              value={emailNote}
              onChange={(e) => setEmailNote(e.target.value)}
              placeholder={t('emailNotePlaceholder')}
              disabled={loading || !canReview}
            />
            {canReview ? (
              <Button
                type="button"
                variant="outline"
                disabled={loading || !trimmedTravelerName}
                loading={loading}
                onClick={() => void handleRequestByEmail()}
              >
                {t('requestByEmail')}
              </Button>
            ) : null}
          </div>
        ) : null}

        {document?.staffNote ? (
          <p className="mt-3 text-sm text-atg-muted">
            <span className="font-medium text-atg-fg">{tDoc('staffNoteLabel')} :</span>{' '}
            {document.staffNote}
          </p>
        ) : null}

        {showReviewActions ? (
          <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-atg-border pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => {
                setRejectNote('');
                setRejectDialogOpen(true);
              }}
            >
              {t('reject')}
            </Button>
            <Button type="button" disabled={loading} loading={loading} onClick={() => void handleApprove()}>
              {t('approve')}
            </Button>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={rejectDialogOpen}
        onOpenChange={(nextOpen) => {
          if (!loading) {
            setRejectDialogOpen(nextOpen);
          }
        }}
        title={t('rejectDialogTitle')}
        description={t('rejectDialogDescription')}
        showClose
        className="max-w-lg"
      >
        <Textarea
          id={rejectNoteId}
          name="rejectNote"
          label={t('rejectNoteLabel')}
          rows={3}
          value={rejectNote}
          onChange={(e) => setRejectNote(e.target.value)}
          placeholder={t('rejectNotePlaceholder')}
          disabled={loading}
        />
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => setRejectDialogOpen(false)}
          >
            {tActions('cancel')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="!text-red-600 hover:!bg-red-50 dark:!text-red-400"
            disabled={loading}
            loading={loading}
            onClick={() => void handleRejectConfirm()}
          >
            {t('reject')}
          </Button>
        </div>
      </Modal>
    </>
  );
}
