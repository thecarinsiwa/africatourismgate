'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { AlertDialog, Button, Card, Input, useToast } from '@africatourismgate/ui';
import type { BookingIdentityDocument } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { fetchBookingIdentityDocumentBlobAdmin } from '../../lib/booking-identity-documents';

type Props = {
  bookingId: string;
  documents: BookingIdentityDocument[];
  canReview: boolean;
  onUpdated: () => Promise<void>;
};

export function BookingIdentityDocumentsPanel({
  bookingId,
  documents,
  canReview,
  onUpdated,
}: Props) {
  const { bookings: getBookingsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.bookings.identityDocuments');
  const tActions = useTranslations('common.actions');
  const { toast } = useToast();
  const noteId = useId();

  const [loading, setLoading] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [resubmitDoc, setResubmitDoc] = useState<BookingIdentityDocument | null>(null);
  const [staffNote, setStaffNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const sorted = useMemo(
    () =>
      [...documents].sort(
        (a, b) =>
          a.documentType.localeCompare(b.documentType) || b.version - a.version,
      ),
    [documents],
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

  async function handleView(doc: BookingIdentityDocument) {
    setViewingId(doc.id);
    try {
      const blob = await fetchBookingIdentityDocumentBlobAdmin(bookingId, doc.id);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      setError(getBookingsErrorMessage(err));
    } finally {
      setViewingId(null);
    }
  }

  return (
    <Card variant="dashboard" padding="md" className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-atg-fg">{t('title')}</h2>
        <p className="mt-1 text-sm text-atg-muted">{t('subtitle')}</p>
      </div>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      {sorted.length === 0 ? (
        <p className="text-sm text-atg-muted">{t('empty')}</p>
      ) : (
        <ul className="space-y-3">
          {sorted.map((doc) => (
            <li
              key={doc.id}
              className="rounded-lg border border-atg-border bg-atg-surface/50 p-3 dark:bg-black/10"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-atg-fg">
                    {t(`types.${doc.documentType}`)} · v{doc.version}
                  </p>
                  <p className="truncate text-xs text-atg-muted">{doc.originalFilename}</p>
                  <p className="mt-1 text-sm">
                    {t('statusLabel')}: {t(`statuses.${doc.status}`)}
                  </p>
                  {doc.staffNote ? (
                    <p className="mt-2 text-sm text-atg-muted">{doc.staffNote}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={viewingId === doc.id || loading}
                    onClick={() => void handleView(doc)}
                  >
                    {viewingId === doc.id ? t('viewing') : t('view')}
                  </Button>
                  {canReview && doc.status === 'pending_review' ? (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        disabled={loading}
                        onClick={() =>
                          void runAction(
                            () =>
                              getApiClient().approveBookingIdentityDocument(
                                bookingId,
                                doc.id,
                              ),
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
                          setResubmitDoc(doc);
                          setStaffNote('');
                        }}
                      >
                        {t('requestResubmit')}
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AlertDialog
        open={Boolean(resubmitDoc)}
        onOpenChange={(open) => {
          if (!open) setResubmitDoc(null);
        }}
        title={t('resubmitDialogTitle')}
        description={t('resubmitDialogDescription')}
        confirmLabel={t('resubmitConfirm')}
        cancelLabel={tActions('cancel')}
        confirmDisabled={!staffNote.trim() || loading}
        onConfirm={() => {
          if (!resubmitDoc) return;
          void runAction(
            async () => {
              await getApiClient().requestBookingIdentityDocumentResubmit(
                bookingId,
                resubmitDoc.id,
                { staffNote: staffNote.trim() },
              );
              setResubmitDoc(null);
              setStaffNote('');
            },
            t('resubmitSuccess'),
          );
        }}
      >
        <label className="mt-4 block text-sm" htmlFor={noteId}>
          <span className="font-medium text-atg-fg">{t('staffNoteLabel')}</span>
          <Input
            id={noteId}
            className="mt-1"
            value={staffNote}
            onChange={(e) => setStaffNote(e.target.value)}
            placeholder={t('staffNotePlaceholder')}
          />
        </label>
      </AlertDialog>
    </Card>
  );
}
