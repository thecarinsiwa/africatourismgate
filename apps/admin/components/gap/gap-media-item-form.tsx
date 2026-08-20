'use client';

import { Button, Input, Textarea } from '@africatourismgate/ui';
import type {
  CreateGapMediaItemRequest,
  GapMediaItem,
  GapMediaItemType,
  GapStatus,
} from '@africatourismgate/types';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useId, useState } from 'react';
import { isValidMediaUrl, toDatetimeLocalValue } from '../../lib/about/form-utils';
import { getApiClient, resolveApiBaseUrl } from '../../lib/auth/api';
import { getSession } from '../../lib/auth/session';
import { GAP_MEDIA_TYPES } from '../../lib/gap/constants';
import { useGapPermissions } from '../../lib/gap/use-gap-permissions';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { resolveMediaUrl } from '../../lib/resolve-media-url';

const FILE_MAX_BYTES = 50 * 1024 * 1024;
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const VIDEO_TYPES = new Set(['video/mp4', 'video/webm']);

export type GapMediaItemFormValues = {
  mediaType: GapMediaItemType;
  title: string;
  description: string;
  fileUrl: string;
  externalUrl: string;
  thumbnailUrl: string;
  publishedAt: string;
  sortOrder: string;
  status: GapStatus;
  locale: string;
};

const defaultValues: GapMediaItemFormValues = {
  mediaType: 'image',
  title: '',
  description: '',
  fileUrl: '',
  externalUrl: '',
  thumbnailUrl: '',
  publishedAt: '',
  sortOrder: '0',
  status: 'draft',
  locale: 'fr',
};

function mediaItemToFormValues(item: GapMediaItem): GapMediaItemFormValues {
  return {
    mediaType: item.mediaType,
    title: item.title,
    description: item.description ?? '',
    fileUrl: item.fileUrl ?? '',
    externalUrl: item.externalUrl ?? '',
    thumbnailUrl: item.thumbnailUrl ?? '',
    publishedAt: toDatetimeLocalValue(item.publishedAt),
    sortOrder: String(item.sortOrder),
    status: item.status,
    locale: item.locale,
  };
}

function toPayload(values: GapMediaItemFormValues): CreateGapMediaItemRequest {
  const publishedAt = values.publishedAt.trim();
  return {
    mediaType: values.mediaType,
    title: values.title.trim(),
    description: values.description.trim() || null,
    fileUrl: values.fileUrl.trim() || null,
    externalUrl: values.externalUrl.trim() || null,
    thumbnailUrl: values.thumbnailUrl.trim() || null,
    publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
    sortOrder: Number.parseInt(values.sortOrder, 10) || 0,
    status: values.status,
    locale: values.locale,
  };
}

type GapMediaItemFormProps = {
  mode: 'create' | 'edit';
  mediaItemId?: string;
  initialMediaItem?: GapMediaItem;
  defaultLocale?: string;
};

type UploadTarget = 'fileUrl' | 'thumbnailUrl';

