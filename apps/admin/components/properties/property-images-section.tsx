'use client';

import {
  Button,
  Card,
  DataTable,
  Input,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { PropertyImage } from '@africatourismgate/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getHebergementsErrorMessage } from '../../lib/hebergements-errors';

type ImageFormValues = {
  url: string;
  caption: string;
  sortOrder: string;
};

const emptyForm: ImageFormValues = { url: '', caption: '', sortOrder: '0' };

type PropertyImagesSectionProps = {
  propertyId: string;
};

export function PropertyImagesSection({ propertyId }: PropertyImagesSectionProps) {
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; images: PropertyImage[] }
  >({ status: 'loading' });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PropertyImage | null>(null);
  const [formValues, setFormValues] = useState<ImageFormValues>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listPropertyImages({
        propertyId,
        page: 1,
        limit: 100,
      });
      setState({ status: 'ready', images: result.data });
    } catch (error) {
      setState({ status: 'error', message: getHebergementsErrorMessage(error) });
    }
  }, [propertyId]);

  useEffect(() => {
    void load();
  }, [load]);

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

  function openEdit(img: PropertyImage) {
    setEditing(img);
    setFormValues({
      url: img.url,
      caption: img.caption ?? '',
      sortOrder: String(img.sortOrder),
    });
    setShowForm(true);
    setFormError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!formValues.url.trim()) {
      setFormError('L’URL est obligatoire.');
      return;
    }
    setSubmitting(true);
    try {
      const client = getApiClient();
      const sortOrder = Number(formValues.sortOrder) || 0;
      const body = {
        url: formValues.url.trim(),
        sortOrder,
        ...(formValues.caption.trim() ? { caption: formValues.caption.trim() } : {}),
      };
      if (editing) {
        await client.updatePropertyImage(editing.id, body);
      } else {
        await client.createPropertyImage({ propertyId, ...body });
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
    async (img: PropertyImage) => {
      if (!window.confirm('Supprimer cette image ?')) return;
      setDeletingId(img.id);
      try {
        await getApiClient().deletePropertyImage(img.id);
        await load();
      } catch (error) {
        setFormError(getHebergementsErrorMessage(error));
      } finally {
        setDeletingId(null);
      }
    },
    [load],
  );

  const columns = useMemo<ColumnDef<PropertyImage, unknown>[]>(
    () => [
      {
        id: 'preview',
        header: 'Aperçu',
        cell: ({ row }) => (
          <img
            src={row.original.url}
            alt=""
            className="h-10 w-16 rounded object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ),
      },
      {
        accessorKey: 'url',
        header: 'URL',
        cell: ({ row }) => (
          <a
            href={row.original.url}
            target="_blank"
            rel="noreferrer"
            className="max-w-xs truncate text-sm text-primary hover:underline"
          >
            {row.original.url}
          </a>
        ),
      },
      {
        accessorKey: 'caption',
        header: 'Légende',
        cell: ({ row }) => (
          <span className="text-sm text-atg-muted">{row.original.caption ?? '—'}</span>
        ),
      },
      {
        accessorKey: 'sortOrder',
        header: 'Ordre',
        meta: { align: 'center' },
      },
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

  const images = state.status === 'ready' ? state.images : [];

  return (
    <section className="mt-12 space-y-6 border-t border-atg-border pt-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-atg-fg">Images</h2>
          <p className="mt-1 text-sm text-atg-muted">URLs des photos de la propriété.</p>
        </div>
        {!showForm ? (
          <Button type="button" onClick={openCreate}>
            Ajouter une image
          </Button>
        ) : null}
      </div>

      {showForm ? (
        <Card variant="dashboard" className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-sm font-medium">
              {editing ? 'Modifier l’image' : 'Nouvelle image'}
            </h3>
            {formError ? (
              <p role="alert" className="text-sm text-red-600">
                {formError}
              </p>
            ) : null}
            <Input
              label="URL"
              type="url"
              value={formValues.url}
              onChange={(e) => setFormValues((p) => ({ ...p, url: e.target.value }))}
              required
            />
            <Input
              label="Légende"
              value={formValues.caption}
              onChange={(e) => setFormValues((p) => ({ ...p, caption: e.target.value }))}
            />
            <Input
              label="Ordre d’affichage"
              type="number"
              min={0}
              value={formValues.sortOrder}
              onChange={(e) => setFormValues((p) => ({ ...p, sortOrder: e.target.value }))}
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
        <Card variant="dashboard" padding="none" className="overflow-hidden">
          <DataTable
            columns={columns}
            data={images}
            isLoading={state.status === 'loading'}
            emptyMessage="Aucune image."
            getRowId={(row) => row.id}
          />
        </Card>
      )}
    </section>
  );
}
