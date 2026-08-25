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
import type { PropertyImage } from '@africatourismgate/types';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminImageViewerModal } from '../admin-image-viewer-modal';
import { getApiClient, resolveApiBaseUrl } from '../../lib/auth/api';
import { getSession } from '../../lib/auth/session';
import { resolveMediaUrl } from '../../lib/resolve-media-url';
import { PropertyPhotosCarousel } from './property-photos-carousel';

const PROPERTY_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_PROPERTY_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

type ImageFormValues = {
  url: string;
  caption: string;
  sortOrder: string;
};

const emptyForm: ImageFormValues = { url: '', caption: '', sortOrder: '0' };

type PropertyImagesSectionProps = {
  propertyId: string;
  embedded?: boolean;
  /** Panneau compact à droite de Identité (carrousel + actions). */
  variant?: 'default' | 'aside';
  altFallback?: string;
};

export function PropertyImagesSection({
  propertyId,
  embedded,
  variant = 'default',
  altFallback,
}: PropertyImagesSectionProps) {
  const { hebergements: getHebergementsErrorMessage } = useAdminErrorMessages();
  const tGallery = useTranslations('modules.common.imagesGallery');
  const tColumns = useTranslations('modules.common.columns');
  const tForm = useTranslations('modules.common.form');
  const tValidation = useTranslations('modules.common.validation');
  const tCommon = useTranslations('modules.common');
  const tActions = useTranslations('common.actions');
  const emptyDash = tCommon('empty.dash');
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
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<PropertyImage | null>(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listPropertyImages({
        propertyId,
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
      setState({ status: 'error', message: getHebergementsErrorMessage(error) });
    }
  }, [propertyId, getHebergementsErrorMessage]);

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

  async function handleLocalImagePick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (!ALLOWED_PROPERTY_IMAGE_TYPES.has(file.type)) {
        setFormError(tValidation('imageFormat'));
        return;
      }
      if (file.size > PROPERTY_IMAGE_MAX_BYTES) {
        setFormError(tValidation('imageTooLarge'));
        return;
      }
      const session = getSession();
      if (!session?.accessToken) {
        setFormError(tValidation('sessionExpiredRetry'));
        return;
      }
      setUploading(true);
      setFormError(null);
      const body = new FormData();
      body.append('file', file);
      const response = await fetch(
        `${resolveApiBaseUrl()}/properties/${propertyId}/upload-image`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
          body,
        },
      );
      if (!response.ok) {
        throw new Error('Upload property image failed');
      }
      const payload = (await response.json()) as { url?: string };
      if (!payload.url) {
        throw new Error('Invalid upload response');
      }
      setFormValues((prev) => ({ ...prev, url: payload.url! }));
    } catch {
      setFormError(tValidation('uploadFailed'));
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!formValues.url.trim()) {
      setFormError(tValidation('urlRequired'));
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

  const handleDeleteRequest = useCallback((img: PropertyImage) => {
    setConfirmTarget(img);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const img = confirmTarget;
    setConfirmTarget(null);
    setDeleteError(null);
    setDeletingId(img.id);
    try {
      await getApiClient().deletePropertyImage(img.id);
      await load();
    } catch (error) {
      setDeleteError(getHebergementsErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, load, getHebergementsErrorMessage]);

  const images = state.status === 'ready' ? state.images : [];

  const openViewer = useCallback(
    (img: PropertyImage) => {
      const index = images.findIndex((item) => item.id === img.id);
      setViewerIndex(index >= 0 ? index : 0);
    },
    [images],
  );

  const columns = useMemo<ColumnDef<PropertyImage, unknown>[]>(
    () => [
      {
        id: 'preview',
        header: tColumns('preview'),
        cell: ({ row }) => {
          const src = resolveMediaUrl(row.original.url);
          const caption = row.original.caption?.trim();
          return (
            <button
              type="button"
              onClick={() => openViewer(row.original)}
              className="flex min-w-0 items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={tGallery('viewerOpen')}
            >
              <span className="relative h-12 w-16 shrink-0 cursor-zoom-in overflow-hidden rounded-md border border-atg-border bg-atg-surface">
                <Image
                  src={src}
                  alt={caption || ''}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="64px"
                />
              </span>
              <div className="min-w-0 md:hidden">
                <p className="truncate text-sm font-medium text-atg-fg">
                  {caption || emptyDash}
                </p>
                <p className="mt-0.5 text-xs tabular-nums text-atg-muted">
                  #{row.original.sortOrder}
                </p>
              </div>
            </button>
          );
        },
      },
      {
        accessorKey: 'caption',
        header: tColumns('caption'),
        meta: { hideOnMobile: true },
        cell: ({ row }) => {
          const caption = row.original.caption?.trim();
          return (
            <span className="text-sm text-atg-fg">{caption || emptyDash}</span>
          );
        },
      },
      {
        accessorKey: 'sortOrder',
        header: tColumns('sortOrder'),
        meta: { align: 'center', hideOnMobile: true },
        cell: ({ row }) => (
          <DataTableBadge variant="muted">{row.original.sortOrder}</DataTableBadge>
        ),
      },
      {
        accessorKey: 'url',
        header: tColumns('url'),
        meta: { hideOnMobile: true },
        cell: ({ row }) => {
          const href = resolveMediaUrl(row.original.url);
          return (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="block max-w-[14rem] truncate text-sm text-primary hover:underline"
            >
              {row.original.url}
            </a>
          );
        },
      },
      {
        id: 'actions',
        header: tColumns('actions'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <DataTableActions className="opacity-90 transition-opacity group-hover:opacity-100">
            <DataTableActionButton
              action="view"
              label={tGallery('viewerOpen')}
              onClick={() => openViewer(row.original)}
            />
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
    [deletingId, emptyDash, handleDeleteRequest, openViewer, tColumns, tGallery],
  );

  const previewSrc = formValues.url.trim() ? resolveMediaUrl(formValues.url.trim()) : '';

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
            <p className="text-xs font-medium text-atg-fg">{tForm('image')}</p>
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center rounded-md border border-atg-border px-3 py-2 text-xs font-medium text-atg-fg hover:bg-atg-muted/10">
                {uploading ? tForm('uploading') : tForm('chooseFile')}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => void handleLocalImagePick(e)}
                  disabled={uploading || submitting}
                />
              </label>
              <span className="text-xs text-atg-muted">{tForm('imageFormatHint')}</span>
            </div>
            {previewSrc ? (
              <div className="relative h-40 w-full max-w-sm overflow-hidden rounded-lg border border-atg-border bg-atg-surface">
                <Image
                  src={previewSrc}
                  alt={formValues.caption.trim() || tColumns('preview')}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="320px"
                />
              </div>
            ) : null}
          </div>
          <Input
            label={tForm('externalUrlOptional')}
            type="url"
            value={formValues.url}
            onChange={(e) => setFormValues((p) => ({ ...p, url: e.target.value }))}
            placeholder={tForm('urlPlaceholder')}
          />
          <Input
            label={tColumns('caption')}
            value={formValues.caption}
            onChange={(e) => setFormValues((p) => ({ ...p, caption: e.target.value }))}
          />
          <Input
            label={tForm('displayOrder')}
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
        fallbackLabel={altFallback || tGallery('titleProperty')}
      />

      {variant === 'aside' ? (
        <Card variant="dashboard" padding="sm">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-atg-fg">{tGallery('titleProperty')}</h3>
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
                <PropertyPhotosCarousel
                  images={images}
                  altFallback={altFallback || tGallery('titleProperty')}
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
            embedded ? 'space-y-4' : 'mt-12 space-y-4 border-t border-atg-border pt-10'
          }
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-atg-fg">{tGallery('titleProperty')}</h2>
                {state.status === 'ready' ? (
                  <DataTableBadge variant="muted">{images.length}</DataTableBadge>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-atg-muted">{tGallery('intro')}</p>
            </div>
            <Button type="button" onClick={openCreate} size="sm">
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
                emptyMessage={tGallery('emptyProperty')}
                getRowId={(row) => row.id}
                aria-label={tGallery('titleProperty')}
                loadingMessage={tCommon('dataTable.loading')}
                expandRowLabel={tCommon('dataTable.expandRow')}
                collapseRowLabel={tCommon('dataTable.collapseRow')}
                expandRowAriaLabel={tCommon('dataTable.expandRowAria')}
              />
            </Card>
          )}
        </section>
      )}
    </>
  );
}
