'use client';

import { Button } from '@africatourismgate/ui';
import type {
  BookingIdentityDocument,
  BookingIdentityDocumentType,
  BookingStatus,
} from '@africatourismgate/types';
import { useMemo, useRef, useState } from 'react';
import {
  fetchBookingIdentityDocumentBlob,
  uploadBookingIdentityDocument,
} from '../../lib/api/booking-identity-documents';
import { useTranslations } from '../../lib/i18n/locale-provider';

const DOCUMENT_TYPES: BookingIdentityDocumentType[] = [
  'passport',
  'national_id',
  'drivers_license',
  'other',
];

const ALLOWED_ACCEPT = 'image/jpeg,image/png,image/webp,application/pdf';
const MAX_BYTES = 10 * 1024 * 1024;

function latestDocumentsByType(
  documents: BookingIdentityDocument[],
): BookingIdentityDocument[] {
  const map = new Map<BookingIdentityDocumentType, BookingIdentityDocument>();
  for (const doc of documents) {
    const prev = map.get(doc.documentType);
    if (!prev || doc.version > prev.version) {
      map.set(doc.documentType, doc);
    }
  }
  return [...map.values()].sort((a, b) =>
    a.documentType.localeCompare(b.documentType),
  );
}

function canUploadForStatus(status: BookingStatus): boolean {
  return (
    status === 'pending_approval' ||
    status === 'pending_payment' ||
    status === 'confirmed'
  );
}

function canUploadNewVersion(doc: BookingIdentityDocument | undefined): boolean {
  if (!doc) return true;
  if (doc.status === 'pending_review') return false;
  return doc.status === 'resubmit_requested' || doc.status === 'rejected';
}

type Props = {
  bookingId: string;
  bookingStatus: BookingStatus;
  documents: BookingIdentityDocument[];
  onUpdated: () => Promise<void>;
};

export function BookingIdentityDocumentsSection({
  bookingId,
  bookingStatus,
  documents,
  onUpdated,
}: Props) {
  const t = useTranslations();
  const id = t.account.reservations.detail.identityDocuments;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documentType, setDocumentType] =
    useState<BookingIdentityDocumentType>('passport');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const latest = useMemo(() => latestDocumentsByType(documents), [documents]);
  const showUpload = canUploadForStatus(bookingStatus);

  async function handleUpload(file: File) {
    if (file.size > MAX_BYTES) {
      setError(id.fileTooLarge);
      return;
    }
    setUploading(true);
    setError(null);
    try {
      await uploadBookingIdentityDocument(bookingId, file, documentType);
      await onUpdated();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : id.uploadError);
    } finally {
      setUploading(false);
    }
  }

  async function handleView(doc: BookingIdentityDocument) {
    setViewingId(doc.id);
    try {
      const blob = await fetchBookingIdentityDocumentBlob(bookingId, doc.id);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setError(id.viewError);
    } finally {
      setViewingId(null);
    }
  }

  if (!showUpload && latest.length === 0) {
    return null;
  }

  const typeLabel = (type: BookingIdentityDocumentType) => id.types[type];
  const statusLabel = (status: BookingIdentityDocument['status']) => id.statuses[status];

  return (
    <section className="rounded-lg border border-atg-border bg-atg-surface p-4 dark:border-atg-border dark:bg-white/5">
      <h3 className="text-base font-semibold text-atg-fg">{id.title}</h3>
      <p className="mt-1 text-sm text-atg-muted">{id.subtitle}</p>

      {latest.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {latest.map((doc) => (
            <li
              key={doc.id}
              className="rounded-lg border border-atg-border bg-white/50 p-3 dark:bg-black/10"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-atg-fg">{typeLabel(doc.documentType)}</p>
                  <p className="text-xs text-atg-muted">
                    {doc.originalFilename} · v{doc.version}
                  </p>
                  <p className="mt-1 text-sm">
                    <span className="font-medium">{id.statusLabel} : </span>
                    {statusLabel(doc.status)}
                  </p>
                  {doc.staffNote ? (
                    <p className="mt-2 rounded-md bg-amber-50 px-2 py-1 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                      {doc.staffNote}
                    </p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={viewingId === doc.id}
                  onClick={() => void handleView(doc)}
                >
                  {viewingId === doc.id ? id.viewing : id.view}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-atg-muted">{id.empty}</p>
      )}

      {showUpload && canUploadNewVersion(latest.find((d) => d.documentType === documentType)) ? (
        <form
          className="mt-4 space-y-3 border-t border-atg-border pt-4"
          onSubmit={(e) => {
            e.preventDefault();
            const file = fileInputRef.current?.files?.[0];
            if (file) void handleUpload(file);
          }}
        >
          <label className="block text-sm">
            <span className="font-medium text-atg-fg">{id.documentType}</span>
            <select
              className="mt-1 w-full rounded-lg border border-atg-border bg-transparent px-3 py-2 text-sm dark:border-atg-border"
              value={documentType}
              onChange={(e) =>
                setDocumentType(e.target.value as BookingIdentityDocumentType)
              }
            >
              {DOCUMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {typeLabel(type)}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-atg-fg">{id.file}</span>
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_ACCEPT}
              className="mt-1 block w-full text-sm text-atg-muted file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
              required
            />
            <span className="mt-1 block text-xs text-atg-muted">{id.fileHint}</span>
          </label>
          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={uploading}>
            {uploading ? id.uploading : id.upload}
          </Button>
        </form>
      ) : null}
    </section>
  );
}
