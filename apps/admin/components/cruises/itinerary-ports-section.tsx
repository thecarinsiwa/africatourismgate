'use client';

import { Button, Card, DataTable, DataTableActionButton, DataTableActions, Input, type ColumnDef } from '@africatourismgate/ui';
import type { CruisePort, ItineraryPort } from '@africatourismgate/types';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { AdminPageBackLink } from '../admin-page-back-link';
import { getApiClient } from '../../lib/auth/api';
import { buildCruiseBreadcrumbTail } from '../../lib/cruise-breadcrumbs';
import { getCroisieresErrorMessage } from '../../lib/croisieres-errors';
import { ItineraryPortsTimeline } from './itinerary-ports-timeline';

type FormValues = {
  portId: string;
  dayNumber: string;
  arrivalTime: string;
  departureTime: string;
};
const emptyForm: FormValues = {
  portId: '',
  dayNumber: '',
  arrivalTime: '',
  departureTime: '',
};

function formatTime(t: string | null): string {
  if (!t) return '—';
  return t.slice(0, 5);
}

type ItineraryPortsSectionProps = {
  shipId: string;
  shipName?: string;
  lineName: string;
  itineraryId: string;
  itineraryName: string;
};

export function ItineraryPortsSection({
  shipId,
  shipName,
  lineName,
  itineraryId,
  itineraryName,
}: ItineraryPortsSectionProps) {
  const portSelectId = useId();
  const [ports, setPorts] = useState<CruisePort[]>([]);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; rows: ItineraryPort[] }
  >({ status: 'loading' });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ItineraryPort | null>(null);
  const [formValues, setFormValues] = useState<FormValues>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useAdminEditPageMeta({
    ready: true,
    title: 'Escales',
    breadcrumbTail: buildCruiseBreadcrumbTail({
      lineName,
      shipName: shipName ?? 'Navire',
      shipId,
      itineraryName,
    }),
  });

  useEffect(() => {
    void getApiClient()
      .listCruisePorts({ page: 1, limit: 100 })
      .then((r) => setPorts(r.data))
      .catch(() => setPorts([]));
  }, []);

  const portById = useMemo(() => new Map(ports.map((p) => [p.id, p])), [ports]);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listItineraryPorts({
        itineraryId,
        page: 1,
        limit: 100,
      });
      setState({ status: 'ready', rows: result.data });
    } catch (error) {
      setState({ status: 'error', message: getCroisieresErrorMessage(error) });
    }
  }, [itineraryId]);

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
    const day = Number(formValues.dayNumber);
    if (!formValues.portId || !Number.isFinite(day) || day < 1) {
      setFormError('Port et jour obligatoires.');
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        portId: formValues.portId,
        dayNumber: day,
        arrivalTime: formValues.arrivalTime.trim() || null,
        departureTime: formValues.departureTime.trim() || null,
      };
      if (editing) {
        await getApiClient().updateItineraryPort(editing.id, body);
      } else {
        await getApiClient().createItineraryPort({ itineraryId, ...body });
      }
      resetForm();
      await load();
    } catch (error) {
      setFormError(getCroisieresErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const columns = useMemo<ColumnDef<ItineraryPort, unknown>[]>(
    () => [
      {
        accessorKey: 'dayNumber',
        header: 'Jour',
        meta: { align: 'center' },
      },
      {
        id: 'port',
        header: 'Port',
        cell: ({ row }) => {
          const port = portById.get(row.original.portId);
          return port ? (
            <span>
              <code className="font-mono text-xs">{port.code}</code> {port.name}
            </span>
          ) : (
            '—'
          );
        },
      },
      {
        id: 'arrival',
        header: 'Arrivée',
        cell: ({ row }) => formatTime(row.original.arrivalTime),
      },
      {
        id: 'departure',
        header: 'Départ',
        cell: ({ row }) => formatTime(row.original.departureTime),
      },
      {
        id: 'actions',
        header: 'Actions',
        meta: { align: 'right' },
        cell: ({ row }) => (
          <DataTableActions>
            <DataTableActionButton
              action="edit"
              onClick={() => {
                setEditing(row.original);
                setFormValues({
                  portId: row.original.portId,
                  dayNumber: String(row.original.dayNumber),
                  arrivalTime: row.original.arrivalTime?.slice(0, 5) ?? '',
                  departureTime: row.original.departureTime?.slice(0, 5) ?? '',
                });
                setShowForm(true);
              }}
            />
            <DataTableActionButton
              action="delete"
              onClick={async () => {
                if (!window.confirm('Supprimer cette escale ?')) return;
                setDeletingId(row.original.id);
                try {
                  await getApiClient().deleteItineraryPort(row.original.id);
                  await load();
                } catch (error) {
                  setFormError(getCroisieresErrorMessage(error));
                } finally {
                  setDeletingId(null);
                }
              }}
              disabled={deletingId === row.original.id}
              loading={deletingId === row.original.id}
            />
          </DataTableActions>
        ),
      },
    ],
    [deletingId, load, portById],
  );

  const rows = useMemo(
    () => (state.status === 'ready' ? state.rows : []),
    [state],
  );
  const timelineStops = useMemo(
    () =>
      rows.map((row) => ({
        ...row,
        port: portById.get(row.portId) ?? null,
      })),
    [rows, portById],
  );
  const selectClass =
    'w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg';

  return (
    <div>
      <AdminPageBackLink
        href={`/produits/croisieres/navires/${shipId}`}
        label="Retour au navire"
      />

      <p className="mb-8 mt-4 text-sm text-atg-muted">Itinéraire : {itineraryName}</p>

      <div className="space-y-6">
        {state.status === 'ready' && timelineStops.length > 0 ? (
          <ItineraryPortsTimeline stops={timelineStops} />
        ) : null}

        <div className="flex justify-end">
          {!showForm ? (
            <Button type="button" onClick={() => setShowForm(true)}>
              Ajouter une escale
            </Button>
          ) : null}
        </div>

        {showForm ? (
          <Card variant="dashboard" className="max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-sm font-medium">
                {editing ? 'Modifier l’escale' : 'Nouvelle escale'}
              </h3>
              {formError ? (
                <p role="alert" className="text-sm text-red-600">
                  {formError}
                </p>
              ) : null}
              <div>
                <label htmlFor={portSelectId} className="mb-2 block text-sm font-medium">
                  Port
                </label>
                <select
                  id={portSelectId}
                  className={selectClass}
                  value={formValues.portId}
                  onChange={(e) =>
                    setFormValues((p) => ({ ...p, portId: e.target.value }))
                  }
                  required
                >
                  <option value="">Choisir un port…</option>
                  {ports.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} — {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Jour"
                type="number"
                min={1}
                value={formValues.dayNumber}
                onChange={(e) =>
                  setFormValues((p) => ({ ...p, dayNumber: e.target.value }))
                }
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Heure d’arrivée (HH:MM)"
                  value={formValues.arrivalTime}
                  onChange={(e) =>
                    setFormValues((p) => ({ ...p, arrivalTime: e.target.value }))
                  }
                  placeholder="08:00"
                />
                <Input
                  label="Heure de départ (HH:MM)"
                  value={formValues.departureTime}
                  onChange={(e) =>
                    setFormValues((p) => ({ ...p, departureTime: e.target.value }))
                  }
                  placeholder="18:00"
                />
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
        ) : state.status === 'loading' ? (
          <p className="text-sm text-atg-muted">Chargement…</p>
        ) : rows.length === 0 ? (
          <Card variant="dashboard" className="py-12 text-center">
            <p className="text-sm text-atg-muted">Aucune escale.</p>
          </Card>
        ) : (
          <Card variant="dashboard" padding="none">
            <DataTable
              columns={columns}
              data={rows}
              isLoading={false}
              emptyMessage="Aucune escale."
              getRowId={(r) => r.id}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
