'use client';

import { Button, Card, DataTable, Input, type ColumnDef } from '@africatourismgate/ui';
import type { CruisePort, ItineraryPort } from '@africatourismgate/types';
import Link from 'next/link';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getCroisieresErrorMessage } from '../../lib/croisieres-errors';

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
  itineraryId: string;
  itineraryName: string;
};

export function ItineraryPortsSection({
  shipId,
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
          <div className="flex justify-end gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
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
            >
              Modifier
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="!text-red-600"
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
            >
              Supprimer
            </Button>
          </div>
        ),
      },
    ],
    [deletingId, load, portById],
  );

  const rows = state.status === 'ready' ? state.rows : [];
  const selectClass =
    'w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg';

  return (
    <div>
      <nav className="mb-6 text-sm text-atg-muted">
        <Link href="/produits/croisieres/navires" className="text-primary hover:underline">
          Navires
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/produits/croisieres/navires/${shipId}`}
          className="text-primary hover:underline"
        >
          Navire
        </Link>
        <span className="mx-2">/</span>
        <span className="text-atg-fg">{itineraryName}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Escales</h1>
        <p className="mt-2 text-sm text-atg-muted">Itinéraire : {itineraryName}</p>
      </div>

      <div className="space-y-6">
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
        ) : (
          <Card variant="dashboard" padding="none">
            <DataTable
              columns={columns}
              data={rows}
              isLoading={state.status === 'loading'}
              emptyMessage="Aucune escale."
              getRowId={(r) => r.id}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
