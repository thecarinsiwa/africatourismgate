'use client';

import { Button } from '@africatourismgate/ui';
import type { BookingIdentityDocument, BookingManifestEntry, BookingManifestSex, BookingStatus } from '@africatourismgate/types';
import { useCallback, useEffect, useId, useState } from 'react';
import { fetchBookingIdentityDocumentBlob } from '../../lib/api/booking-identity-documents';
import { getAccountApiClient } from '../../lib/api/account';
import { useTranslations } from '../../lib/i18n/locale-provider';

type FormState = {
  fullName: string;
  age: string;
  sex: '' | BookingManifestSex;
  nationality: string;
  idNumber: string;
  conditions: string;
  comment: string;
  other: string;
};

const EMPTY_FORM: FormState = {
  fullName: '',
  age: '',
  sex: '',
  nationality: '',
  idNumber: '',
  conditions: '',
  comment: '',
  other: '',
};

function entryToForm(entry: BookingManifestEntry): FormState {
  return {
    fullName: entry.fullName,
    age: entry.age != null ? String(entry.age) : '',
    sex: entry.sex ?? '',
    nationality: entry.nationality ?? '',
    idNumber: entry.idNumber ?? '',
    conditions: entry.conditions ?? '',
    comment: entry.comment ?? '',
    other: entry.other ?? '',
  };
}

function formToPayload(form: FormState) {
  const ageTrimmed = form.age.trim();
  const ageParsed = ageTrimmed ? Number.parseInt(ageTrimmed, 10) : undefined;
  return {
    fullName: form.fullName.trim(),
    age: ageParsed != null && !Number.isNaN(ageParsed) ? ageParsed : undefined,
    sex: form.sex || undefined,
    nationality: form.nationality.trim() || undefined,
    idNumber: form.idNumber.trim() || undefined,
    conditions: form.conditions.trim() || undefined,
    comment: form.comment.trim() || undefined,
    other: form.other.trim() || undefined,
  };
}

function canEditManifest(status: BookingStatus): boolean {
  return (
    status === 'pending_approval' ||
    status === 'pending_payment' ||
    status === 'confirmed'
  );
}

type Props = {
  bookingId: string;
  bookingStatus: BookingStatus;
};

