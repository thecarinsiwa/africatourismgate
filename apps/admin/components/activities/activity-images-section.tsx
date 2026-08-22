'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { AlertDialog, Button, Input, Modal } from '@africatourismgate/ui';
import type { ActivityImage } from '@africatourismgate/types';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { AdminImagesGalleryGrid } from '../common/admin-images-gallery-grid';
import { AdminImageViewerModal } from '../admin-image-viewer-modal';
import { getApiClient, resolveApiBaseUrl } from '../../lib/auth/api';
import { getSession } from '../../lib/auth/session';
import { resolveMediaUrl } from '../../lib/resolve-media-url';

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
  onImagesChanged?: () => void;
};

export function ActivityImagesSection({
  activityId,
  embedded,
  onImagesChanged,
}: ActivityImagesSectionProps) {
  const { activities: getActivitiesErrorMessage } = useAdminErrorMessages();
  const tGallery = useTranslations('modules.common.imagesGallery');
  const tCommon = useTranslations('modules.common');
  const tColumns = useTranslations('modules.common.columns');
  const tForm = useTranslations('modules.common.form');
  const tValidation = useTranslations('modules.common.validation');
  const tActions = useTranslations('common.actions');
  const emptyDash = tCommon('empty.dash');
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
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<ActivityImage | null>(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

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
  }, [activityId, getActivitiesErrorMessage]);

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
        setFormError(tValidation('imageFormat'));
        return;
      }
      if (file.size > ACTIVITY_IMAGE_MAX_BYTES) {
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
        await client.updateActivityImage(editing.id, body);
      } else {
        await client.createActivityImage({ activityId, ...body });
      }
      resetForm();
      await load();
      onImagesChanged?.();
    } catch (error) {
      setFormError(getActivitiesErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const handleDeleteRequest = useCallback((img: ActivityImage) => {
    setConfirmTarget(img);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const img = confirmTarget;
    setConfirmTarget(null);
    setDeleteError(null);
    setDeletingId(img.id);
    try {
      await getApiClient().deleteActivityImage(img.id);
      await load();
      onImagesChanged?.();
    } catch (error) {
      setDeleteError(getActivitiesErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, getActivitiesErrorMessage, load, onImagesChanged]);

  const images = state.status === 'ready' ? state.images : [];

  const openViewer = useCallback(
    (img: ActivityImage) => {
      const index = images.findIndex((item) => item.id === img.id);
      setViewerIndex(index >= 0 ? index : 0);
    },
    [images],
  );

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
      <AdminImageViewerModal
        open={viewerIndex !== null}
        onOpenChange={(open) => {
          if (!open) setViewerIndex(null);
        }}
        images={images}
        index={viewerIndex ?? 0}
        onIndexChange={setViewerIndex}
        fallbackLabel={tGallery('title')}
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
            {formValues.url.trim() ? (
              <Image
                src={resolveMediaUrl(formValues.url.trim())}
                alt={formValues.caption.trim() || tColumns('preview')}
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
          <p role="alert" className="text-sm text-red-600">
            {state.message}
          </p>
        ) : (
          <AdminImagesGalleryGrid
            images={images}
            ariaLabel={tGallery('ariaLabel')}
            emptyMessage={tGallery('emptyDefault')}
            isLoading={state.status === 'loading'}
            loadingMessage={tGallery('loading')}
            deletingId={deletingId}
            emptyDash={emptyDash}
            viewLabel={tGallery('viewerOpen')}
            editLabel={tActions('edit')}
            deleteLabel={tActions('delete')}
            onView={openViewer}
            onEdit={openEdit}
            onDelete={handleDeleteRequest}
          />
        )}
      </section>
    </>
  );
}
