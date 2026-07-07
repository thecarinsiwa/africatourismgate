'use client';

import { Button, Input } from '@africatourismgate/ui';
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
import { getApiClient } from '../../lib/auth/api';
import { GAP_MEDIA_TYPES } from '../../lib/gap/constants';
import { useGapPermissions } from '../../lib/gap/use-gap-permissions';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { resolveMediaUrl } from '../../lib/resolve-media-url';

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
  const tLocale = useTranslations('modules.about.locale');
  const tStatus = useTranslations('modules.about.status');
  const router = useRouter();

  const mediaTypeId = useId();
  const titleId = useId();
  const descriptionId = useId();
  const sortOrderId = useId();
  const statusId = useId();
  const localeId = useId();

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

  const updateField = useCallback(
    <K extends keyof GapMediaItemFormValues>(key: K, value: GapMediaItemFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

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
          disabled={!canWrite || mode === 'edit'}
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

      <div>
        <label htmlFor={descriptionId} className="mb-1 block text-sm font-medium">
          {t('fields.description')}
        </label>
        <textarea
          id={descriptionId}
          rows={3}
          value={values.description}
          onChange={(e) => updateField('description', e.target.value)}
          disabled={!canWrite}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-4">
        <Input
          label={t('fields.fileUrl')}
          type="url"
          value={values.fileUrl}
          onChange={(e) => updateField('fileUrl', e.target.value)}
          placeholder={tCommonForm('urlPlaceholder')}
          disabled={!canWrite}
          error={fieldErrors.fileUrl}
        />
        <Input
          label={t('fields.externalUrl')}
          type="url"
          value={values.externalUrl}
          onChange={(e) => updateField('externalUrl', e.target.value)}
          placeholder={tCommonForm('urlPlaceholder')}
          disabled={!canWrite}
          error={fieldErrors.externalUrl}
        />
        <Input
          label={t('fields.thumbnailUrl')}
          type="url"
          value={values.thumbnailUrl}
          onChange={(e) => updateField('thumbnailUrl', e.target.value)}
          placeholder={tCommonForm('urlPlaceholder')}
          disabled={!canWrite}
          error={fieldErrors.thumbnailUrl}
        />
        {previewUrl && values.mediaType === 'image' ? (
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
          <Button type="submit" disabled={saving}>
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