export function AccountBookingManifestSection({ bookingId, bookingStatus }: Props) {
  const t = useTranslations();
  const m = t.account.reservations.detail.manifest;

  const conditionsId = useId();
  const commentId = useId();
  const otherId = useId();

  const [entries, setEntries] = useState<BookingManifestEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BookingManifestEntry | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<BookingManifestEntry | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  // Document viewer
  const [docsOpen, setDocsOpen] = useState(false);
  const [documents, setDocuments] = useState<BookingIdentityDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsError, setDocsError] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<BookingIdentityDocument | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  async function openDocs() {
    setDocsOpen(true);
    if (documents.length > 0) return;
    setDocsLoading(true);
    setDocsError(null);
    try {
      const client = await getAccountApiClient();
      const docs = await client.listBookingIdentityDocuments(bookingId);
      setDocuments(docs);
    } catch {
      setDocsError(m.docsLoadError);
    } finally {
      setDocsLoading(false);
    }
  }

  async function openPreview(doc: BookingIdentityDocument) {
    setPreviewDoc(doc);
    setPreviewLoading(true);
    try {
      const blob = await fetchBookingIdentityDocumentBlob(bookingId, doc.id);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch {
      setPreviewUrl(null);
    } finally {
      setPreviewLoading(false);
    }
  }

  function closePreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewDoc(null);
  }

  function closeDocs() {
    closePreview();
    setDocsOpen(false);
  }

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const client = await getAccountApiClient();
      const rows = await client.listBookingManifestEntries(bookingId);
      setEntries(rows);
    } catch {
      setLoadError(m.loadError);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [bookingId, m.loadError]);

  useEffect(() => {
    void load();
  }, [load]);

  const canWrite = canEditManifest(bookingStatus);

  function openCreate() {
    setEditingEntry(null);
    setForm(EMPTY_FORM);
    setActionError(null);
    setEditorOpen(true);
  }

  function openEdit(entry: BookingManifestEntry) {
    setEditingEntry(entry);
    setForm(entryToForm(entry));
    setActionError(null);
    setEditorOpen(true);
  }

  function closeEditor() {
    if (!saving) setEditorOpen(false);
  }

  async function handleSave() {
    if (!form.fullName.trim()) {
      setActionError(m.fullNameRequired);
      return;
    }
    setSaving(true);
    setActionError(null);
    try {
      const client = await getAccountApiClient();
      const payload = formToPayload(form);
      if (editingEntry) {
        await client.updateBookingManifestEntry(bookingId, editingEntry.id, payload);
      } else {
        await client.createBookingManifestEntry(bookingId, payload);
      }
      setEditorOpen(false);
      await load();
    } catch {
      setActionError(m.saveError);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(entry: BookingManifestEntry) {
    setDeletingId(entry.id);
    setActionError(null);
    try {
      const client = await getAccountApiClient();
      await client.removeBookingManifestEntry(bookingId, entry.id);
      setDeleteTarget(null);
      await load();
    } catch {
      setActionError(m.deleteError);
    } finally {
      setDeletingId(null);
    }
  }

  const sexLabel = (sex: BookingManifestSex | null | undefined) => {
    if (sex === 'M') return m.sex.M;
    if (sex === 'F') return m.sex.F;
    if (sex === 'other') return m.sex.other;
    return '—';
  };

  if (!canWrite && !loading && entries.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg border border-atg-border bg-atg-surface p-4 dark:border-atg-border dark:bg-white/5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-atg-fg">{m.title}</h3>
          <p className="mt-1 text-sm text-atg-muted">{m.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => void openDocs()}>
            {m.viewDocuments}
          </Button>
          {canWrite ? (
            <Button type="button" size="sm" onClick={openCreate}>
              {m.addTraveler}
            </Button>
          ) : null}
        </div>
      </div>

      {loadError ? (
        <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
          {loadError}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-4 text-sm text-atg-muted">{m.loading}</p>
      ) : entries.length === 0 ? (
        <p className="mt-4 text-sm text-atg-muted">{m.empty}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {entries.map((entry, index) => (
            <li
              key={entry.id}
              className="rounded-lg border border-atg-border bg-white/50 p-3 dark:bg-black/10"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-atg-fg">
                    <span className="mr-2 text-xs text-atg-muted tabular-nums">
                      {index + 1}.
                    </span>
                    {entry.fullName}
                  </p>
                  <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
                    {entry.age != null ? (
                      <div>
                        <dt className="text-xs text-atg-muted">{m.fields.age}</dt>
                        <dd className="text-atg-fg tabular-nums">{entry.age}</dd>
                      </div>
                    ) : null}
                    {entry.sex ? (
                      <div>
                        <dt className="text-xs text-atg-muted">{m.fields.sex}</dt>
                        <dd className="text-atg-fg">{sexLabel(entry.sex)}</dd>
                      </div>
                    ) : null}
                    {entry.nationality ? (
                      <div>
                        <dt className="text-xs text-atg-muted">{m.fields.nationality}</dt>
                        <dd className="text-atg-fg">{entry.nationality}</dd>
                      </div>
                    ) : null}
                    {entry.idNumber ? (
                      <div>
                        <dt className="text-xs text-atg-muted">{m.fields.idNumber}</dt>
                        <dd className="font-mono text-xs text-atg-fg">{entry.idNumber}</dd>
                      </div>
                    ) : null}
                    {entry.conditions ? (
                      <div className="col-span-2 sm:col-span-3">
                        <dt className="text-xs text-atg-muted">{m.fields.conditions}</dt>
                        <dd className="text-atg-fg">{entry.conditions}</dd>
                      </div>
                    ) : null}
                  </dl>
                </div>
                {canWrite ? (
                  <div className="flex gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(entry)}
                    >
                      {m.edit}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={deletingId === entry.id}
                      onClick={() => setDeleteTarget(entry)}
                      className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-950/40"
                    >
                      {deletingId === entry.id ? m.deleting : m.delete}
                    </Button>
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {actionError ? (
        <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
          {actionError}
        </p>
      ) : null}

      {editorOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={editingEntry ? m.editTitle : m.addTitle}
        >
          <div className="w-full max-w-xl rounded-xl border border-atg-border bg-atg-surface p-6 shadow-xl dark:border-atg-border dark:bg-atg-bg">
            <h2 className="text-lg font-semibold text-atg-fg">
              {editingEntry ? m.editTitle : m.addTitle}
            </h2>
            <p className="mt-1 text-sm text-atg-muted">{m.formHint}</p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-atg-fg" htmlFor="manifest-fullName">
                  {m.fields.fullName}
                  <span className="ml-1 text-red-500">*</span>
                </label>
                <input
                  id="manifest-fullName"
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-atg-border bg-transparent px-3 py-2 text-sm text-atg-fg dark:border-atg-border"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-atg-fg" htmlFor="manifest-age">
                  {m.fields.age}
                </label>
                <input
                  id="manifest-age"
                  type="number"
                  min={0}
                  max={150}
                  value={form.age}
                  onChange={(e) => setForm((prev) => ({ ...prev, age: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-atg-border bg-transparent px-3 py-2 text-sm text-atg-fg dark:border-atg-border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-atg-fg" htmlFor="manifest-sex">
                  {m.fields.sex}
                </label>
                <select
                  id="manifest-sex"
                  value={form.sex}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, sex: e.target.value as FormState['sex'] }))
                  }
                  className="mt-1 w-full rounded-lg border border-atg-border bg-transparent px-3 py-2 text-sm text-atg-fg dark:border-atg-border"
                >
                  <option value="">{m.sex.unspecified}</option>
                  <option value="M">{m.sex.M}</option>
                  <option value="F">{m.sex.F}</option>
                  <option value="other">{m.sex.other}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-atg-fg" htmlFor="manifest-nationality">
                  {m.fields.nationality}
                </label>
                <input
                  id="manifest-nationality"
                  type="text"
                  value={form.nationality}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, nationality: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-atg-border bg-transparent px-3 py-2 text-sm text-atg-fg dark:border-atg-border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-atg-fg" htmlFor="manifest-idNumber">
                  {m.fields.idNumber}
                </label>
                <input
                  id="manifest-idNumber"
                  type="text"
                  value={form.idNumber}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, idNumber: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-atg-border bg-transparent px-3 py-2 text-sm font-mono text-atg-fg dark:border-atg-border"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-atg-fg" htmlFor={conditionsId}>
                  {m.fields.conditions}
                </label>
                <textarea
                  id={conditionsId}
                  rows={2}
                  value={form.conditions}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, conditions: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-atg-border bg-transparent px-3 py-2 text-sm text-atg-fg dark:border-atg-border"
                  placeholder={m.fields.conditionsPlaceholder}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-atg-fg" htmlFor={commentId}>
                  {m.fields.comment}
                </label>
                <textarea
                  id={commentId}
                  rows={2}
                  value={form.comment}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, comment: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-atg-border bg-transparent px-3 py-2 text-sm text-atg-fg dark:border-atg-border"
                  placeholder={m.fields.commentPlaceholder}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-atg-fg" htmlFor={otherId}>
                  {m.fields.other}
                </label>
                <textarea
                  id={otherId}
                  rows={2}
                  value={form.other}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, other: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-atg-border bg-transparent px-3 py-2 text-sm text-atg-fg dark:border-atg-border"
                  placeholder={m.fields.otherPlaceholder}
                />
              </div>
            </div>

            {actionError ? (
              <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
                {actionError}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={closeEditor}
              >
                {m.cancel}
              </Button>
              <Button
                type="button"
                disabled={saving}
                onClick={() => void handleSave()}
              >
                {saving ? m.saving : m.save}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-xl border border-atg-border bg-atg-surface p-6 shadow-xl dark:border-atg-border dark:bg-atg-bg">
            <h2 className="text-base font-semibold text-atg-fg">{m.deleteTitle}</h2>
            <p className="mt-2 text-sm text-atg-muted">
              {m.deleteDescription.replace('{name}', deleteTarget.fullName)}
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={Boolean(deletingId)}
                onClick={() => setDeleteTarget(null)}
              >
                {m.cancel}
              </Button>
              <Button
                type="button"
                disabled={Boolean(deletingId)}
                onClick={() => void handleDelete(deleteTarget)}
                className="bg-red-600 hover:bg-red-700 text-white border-red-600"
              >
                {deletingId ? m.deleting : m.delete}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Documents modal */}
      {docsOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          onClick={closeDocs}
        >
          <div
            className="flex w-full max-w-lg flex-col rounded-xl border border-atg-border bg-atg-surface shadow-xl dark:border-atg-border dark:bg-atg-bg"
            style={{ maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-atg-border px-5 py-4 dark:border-atg-border">
              <h2 className="text-base font-semibold text-atg-fg">{m.docsTitle}</h2>
              <button
                type="button"
                onClick={closeDocs}
                className="flex h-8 w-8 items-center justify-center rounded-full text-atg-muted hover:bg-atg-surface hover:text-atg-fg"
                aria-label={m.cancel}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {docsLoading ? (
                <p className="text-sm text-atg-muted">{m.loading}</p>
              ) : docsError ? (
                <p className="text-sm text-red-600 dark:text-red-400">{docsError}</p>
              ) : documents.length === 0 ? (
                <p className="text-sm text-atg-muted">{m.docsEmpty}</p>
              ) : (
                <ul className="space-y-3">
                  {documents.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex items-center gap-3 rounded-lg border border-atg-border bg-white/50 px-3 py-3 dark:bg-black/10"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-atg-fg">{doc.originalFilename}</p>
                        <p className="text-xs text-atg-muted">
                          {doc.documentType} · v{doc.version}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={previewLoading && previewDoc?.id === doc.id}
                        onClick={() => void openPreview(doc)}
                      >
                        {previewLoading && previewDoc?.id === doc.id ? m.loading : m.viewDocument}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Preview inline */}
              {previewDoc && (
                <div className="mt-4 overflow-hidden rounded-lg border border-atg-border dark:border-atg-border">
                  <div className="flex items-center justify-between border-b border-atg-border bg-atg-elevated px-3 py-2 dark:border-atg-border dark:bg-white/5">
                    <span className="truncate text-xs text-atg-muted">{previewDoc.originalFilename}</span>
                    <button
                      type="button"
                      onClick={closePreview}
                      className="ml-2 shrink-0 text-xs text-atg-muted hover:text-atg-fg"
                    >
                      ✕
                    </button>
                  </div>
                  {previewLoading ? (
                    <div className="flex h-48 items-center justify-center">
                      <p className="text-sm text-atg-muted">{m.loading}</p>
                    </div>
                  ) : previewUrl ? (
                    previewDoc.mimeType === 'application/pdf' ? (
                      <iframe
                        src={previewUrl}
                        title={previewDoc.originalFilename}
                        className="h-96 w-full"
                      />
                    ) : (
                      <img
                        src={previewUrl}
                        alt={previewDoc.originalFilename}
                        className="max-h-96 w-full object-contain"
                      />
                    )
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
