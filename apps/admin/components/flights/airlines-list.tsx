'use client';

import {
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTablePagination,
  Input,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { Airline } from '@africatourismgate/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getVolsErrorMessage } from '../../lib/vols-errors';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

type FormValues = { iataCode: string; name: string };
const emptyForm: FormValues = { iataCode: '', name: '' };

export function AirlinesList() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; airlines: Airline[]; total: number; totalPages: number }
  >({ status: 'loading' });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Airline | null>(null);
  const [formValues, setFormValues] = useState<FormValues>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listAirlines({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
      });
      setState({
        status: 'ready',
        airlines: result.data,
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
    if (formValues.iataCode.trim().length !== 2 || !formValues.name.trim()) {
      setFormError('Code IATA (2 lettres) et nom sont obligatoires.');
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        iataCode: formValues.iataCode.trim().toUpperCase(),
        name: formValues.name.trim(),
      };
      if (editing) {
        await getApiClient().updateAirline(editing.id, body);
      } else {
        await getApiClient().createAirline(body);
      }
      resetForm();
      await load();
    } catch (error) {
      setFormError(getVolsErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const columns = useMemo<ColumnDef<Airline, unknown>[]>(
    () => [
      {
        accessorKey: 'iataCode',
        header: 'IATA',
        cell: ({ row }) => (
          <code className="font-mono text-sm">{row.original.iataCode}</code>
        ),
      },
      { accessorKey: 'name', header: 'Compagnie' },
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
                  iataCode: row.original.iataCode,
                  name: row.original.name,
                });
                setShowForm(true);
              }}
            />
            <DataTableActionButton
              action="delete"
              onClick={async () => {
                if (!window.confirm(`Supprimer « ${row.original.name} » ?`)) return;
                setDeletingId(row.original.id);
                try {
                  await getApiClient().deleteAirline(row.original.id);
                  await load();
                } catch (error) {
                  setFormError(getVolsErrorMessage(error));
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
    [deletingId, load],
  );

  const airlines = state.status === 'ready' ? state.airlines : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 sm:max-w-md">
          <Input
            type="search"
            placeholder="Rechercher par code IATA ou nom…"
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
            Nouvelle compagnie
          </Button>
        ) : null}
      </div>

      {showForm ? (
        <Card variant="dashboard" className="max-w-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-sm font-medium">
              {editing ? 'Modifier la compagnie' : 'Nouvelle compagnie'}
            </h3>
            {formError ? (
              <p role="alert" className="text-sm text-red-600">
                {formError}
              </p>
            ) : null}
            <Input
              label="Code IATA"
              maxLength={2}
              value={formValues.iataCode}
              onChange={(e) =>
                setFormValues((p) => ({ ...p, iataCode: e.target.value.toUpperCase() }))
              }
            />
            <Input
              label="Nom"
              value={formValues.name}
              onChange={(e) => setFormValues((p) => ({ ...p, name: e.target.value }))}
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
              data={airlines}
              isLoading={state.status === 'loading'}
              emptyMessage="Aucune compagnie."
              getRowId={(r) => r.id}
            />
          </Card>
          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel="compagnie"
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
