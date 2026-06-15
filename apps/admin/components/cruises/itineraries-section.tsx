'use client';

import { Button, Card, DataTable, DataTableActionButton, DataTableActions, Input, type ColumnDef } from '@africatourismgate/ui';
import type { Itinerary } from '@africatourismgate/types';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { withApiClient } from '../../lib/auth/api';
import { getCroisieresErrorMessage } from '../../lib/croisieres-errors';

type FormValues = { name: string; durationNights: string };
const emptyForm: FormValues = { name: '', durationNights: '' };

type ItinerariesSectionProps = { shipId: string };

export function ItinerariesSection({ shipId }: ItinerariesSectionProps) {
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; itineraries: Itinerary[] }
  >({ status: 'loading' });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Itinerary | null>(null);
  const [formValues, setFormValues] = useState<FormValues>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await withApiClient((client) =>
        client.listItineraries({
          shipId,
          page: 1,
          limit: 100,
        }),
      );
      setState({ status: 'ready', itineraries: result.data });
    } catch (error) {
      setState({ status: 'error', message: getCroisieresErrorMessage(error) });
    }
  }, [shipId]);

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
    const nights = Number(formValues.durationNights);
    if (!formValues.name.trim() || !Number.isFinite(nights) || nights < 1) {
      setFormError('Nom et durée (nuits) invalides.');
      return;
    }
    setSubmitting(true);
    try {
      const body = { name: formValues.name.trim(), durationNights: nights };
      await withApiClient((client) =>
        editing
          ? client.updateItinerary(editing.id, body)
          : client.createItinerary({ shipId, ...body }),
      );
      resetForm();
      await load();
    } catch (error) {
      setFormError(getCroisieresErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const columns = useMemo<ColumnDef<Itinerary, unknown>[]>(
    () => [
      { accessorKey: 'name', header: 'Itinéraire' },
      {
        accessorKey: 'durationNights',
        header: 'Nuits',
        meta: { align: 'center' },
      },
      {
        id: 'actions',
        header: 'Actions',
        meta: { align: 'right' },
        cell: ({ row }) => (
          <DataTableActions>
            <Link
              href={`/produits/croisieres/navires/${shipId}/itineraires/${row.original.id}`}
              className="inline-flex items-center rounded-md px-2 py-1 text-sm font-medium text-primary hover:underline"
            >
              Escales
            </Link>
            <DataTableActionButton
              action="edit"
              onClick={() => {
                setEditing(row.original);
                setFormValues({
                  name: row.original.name,
                  durationNights: String(row.original.durationNights),
                });
                setShowForm(true);
              }}
            />
            <DataTableActionButton
              action="delete"
              onClick={async () => {
                if (!window.confirm('Supprimer cet itinéraire ?')) return;
                setDeletingId(row.original.id);
                try {
                  await withApiClient((client) => client.deleteItinerary(row.original.id));
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
    [deletingId, load, shipId],
  );

  const itineraries = state.status === 'ready' ? state.itineraries : [];

  return (
    <section className="mt-12 space-y-6 border-t border-atg-border pt-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-atg-fg">Itinéraires</h2>
          <p className="mt-1 text-sm text-atg-muted">
            Parcours et escales pour ce navire.
          </p>
        </div>
        {!showForm ? (
          <Button type="button" onClick={() => setShowForm(true)}>
            Ajouter un itinéraire
          </Button>
        ) : null}
      </div>

      {showForm ? (
        <Card variant="dashboard" className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-sm font-medium">
              {editing ? 'Modifier l’itinéraire' : 'Nouvel itinéraire'}
            </h3>
            {formError ? (
              <p role="alert" className="text-sm text-red-600">
                {formError}
              </p>
            ) : null}
            <Input
              label="Nom"
              value={formValues.name}
              onChange={(e) => setFormValues((p) => ({ ...p, name: e.target.value }))}
            />
            <Input
              label="Durée (nuits)"
              type="number"
              min={1}
              value={formValues.durationNights}
              onChange={(e) =>
                setFormValues((p) => ({ ...p, durationNights: e.target.value }))
              }
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
            data={itineraries}
            isLoading={state.status === 'loading'}
            emptyMessage="Aucun itinéraire."
            getRowId={(r) => r.id}
          />
        </Card>
      )}
    </section>
  );
}
