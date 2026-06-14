'use client';

import {
  Button,
  Card,
  DataTableActionButton,
  DataTableActions,
  DataTablePagination,
  Input,
} from '@africatourismgate/ui';
import type { Amenity } from '@africatourismgate/types';
import { useCallback, useEffect, useState } from 'react';
import { getAmenityIcon } from '../../lib/amenity-icon-map';
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
          {state.status === 'loading' ? (
            <p className="text-sm text-atg-muted">Chargement…</p>
          ) : amenities.length === 0 ? (
            <p className="text-sm text-atg-muted">Aucun équipement.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {amenities.map((a) => (
                <li key={a.id}>
                  <Card variant="dashboard" className="flex h-full flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-atg-surface text-primary">
                        {getAmenityIcon(a.code, 'h-5 w-5')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-atg-fg">{a.name}</p>
                        <code className="font-mono text-xs text-atg-muted">{a.code}</code>
                      </div>
                    </div>
                    <div className="mt-auto flex justify-end border-t border-atg-border pt-3">
                      <DataTableActions>
                        <DataTableActionButton action="edit" onClick={() => openEdit(a)} />
                        <DataTableActionButton
                          action="delete"
                          onClick={() => void handleDelete(a)}
                          disabled={deletingId === a.id}
                          loading={deletingId === a.id}
                        />
                      </DataTableActions>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
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
