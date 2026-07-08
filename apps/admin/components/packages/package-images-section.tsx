'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  Input,
  cn,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { PackageImage, PackageSuggestedImageGroup } from '@africatourismgate/types';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient, resolveApiBaseUrl } from '../../lib/auth/api';
import { getSession } from '../../lib/auth/session';
import { usePackageItemTypeLabels } from '../../lib/i18n/use-module-labels';
import { getPackageItemTypeLabel } from '../../lib/package-item-type';
import { PackageItemTypeIcon } from './package-item-type-icon';

const PACKAGE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_PACKAGE_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

type ImageFormValues = {
  url: string;
  caption: string;
  sortOrder: string;
};

const emptyForm: ImageFormValues = { url: '', caption: '', sortOrder: '0' };

type PackageImagesSectionProps = {
  packageId: string;
  embedded?: boolean;
  onChanged?: () => void;
};

export function PackageImagesSection({
  packageId,
  embedded = false,
  onChanged,
}: PackageImagesSectionProps) {
  const { packages: getPackagesErrorMessage } = useAdminErrorMessages();
  const tGallery = useTranslations('modules.common.imagesGallery');
  const tCommon = useTranslations('modules.common');
  const tActions = useTranslations('common.actions');
  const itemTypeLabels = usePackageItemTypeLabels();
  const emptyDash = tCommon('empty.dash');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; images: PackageImage[] }
  >({ status: 'loading' });
  const [suggestions, setSuggestions] = useState<PackageSuggestedImageGroup[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PackageImage | null>(null);
  const [formValues, setFormValues] = useState<ImageFormValues>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [addingSuggestionKey, setAddingSuggestionKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listPackageImages({
        packageId,
        page: 1,
        limit: 100,
      });
      setState({ status: 'ready', images: result.data });
      onChanged?.();
    } catch (error) {
      setState({ status: 'error', message: getPackagesErrorMessage(error) });
    }
  }, [packageId, getPackagesErrorMessage, onChanged]);

  const loadSuggestions = useCallback(async () => {
    setSuggestionsLoading(true);
    try {
      const groups = await getApiClient().listPackageSuggestedImages(packageId);
      setSuggestions(groups);
    } catch {
      setSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  }, [packageId]);

  useEffect(() => {
    void load();
    void loadSuggestions();
  }, [load, loadSuggestions]);

  const existingUrls = useMemo(() => {
    if (state.status !== 'ready') return new Set<string>();
    return new Set(state.images.map((image) => image.url));
  }, [state]);

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

  function openEdit(img: PackageImage) {
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
      if (!ALLOWED_PACKAGE_IMAGE_TYPES.has(file.type)) {
        setFormError(tCommon('validation.imageFormat'));
        return;
      }
      if (file.size > PACKAGE_IMAGE_MAX_BYTES) {
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
      const response = await fetch(
        `${resolveApiBaseUrl()}/packages/${packageId}/upload-image`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
          body,
        },
      );
      if (!response.ok) {
        throw new Error('Upload package image failed');
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
        await client.updatePackageImage(editing.id, body);
      } else {
        await client.createPackageImage({ packageId, ...body });
      }
      resetForm();
      await load();
    } catch (error) {
      setFormError(getPackagesErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddSuggestion(
    group: PackageSuggestedImageGroup,
    url: string,
    caption: string | null,
    sortOrder: number,
  ) {
    const key = `${group.packageItemId}:${url}`;
    if (existingUrls.has(url)) return;

    setAddingSuggestionKey(key);
    setFormError(null);
    try {
      await getApiClient().createPackageImage({
        packageId,
        url,
        sortOrder,
        sourcePackageItemId: group.packageItemId,
        ...(caption ? { caption } : {}),
      });
      await load();
    } catch (error) {
      setFormError(getPackagesErrorMessage(error));
    } finally {
      setAddingSuggestionKey(null);
    }
  }

  const handleDelete = useCallback(
    async (img: PackageImage) => {
      if (!window.confirm(tGallery('deleteConfirm'))) return;
      setDeletingId(img.id);
      try {
        await getApiClient().deletePackageImage(img.id);
        await load();
      } catch (error) {
        setFormError(getPackagesErrorMessage(error));
      } finally {
        setDeletingId(null);
      }
    },
    [load, tGallery, getPackagesErrorMessage],
  );

  const columns = useMemo<ColumnDef<PackageImage, unknown>[]>(
    () => [
      {
        id: 'preview',
        header: tCommon('columns.preview'),
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
        id: 'source',
        header: tCommon('columns.source'),
        cell: ({ row }) => (
          <span className="text-sm text-atg-muted">
            {row.original.sourcePackageItemId
              ? tGallery('sourceIncluded')
              : tGallery('sourceManual')}
          </span>
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
              onClick={() => void handleDelete(row.original)}
              disabled={deletingId === row.original.id}
              loading={deletingId === row.original.id}
            />
          </DataTableActions>
        ),
      },
    ],
    [deletingId, emptyDash, handleDelete, tCommon, tGallery],
  );

  const images = state.status === 'ready' ? state.images : [];
  const hasSuggestions = suggestions.some((group) => group.images.length > 0);

  return (
    <section className={cn('space-y-6', embedded ? '' : 'border-t border-atg-border pt-10')}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-atg-fg">{tGallery('titlePackage')}</h2>
          <p className="mt-1 text-sm text-atg-muted">{tGallery('introPackage')}</p>
        </div>
        {!showForm ? (
          <Button type="button" onClick={openCreate}>
            {tGallery('addPhoto')}
          </Button>
        ) : null}
      </div>

      {formError ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {formError}
        </p>
      ) : null}

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-atg-fg">{tGallery('suggestionsTitle')}</h3>
        {suggestionsLoading ? (
          <p className="text-sm text-atg-muted">{tGallery('suggestionsLoading')}</p>
        ) : !hasSuggestions ? (
          <p className="text-sm text-atg-muted">{tGallery('suggestionsEmpty')}</p>
        ) : (
          <div className="space-y-4">
            {suggestions.map((group) =>
              group.images.length === 0 ? null : (
                <Card key={group.packageItemId} variant="dashboard" className="p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <PackageItemTypeIcon itemType={group.itemType} />
                    <div>
                      <p className="text-sm font-medium text-atg-fg">{group.label}</p>
                      <p className="text-xs text-atg-muted">
                        {getPackageItemTypeLabel(group.itemType, itemTypeLabels)}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {group.images.map((image) => {
                      const key = `${group.packageItemId}:${image.url}`;
                      const alreadyAdded = existingUrls.has(image.url);
                      const loading = addingSuggestionKey === key;
                      return (
                        <div
                          key={key}
                          className="overflow-hidden rounded-lg border border-atg-border"
                        >
                          <Image
                            src={image.url}
                            alt={image.caption ?? group.label}
                            width={160}
                            height={120}
                            unoptimized
                            className="aspect-[4/3] w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <div className="space-y-2 p-2">
                            {image.caption ? (
                              <p className="truncate text-xs text-atg-muted">{image.caption}</p>
                            ) : null}
                            <Button
                              type="button"
                              size="sm"
                              variant={alreadyAdded ? 'outline' : 'primary'}
                              className="w-full"
                              disabled={alreadyAdded || loading}
                              loading={loading}
                              onClick={() =>
                                void handleAddSuggestion(
                                  group,
                                  image.url,
                                  image.caption,
                                  image.sortOrder,
                                )
                              }
                            >
                              {alreadyAdded
                                ? tGallery('alreadyAdded')
                                : tGallery('addFromSuggestion')}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ),
            )}
          </div>
        )}
      </div>

      {showForm ? (
        <Card variant="dashboard" className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-sm font-medium">
              {editing ? tGallery('editPhoto') : tGallery('newPhoto')}
            </h3>
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
            <div className="flex gap-3">
              <Button type="submit" loading={submitting} disabled={uploading}>
                {editing ? tActions('save') : tActions('create')}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                {tActions('cancel')}
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
            data={images}
            isLoading={state.status === 'loading'}
            emptyMessage={tGallery('emptyPackage')}
            getRowId={(row) => row.id}
          />
        </Card>
      )}
    </section>
  );
}
