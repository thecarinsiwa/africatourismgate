'use client';

import {
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  Input,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { ActivitySchedule } from '@africatourismgate/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getActivitiesErrorMessage } from '../../lib/activities-errors';

type ScheduleFormValues = {
  startDatetime: string;
  capacity: string;
};

const emptyForm: ScheduleFormValues = { startDatetime: '', capacity: '10' };

function toLocalDatetimeInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDatetime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

type ActivitySchedulesSectionProps = {
  activityId: string;
};

export function ActivitySchedulesSection({ activityId }: ActivitySchedulesSectionProps) {
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
  }, [activityId]);

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
      setFormError('La date et l’heure sont obligatoires.');
      return false;
    }
    const cap = Number(formValues.capacity);
    if (!Number.isFinite(cap) || cap < 1) {
      setFormError('La capacité doit être au moins 1.');
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

  const handleDelete = useCallback(
    async (schedule: ActivitySchedule) => {
      if (!window.confirm('Supprimer ce créneau ?')) return;
      setDeletingId(schedule.id);
      try {
        await getApiClient().deleteActivitySchedule(schedule.id);
        await load();
      } catch (error) {
        setFormError(getActivitiesErrorMessage(error));
      } finally {
        setDeletingId(null);
      }
    },
    [load],
  );

  const columns = useMemo<ColumnDef<ActivitySchedule, unknown>[]>(
    () => [
      {
        id: 'start',
        header: 'Début',
        cell: ({ row }) => formatDatetime(row.original.startDatetime),
      },
      {
        accessorKey: 'capacity',
        header: 'Capacité',
        meta: { align: 'center' },
      },
      {
        accessorKey: 'bookedCount',
        header: 'Réservés',
        meta: { align: 'center' },
      },
      {
        id: 'actions',
        header: 'Actions',
        meta: { align: 'right' },
        cell: ({ row }) => (
          <DataTableActions>
            <DataTableActionButton action="edit" onClick={() => openEdit(row.original)} />
            <DataTableActionButton
              action="delete"
              onClick={() => void handleDelete(row.original)}
              disabled={deletingId === row.original.id}
              loading={deletingId === row.original.id}
            />
          </DataTableActions>
        ),
      },
    ],
    [deletingId, handleDelete],
  );

  const schedules = state.status === 'ready' ? state.schedules : [];

  return (
    <section className="mt-12 space-y-6 border-t border-atg-border pt-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-atg-fg">Créneaux</h2>
          <p className="mt-1 text-sm text-atg-muted">
            Horaires et capacité pour cette activité.
          </p>
        </div>
        {!showForm ? (
          <Button type="button" onClick={openCreate}>
            Ajouter un créneau
          </Button>
        ) : null}
      </div>

      {showForm ? (
        <Card variant="dashboard" className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-sm font-medium">
              {editing ? 'Modifier le créneau' : 'Nouveau créneau'}
            </h3>
            {formError ? (
              <p role="alert" className="text-sm text-red-600">
                {formError}
              </p>
            ) : null}
            <Input
              label="Date et heure"
              type="datetime-local"
              value={formValues.startDatetime}
              onChange={(e) =>
                setFormValues((p) => ({ ...p, startDatetime: e.target.value }))
              }
            />
            <Input
              label="Capacité"
              type="number"
              min={1}
              value={formValues.capacity}
              onChange={(e) => setFormValues((p) => ({ ...p, capacity: e.target.value }))}
            />
            <div className="flex gap-3">
              <Button type="submit" loading={submitting}>
                {editing ? 'Enregistrer' : 'Ajouter'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {state.status === 'error' ? (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      ) : (
        <Card variant="dashboard" padding="none">
          <DataTable
            columns={columns}
            data={schedules}
            isLoading={state.status === 'loading'}
            emptyMessage="Aucun créneau pour cette activité."
            getRowId={(r) => r.id}
          />
        </Card>
      )}
    </section>
  );
}
