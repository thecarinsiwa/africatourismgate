'use client';

import {
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  Input,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { PointOfInterest } from '@africatourismgate/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getDestinationsErrorMessage } from '../../lib/destinations-errors';

type PoiFormValues = {
  name: string;
  latitude: string;
  longitude: string;
};

const emptyPoiForm: PoiFormValues = {
  name: '',
  latitude: '',
  longitude: '',
};

function parseCoord(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : undefined;
}

function formatCoord(value: string | null): string {
  if (value === null || value === '') return '—';
  const num = Number(value);
  return Number.isFinite(num) ? num.toFixed(5) : value;
}

type DestinationPoisSectionProps = {
  destinationId: string;
};

export function DestinationPoisSection({ destinationId }: DestinationPoisSectionProps) {
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; pois: PointOfInterest[] }
  >({ status: 'loading' });
  const [showForm, setShowForm] = useState(false);
  const [editingPoi, setEditingPoi] = useState<PointOfInterest | null>(null);
  const [formValues, setFormValues] = useState<PoiFormValues>(emptyPoiForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof PoiFormValues, string>>>(
    {},
  );
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listPointsOfInterest({
        destinationId,
        page: 1,
        limit: 100,
      });
      setState({ status: 'ready', pois: result.data });
    } catch (error) {
      setState({ status: 'error', message: getDestinationsErrorMessage(error) });
    }
  }, [destinationId]);

  useEffect(() => {
    void load();
  }, [load]);

  function resetForm() {
    setFormValues(emptyPoiForm);
    setFieldErrors({});
    setFormError(null);
    setEditingPoi(null);
    setShowForm(false);
  }

  function openCreateForm() {
    resetForm();
    setShowForm(true);
  }

  function openEditForm(poi: PointOfInterest) {
    setEditingPoi(poi);
    setFormValues({
      name: poi.name,
      latitude: poi.latitude ?? '',
      longitude: poi.longitude ?? '',
    });
    setFieldErrors({});
    setFormError(null);
    setShowForm(true);
  }

  function validatePoiForm(): boolean {
    const errors: Partial<Record<keyof PoiFormValues, string>> = {};
    if (!formValues.name.trim()) {
      errors.name = 'Le nom est obligatoire.';
    }
    const lat = parseCoord(formValues.latitude);
    const lng = parseCoord(formValues.longitude);
    if (formValues.latitude.trim() && lat === undefined) {
      errors.latitude = 'Latitude invalide (-90 à 90).';
    } else if (lat !== undefined && (lat < -90 || lat > 90)) {
      errors.latitude = 'Latitude hors plage (-90 à 90).';
    }
    if (formValues.longitude.trim() && lng === undefined) {
      errors.longitude = 'Longitude invalide (-180 à 180).';
    } else if (lng !== undefined && (lng < -180 || lng > 180)) {
      errors.longitude = 'Longitude hors plage (-180 à 180).';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmitPoi(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!validatePoiForm()) return;

    setSubmitting(true);
    try {
      const client = getApiClient();
      const latitude = parseCoord(formValues.latitude);
      const longitude = parseCoord(formValues.longitude);
      const body = {
        name: formValues.name.trim(),
        ...(latitude !== undefined ? { latitude } : {}),
        ...(longitude !== undefined ? { longitude } : {}),
      };

      if (editingPoi) {
        await client.updatePointOfInterest(editingPoi.id, body);
      } else {
        await client.createPointOfInterest({
          destinationId,
          ...body,
        });
      }
      resetForm();
      await load();
    } catch (error) {
      setFormError(getDestinationsErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const handleDelete = useCallback(
    async (poi: PointOfInterest) => {
      if (!window.confirm(`Supprimer le point d’intérêt « ${poi.name} » ?`)) {
        return;
      }
      setDeletingId(poi.id);
      try {
        await getApiClient().deletePointOfInterest(poi.id);
        await load();
      } catch (error) {
        setFormError(getDestinationsErrorMessage(error));
      } finally {
        setDeletingId(null);
      }
    },
    [load],
  );

  const columns = useMemo<ColumnDef<PointOfInterest, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Nom',
        cell: ({ row }) => (
          <span className="font-medium text-atg-fg">{row.original.name}</span>
        ),
      },
      {
        id: 'latitude',
        header: 'Latitude',
        meta: { align: 'right' },
        cell: ({ row }) => (
          <span className="font-mono text-xs tabular-nums text-atg-muted">
            {formatCoord(row.original.latitude)}
          </span>
        ),
      },
      {
        id: 'longitude',
        header: 'Longitude',
        meta: { align: 'right' },
        cell: ({ row }) => (
          <span className="font-mono text-xs tabular-nums text-atg-muted">
            {formatCoord(row.original.longitude)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        meta: { align: 'right' },
        cell: ({ row }) => {
          const poi = row.original;
          return (
            <DataTableActions>
              <DataTableActionButton action="edit" onClick={() => openEditForm(poi)} />
              <DataTableActionButton
                action="delete"
                onClick={() => void handleDelete(poi)}
                disabled={deletingId === poi.id}
                loading={deletingId === poi.id}
              />
            </DataTableActions>
          );
        },
      },
    ],
    [deletingId, handleDelete],
  );

  const pois = state.status === 'ready' ? state.pois : [];

  return (
    <section className="mt-12 space-y-6 border-t border-atg-border pt-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-atg-fg">Points d’intérêt</h2>
          <p className="mt-1 text-sm text-atg-muted">
            Lieux remarquables liés à cette destination (coordonnées optionnelles).
          </p>
        </div>
        {!showForm ? (
          <Button type="button" onClick={openCreateForm}>
            Ajouter un POI
          </Button>
        ) : null}
      </div>

      {formError && !showForm ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {formError}
        </p>
      ) : null}

      {showForm ? (
        <Card variant="dashboard" className="max-w-2xl">
          <form onSubmit={handleSubmitPoi} className="space-y-4">
            <h3 className="text-sm font-medium text-atg-fg">
              {editingPoi ? 'Modifier le point d’intérêt' : 'Nouveau point d’intérêt'}
            </h3>
            {formError ? (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
              >
                {formError}
              </p>
            ) : null}
            <Input
              label="Nom"
              name="poiName"
              value={formValues.name}
              onChange={(e) => {
                setFormValues((prev) => ({ ...prev, name: e.target.value }));
                setFieldErrors((prev) => ({ ...prev, name: undefined }));
              }}
              error={fieldErrors.name}
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Latitude"
                name="latitude"
                type="number"
                step="any"
                value={formValues.latitude}
                onChange={(e) => {
                  setFormValues((prev) => ({ ...prev, latitude: e.target.value }));
                  setFieldErrors((prev) => ({ ...prev, latitude: undefined }));
                }}
                placeholder="-4.3058"
                hint="Optionnel, -90 à 90"
                error={fieldErrors.latitude}
              />
              <Input
                label="Longitude"
                name="longitude"
                type="number"
                step="any"
                value={formValues.longitude}
                onChange={(e) => {
                  setFormValues((prev) => ({ ...prev, longitude: e.target.value }));
                  setFieldErrors((prev) => ({ ...prev, longitude: undefined }));
                }}
                placeholder="15.3000"
                hint="Optionnel, -180 à 180"
                error={fieldErrors.longitude}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="submit" loading={submitting} loadingText="Enregistrement…">
                {editingPoi ? 'Enregistrer' : 'Ajouter'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {state.status === 'error' ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      ) : (
        <Card variant="dashboard" padding="none" className="overflow-hidden">
          <DataTable
            columns={columns}
            data={pois}
            isLoading={state.status === 'loading'}
            emptyMessage="Aucun point d’intérêt pour cette destination."
            getRowId={(row) => row.id}
            aria-label="Points d’intérêt de la destination"
          />
        </Card>
      )}
    </section>
  );
}
