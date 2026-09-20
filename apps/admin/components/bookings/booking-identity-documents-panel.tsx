'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Card, Input, Modal, useToast } from '@africatourismgate/ui';
import type {
  BookingIdentityDocument,
  BookingManifestEntry,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { fetchBookingIdentityDocumentBlobAdmin } from '../../lib/booking-identity-documents';
import {
  documentsForManifestEntry,
  unlinkedIdentityDocuments,
} from '../../lib/booking-traveler-documents';

type Props = {
  bookingId: string;
  documents: BookingIdentityDocument[];
  canReview: boolean;
  onUpdated: () => Promise<void>;
  embedded?: boolean;
};

export function BookingIdentityDocumentsPanel({
  bookingId,
  documents,
  canReview,
  onUpdated,
  embedded = false,
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
  const [entries, setEntries] = useState<BookingManifestEntry[]>([]);

  const loadEntries = useCallback(async () => {
    try {
      const rows = await getApiClient().listBookingManifestEntries(bookingId);
      setEntries(rows);
    } catch {
      setEntries([]);
    }
  }, [bookingId]);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries, documents]);

  const groups = useMemo(() => {
    const travelerGroups = entries.map((entry) => ({
      key: entry.id,
      label: entry.fullName,
      docs: documentsForManifestEntry(documents, entry.id),
    }));
    const orphans = unlinkedIdentityDocuments(documents);
    return { travelerGroups, orphans };
  }, [documents, entries]);

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

  function renderDoc(doc: BookingIdentityDocument) {
    return (
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
                    void runAction(async () => {
                      await getApiClient().approveBookingIdentityDocument(
                        bookingId,
                        doc.id,
                      );
                    }, t('approveSuccess'))
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
    );
  }

  const hasContent =
    entries.length > 0 || documents.length > 0;

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

      {!hasContent ? (
        <p className="text-sm text-atg-muted">{t('empty')}</p>
      ) : entries.length > 0 || groups.orphans.length > 0 ? (
        <div className="space-y-5">
          {groups.travelerGroups.map((group, index) => (
            <div key={group.key} className="space-y-2">
              <p className="text-sm font-semibold text-atg-fg">
                <span className="mr-2 text-xs font-normal text-atg-muted tabular-nums">
                  {index + 1}.
                </span>
                {group.label}
              </p>
              {group.docs.length === 0 ? (
                <p className="text-sm text-atg-muted">{t('travelerEmpty')}</p>
              ) : (
                <ul className="space-y-3">{group.docs.map(renderDoc)}</ul>
              )}
            </div>
          ))}
          {groups.orphans.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-atg-fg">{t('unlinkedTitle')}</p>
              <ul className="space-y-3">{groups.orphans.map(renderDoc)}</ul>
            </div>
          ) : null}
        </div>
      ) : (
        <ul className="space-y-3">{documents.map(renderDoc)}</ul>
      )}

      <Modal
        open={Boolean(resubmitDoc)}
        onOpenChange={(open) => {
          if (!loading && !open) setResubmitDoc(null);
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
            onClick={() => setResubmitDoc(null)}
          >
            {tActions('cancel')}
          </Button>
          <Button
            type="button"
            disabled={!staffNote.trim() || loading}
            onClick={() => {
              if (!resubmitDoc) return;
              void runAction(async () => {
                await getApiClient().requestBookingIdentityDocumentResubmit(
                  bookingId,
                  resubmitDoc.id,
                  { staffNote: staffNote.trim() },
                );
                setResubmitDoc(null);
                setStaffNote('');
              }, t('resubmitSuccess'));
            }}
          >
            {t('resubmitConfirm')}
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
