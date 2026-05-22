'use client';

import {
  Button,
  Card,
  DataTable,
  DataTablePagination,
  Input,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { Airport } from '@africatourismgate/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getVolsErrorMessage } from '../../lib/vols-errors';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

type FormValues = {
  iataCode: string;
  name: string;
  city: string;
  countryCode: string;
};

const emptyForm: FormValues = {
  iataCode: '',
  name: '',
  city: '',
  countryCode: 'CD',
};

export function AirportsList() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; airports: Airport[]; total: number; totalPages: number }
  >({ status: 'loading' });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Airport | null>(null);
  const [formValues, setFormValues] = useState<FormValues>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listAirports({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
      });
      setState({
        status: 'ready',
        airports: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getVolsErrorMessage(error) });
    }
  }, [page, search]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const q = searchInput.trim();
    const t = window.setTimeout(() => {
      setSearch((prev) => {
        if (prev !== q) setPage(1);
        return q;
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  function resetForm() {
    setFormValues(emptyForm);
    setEditing(null);
    setShowForm(false);
    setFormError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (
      formValues.iataCode.trim().length !== 3 ||
      !formValues.name.trim() ||
      !formValues.city.trim() ||
      formValues.countryCode.trim().length !== 2
    ) {
      setFormError('IATA (3 lettres), nom, ville et pays (2 lettres) sont obligatoires.');
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        iataCode: formValues.iataCode.trim().toUpperCase(),
        name: formValues.name.trim(),
        city: formValues.city.trim(),
        countryCode: formValues.countryCode.trim().toUpperCase(),
      };
      if (editing) {
        await getApiClient().updateAirport(editing.id, body);
      } else {
        await getApiClient().createAirport(body);
      }
      resetForm();
      await load();
    } catch (error) {
      setFormError(getVolsErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const columns = useMemo<ColumnDef<Airport, unknown>[]>(
    () => [
      {
        accessorKey: 'iataCode',
        header: 'IATA',
        cell: ({ row }) => (
          <code className="font-mono text-sm">{row.original.iataCode}</code>
        ),
      },
      { accessorKey: 'name', header: 'Aéroport' },
      { accessorKey: 'city', header: 'Ville' },
      {
        accessorKey: 'countryCode',
        header: 'Pays',
        meta: { align: 'center' },
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
                  iataCode: row.original.iataCode,
                  name: row.original.name,
                  city: row.original.city,
                  countryCode: row.original.countryCode,
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
                if (!window.confirm(`Supprimer « ${row.original.name} » ?`)) return;
                setDeletingId(row.original.id);
                try {
                  await getApiClient().deleteAirport(row.original.id);
                  await load();
                } catch (error) {
                  setFormError(getVolsErrorMessage(error));
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

  const airports = state.status === 'ready' ? state.airports : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 sm:max-w-md">
          <Input
            type="search"
            placeholder="Rechercher par IATA, nom ou ville…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        {!showForm ? (
          <Button
            type="button"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            Nouvel aéroport
          </Button>
        ) : null}
      </div>

      {showForm ? (
        <Card variant="dashboard" className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-sm font-medium">
              {editing ? 'Modifier l’aéroport' : 'Nouvel aéroport'}
            </h3>
            {formError ? (
              <p role="alert" className="text-sm text-red-600">
                {formError}
              </p>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Code IATA"
                maxLength={3}
                value={formValues.iataCode}
                onChange={(e) =>
                  setFormValues((p) => ({ ...p, iataCode: e.target.value.toUpperCase() }))
                }
              />
              <Input
                label="Code pays"
                maxLength={2}
                value={formValues.countryCode}
                onChange={(e) =>
                  setFormValues((p) => ({
                    ...p,
                    countryCode: e.target.value.toUpperCase(),
                  }))
                }
              />
            </div>
            <Input
              label="Nom"
              value={formValues.name}
              onChange={(e) => setFormValues((p) => ({ ...p, name: e.target.value }))}
            />
            <Input
              label="Ville"
              value={formValues.city}
              onChange={(e) => setFormValues((p) => ({ ...p, city: e.target.value }))}
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
        <>
          <Card variant="dashboard" padding="none">
            <DataTable
              columns={columns}
              data={airports}
              isLoading={state.status === 'loading'}
              emptyMessage="Aucun aéroport."
              getRowId={(r) => r.id}
            />
          </Card>
          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel="aéroport"
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
