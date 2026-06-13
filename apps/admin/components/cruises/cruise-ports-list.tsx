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
import type { CruisePort } from '@africatourismgate/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getCroisieresErrorMessage } from '../../lib/croisieres-errors';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

type FormValues = { code: string; name: string; countryCode: string };
const emptyForm: FormValues = { code: '', name: '', countryCode: '' };

export function CruisePortsList() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; ports: CruisePort[]; total: number; totalPages: number }
  >({ status: 'loading' });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CruisePort | null>(null);
  const [formValues, setFormValues] = useState<FormValues>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listCruisePorts({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
      });
      setState({
        status: 'ready',
        ports: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getCroisieresErrorMessage(error) });
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
    const code = formValues.code.trim();
    const name = formValues.name.trim();
    const countryCode = formValues.countryCode.trim().toUpperCase();
    if (!code || !name || countryCode.length !== 2) {
      setFormError('Code, nom et pays (2 lettres) sont obligatoires.');
      return;
    }
    setSubmitting(true);
    try {
      const body = { code, name, countryCode };
      if (editing) {
        await getApiClient().updateCruisePort(editing.id, body);
      } else {
        await getApiClient().createCruisePort(body);
      }
      resetForm();
      await load();
    } catch (error) {
      setFormError(getCroisieresErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const columns = useMemo<ColumnDef<CruisePort, unknown>[]>(
    () => [
      {
        accessorKey: 'code',
        header: 'Code',
        cell: ({ row }) => (
          <code className="rounded-md bg-atg-surface px-2 py-0.5 font-mono text-sm">
            {row.original.code}
          </code>
        ),
      },
      { accessorKey: 'name', header: 'Port' },
      { accessorKey: 'countryCode', header: 'Pays' },
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
                  code: row.original.code,
                  name: row.original.name,
                  countryCode: row.original.countryCode,
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
                  await getApiClient().deleteCruisePort(row.original.id);
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
    [deletingId, load],
  );

  const ports = state.status === 'ready' ? state.ports : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 sm:max-w-md">
          <Input
            type="search"
            placeholder="Rechercher par code ou nom…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        {!showForm ? (
          <Button type="button" onClick={() => setShowForm(true)}>
            Nouveau port
          </Button>
        ) : null}
      </div>

      {showForm ? (
        <Card variant="dashboard" className="max-w-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-sm font-medium">
              {editing ? 'Modifier le port' : 'Nouveau port de croisière'}
            </h3>
            {formError ? (
              <p role="alert" className="text-sm text-red-600">
                {formError}
              </p>
            ) : null}
            <Input
              label="Code"
              value={formValues.code}
              onChange={(e) => setFormValues((p) => ({ ...p, code: e.target.value }))}
              required
            />
            <Input
              label="Nom"
              value={formValues.name}
              onChange={(e) => setFormValues((p) => ({ ...p, name: e.target.value }))}
              required
            />
            <Input
              label="Pays (ISO)"
              value={formValues.countryCode}
              onChange={(e) =>
                setFormValues((p) => ({ ...p, countryCode: e.target.value }))
              }
              maxLength={2}
              required
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
              data={ports}
              isLoading={state.status === 'loading'}
              emptyMessage="Aucun port."
              getRowId={(r) => r.id}
            />
          </Card>
          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel="port"
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
