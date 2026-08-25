'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  AlertDialog,
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
  Input,
  Modal,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { FlightImage } from '@africatourismgate/types';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminImageViewerModal } from '../admin-image-viewer-modal';
import { getApiClient, resolveApiBaseUrl } from '../../lib/auth/api';
import { getSession } from '../../lib/auth/session';
import { FlightPhotosCarousel } from './flight-photos-carousel';

const FLIGHT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_FLIGHT_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

type ImageFormValues = {
  url: string;
  caption: string;
  sortOrder: string;
};

const emptyForm: ImageFormValues = { url: '', caption: '', sortOrder: '0' };

type FlightImagesSectionProps = {
  flightId: string;
  embedded?: boolean;
  /** Panneau compact à droite du formulaire (carrousel + actions). */
  variant?: 'default' | 'aside';
  altFallback?: string;
};

export function FlightImagesSection({
  flightId,
  embedded,
  variant = 'default',
  altFallback,
}: FlightImagesSectionProps) {
  const { vols: getVolsErrorMessage } = useAdminErrorMessages();
  const tGallery = useTranslations('modules.common.imagesGallery');
  const tCommon = useTranslations('modules.common');
  const tActions = useTranslations('common.actions');
  const emptyDash = tCommon('empty.dash');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; images: FlightImage[] }
  >({ status: 'loading' });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FlightImage | null>(null);
  const [formValues, setFormValues] = useState<ImageFormValues>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<FlightImage | null>(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listFlightImages({
        flightId,
        page: 1,
        limit: 100,
      });
      setState({
        status: 'ready',
        images: [...result.data].sort(
          (a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt),
        ),
      });
    } catch (error) {
      setState({ status: 'error', message: getVolsErrorMessage(error) });
    }
  }, [flightId, getVolsErrorMessage]);

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
    setFormValues(emptyForm);
    setEditing(null);
    setFormError(null);
    setUploading(false);
    setShowForm(true);
  }

  function openEdit(img: FlightImage) {
    setEditing(img);
    setFormValues({
      url: img.url,
      caption: img.caption ?? '',
      sortOrder: String(img.sortOrder),
    });
    setShowForm(true);
    setFormError(null);
  }

  const openViewer = useCallback(
    (img: FlightImage) => {
      if (state.status !== 'ready') return;
      const index = state.images.findIndex((image) => image.id === img.id);
      if (index >= 0) setViewerIndex(index);
    },
    [state],
  );

  async function handleLocalImagePick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (!ALLOWED_FLIGHT_IMAGE_TYPES.has(file.type)) {
        setFormError(tCommon('validation.imageFormat'));
        return;
      }
      if (file.size > FLIGHT_IMAGE_MAX_BYTES) {
        setFormError(tCommon('validation.imageTooLarge'));
        return;
      }
      const session = getSession();
      if (!session?.accessToken) {
        setFormError(tCommon('validation.sessionExpiredRetry'));
        return;
      }
      setUploading(true);
      setFormError(null);
      const body = new FormData();
      body.append('file', file);
      const response = await fetch(`${resolveApiBaseUrl()}/flights/${flightId}/upload-image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        body,
      });
      if (!response.ok) {
        throw new Error('Upload flight image failed');
      }
      const payload = (await response.json()) as { url?: string };
      if (!payload.url) {
        throw new Error('Invalid upload response');
      }
      setFormValues((prev) => ({ ...prev, url: payload.url! }));
    } catch {
      setFormError(tCommon('validation.uploadFailed'));
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!formValues.url.trim()) {
      setFormError(tCommon('validation.urlRequired'));
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
        await client.updateFlightImage(editing.id, body);
      } else {
        await client.createFlightImage({ flightId, ...body });
      }
      resetForm();
      await load();
    } catch (error) {
      setFormError(getVolsErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const handleDeleteRequest = useCallback((img: FlightImage) => {
    setConfirmTarget(img);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const img = confirmTarget;
    setConfirmTarget(null);
    setDeleteError(null);
    setDeletingId(img.id);
    try {
      await getApiClient().deleteFlightImage(img.id);
      await load();
    } catch (error) {
      setDeleteError(getVolsErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, getVolsErrorMessage, load]);

  const columns = useMemo<ColumnDef<FlightImage, unknown>[]>(
    () => [
      {
        id: 'preview',
        header: tCommon('columns.preview'),
        cell: ({ row }) => (
          <button type="button" onClick={() => openViewer(row.original)} className="block">
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
          </button>
        ),
      },
      {
        accessorKey: 'url',
        header: tCommon('columns.url'),
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
        header: tCommon('columns.caption'),
        cell: ({ row }) => (
          <span className="text-sm text-atg-muted">{row.original.caption ?? emptyDash}</span>
        ),
      },
      {
        accessorKey: 'sortOrder',
        header: tCommon('columns.sortOrder'),
        meta: { align: 'center' },
      },
      {
        id: 'actions',
        header: tCommon('columns.actions'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <DataTableActions>
            <DataTableActionButton action="edit" onClick={() => openEdit(row.original)} />
            <DataTableActionButton
              action="delete"
              onClick={() => handleDeleteRequest(row.original)}
              disabled={deletingId === row.original.id}
              loading={deletingId === row.original.id}
            />
          </DataTableActions>
        ),
      },
    ],
    [deletingId, emptyDash, handleDeleteRequest, openViewer, tCommon],
  );

  const images = state.status === 'ready' ? state.images : [];

  return (
    <>
      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(open) => {
          if (!open) setConfirmTarget(null);
        }}
        title={tGallery('deleteTitle')}
        description={tGallery('deleteConfirm')}
        confirmLabel={tGallery('deleteConfirmButton')}
        cancelLabel={tGallery('cancel')}
        variant="danger"
        loading={!!deletingId}
        error={deleteError}
        onConfirm={() => void handleDeleteConfirm()}
      />

      <Modal
        open={showForm}
        onOpenChange={(open) => {
          if (!open && !submitting && !uploading) resetForm();
        }}
        title={editing ? tGallery('editPhoto') : tGallery('newPhoto')}
        showClose={!submitting && !uploading}
        closeAriaLabel={tActions('close')}
        className="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError ? (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {formError}
            </p>
          ) : null}
          <div className="space-y-3">
            <p className="text-xs font-medium text-atg-fg">{tCommon('form.image')}</p>
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center rounded-md border border-atg-border px-3 py-2 text-xs font-medium text-atg-fg hover:bg-atg-muted/10">
                {uploading ? tCommon('form.uploading') : tCommon('form.chooseFile')}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => void handleLocalImagePick(e)}
                  disabled={uploading || submitting}
                />
              </label>
              <span className="text-xs text-atg-muted">{tCommon('form.imageFormatHint')}</span>
            </div>
            {formValues.url.trim() ? (
              <Image
                src={formValues.url.trim()}
                alt={formValues.caption.trim() || tCommon('columns.preview')}
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
            label={tCommon('form.externalUrlOptional')}
            type="url"
            value={formValues.url}
            onChange={(e) => setFormValues((p) => ({ ...p, url: e.target.value }))}
            placeholder={tCommon('form.urlPlaceholder')}
          />
          <Input
            label={tCommon('columns.caption')}
            value={formValues.caption}
            onChange={(e) => setFormValues((p) => ({ ...p, caption: e.target.value }))}
          />
          <Input
            label={tCommon('form.displayOrder')}
            type="number"
            min={0}
            value={formValues.sortOrder}
            onChange={(e) => setFormValues((p) => ({ ...p, sortOrder: e.target.value }))}
          />
          <div className="flex gap-3 pt-1">
            <Button type="submit" loading={submitting} disabled={uploading}>
              {editing ? tActions('save') : tActions('create')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={submitting || uploading}
            >
              {tActions('cancel')}
            </Button>
          </div>
        </form>
      </Modal>

      <AdminImageViewerModal
        open={viewerIndex !== null}
        onOpenChange={(open) => {
          if (!open) setViewerIndex(null);
        }}
        images={images}
        index={viewerIndex ?? 0}
        onIndexChange={setViewerIndex}
        fallbackLabel={altFallback || tGallery('title')}
      />

      {variant === 'aside' ? (
        <Card variant="dashboard" padding="sm">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-atg-fg">{tGallery('title')}</h3>
                {state.status === 'ready' ? (
                  <DataTableBadge variant="muted">{images.length}</DataTableBadge>
                ) : null}
              </div>
            </div>
            <Button type="button" size="sm" onClick={openCreate}>
              {tGallery('addPhoto')}
            </Button>
          </div>

          <div className="mt-3">
            {state.status === 'loading' ? (
              <p className="text-sm text-atg-muted">{tCommon('dataTable.loading')}</p>
            ) : state.status === 'error' ? (
              <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                {state.message}
              </p>
            ) : (
              <>
                <FlightPhotosCarousel
                  images={images}
                  altFallback={altFallback || tGallery('title')}
                />
                {images.length > 0 ? (
                  <ul className="mt-3 max-h-40 space-y-1 overflow-y-auto">
                    {images.map((image, index) => (
                      <li
                        key={image.id}
                        className="flex items-center gap-2 rounded-md border border-atg-border px-2 py-1.5"
                      >
                        <button
                          type="button"
                          onClick={() => openViewer(image)}
                          className="min-w-0 flex-1 truncate text-left text-xs text-atg-fg hover:text-primary"
                        >
                          {image.caption?.trim() || `#${image.sortOrder || index + 1}`}
                        </button>
                        <DataTableActions>
                          <DataTableActionButton
                            action="edit"
                            onClick={() => openEdit(image)}
                          />
                          <DataTableActionButton
                            action="delete"
                            onClick={() => handleDeleteRequest(image)}
                            disabled={deletingId === image.id}
                            loading={deletingId === image.id}
                          />
                        </DataTableActions>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </>
            )}
          </div>
        </Card>
      ) : (
        <section
          className={
            embedded ? 'space-y-6' : 'mt-12 space-y-6 border-t border-atg-border pt-10'
          }
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-atg-fg">{tGallery('title')}</h2>
              <p className="mt-1 text-sm text-atg-muted">{tGallery('intro')}</p>
            </div>
            <Button type="button" onClick={openCreate}>
              {tGallery('addPhoto')}
            </Button>
          </div>

          {state.status === 'error' ? (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {state.message}
            </p>
          ) : (
            <Card variant="dashboard" padding="none" className="overflow-hidden">
              <DataTable
                columns={columns}
                data={images}
                isLoading={state.status === 'loading'}
                emptyMessage={tGallery('emptyDefault')}
                getRowId={(row) => row.id}
              />
            </Card>
          )}
        </section>
      )}
    </>
  );
}
