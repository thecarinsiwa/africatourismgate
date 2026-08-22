'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  AlertDialog,
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
  Input,
  Modal,
  Textarea,
  type ColumnDef,
} from '@africatourismgate/ui';
import { parseApiErrorMessage } from '@africatourismgate/api-client';
import type {
  BookingGuideAssignment,
  BookingGuideRole,
  TourGuideAvailableItem,
} from '@africatourismgate/types';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { BookingGuideAssignmentHistorySection } from './booking-guide-assignment-history-section';
import { fromDatetimeLocalValue, toDatetimeLocalValue } from '../../lib/flight-datetime';
import {
  parseGuideScheduleConflictError,
  type ParsedGuideScheduleConflictError,
} from '../../lib/guide-schedule-errors';
import { useBookingGuideRoleLabels, useFormatDateTime } from '../../lib/i18n/use-module-labels';

type AssignmentRow = BookingGuideAssignment & {
  guideName: string;
};

type SlotFormValues = {
  startDatetime: string;
  endDatetime: string;
  guideId: string;
  role: BookingGuideRole;
  notes: string;
};

const emptyForm: SlotFormValues = {
  startDatetime: '',
  endDatetime: '',
  guideId: '',
  role: 'primary',
  notes: '',
};

type BookingGuidesSectionProps = {
  bookingId: string;
  canWrite: boolean;
  embedded?: boolean;
};

function formatSlotRange(startIso: string, endIso: string, locale: string): string {
  try {
    const start = new Date(startIso);
    const end = new Date(endIso);
    const sameDay = startIso.slice(0, 10) === endIso.slice(0, 10);
    const timeFmt: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
    const dateFmt: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    };
    const intlLocale = locale.startsWith('en') ? 'en-US' : locale.startsWith('es') ? 'es-ES' : 'fr-FR';
    if (sameDay) {
      const day = start.toLocaleDateString(intlLocale, { weekday: 'short', day: 'numeric', month: 'short' });
      const from = start.toLocaleTimeString(intlLocale, timeFmt);
      const to = end.toLocaleTimeString(intlLocale, timeFmt);
      return `${day} · ${from} – ${to}`;
    }
    return `${start.toLocaleString(intlLocale, dateFmt)} → ${end.toLocaleString(intlLocale, dateFmt)}`;
  } catch {
    return `${startIso} – ${endIso}`;
  }
}

