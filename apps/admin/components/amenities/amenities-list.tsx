'use client';

import {
  Button,
  Card,
  DataTable,
  DataTablePagination,
  Input,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { Amenity } from '@africatourismgate/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getHebergementsErrorMessage } from '../../lib/hebergements-errors';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

type AmenityFormValues = { code: string; name: string };

const emptyForm: AmenityFormValues = { code: '', name: '' };

export function AmenitiesList() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; amenities: Amenity[]; total: number; totalPages: number }
  >({ status: 'loading' });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Amenity | null>(null);
  const [formValues, setFormValues] = useState<AmenityFormValues>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listAmenities({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
      });
      setState({
        status: 'ready',
        amenities: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getHebergementsErrorMessage(error) });
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

  function openCreate() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(a: Amenity) {
    setEditing(a);
    setFormValues({ code: a.code, name: a.name });
    setShowForm(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!formValues.code.trim() || !formValues.name.trim()) {
      setFormError('Code et nom sont obligatoires.');
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        code: formValues.code.trim().toLowerCase(),
        name: formValues.name.trim(),
      };
      if (editing) {
        await getApiClient().updateAmenity(editing.id, body);
      } else {
        await getApiClient().createAmenity(body);
      }
      resetForm();
      await load();
    } catch (error) {
      setFormError(getHebergementsErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const handleDelete = useCallback(
    async (a: Amenity) => {
      if (!window.confirm(`Supprimer l’équipement « ${a.name} » ?`)) return;
      setDeletingId(a.id);
      try {
        await getApiClient().deleteAmenity(a.id);
        await load();
      } catch (error) {
        setFormError(getHebergementsErrorMessage(error));
      } finally {
        setDeletingId(null);
      }
    },
    [load],
  );

  const columns = useMemo<ColumnDef<Amenity, unknown>[]>(
    () => [
      {
        accessorKey: 'code',
        header: 'Code',
        cell: ({ row }) => (
          <code className="font-mono text-xs text-atg-muted">{row.original.code}</code>
        ),
      },
      { accessorKey: 'name', header: 'Nom' },
      {
        id: 'actions',
        header: 'Actions',
        meta: { align: 'right' },
        cell: ({ row }) => (
          <div className="flex justify-end gap-1.5">
            <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(row.original)}>
              Modifier
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => void handleDelete(row.original)}
              disabled={deletingId === row.original.id}
              loading={deletingId === row.original.id}
              className="!text-red-600"
            >
              Supprimer
            </Button>
          </div>
        ),
      },
    ],
    [deletingId, handleDelete],
  );

  const amenities = state.status === 'ready' ? state.amenities : [];

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
        <div className="flex gap-2">
          <Button href="/hebergements" variant="outline">
            Hébergements
          </Button>
          {!showForm ? (
            <Button type="button" onClick={openCreate}>
              Nouvel équipement
            </Button>
          ) : null}
        </div>
      </div>

      {showForm ? (
        <Card variant="dashboard" className="max-w-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-sm font-medium">
              {editing ? 'Modifier l’équipement' : 'Nouvel équipement'}
            </h3>
            {formError ? (
              <p role="alert" className="text-sm text-red-600">
                {formError}
              </p>
            ) : null}
            <Input
              label="Code"
              value={formValues.code}
              onChange={(e) =>
                setFormValues((p) => ({ ...p, code: e.target.value.toLowerCase() }))
              }
              hint="Ex. wifi, pool_parking"
              disabled={Boolean(editing)}
              required
            />
            <Input
              label="Nom"
              value={formValues.name}
              onChange={(e) => setFormValues((p) => ({ ...p, name: e.target.value }))}
              required
            />
            <div className="flex gap-3">
              <Button type="submit" loading={submitting}>
                {editing ? 'Enregistrer' : 'Créer'}
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
          <Card variant="dashboard" padding="none" className="overflow-hidden">
            <DataTable
              columns={columns}
              data={amenities}
              isLoading={state.status === 'loading'}
              emptyMessage="Aucun équipement."
              getRowId={(row) => row.id}
            />
          </Card>
          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel="équipement"
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
