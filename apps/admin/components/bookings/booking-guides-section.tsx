'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
  Modal,
  Textarea,
  type ColumnDef,
} from '@africatourismgate/ui';
import type {
  BookingGuideAssignment,
  BookingGuideRole,
  TourGuide,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { useBookingGuideRoleLabels, useFormatDateTime } from '../../lib/i18n/use-module-labels';

type AssignmentRow = BookingGuideAssignment & {
  guideName: string;
};

type BookingGuidesSectionProps = {
  bookingId: string;
  canWrite: boolean;
  embedded?: boolean;
};

export function BookingGuidesSection({
  bookingId,
  canWrite,
  embedded = false,
}: BookingGuidesSectionProps) {
  const { bookings: getBookingsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.bookings.guides');
  const tCommon = useTranslations('modules.common');
  const tActions = useTranslations('common.actions');
  const roleLabels = useBookingGuideRoleLabels();
  const formatDateTime = useFormatDateTime();
  const guideSelectId = useId();
  const roleSelectId = useId();

  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [availableGuides, setAvailableGuides] = useState<TourGuide[]>([]);
  const [selectedGuideId, setSelectedGuideId] = useState('');
  const [selectedRole, setSelectedRole] = useState<BookingGuideRole>('primary');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [removingGuideId, setRemovingGuideId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);
  const [removeComment, setRemoveComment] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const client = getApiClient();
      const [assignmentRows, guidesResult] = await Promise.all([
        client.listBookingGuides(bookingId),
        client.listTourGuides({ page: 1, limit: 100, status: 'active' }),
      ]);

      const guideById = new Map(guidesResult.data.map((guide) => [guide.id, guide]));
      setAvailableGuides(guidesResult.data);
      setAssignments(
        assignmentRows.map((row) => ({
          ...row,
          guideName: guideById.get(row.guideId)?.displayName ?? row.guideId.slice(0, 8),
        })),
      );
    } catch (err) {
      setError(getBookingsErrorMessage(err));
      setAssignments([]);
      setAvailableGuides([]);
    } finally {
      setLoading(false);
    }
  }, [bookingId, getBookingsErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  const unassignedGuides = useMemo(() => {
    const assignedIds = new Set(assignments.map((row) => row.guideId));
    return availableGuides.filter((guide) => !assignedIds.has(guide.id));
  }, [assignments, availableGuides]);

  const handleAssign = useCallback(async () => {
    if (!selectedGuideId) {
      return;
    }
    setActionError(null);
    setAssigning(true);
    try {
      await getApiClient().assignBookingGuides(bookingId, {
        guides: [{ guideId: selectedGuideId, role: selectedRole }],
      });
      setSelectedGuideId('');
      setSelectedRole('primary');
      await load();
    } catch (err) {
      setActionError(getBookingsErrorMessage(err));
    } finally {
      setAssigning(false);
    }
  }, [bookingId, getBookingsErrorMessage, load, selectedGuideId, selectedRole]);

  const handleRemoveRequest = useCallback((guideId: string) => {
    setRemoveComment('');
    setConfirmTarget(guideId);
  }, []);

  const handleRemoveConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const guideId = confirmTarget;
    setActionError(null);
    setRemovingGuideId(guideId);
    try {
      const comment = removeComment.trim();
      await getApiClient().removeBookingGuide(
        bookingId,
        guideId,
        comment ? { comment } : {},
      );
      setConfirmTarget(null);
      setRemoveComment('');
      await load();
    } catch (err) {
      setActionError(getBookingsErrorMessage(err));
    } finally {
      setRemovingGuideId(null);
    }
  }, [bookingId, confirmTarget, getBookingsErrorMessage, load, removeComment]);

  const columns = useMemo<ColumnDef<AssignmentRow, unknown>[]>(
    () => [
      {
        accessorKey: 'guideName',
        header: t('columns.guide'),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium text-atg-fg">{row.original.guideName}</span>
            <a
              href={`/guides/${row.original.guideId}`}
              className="text-xs text-primary hover:underline"
            >
              {t('viewProfile')}
            </a>
          </div>
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
                    action="delete"
                    label={tActions('delete')}
                    onClick={() => handleRemoveRequest(row.original.guideId)}
                    disabled={removingGuideId === row.original.guideId}
                    loading={removingGuideId === row.original.guideId}
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
      handleRemoveRequest,
      removingGuideId,
      roleLabels,
      t,
      tActions,
      tCommon,
    ],
  );

  const confirmGuideName = useMemo(() => {
    if (!confirmTarget) return '';
    return assignments.find((row) => row.guideId === confirmTarget)?.guideName ?? '';
  }, [assignments, confirmTarget]);

  return (
    <>
      <Modal
        open={!!confirmTarget}
        onOpenChange={(open) => {
          if (!open && !removingGuideId) {
            setConfirmTarget(null);
            setRemoveComment('');
          }
        }}
        title={t('removeTitle')}
        description={
          confirmGuideName
            ? t('removeConfirmNamed', { name: confirmGuideName })
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
              disabled={!!removingGuideId}
              onClick={() => {
                setConfirmTarget(null);
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
              loading={!!removingGuideId}
            >
              {t('removeConfirmButton')}
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

      {canWrite ? (
        <Card variant="dashboard" padding="md" className="space-y-4">
          <p className="text-sm font-medium text-atg-fg">{t('assignTitle')}</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label htmlFor={guideSelectId} className="mb-1 block text-xs font-medium text-atg-muted">
                {t('selectGuide')}
              </label>
              <select
                id={guideSelectId}
                value={selectedGuideId}
                onChange={(e) => setSelectedGuideId(e.target.value)}
                className="w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm text-atg-fg"
              >
                <option value="">{t('selectPlaceholder')}</option>
                {unassignedGuides.map((guide) => (
                  <option key={guide.id} value={guide.id}>
                    {guide.displayName}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:w-40">
              <label htmlFor={roleSelectId} className="mb-1 block text-xs font-medium text-atg-muted">
                {t('selectRole')}
              </label>
              <select
                id={roleSelectId}
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as BookingGuideRole)}
                className="w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm text-atg-fg"
              >
                <option value="primary">{roleLabels.primary}</option>
                <option value="secondary">{roleLabels.secondary}</option>
              </select>
            </div>
            <Button
              type="button"
              variant="primary"
              onClick={() => void handleAssign()}
              disabled={!selectedGuideId || assigning}
              loading={assigning}
            >
              {t('assignButton')}
            </Button>
          </div>
          {unassignedGuides.length === 0 && !loading ? (
            <p className="text-xs text-atg-muted">{t('noGuidesAvailable')}</p>
          ) : null}
        </Card>
      ) : null}
    </section>
    </>
  );
}
