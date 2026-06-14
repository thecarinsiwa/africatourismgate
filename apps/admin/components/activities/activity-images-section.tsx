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
import type { ActivityImage } from '@africatourismgate/types';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient, resolveApiBaseUrl } from '../../lib/auth/api';
import { getSession } from '../../lib/auth/session';
import { getActivitiesErrorMessage } from '../../lib/activities-errors';

const ACTIVITY_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_ACTIVITY_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

type ImageFormValues = {
  url: string;
  caption: string;
  sortOrder: string;
};

const emptyForm: ImageFormValues = { url: '', caption: '', sortOrder: '0' };

type ActivityImagesSectionProps = {
  activityId: string;
  embedded?: boolean;
};

export function ActivityImagesSection({ activityId, embedded }: ActivityImagesSectionProps) {
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; images: ActivityImage[] }
  >({ status: 'loading' });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ActivityImage | null>(null);
  const [formValues, setFormValues] = useState<ImageFormValues>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listActivityImages({
        activityId,
        page: 1,
        limit: 100,
      });
      setState({ status: 'ready', images: result.data });
    } catch (error) {
      setState({ status: 'error', message: getActivitiesErrorMessage(error) });
    }
  }, [activityId]);

  useEffect(() => {
    void load();
  }, [load]);

  function resetForm() {
    setFormValues(emptyForm);
    setEditing(null);
    setShowForm(false);
    setFormError(null);
    setUploading(false);
  }

  function openCreate() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(img: ActivityImage) {
    setEditing(img);
    setFormValues({
      url: img.url,
      caption: img.caption ?? '',
      sortOrder: String(img.sortOrder),
    });
    setShowForm(true);
    setFormError(null);
  }

  async function handleLocalImagePick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (!ALLOWED_ACTIVITY_IMAGE_TYPES.has(file.type)) {
        setFormError('Format accepté : JPEG, PNG ou WebP.');
        return;
      }
      if (file.size > ACTIVITY_IMAGE_MAX_BYTES) {
        setFormError('Image trop lourde (max 5 Mo).');
        return;
      }
      const session = getSession();
      if (!session?.accessToken) {
        setFormError('Session expirée. Reconnectez-vous puis réessayez.');
        return;
      }
      setUploading(true);
      setFormError(null);
      const body = new FormData();
      body.append('file', file);
      const response = await fetch(
        `${resolveApiBaseUrl()}/activities/${activityId}/upload-image`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
          body,
        },
      );
      if (!response.ok) {
        throw new Error('Upload activity image failed');
      }
      const payload = (await response.json()) as { url?: string };
      if (!payload.url) {
        throw new Error('Invalid upload response');
      }
      setFormValues((prev) => ({ ...prev, url: payload.url! }));
    } catch {
      setFormError("Impossible d'uploader l'image locale.");
    } finally {
      setUploading(false);
      event.target.value = '';
    }
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
        await client.updateActivityImage(editing.id, body);
      } else {
        await client.createActivityImage({ activityId, ...body });
      }
      resetForm();
      await load();
    } catch (error) {
      setFormError(getActivitiesErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const handleDelete = useCallback(
    async (img: ActivityImage) => {
      if (!window.confirm('Supprimer cette image ?')) return;
      setDeletingId(img.id);
      try {
        await getApiClient().deleteActivityImage(img.id);
        await load();
      } catch (error) {
        setFormError(getActivitiesErrorMessage(error));
      } finally {
        setDeletingId(null);
      }
    },
    [load],
  );

  const columns = useMemo<ColumnDef<ActivityImage, unknown>[]>(
    () => [
      {
        id: 'preview',
        header: 'Aperçu',
        cell: ({ row }) => (
          <Image
            src={row.original.url}
            alt=""
            width={64}
            height={40}
            unoptimized
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
          <DataTableActions>
            <DataTableActionButton action="edit" onClick={() => openEdit(row.original)} />
            <DataTableActionButton
              action="delete"
              onClick={() => void handleDelete(row.original)}
              disabled={deletingId === row.original.id}
              loading={deletingId === row.original.id}
            />
          </DataTableActions>
        ),
      },
    ],
    [deletingId, handleDelete],
  );

  const images = state.status === 'ready' ? state.images : [];

  return (
    <section
      className={
        embedded ? 'space-y-6' : 'mt-12 space-y-6 border-t border-atg-border pt-10'
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-atg-fg">Galerie photos</h2>
          <p className="mt-1 text-sm text-atg-muted">
            Uploadez une photo ou saisissez une URL externe.
          </p>
        </div>
        {!showForm ? (
          <Button type="button" onClick={openCreate}>
            Ajouter une photo
          </Button>
        ) : null}
      </div>

      {showForm ? (
        <Card variant="dashboard" className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-sm font-medium">
              {editing ? 'Modifier la photo' : 'Nouvelle photo'}
            </h3>
            {formError ? (
              <p role="alert" className="text-sm text-red-600">
                {formError}
              </p>
            ) : null}
            <div className="space-y-3">
              <p className="text-xs font-medium text-atg-fg">Image</p>
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center rounded-md border border-atg-border px-3 py-2 text-xs font-medium text-atg-fg hover:bg-atg-muted/10">
                  {uploading ? 'Upload en cours…' : 'Choisir un fichier'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => void handleLocalImagePick(e)}
                    disabled={uploading || submitting}
                  />
                </label>
                <span className="text-xs text-atg-muted">JPEG, PNG ou WebP, max 5 Mo</span>
              </div>
              {formValues.url.trim() ? (
                <Image
                  src={formValues.url.trim()}
                  alt={formValues.caption.trim() || 'Aperçu'}
                  width={320}
                  height={200}
                  unoptimized
                  className="h-40 w-full max-w-sm rounded-lg border border-atg-border object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : null}
            </div>
            <Input
              label="URL externe (optionnel si upload)"
              type="url"
              value={formValues.url}
              onChange={(e) => setFormValues((p) => ({ ...p, url: e.target.value }))}
              placeholder="https://..."
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
              <Button type="submit" loading={submitting} disabled={uploading}>
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
            emptyMessage="Aucune photo."
            getRowId={(row) => row.id}
          />
        </Card>
      )}
    </section>
  );
}
