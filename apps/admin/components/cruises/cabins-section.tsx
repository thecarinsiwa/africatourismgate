'use client';

import { Button, Card, DataTable, Input, type ColumnDef } from '@africatourismgate/ui';
import type { Cabin } from '@africatourismgate/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getCroisieresErrorMessage } from '../../lib/croisieres-errors';

type FormValues = {
  categoryName: string;
  maxGuests: string;
  basePriceCents: string;
  currency: string;
};
const emptyForm: FormValues = {
  categoryName: '',
  maxGuests: '',
  basePriceCents: '',
  currency: 'USD',
};

function formatPrice(cents: number, currency: string): string {
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

type CabinsSectionProps = { shipId: string };

export function CabinsSection({ shipId }: CabinsSectionProps) {
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; cabins: Cabin[] }
  >({ status: 'loading' });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Cabin | null>(null);
  const [formValues, setFormValues] = useState<FormValues>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listCabins({ shipId, page: 1, limit: 100 });
      setState({ status: 'ready', cabins: result.data });
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
    const guests = Number(formValues.maxGuests);
    const cents = Number(formValues.basePriceCents);
    if (!formValues.categoryName.trim() || !Number.isFinite(guests) || guests < 1) {
      setFormError('Catégorie et capacité invalides.');
      return;
    }
    if (!Number.isFinite(cents) || cents < 0) {
      setFormError('Prix de base invalide.');
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        categoryName: formValues.categoryName.trim(),
        maxGuests: guests,
        basePriceCents: cents,
        currency: formValues.currency.trim().toUpperCase() || 'USD',
      };
      if (editing) {
        await getApiClient().updateCabin(editing.id, body);
      } else {
        await getApiClient().createCabin({ shipId, ...body });
      }
      resetForm();
      await load();
    } catch (error) {
      setFormError(getCroisieresErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const columns = useMemo<ColumnDef<Cabin, unknown>[]>(
    () => [
      { accessorKey: 'categoryName', header: 'Catégorie' },
      { accessorKey: 'maxGuests', header: 'Voyageurs max', meta: { align: 'center' } },
      {
        id: 'price',
        header: 'Prix de base',
        meta: { align: 'right' },
        cell: ({ row }) => (
          <span className="tabular-nums text-sm">
            {formatPrice(row.original.basePriceCents, row.original.currency)}
          </span>
        ),
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
                  categoryName: row.original.categoryName,
                  maxGuests: String(row.original.maxGuests),
                  basePriceCents: String(row.original.basePriceCents),
                  currency: row.original.currency,
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
                if (!window.confirm('Supprimer cette cabine ?')) return;
                setDeletingId(row.original.id);
                try {
                  await getApiClient().deleteCabin(row.original.id);
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
    [deletingId, load],
  );

  const cabins = state.status === 'ready' ? state.cabins : [];

  return (
    <section className="mt-12 space-y-6 border-t border-atg-border pt-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-atg-fg">Cabines</h2>
          <p className="mt-1 text-sm text-atg-muted">
            Catégories de cabines et tarifs de base.
          </p>
        </div>
        {!showForm ? (
          <Button type="button" onClick={() => setShowForm(true)}>
            Ajouter une cabine
          </Button>
        ) : null}
      </div>

      {showForm ? (
        <Card variant="dashboard" className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-sm font-medium">
              {editing ? 'Modifier la cabine' : 'Nouvelle cabine'}
            </h3>
            {formError ? (
              <p role="alert" className="text-sm text-red-600">
                {formError}
              </p>
            ) : null}
            <Input
              label="Catégorie"
              value={formValues.categoryName}
              onChange={(e) =>
                setFormValues((p) => ({ ...p, categoryName: e.target.value }))
              }
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Voyageurs max"
                type="number"
                min={1}
                value={formValues.maxGuests}
                onChange={(e) =>
                  setFormValues((p) => ({ ...p, maxGuests: e.target.value }))
                }
              />
              <Input
                label="Prix de base (centimes)"
                type="number"
                min={0}
                value={formValues.basePriceCents}
                onChange={(e) =>
                  setFormValues((p) => ({ ...p, basePriceCents: e.target.value }))
                }
              />
            </div>
            <Input
              label="Devise"
              value={formValues.currency}
              onChange={(e) => setFormValues((p) => ({ ...p, currency: e.target.value }))}
              maxLength={3}
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
            data={cabins}
            isLoading={state.status === 'loading'}
            emptyMessage="Aucune cabine."
            getRowId={(r) => r.id}
          />
        </Card>
      )}
    </section>
  );
}
