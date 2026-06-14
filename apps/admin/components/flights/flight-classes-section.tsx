'use client';

import {
  Button,
  Card,
  DataTableActionButton,
  DataTableActions,
  Input,
} from '@africatourismgate/ui';
import type { FlightClass, FlightClassName } from '@africatourismgate/types';
import { useCallback, useEffect, useId, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { flightClassLabels, flightClassOptions } from '../../lib/flight-class-labels';
import { getVolsErrorMessage } from '../../lib/vols-errors';

type FormValues = {
  className: FlightClassName;
  basePriceCents: string;
  seatsTotal: string;
};

const emptyForm: FormValues = {
  className: 'economy',
  basePriceCents: '',
  seatsTotal: '',
};

function formatPrice(cents: number): string {
  return `${(cents / 100).toFixed(2)} USD`;
}

type FlightClassesSectionProps = {
  flightId: string;
  embedded?: boolean;
};

export function FlightClassesSection({ flightId, embedded }: FlightClassesSectionProps) {
  const classSelectId = useId();
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; classes: FlightClass[] }
  >({ status: 'loading' });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FlightClass | null>(null);
  const [formValues, setFormValues] = useState<FormValues>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listFlightClasses({
        flightId,
        page: 1,
        limit: 100,
      });
      setState({ status: 'ready', classes: result.data });
    } catch (error) {
      setState({ status: 'error', message: getVolsErrorMessage(error) });
    }
  }, [flightId]);

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
    const cents = Number(formValues.basePriceCents);
    const seats = Number(formValues.seatsTotal);
    if (!Number.isFinite(cents) || cents < 0) {
      setFormError('Prix invalide (centimes).');
      return;
    }
    if (!Number.isFinite(seats) || seats < 1) {
      setFormError('Nombre de sièges invalide.');
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        className: formValues.className,
        basePriceCents: cents,
        seatsTotal: seats,
      };
      if (editing) {
        await getApiClient().updateFlightClass(editing.id, body);
      } else {
        await getApiClient().createFlightClass({ flightId, ...body });
      }
      resetForm();
      await load();
    } catch (error) {
      setFormError(getVolsErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  function openEdit(flightClass: FlightClass) {
    setEditing(flightClass);
    setFormValues({
      className: flightClass.className,
      basePriceCents: String(flightClass.basePriceCents),
      seatsTotal: String(flightClass.seatsTotal),
    });
    setShowForm(true);
  }

  const classes = state.status === 'ready' ? state.classes : [];
  const selectClass =
    'w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg';

  return (
    <section
      className={
        embedded ? 'space-y-6' : 'mt-12 space-y-6 border-t border-atg-border pt-10'
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {!embedded ? (
          <div>
            <h2 className="text-lg font-semibold text-atg-fg">Classes cabine</h2>
            <p className="mt-1 text-sm text-atg-muted">
              Cabines et tarifs de base pour ce vol.
            </p>
          </div>
        ) : (
          <p className="text-sm text-atg-muted">
            Cabines et tarifs de base pour ce vol.
          </p>
        )}
        {!showForm ? (
          <Button type="button" onClick={() => setShowForm(true)}>
            Ajouter une classe
          </Button>
        ) : null}
      </div>

      {showForm ? (
        <Card variant="dashboard" className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-sm font-medium">
              {editing ? 'Modifier la classe' : 'Nouvelle classe'}
            </h3>
            {formError ? (
              <p role="alert" className="text-sm text-red-600">
                {formError}
              </p>
            ) : null}
            <div>
              <label htmlFor={classSelectId} className="mb-2 block text-sm font-medium">
                Type de cabine
              </label>
              <select
                id={classSelectId}
                className={selectClass}
                value={formValues.className}
                onChange={(e) =>
                  setFormValues((p) => ({
                    ...p,
                    className: e.target.value as FlightClassName,
                  }))
                }
              >
                {flightClassOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Prix de base (centimes)"
                type="number"
                min={0}
                value={formValues.basePriceCents}
                onChange={(e) =>
                  setFormValues((p) => ({ ...p, basePriceCents: e.target.value }))
                }
              />
              <Input
                label="Sièges totaux"
                type="number"
                min={1}
                value={formValues.seatsTotal}
                onChange={(e) =>
                  setFormValues((p) => ({ ...p, seatsTotal: e.target.value }))
                }
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
      ) : classes.length === 0 ? (
        <Card variant="dashboard" className="py-12 text-center">
          <p className="text-sm text-atg-muted">Aucune classe cabine.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {classes.map((flightClass) => (
            <Card key={flightClass.id} variant="dashboard" className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-atg-fg">
                    {flightClassLabels[flightClass.className]}
                  </h3>
                  <p className="mt-1 text-lg tabular-nums text-atg-fg">
                    {formatPrice(flightClass.basePriceCents)}
                  </p>
                </div>
                <DataTableActions>
                  <DataTableActionButton
                    action="calendar"
                    href={`/produits/vols/${flightId}/classes/${flightClass.id}/disponibilites`}
                  />
                  <DataTableActionButton
                    action="edit"
                    onClick={() => openEdit(flightClass)}
                  />
                  <DataTableActionButton
                    action="delete"
                    onClick={async () => {
                      if (!window.confirm('Supprimer cette classe ?')) return;
                      setDeletingId(flightClass.id);
                      try {
                        await getApiClient().deleteFlightClass(flightClass.id);
                        await load();
                      } catch (error) {
                        setFormError(getVolsErrorMessage(error));
                      } finally {
                        setDeletingId(null);
                      }
                    }}
                    disabled={deletingId === flightClass.id}
                    loading={deletingId === flightClass.id}
                  />
                </DataTableActions>
              </div>
              <div className="mt-auto border-t border-atg-border pt-3">
                <p className="text-sm text-atg-muted">
                  <span className="font-medium text-atg-fg">{flightClass.seatsTotal}</span>{' '}
                  sièges
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
