'use client';

import {
  Button,
  Card,
  DataTable,
  Input,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { VehicleAvailability, VehicleAvailabilityStatus } from '@africatourismgate/types';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import {
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from '../../lib/flight-datetime';
import { getLocationsErrorMessage } from '../../lib/locations-errors';
import { vehicleStatusLabels, vehicleStatusOptions } from '../../lib/vehicle-status-labels';

type FormValues = {
  startDatetime: string;
  endDatetime: string;
  status: VehicleAvailabilityStatus;
};

const emptyForm: FormValues = {
  startDatetime: '',
  endDatetime: '',
  status: 'available',
};

function formatRange(start: string, end: string): string {
  const opts: Intl.DateTimeFormatOptions = {
    dateStyle: 'short',
    timeStyle: 'short',
  };
  try {
    return `${new Date(start).toLocaleString('fr-FR', opts)} → ${new Date(end).toLocaleString('fr-FR', opts)}`;
  } catch {
    return `${start} → ${end}`;
  }
}

type VehicleAvailabilitySectionProps = {
  vehicleId: string;
};

export function VehicleAvailabilitySection({ vehicleId }: VehicleAvailabilitySectionProps) {
  const statusId = useId();
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; slots: VehicleAvailability[] }
  >({ status: 'loading' });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<VehicleAvailability | null>(null);
  const [formValues, setFormValues] = useState<FormValues>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listVehicleAvailability({
        vehicleId,
        page: 1,
        limit: 100,
        ...(filterStart
          ? { startFrom: fromDatetimeLocalValue(`${filterStart}T00:00`) }
          : {}),
        ...(filterEnd ? { endTo: fromDatetimeLocalValue(`${filterEnd}T23:59`) } : {}),
      });
      setState({ status: 'ready', slots: result.data });
    } catch (error) {
      setState({ status: 'error', message: getLocationsErrorMessage(error) });
    }
  }, [vehicleId, filterStart, filterEnd]);

  useEffect(() => {
    void load();
  }, [load]);

  function resetForm() {
    setFormValues(emptyForm);
    setEditing(null);
    setShowForm(false);
    setFormError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!formValues.startDatetime || !formValues.endDatetime) {
      setFormError('Les dates de début et de fin sont obligatoires.');
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        startDatetime: fromDatetimeLocalValue(formValues.startDatetime),
        endDatetime: fromDatetimeLocalValue(formValues.endDatetime),
        status: formValues.status,
      };
      if (editing) {
        await getApiClient().updateVehicleAvailability(editing.id, body);
      } else {
        await getApiClient().createVehicleAvailability({ vehicleId, ...body });
      }
      resetForm();
      await load();
    } catch (error) {
      setFormError(getLocationsErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const columns = useMemo<ColumnDef<VehicleAvailability, unknown>[]>(
    () => [
      {
        id: 'range',
        header: 'Période',
        cell: ({ row }) => (
          <span className="text-sm">
            {formatRange(row.original.startDatetime, row.original.endDatetime)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Statut',
        cell: ({ row }) => vehicleStatusLabels[row.original.status],
      },
      {
        id: 'actions',
        header: 'Actions',
        meta: { align: 'right' },
        cell: ({ row }) => (
          <div className="flex justify-end gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditing(row.original);
                setFormValues({
                  startDatetime: toDatetimeLocalValue(row.original.startDatetime),
                  endDatetime: toDatetimeLocalValue(row.original.endDatetime),
                  status: row.original.status,
                });
                setShowForm(true);
              }}
            >
              Modifier
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="!text-red-600"
              onClick={async () => {
                if (!window.confirm('Supprimer ce créneau ?')) return;
                setDeletingId(row.original.id);
                try {
                  await getApiClient().deleteVehicleAvailability(row.original.id);
                  await load();
                } catch (error) {
                  setFormError(getLocationsErrorMessage(error));
                } finally {
                  setDeletingId(null);
                }
              }}
              disabled={deletingId === row.original.id}
              loading={deletingId === row.original.id}
            >
              Supprimer
            </Button>
          </div>
        ),
      },
    ],
    [deletingId, load],
  );

  const slots = state.status === 'ready' ? state.slots : [];
  const selectClass =
    'w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg';

  return (
    <section className="mt-12 space-y-6 border-t border-atg-border pt-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-atg-fg">Disponibilités</h2>
          <p className="mt-1 text-sm text-atg-muted">
            Créneaux de disponibilité par dates (location, maintenance, loué).
          </p>
        </div>
        {!showForm ? (
          <Button type="button" onClick={() => setShowForm(true)}>
            Ajouter un créneau
          </Button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <Input
          label="Filtrer du"
          type="date"
          value={filterStart}
          onChange={(e) => setFilterStart(e.target.value)}
          className="max-w-[180px]"
        />
        <Input
          label="au"
          type="date"
          value={filterEnd}
          onChange={(e) => setFilterEnd(e.target.value)}
          className="max-w-[180px]"
        />
        <Button type="button" variant="outline" size="sm" onClick={() => void load()}>
          Appliquer
        </Button>
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Début</label>
                <input
                  type="datetime-local"
                  className={selectClass}
                  value={formValues.startDatetime}
                  onChange={(e) =>
                    setFormValues((p) => ({ ...p, startDatetime: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Fin</label>
                <input
                  type="datetime-local"
                  className={selectClass}
                  value={formValues.endDatetime}
                  onChange={(e) =>
                    setFormValues((p) => ({ ...p, endDatetime: e.target.value }))
                  }
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor={statusId} className="mb-2 block text-sm font-medium">
                Statut
              </label>
              <select
                id={statusId}
                className={selectClass}
                value={formValues.status}
                onChange={(e) =>
                  setFormValues((p) => ({
                    ...p,
                    status: e.target.value as VehicleAvailabilityStatus,
                  }))
                }
              >
                {vehicleStatusOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
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
            data={slots}
            isLoading={state.status === 'loading'}
            emptyMessage="Aucun créneau sur cette période."
            getRowId={(r) => r.id}
          />
        </Card>
      )}
    </section>
  );
}