function GuideScheduleConflictAlert({
  error,
  t,
  formatDateTime,
}: {
  error: ParsedGuideScheduleConflictError;
  t: ReturnType<typeof useTranslations<'modules.bookings.guides'>>;
  formatDateTime: (value: string) => string;
}) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-amber-300/60 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-100"
    >
      <p className="font-medium">{error.message}</p>
      {error.conflicts.length > 0 ? (
        <ul className="mt-2 space-y-1.5">
          {error.conflicts.map((conflict) => (
            <li key={`${conflict.kind}-${conflict.id}`} className="text-xs">
              <span className="font-medium">
                {conflict.kind === 'assignment'
                  ? t('conflicts.assignment')
                  : t('conflicts.unavailability')}
              </span>
              {' · '}
              {formatDateTime(conflict.startDatetime)} – {formatDateTime(conflict.endDatetime)}
              {conflict.bookingId ? (
                <>
                  {' · '}
                  <Link
                    href={`/reservations/${conflict.bookingId}`}
                    className="underline hover:no-underline"
                  >
                    {t('conflicts.viewBooking')}
                  </Link>
                </>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function BookingGuidesSection({
  bookingId,
  canWrite,
  embedded = false,
}: BookingGuidesSectionProps) {
  const locale = useLocale();
  const { bookings: getBookingsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.bookings.guides');
  const tCommon = useTranslations('modules.common');
  const tActions = useTranslations('common.actions');
  const roleLabels = useBookingGuideRoleLabels();
  const formatDateTime = useFormatDateTime();
  const guideSelectId = useId();
  const roleSelectId = useId();

  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [guideDirectory, setGuideDirectory] = useState<Map<string, string>>(new Map());
  const [availableForSlot, setAvailableForSlot] = useState<TourGuideAvailableItem[]>([]);
  const [searchingGuides, setSearchingGuides] = useState(false);
  const [formValues, setFormValues] = useState<SlotFormValues>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [conflictError, setConflictError] = useState<ParsedGuideScheduleConflictError | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [assignConfirmOpen, setAssignConfirmOpen] = useState(false);
  const [removingAssignmentId, setRemovingAssignmentId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [removeComment, setRemoveComment] = useState('');
  const [editTarget, setEditTarget] = useState<AssignmentRow | null>(null);
  const [editValues, setEditValues] = useState<SlotFormValues>(emptyForm);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editConflict, setEditConflict] = useState<ParsedGuideScheduleConflictError | null>(null);

  const resolveActionError = useCallback(
    (err: unknown): string => {
      const conflict = parseGuideScheduleConflictError(err);
      if (conflict) {
        setConflictError(conflict);
        return conflict.message;
      }
      setConflictError(null);
      const parsed = parseApiErrorMessage(
        err && typeof err === 'object' && 'body' in err
          ? (err as { body: unknown }).body
          : undefined,
      );
      if (parsed) return parsed;
      return getBookingsErrorMessage(err);
    },
    [getBookingsErrorMessage],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const client = getApiClient();
      const [assignmentRows, guidesResult] = await Promise.all([
        client.listBookingGuides(bookingId),
        client.listTourGuides({ page: 1, limit: 200, status: 'active' }),
      ]);

      const directory = new Map(guidesResult.data.map((guide) => [guide.id, guide.displayName]));
      setGuideDirectory(directory);
      setAssignments(
        assignmentRows
          .map((row) => ({
            ...row,
            guideName: directory.get(row.guideId) ?? row.guideId.slice(0, 8),
          }))
          .sort((left, right) => left.startDatetime.localeCompare(right.startDatetime)),
      );
    } catch (err) {
      setError(getBookingsErrorMessage(err));
      setAssignments([]);
      setGuideDirectory(new Map());
    } finally {
      setLoading(false);
    }
  }, [bookingId, getBookingsErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  const slotRangeIso = useMemo(() => {
    if (!formValues.startDatetime || !formValues.endDatetime) return null;
    try {
      const from = fromDatetimeLocalValue(formValues.startDatetime);
      const to = fromDatetimeLocalValue(formValues.endDatetime);
      if (new Date(from) >= new Date(to)) return null;
      return { from, to };
    } catch {
      return null;
    }
  }, [formValues.endDatetime, formValues.startDatetime]);

  useEffect(() => {
    if (!slotRangeIso) {
      setAvailableForSlot([]);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setSearchingGuides(true);
      void getApiClient()
        .searchAvailableTourGuides({ from: slotRangeIso.from, to: slotRangeIso.to })
        .then((guides) => {
          if (!cancelled) {
            setAvailableForSlot(guides);
            setFormValues((current) =>
              current.guideId && guides.some((guide) => guide.id === current.guideId)
                ? current
                : { ...current, guideId: '' },
            );
          }
        })
        .catch(() => {
          if (!cancelled) setAvailableForSlot([]);
        })
        .finally(() => {
          if (!cancelled) setSearchingGuides(false);
        });
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [slotRangeIso]);

  const handleAssignRequest = useCallback(() => {
    if (!formValues.guideId || !slotRangeIso) return;
    setConflictError(null);
    setAssignConfirmOpen(true);
  }, [formValues.guideId, slotRangeIso]);

  const handleAssignConfirm = useCallback(async () => {
    if (!formValues.guideId || !slotRangeIso) return;
    setActionError(null);
    setConflictError(null);
    setAssigning(true);
    try {
      await getApiClient().assignBookingGuides(bookingId, {
        guides: [
          {
            guideId: formValues.guideId,
            role: formValues.role,
            startDatetime: slotRangeIso.from,
            endDatetime: slotRangeIso.to,
            notes: formValues.notes.trim() || undefined,
          },
        ],
      });
      setAssignConfirmOpen(false);
      setFormValues(emptyForm);
      setAvailableForSlot([]);
      await load();
    } catch (err) {
      setActionError(resolveActionError(err));
    } finally {
      setAssigning(false);
    }
  }, [bookingId, formValues, load, resolveActionError, slotRangeIso]);

  const openEdit = useCallback((row: AssignmentRow) => {
    setEditTarget(row);
    setEditValues({
      startDatetime: toDatetimeLocalValue(row.startDatetime),
      endDatetime: toDatetimeLocalValue(row.endDatetime),
      guideId: row.guideId,
      role: row.role,
      notes: row.notes ?? '',
    });
    setEditConflict(null);
  }, []);

  const handleEditSave = useCallback(async () => {
    if (!editTarget) return;
    setSavingEdit(true);
    setEditConflict(null);
    setActionError(null);
    try {
      const startDatetime = fromDatetimeLocalValue(editValues.startDatetime);
      const endDatetime = fromDatetimeLocalValue(editValues.endDatetime);
      if (new Date(startDatetime) >= new Date(endDatetime)) {
        setActionError(t('validation.endAfterStart'));
        return;
      }
      await getApiClient().updateBookingGuideSlot(bookingId, editTarget.id, {
        role: editValues.role,
        startDatetime,
        endDatetime,
        notes: editValues.notes.trim() || null,
      });
      setEditTarget(null);
      await load();
    } catch (err) {
      const conflict = parseGuideScheduleConflictError(err);
      if (conflict) {
        setEditConflict(conflict);
      } else {
        setActionError(getBookingsErrorMessage(err));
      }
    } finally {
      setSavingEdit(false);
    }
  }, [bookingId, editTarget, editValues, getBookingsErrorMessage, load, t]);

  const handleRemoveConfirm = useCallback(async () => {
    if (!confirmRemoveId) return;
    setActionError(null);
    setConflictError(null);
    setRemovingAssignmentId(confirmRemoveId);
    try {
      const comment = removeComment.trim();
      await getApiClient().removeBookingGuideSlot(
        bookingId,
        confirmRemoveId,
        comment ? { comment } : {},
      );
      setConfirmRemoveId(null);
      setRemoveComment('');
      await load();
    } catch (err) {
        setActionError(getBookingsErrorMessage(err));
    } finally {
      setRemovingAssignmentId(null);
    }
  }, [bookingId, confirmRemoveId, getBookingsErrorMessage, load, removeComment]);

  const columns = useMemo<ColumnDef<AssignmentRow, unknown>[]>(
    () => [
      {
        accessorKey: 'guideName',
        header: t('columns.guide'),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium text-atg-fg">{row.original.guideName}</span>
            <Link href={`/guides/${row.original.guideId}`} className="text-xs text-primary hover:underline">
              {t('viewProfile')}
            </Link>
          </div>
        ),
      },
      {
        id: 'schedule',
        header: t('columns.schedule'),
        cell: ({ row }) => (
          <span className="text-sm text-atg-fg">
            {formatSlotRange(row.original.startDatetime, row.original.endDatetime, locale)}
          </span>
        ),
      },
      {
        accessorKey: 'role',
        header: t('columns.role'),
        cell: ({ row }) => (
          <DataTableBadge variant={row.original.role === 'primary' ? 'default' : 'muted'}>
            {roleLabels[row.original.role]}
          </DataTableBadge>
        ),
      },
      {
        accessorKey: 'notes',
        header: t('columns.notes'),
        cell: ({ row }) => (
          <span className="text-sm text-atg-muted">{row.original.notes?.trim() || '—'}</span>
        ),
      },
      {
        accessorKey: 'assignedAt',
        header: t('columns.assignedAt'),
        cell: ({ row }) => (
          <span className="text-sm text-atg-muted">{formatDateTime(row.original.assignedAt)}</span>
        ),
      },
      ...(canWrite
        ? [
            {
              id: 'actions',
              header: tCommon('columns.actions'),
              meta: { align: 'right' as const },
              cell: ({ row }: { row: { original: AssignmentRow } }) => (
                <DataTableActions>
                  <DataTableActionButton
                    action="edit"
                    label={tActions('edit')}
                    onClick={() => openEdit(row.original)}
                  />
                  <DataTableActionButton
                    action="delete"
                    label={tActions('delete')}
                    onClick={() => {
                      setRemoveComment('');
                      setConfirmRemoveId(row.original.id);
                    }}
                    disabled={removingAssignmentId === row.original.id}
                    loading={removingAssignmentId === row.original.id}
                  />
                </DataTableActions>
              ),
            } satisfies ColumnDef<AssignmentRow, unknown>,
          ]
        : []),
    ],
    [
      canWrite,
      formatDateTime,
      locale,
      openEdit,
      removingAssignmentId,
      roleLabels,
      t,
      tActions,
      tCommon,
    ],
  );

  const selectedGuideName = useMemo(() => {
    if (!formValues.guideId) return '';
    return (
      availableForSlot.find((guide) => guide.id === formValues.guideId)?.displayName ??
      guideDirectory.get(formValues.guideId) ??
      ''
    );
  }, [availableForSlot, formValues.guideId, guideDirectory]);

  const confirmRemoveRow = useMemo(
    () => assignments.find((row) => row.id === confirmRemoveId) ?? null,
    [assignments, confirmRemoveId],
  );

  const canSubmitAssign =
    Boolean(formValues.guideId && slotRangeIso) && !assigning && !searchingGuides;

  return (
    <>
      <AlertDialog
        open={assignConfirmOpen}
        onOpenChange={(open) => {
          if (!assigning) setAssignConfirmOpen(open);
        }}
        title={t('assignConfirmTitle')}
        description={
          selectedGuideName && slotRangeIso
            ? t('assignConfirmNamed', {
                name: selectedGuideName,
                role: roleLabels[formValues.role],
                schedule: formatSlotRange(slotRangeIso.from, slotRangeIso.to, locale),
              })
            : t('assignConfirm')
        }
        confirmLabel={t('assignConfirmButton')}
        cancelLabel={t('cancel')}
        loading={assigning}
        onConfirm={() => void handleAssignConfirm()}
      />

      <Modal
        open={!!confirmRemoveId}
        onOpenChange={(open) => {
          if (!open && !removingAssignmentId) {
            setConfirmRemoveId(null);
            setRemoveComment('');
          }
        }}
        title={t('removeTitle')}
        description={
          confirmRemoveRow
            ? t('removeConfirmNamed', {
                name: confirmRemoveRow.guideName,
                schedule: formatSlotRange(
                  confirmRemoveRow.startDatetime,
                  confirmRemoveRow.endDatetime,
                  locale,
                ),
              })
            : t('removeConfirm')
        }
        showClose
        className="max-w-lg"
      >
        <div className="space-y-4">
          <Textarea
            label={t('removeCommentLabel')}
            hint={t('removeCommentHint')}
            value={removeComment}
            onChange={(event) => setRemoveComment(event.target.value)}
            rows={4}
            maxLength={2000}
          />
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={!!removingAssignmentId}
              onClick={() => {
                setConfirmRemoveId(null);
                setRemoveComment('');
              }}
            >
              {t('cancel')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="!text-red-600 hover:!bg-red-50 dark:!text-red-400"
              onClick={() => void handleRemoveConfirm()}
              loading={!!removingAssignmentId}
            >
              {t('removeConfirmButton')}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open && !savingEdit) setEditTarget(null);
        }}
        title={t('editSlotTitle')}
        description={editTarget ? t('editSlotDescription', { name: editTarget.guideName }) : undefined}
        showClose
        className="max-w-2xl"
      >
        <div className="space-y-4">
          {editConflict ? (
            <GuideScheduleConflictAlert error={editConflict} t={t} formatDateTime={formatDateTime} />
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t('fields.startDatetime')}
              type="datetime-local"
              value={editValues.startDatetime}
              onChange={(event) =>
                setEditValues((current) => ({ ...current, startDatetime: event.target.value }))
              }
              required
            />
            <Input
              label={t('fields.endDatetime')}
              type="datetime-local"
              value={editValues.endDatetime}
              onChange={(event) =>
                setEditValues((current) => ({ ...current, endDatetime: event.target.value }))
              }
              required
            />
          </div>
          <div className="sm:w-48">
            <label htmlFor={`${guideSelectId}-edit-role`} className="mb-1 block text-xs font-medium text-atg-muted">
              {t('selectRole')}
            </label>
            <select
              id={`${guideSelectId}-edit-role`}
              value={editValues.role}
              onChange={(event) =>
                setEditValues((current) => ({
                  ...current,
                  role: event.target.value as BookingGuideRole,
                }))
              }
              className="w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm text-atg-fg"
            >
              <option value="primary">{roleLabels.primary}</option>
              <option value="secondary">{roleLabels.secondary}</option>
            </select>
          </div>
          <Textarea
            label={t('fields.notes')}
            hint={t('fields.notesHint')}
            value={editValues.notes}
            onChange={(event) => setEditValues((current) => ({ ...current, notes: event.target.value }))}
            rows={3}
            maxLength={500}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" disabled={savingEdit} onClick={() => setEditTarget(null)}>
              {t('cancel')}
            </Button>
            <Button type="button" loading={savingEdit} onClick={() => void handleEditSave()}>
              {tActions('save')}
            </Button>
          </div>
        </div>
      </Modal>

      <section className="space-y-3">
        {embedded ? null : (
          <h2 className="text-lg font-semibold text-atg-fg">{t('title')}</h2>
        )}

        {error ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : null}

        {actionError ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {actionError}
          </p>
        ) : null}

        {conflictError ? (
          <GuideScheduleConflictAlert error={conflictError} t={t} formatDateTime={formatDateTime} />
        ) : null}

        {canWrite ? (
          <Card variant="dashboard" padding="md" className="space-y-4">
            <div>
              <p className="text-sm font-medium text-atg-fg">{t('assignTitle')}</p>
              <p className="mt-1 text-xs text-atg-muted">{t('assignHint')}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={t('fields.startDatetime')}
                type="datetime-local"
                value={formValues.startDatetime}
                onChange={(event) =>
                  setFormValues((current) => ({ ...current, startDatetime: event.target.value }))
                }
                required
              />
              <Input
                label={t('fields.endDatetime')}
                type="datetime-local"
                value={formValues.endDatetime}
                onChange={(event) =>
                  setFormValues((current) => ({ ...current, endDatetime: event.target.value }))
                }
                required
              />
            </div>
            {!slotRangeIso && formValues.startDatetime && formValues.endDatetime ? (
              <p className="text-xs text-amber-700 dark:text-amber-300">{t('validation.endAfterStart')}</p>
            ) : null}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label htmlFor={guideSelectId} className="mb-1 block text-xs font-medium text-atg-muted">
                  {t('selectGuide')}
                  {searchingGuides ? ` (${t('searchingGuides')})` : null}
                </label>
                <select
                  id={guideSelectId}
                  value={formValues.guideId}
                  onChange={(event) =>
                    setFormValues((current) => ({ ...current, guideId: event.target.value }))
                  }
                  disabled={!slotRangeIso || searchingGuides}
                  className="w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm text-atg-fg disabled:opacity-60"
                >
                  <option value="">
                    {!slotRangeIso ? t('selectTimesFirst') : t('selectPlaceholder')}
                  </option>
                  {availableForSlot.map((guide) => (
                    <option key={guide.id} value={guide.id}>
                      {guide.displayName}
                    </option>
                  ))}
                </select>
                {slotRangeIso && !searchingGuides && availableForSlot.length === 0 ? (
                  <p className="mt-1 text-xs text-atg-muted">{t('noGuidesForSlot')}</p>
                ) : null}
              </div>
              <div className="sm:w-40">
                <label htmlFor={roleSelectId} className="mb-1 block text-xs font-medium text-atg-muted">
                  {t('selectRole')}
                </label>
                <select
                  id={roleSelectId}
                  value={formValues.role}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      role: event.target.value as BookingGuideRole,
                    }))
                  }
                  className="w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm text-atg-fg"
                >
                  <option value="primary">{roleLabels.primary}</option>
                  <option value="secondary">{roleLabels.secondary}</option>
                </select>
              </div>
            </div>
            <Textarea
              label={t('fields.notes')}
              hint={t('fields.notesHint')}
              value={formValues.notes}
              onChange={(event) =>
                setFormValues((current) => ({ ...current, notes: event.target.value }))
              }
              rows={2}
              maxLength={500}
            />
            <div className="flex justify-end">
              <Button
                type="button"
                variant="primary"
                onClick={handleAssignRequest}
                disabled={!canSubmitAssign}
                loading={assigning}
              >
                {t('assignButton')}
              </Button>
            </div>
          </Card>
        ) : null}

        <Card variant="dashboard" padding="none" className="overflow-hidden">
          <DataTable
            columns={columns}
            data={assignments}
            isLoading={loading}
            emptyMessage={t('empty')}
            getRowId={(row) => row.id}
            aria-label={t('ariaLabel')}
          />
        </Card>

        <BookingGuideAssignmentHistorySection bookingId={bookingId} embedded />
      </section>
    </>
  );
}