export function GapMediaItemForm({
  mode,
  mediaItemId,
  initialMediaItem,
  defaultLocale = 'fr',
}: GapMediaItemFormProps) {
  const { gap: getGapErrorMessage } = useAdminErrorMessages();
  const { canWrite } = useGapPermissions();
  const t = useTranslations('modules.gap.media.form');
  const tTypes = useTranslations('modules.gap.mediaTypes');
  const tCommon = useTranslations('modules.common');
  const tCommonForm = useTranslations('modules.common.form');
  const tValidation = useTranslations('modules.common.validation');
  const tLocale = useTranslations('modules.about.locale');
  const tStatus = useTranslations('modules.about.status');
  const router = useRouter();

  const mediaTypeId = useId();
  const titleId = useId();
  const descriptionId = useId();
  const sortOrderId = useId();
  const statusId = useId();
  const localeId = useId();
  const fileInputId = useId();
  const thumbnailInputId = useId();

  const [values, setValues] = useState<GapMediaItemFormValues>(() =>
    initialMediaItem
      ? mediaItemToFormValues(initialMediaItem)
      : { ...defaultValues, locale: defaultLocale },
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof GapMediaItemFormValues, string>>
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  const updateField = useCallback(
    <K extends keyof GapMediaItemFormValues>(key: K, value: GapMediaItemFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  async function uploadFile(
    file: File,
    target: UploadTarget,
    allowedTypes: Set<string>,
    formatError: string,
  ) {
    if (!allowedTypes.has(file.type)) {
      setFieldErrors((prev) => ({ ...prev, [target]: formatError }));
      return;
    }
    if (file.size > FILE_MAX_BYTES) {
      setFieldErrors((prev) => ({ ...prev, [target]: t('validation.fileTooLarge') }));
      return;
    }
    const session = getSession();
    if (!session?.accessToken) {
      setFieldErrors((prev) => ({ ...prev, [target]: tValidation('sessionExpiredRetry') }));
      return;
    }

    const setUploading = target === 'fileUrl' ? setUploadingFile : setUploadingThumbnail;
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const response = await fetch(`${resolveApiBaseUrl()}/gap-media-items/upload-file`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.accessToken}` },
        body,
      });
      if (!response.ok) throw new Error('Upload failed');
      const payload = (await response.json()) as { url?: string };
      if (!payload.url) throw new Error('Invalid upload response');
      updateField(target, payload.url);
    } catch {
      setFieldErrors((prev) => ({ ...prev, [target]: tValidation('uploadFailed') }));
    } finally {
      setUploading(false);
    }
  }

  async function handleFilePick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowed = values.mediaType === 'video' ? VIDEO_TYPES : IMAGE_TYPES;
    const formatError =
      values.mediaType === 'video'
        ? t('validation.videoFormat')
        : t('validation.imageFormat');
    await uploadFile(file, 'fileUrl', allowed, formatError);
    event.target.value = '';
  }

  async function handleThumbnailPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadFile(file, 'thumbnailUrl', IMAGE_TYPES, t('validation.imageFormat'));
    event.target.value = '';
  }

  const validate = (): boolean => {
    const errors: Partial<Record<keyof GapMediaItemFormValues, string>> = {};
    if (!values.title.trim()) errors.title = t('validation.titleRequired');
    const fileUrl = values.fileUrl.trim();
    const externalUrl = values.externalUrl.trim();
    const thumbnailUrl = values.thumbnailUrl.trim();
    if (!fileUrl && !externalUrl) {
      errors.fileUrl = t('validation.urlRequired');
    }
    if (fileUrl && !isValidMediaUrl(fileUrl)) errors.fileUrl = t('validation.urlInvalid');
    if (externalUrl && !isValidMediaUrl(externalUrl)) {
      errors.externalUrl = t('validation.urlInvalid');
    }
    if (thumbnailUrl && !isValidMediaUrl(thumbnailUrl)) {
      errors.thumbnailUrl = t('validation.urlInvalid');
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canWrite || !validate()) return;

    setSaving(true);
    setSubmitError(null);

    const payload = toPayload(values);
    const client = getApiClient();

    try {
      if (mode === 'create') {
        const created = await client.createGapMediaItem(payload);
        router.push(`/gap/medias/${created.id}`);
      } else if (mediaItemId) {
        await client.updateGapMediaItem(mediaItemId, payload);
        router.push('/gap/medias');
      }
    } catch (error) {
      setSubmitError(getGapErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const previewUrl = values.thumbnailUrl.trim() || values.fileUrl.trim();
  const busy = uploadingFile || uploadingThumbnail || saving;
  const fileAccept =
    values.mediaType === 'video'
      ? 'video/mp4,video/webm'
      : 'image/jpeg,image/png,image/webp';

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}

      <div>
        <label htmlFor={mediaTypeId} className="mb-1 block text-sm font-medium">
          {t('fields.mediaType')}
        </label>
        <select
          id={mediaTypeId}
          value={values.mediaType}
          onChange={(e) => updateField('mediaType', e.target.value as GapMediaItemType)}
          disabled={!canWrite}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {GAP_MEDIA_TYPES.map((key) => (
            <option key={key} value={key}>
              {tTypes(key)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={titleId} className="mb-1 block text-sm font-medium">
          {t('fields.title')}
        </label>
        <Input
          id={titleId}
          value={values.title}
          onChange={(e) => updateField('title', e.target.value)}
          disabled={!canWrite}
          aria-invalid={Boolean(fieldErrors.title)}
        />
        {fieldErrors.title ? (
          <p className="mt-1 text-sm text-destructive">{fieldErrors.title}</p>
        ) : null}
      </div>

      <Textarea
        id={descriptionId}
        label={t('fields.description')}
        rows={3}
        value={values.description}
        onChange={(e) => updateField('description', e.target.value)}
        disabled={!canWrite}
      />

      <div className="space-y-4">
        <div className="space-y-3">
          <p className="text-sm font-medium text-atg-fg">{t('fields.file')}</p>
          {canWrite ? (
            <div className="flex flex-wrap items-center gap-3">
              <label
                htmlFor={fileInputId}
                className="inline-flex cursor-pointer items-center rounded-md border border-atg-border px-3 py-2 text-xs font-medium text-atg-fg hover:bg-atg-muted/10"
              >
                {uploadingFile ? tCommonForm('uploading') : tCommonForm('chooseFile')}
                <input
                  id={fileInputId}
                  type="file"
                  accept={fileAccept}
                  className="hidden"
                  onChange={(e) => void handleFilePick(e)}
                  disabled={busy}
                />
              </label>
              <span className="text-xs text-atg-muted">
                {values.mediaType === 'video'
                  ? t('hints.videoFormat')
                  : t('hints.imageFormat')}
              </span>
            </div>
          ) : null}
          <Input
            label={tCommonForm('externalUrlOptional')}
            type="url"
            value={values.fileUrl}
            onChange={(e) => updateField('fileUrl', e.target.value)}
            placeholder={tCommonForm('urlPlaceholder')}
            disabled={!canWrite}
            error={fieldErrors.fileUrl}
          />
        </div>

        <Input
          label={t('fields.externalUrl')}
          type="url"
          value={values.externalUrl}
          onChange={(e) => updateField('externalUrl', e.target.value)}
          placeholder={tCommonForm('urlPlaceholder')}
          disabled={!canWrite}
          error={fieldErrors.externalUrl}
        />

        <div className="space-y-3">
          <p className="text-sm font-medium text-atg-fg">{t('fields.thumbnail')}</p>
          {canWrite ? (
            <div className="flex flex-wrap items-center gap-3">
              <label
                htmlFor={thumbnailInputId}
                className="inline-flex cursor-pointer items-center rounded-md border border-atg-border px-3 py-2 text-xs font-medium text-atg-fg hover:bg-atg-muted/10"
              >
                {uploadingThumbnail ? tCommonForm('uploading') : tCommonForm('chooseFile')}
                <input
                  id={thumbnailInputId}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => void handleThumbnailPick(e)}
                  disabled={busy}
                />
              </label>
              <span className="text-xs text-atg-muted">{t('hints.imageFormat')}</span>
            </div>
          ) : null}
          <Input
            label={tCommonForm('externalUrlOptional')}
            type="url"
            value={values.thumbnailUrl}
            onChange={(e) => updateField('thumbnailUrl', e.target.value)}
            placeholder={tCommonForm('urlPlaceholder')}
            disabled={!canWrite}
            error={fieldErrors.thumbnailUrl}
          />
        </div>

        {previewUrl &&
        (values.mediaType === 'image' || values.thumbnailUrl.trim()) ? (
          <Image
            src={resolveMediaUrl(previewUrl)}
            alt={t('fields.thumbnailPreviewAlt')}
            width={320}
            height={180}
            unoptimized
            className="h-32 w-full max-w-sm rounded-lg border border-atg-border object-cover"
          />
        ) : null}
      </div>

      <Input
        label={t('fields.publishedAtOptional')}
        type="datetime-local"
        value={values.publishedAt}
        onChange={(e) => updateField('publishedAt', e.target.value)}
        disabled={!canWrite}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor={sortOrderId} className="mb-1 block text-sm font-medium">
            {t('fields.sortOrder')}
          </label>
          <Input
            id={sortOrderId}
            type="number"
            min={0}
            value={values.sortOrder}
            onChange={(e) => updateField('sortOrder', e.target.value)}
            disabled={!canWrite}
          />
        </div>
        <div>
          <label htmlFor={statusId} className="mb-1 block text-sm font-medium">
            {tCommon('columns.status')}
          </label>
          <select
            id={statusId}
            value={values.status}
            onChange={(e) => updateField('status', e.target.value as GapStatus)}
            disabled={!canWrite}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="draft">{tStatus('draft')}</option>
            <option value="published">{tStatus('published')}</option>
          </select>
        </div>
        <div>
          <label htmlFor={localeId} className="mb-1 block text-sm font-medium">
            {t('fields.locale')}
          </label>
          <select
            id={localeId}
            value={values.locale}
            onChange={(e) => updateField('locale', e.target.value)}
            disabled={!canWrite}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="fr">{tLocale('fr')}</option>
            <option value="en">{tLocale('en')}</option>
            <option value="es">{tLocale('es')}</option>
          </select>
        </div>
      </div>

      {canWrite ? (
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={busy}>
            {saving ? t('saving') : mode === 'create' ? t('createButton') : t('saveButton')}
          </Button>
          <Button type="button" variant="outline" href="/gap/medias">
            {t('cancelButton')}
          </Button>
        </div>
      ) : null}
    </form>
  );
}
