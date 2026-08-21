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
  type ColumnDef,
} from '@africatourismgate/ui';
import type { ActivitySchedule } from '@africatourismgate/types';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { ActivitySchedulesTimeline } from './activity-schedules-timeline';

type ScheduleFormValues = {
  startDatetime: string;
  capacity: string;
};

const emptyForm: ScheduleFormValues = { startDatetime: '', capacity: '10' };

type ViewMode = 'list' | 'timeline';

function toLocalDatetimeInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type ActivitySchedulesSectionProps = {
  activityId: string;
  embedded?: boolean;
};

export function ActivitySchedulesSection({
  activityId,
  embedded,
}: ActivitySchedulesSectionProps) {
  const { activities: getActivitiesErrorMessage } = useAdminErrorMessages();
  const locale = useLocale();
  const t = useTranslations('modules.activities.sections.schedules');
  const tColumns = useTranslations('modules.common.columns');
  const tCommon = useTranslations('modules.common');
  const tActions = useTranslations('common.actions');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; schedules: ActivitySchedule[] }
  >({ status: 'loading' });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ActivitySchedule | null>(null);
  const [formValues, setFormValues] = useState<ScheduleFormValues>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<ActivitySchedule | null>(null);

  const formatDatetime = useCallback(
    (iso: string) => {
      const d = new Date(iso);
      return Number.isNaN(d.getTime()) ? iso : d.toLocaleString(locale);
    },
    [locale],
  );

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listActivitySchedules({
        activityId,
        page: 1,
        limit: 100,
      });
      setState({ status: 'ready', schedules: result.data });
    } catch (error) {
      setState({ status: 'error', message: getActivitiesErrorMessage(error) });
    }
  }, [activityId, getActivitiesErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  function resetForm() {
    setFormValues(emptyForm);
    setEditing(null);
    setShowForm(false);
    setFormError(null);
  }

  function openCreate() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(schedule: ActivitySchedule) {
    setEditing(schedule);
    setFormValues({
      startDatetime: toLocalDatetimeInput(schedule.startDatetime),
      capacity: String(schedule.capacity),
    });
    setShowForm(true);
  }

  function validate(): boolean {
    if (!formValues.startDatetime) {
      setFormError(t('validationDateTime'));
      return false;
    }
    const cap = Number(formValues.capacity);
    if (!Number.isFinite(cap) || cap < 1) {
      setFormError(t('validationCapacity'));
      return false;
    }
    return true;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const startDatetime = new Date(formValues.startDatetime).toISOString();
      const body = {
        startDatetime,
        capacity: Number(formValues.capacity),
      };
      if (editing) {
        await getApiClient().updateActivitySchedule(editing.id, body);
      } else {
        await getApiClient().createActivitySchedule({ activityId, ...body });
      }
      resetForm();
      await load();
    } catch (error) {
      setFormError(getActivitiesErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const handleDeleteRequest = useCallback((schedule: ActivitySchedule) => {
    setConfirmTarget(schedule);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const schedule = confirmTarget;
    setConfirmTarget(null);
    setDeleteError(null);
    setDeletingId(schedule.id);
    try {
      await getApiClient().deleteActivitySchedule(schedule.id);
      await load();
    } catch (error) {
      setDeleteError(getActivitiesErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, getActivitiesErrorMessage, load]);

  const columns = useMemo<ColumnDef<ActivitySchedule, unknown>[]>(
    () => [
      {
        id: 'start',
        header: tColumns('start'),
        cell: ({ row }) => formatDatetime(row.original.startDatetime),
      },
      {
        accessorKey: 'capacity',
        header: t('capacity'),
        meta: { align: 'center' },
      },
      {
        accessorKey: 'bookedCount',
        header: tColumns('reserved'),
        meta: { align: 'center' },
      },
      {
        id: 'actions',
        header: tColumns('actions'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <DataTableActions>
            <DataTableActionButton action="edit" onClick={() => openEdit(row.original)} />
            <DataTableActionButton
              action="delete"
              onClick={() => handleDeleteRequest(row.original)}
              disabled={deletingId === row.original.id}
              loading={deletingId === row.original.id}
            />
          </DataTableActions>
        ),
      },
    ],
    [deletingId, formatDatetime, handleDeleteRequest, t, tColumns],
  );

  const schedules = state.status === 'ready' ? state.schedules : [];

  return (
    <>
      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(open) => {
          if (!open) setConfirmTarget(null);
        }}
        title={t('deleteTitle')}
        description={t('deleteConfirm')}
        confirmLabel={t('deleteConfirmButton')}
        cancelLabel={t('cancel')}
        variant="danger"
        loading={!!deletingId}
        error={deleteError}
        onConfirm={() => void handleDeleteConfirm()}
      />

      <Modal
        open={showForm}
        onOpenChange={(open) => {
          if (!open && !submitting) resetForm();
        }}
        title={editing ? t('editSlot') : t('addSlot')}
        showClose={!submitting}
        closeAriaLabel={tActions('close')}
        className="max-w-lg"
      >
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          {formError ? (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {formError}
            </p>
          ) : null}
          <Input
            label={t('dateTime')}
            type="datetime-local"
            value={formValues.startDatetime}
            onChange={(e) =>
              setFormValues((p) => ({ ...p, startDatetime: e.target.value }))
            }
            disabled={submitting}
          />
          <Input
            label={t('capacity')}
            type="number"
            min={1}
            value={formValues.capacity}
            onChange={(e) => setFormValues((p) => ({ ...p, capacity: e.target.value }))}
            disabled={submitting}
          />
          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" loading={submitting}>
              {editing ? tActions('save') : tActions('create')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={submitting}
            >
              {tActions('cancel')}
            </Button>
          </div>
        </form>
      </Modal>

      <section
        className={
          embedded ? 'space-y-6' : 'mt-12 space-y-6 border-t border-atg-border pt-10'
        }
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-atg-fg">{t('title')}</h2>
            <p className="mt-1 text-sm text-atg-muted">{t('intro')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                {t('viewList')}
              </Button>
              <Button
                type="button"
                variant={viewMode === 'timeline' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('timeline')}
              >
                {t('viewTimeline')}
              </Button>
            </div>
            <Button type="button" onClick={openCreate}>
              {t('addSchedule')}
            </Button>
          </div>
        </div>

        {state.status === 'error' ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {state.message}
          </p>
        ) : viewMode === 'timeline' ? (
          state.status === 'loading' ? (
            <p className="text-sm text-atg-muted">{tCommon('loading')}</p>
          ) : (
            <ActivitySchedulesTimeline
              schedules={schedules}
              onEdit={openEdit}
              onDelete={handleDeleteRequest}
              deletingId={deletingId}
            />
          )
        ) : (
          <Card variant="dashboard" padding="none">
            <DataTable
              columns={columns}
              data={schedules}
              isLoading={state.status === 'loading'}
              emptyMessage={t('empty')}
              getRowId={(r) => r.id}
            />
          </Card>
        )}
      </section>
    </>
  );
}
