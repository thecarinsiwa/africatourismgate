'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  AlertDialog,
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  Input,
  Modal,
  Select,
  Skeleton,
  useToast,
  type ColumnDef,
} from '@africatourismgate/ui';
import type {
  BookingManifestEntry,
  BookingManifestSex,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';

type FormState = {
  fullName: string;
  age: string;
  sex: '' | BookingManifestSex;
  price: string;
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
  price: '',
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
    price: entry.priceCents != null ? (entry.priceCents / 100).toFixed(2) : '',
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
  const priceTrimmed = form.price.trim();
  const priceParsed = priceTrimmed
    ? Math.round(Number.parseFloat(priceTrimmed.replace(',', '.')) * 100)
    : undefined;
  return {
    fullName: form.fullName.trim(),
    age: ageParsed != null && !Number.isNaN(ageParsed) ? ageParsed : undefined,
    sex: form.sex || undefined,
    priceCents:
      priceParsed != null && !Number.isNaN(priceParsed) && priceParsed >= 0
        ? priceParsed
        : undefined,
    nationality: form.nationality.trim() || undefined,
    idNumber: form.idNumber.trim() || undefined,
    conditions: form.conditions.trim() || undefined,
    comment: form.comment.trim() || undefined,
    other: form.other.trim() || undefined,
  };
}

type Props = {
  bookingId: string;
  canWrite: boolean;
  suggestedCount?: number;
  syncKey?: number;
  onChanged?: () => void;
};

export function BookingManifestSection({
  bookingId,
  canWrite,
  suggestedCount = 0,
  syncKey = 0,
  onChanged,
}: Props) {
  const { bookings: getBookingsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.bookings.manifest');
  const tCommon = useTranslations('modules.common');
  const tActions = useTranslations('common.actions');
  const { toast } = useToast();

  const conditionsId = useId();
  const commentId = useId();
  const otherId = useId();

  const [entries, setEntries] = useState<BookingManifestEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BookingManifestEntry | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<BookingManifestEntry | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await getApiClient().listBookingManifestEntries(bookingId);
      setEntries(rows);
    } catch (err) {
      setError(getBookingsErrorMessage(err));
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [bookingId, getBookingsErrorMessage]);

  useEffect(() => {
    void load();
  }, [load, syncKey]);

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

  async function handleSave() {
    if (!form.fullName.trim()) {
      setActionError(t('fullNameRequired'));
      return;
    }
    setSaving(true);
    setActionError(null);
    try {
      const payload = formToPayload(form);
      if (editingEntry) {
        await getApiClient().updateBookingManifestEntry(
          bookingId,
          editingEntry.id,
          payload,
        );
        toast({ variant: 'success', message: t('updateSuccess') });
      } else {
        await getApiClient().createBookingManifestEntry(bookingId, payload);
        toast({ variant: 'success', message: t('createSuccess') });
      }
      setEditorOpen(false);
      await load();
      onChanged?.();
    } catch (err) {
      setActionError(getBookingsErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    setActionError(null);
    try {
      await getApiClient().removeBookingManifestEntry(bookingId, deleteTarget.id);
      setDeleteTarget(null);
      toast({ variant: 'success', message: t('deleteSuccess') });
      await load();
      onChanged?.();
    } catch (err) {
      setActionError(getBookingsErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  const sexLabel = (sex: BookingManifestSex | null | undefined) => {
    if (!sex) return tCommon('empty.dash');
    return t(`sex.${sex}`);
  };

  const columns = useMemo<ColumnDef<BookingManifestEntry, unknown>[]>(
    () => [
      {
        accessorKey: 'sortOrder',
        header: '#',
        cell: ({ row }) => (
          <span className="tabular-nums text-atg-muted">{row.index + 1}</span>
        ),
      },
      {
        accessorKey: 'fullName',
        header: t('columns.fullName'),
        cell: ({ row }) => (
          <span className="font-medium text-atg-fg">{row.original.fullName}</span>
        ),
      },
      {
        accessorKey: 'age',
        header: t('columns.age'),
        cell: ({ row }) => (
          <span className="tabular-nums">
            {row.original.age ?? tCommon('empty.dash')}
          </span>
        ),
      },
      {
        accessorKey: 'sex',
        header: t('columns.sex'),
        cell: ({ row }) => sexLabel(row.original.sex),
      },
      {
        accessorKey: 'nationality',
        header: t('columns.nationality'),
        cell: ({ row }) => row.original.nationality ?? tCommon('empty.dash'),
      },
      {
        accessorKey: 'idNumber',
        header: t('columns.idNumber'),
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {row.original.idNumber ?? tCommon('empty.dash')}
          </span>
        ),
      },
      {
        accessorKey: 'priceCents',
        header: t('columns.price'),
        cell: ({ row }) => (
          <span className="tabular-nums">
            {row.original.priceCents != null
              ? (row.original.priceCents / 100).toFixed(2)
              : tCommon('empty.dash')}
          </span>
        ),
      },
      {
        accessorKey: 'conditions',
        header: t('columns.conditions'),
        cell: ({ row }) => (
          <span className="line-clamp-2 max-w-[12rem] text-sm text-atg-muted">
            {row.original.conditions ?? tCommon('empty.dash')}
          </span>
        ),
      },
      ...(canWrite
        ? [
            {
              id: 'actions',
              header: tCommon('columns.actions'),
              meta: { align: 'right' as const },
              cell: ({ row }: { row: { original: BookingManifestEntry } }) => (
                <DataTableActions>
                  <DataTableActionButton
                    action="edit"
                    label={tActions('edit')}
                    onClick={() => openEdit(row.original)}
                  />
                  <DataTableActionButton
                    action="delete"
                    label={tActions('delete')}
                    onClick={() => setDeleteTarget(row.original)}
                    disabled={deletingId === row.original.id}
                    loading={deletingId === row.original.id}
                  />
                </DataTableActions>
              ),
            } satisfies ColumnDef<BookingManifestEntry, unknown>,
          ]
        : []),
    ],
    [canWrite, deletingId, t, tActions, tCommon],
  );

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-atg-fg">{t('title')}</h2>
          <p className="mt-1 text-sm text-atg-muted">{t('subtitle')}</p>
          {suggestedCount > 0 ? (
            <p className="mt-1 text-xs text-atg-muted">
              {t('suggestedCount', { count: suggestedCount })}
            </p>
          ) : null}
        </div>
        {canWrite ? (
          <Button type="button" size="sm" onClick={openCreate}>
            {t('addTraveler')}
          </Button>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}

      {loading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : (
        <Card variant="dashboard" padding="none" className="overflow-hidden">
          <DataTable
            columns={columns}
            data={entries}
            emptyMessage={t('empty')}
            getRowId={(row) => row.id}
            aria-label={t('tableAria')}
          />
        </Card>
      )}

      <Modal
        open={editorOpen}
        onOpenChange={(open) => {
          if (!saving) setEditorOpen(open);
        }}
        title={editingEntry ? t('editTitle') : t('addTitle')}
        description={t('formHint')}
        showClose
        className="max-w-2xl"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            className="sm:col-span-2"
            label={t('fields.fullName')}
            name="fullName"
            value={form.fullName}
            onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
            required
          />
          <Input
            label={t('fields.age')}
            name="age"
            type="number"
            min={0}
            max={150}
            value={form.age}
            onChange={(e) => setForm((prev) => ({ ...prev, age: e.target.value }))}
          />
          <Select
            label={t('fields.sex')}
            value={form.sex}
            options={[
              { value: '', label: t('sex.unspecified') },
              { value: 'M', label: t('sex.M') },
              { value: 'F', label: t('sex.F') },
              { value: 'other', label: t('sex.other') },
            ]}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                sex: e.target.value as FormState['sex'],
              }))
            }
          />
          <Input
            label={t('fields.price')}
            name="price"
            type="text"
            inputMode="decimal"
            value={form.price}
            onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
            placeholder={t('fields.pricePlaceholder')}
          />
          <Input
            label={t('fields.nationality')}
            name="nationality"
            value={form.nationality}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, nationality: e.target.value }))
            }
          />
          <Input
            label={t('fields.idNumber')}
            name="idNumber"
            value={form.idNumber}
            onChange={(e) => setForm((prev) => ({ ...prev, idNumber: e.target.value }))}
          />
          <label className="block text-sm sm:col-span-2" htmlFor={conditionsId}>
            <span className="font-medium text-atg-fg">{t('fields.conditions')}</span>
            <textarea
              id={conditionsId}
              rows={2}
              value={form.conditions}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, conditions: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg"
              placeholder={t('fields.conditionsPlaceholder')}
            />
          </label>
          <label className="block text-sm sm:col-span-2" htmlFor={commentId}>
            <span className="font-medium text-atg-fg">{t('fields.comment')}</span>
            <textarea
              id={commentId}
              rows={2}
              value={form.comment}
              onChange={(e) => setForm((prev) => ({ ...prev, comment: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg"
              placeholder={t('fields.commentPlaceholder')}
            />
          </label>
          <label className="block text-sm sm:col-span-2" htmlFor={otherId}>
            <span className="font-medium text-atg-fg">{t('fields.other')}</span>
            <textarea
              id={otherId}
              rows={2}
              value={form.other}
              onChange={(e) => setForm((prev) => ({ ...prev, other: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg"
              placeholder={t('fields.otherPlaceholder')}
            />
          </label>
        </div>

        {actionError ? (
          <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">
            {actionError}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => setEditorOpen(false)}
          >
            {tActions('cancel')}
          </Button>
          <Button type="button" disabled={saving} onClick={() => void handleSave()}>
            {saving ? t('saving') : tActions('save')}
          </Button>
        </div>
      </Modal>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!deletingId && !open) setDeleteTarget(null);
        }}
        title={t('deleteTitle')}
        description={t('deleteDescription', {
          name: deleteTarget?.fullName ?? '',
        })}
        confirmLabel={tActions('delete')}
        cancelLabel={tActions('cancel')}
        variant="danger"
        loading={Boolean(deletingId)}
        onConfirm={() => void handleDelete()}
      />
    </section>
  );
}
