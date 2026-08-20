'use client';

import { Button, Input } from '@africatourismgate/ui';
import type {
  CreateGapActivityRequest,
  GapActivity,
  GapActivityIconKey,
  GapStatus,
} from '@africatourismgate/types';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useId, useState } from 'react';
import { isValidMediaUrl } from '../../lib/about/form-utils';
import { getApiClient, resolveApiBaseUrl } from '../../lib/auth/api';
import { getSession } from '../../lib/auth/session';
import { GAP_ACTIVITY_ICON_KEYS } from '../../lib/gap/constants';
import { useGapPermissions } from '../../lib/gap/use-gap-permissions';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { isRichTextEmpty } from '../../lib/rich-text';
import { resolveMediaUrl } from '../../lib/resolve-media-url';
import { RichTextEditor } from '../rich-text-editor';

const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_ACTIVITY_IMAGES = 10;

export type GapActivityFormValues = {
  title: string;
  description: string;
  iconKey: GapActivityIconKey;
  imageUrls: string[];
  sortOrder: string;
  status: GapStatus;
  locale: string;
};

const defaultValues: GapActivityFormValues = {
  title: '',
  description: '',
  iconKey: 'school',
  imageUrls: [],
  sortOrder: '0',
  status: 'draft',
  locale: 'fr',
};

function resolveActivityImageUrls(activity: GapActivity): string[] {
  const fromArray = Array.isArray(activity.imageUrls) ? activity.imageUrls : [];
  if (fromArray.length > 0) {
    return [...new Set(fromArray.map((url) => url.trim()).filter(Boolean))].slice(
      0,
      MAX_ACTIVITY_IMAGES,
    );
  }
  return activity.imageUrl?.trim() ? [activity.imageUrl.trim()] : [];
}

function activityToFormValues(activity: GapActivity): GapActivityFormValues {
  return {
    title: activity.title,
    description: activity.description,
    iconKey: activity.iconKey,
    imageUrls: resolveActivityImageUrls(activity),
    sortOrder: String(activity.sortOrder),
    status: activity.status,
    locale: activity.locale,
  };
}

function toPayload(values: GapActivityFormValues): CreateGapActivityRequest {
  const imageUrls = [...new Set(values.imageUrls.map((url) => url.trim()).filter(Boolean))].slice(
    0,
    MAX_ACTIVITY_IMAGES,
  );
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    iconKey: values.iconKey,
    imageUrls,
    imageUrl: imageUrls[0] ?? null,
    sortOrder: Number.parseInt(values.sortOrder, 10) || 0,
    status: values.status,
    locale: values.locale,
  };
}

type GapActivityFormProps = {
  mode: 'create' | 'edit';
  activityId?: string;
  initialActivity?: GapActivity;
  defaultLocale?: string;
};

export function GapActivityForm({
  mode,
  activityId,
  initialActivity,
  defaultLocale = 'fr',
}: GapActivityFormProps) {
  const { gap: getGapErrorMessage } = useAdminErrorMessages();
  const { canWrite } = useGapPermissions();
  const t = useTranslations('modules.gap.activities.form');
  const tIcons = useTranslations('modules.gap.activityIcons');
  const tCommon = useTranslations('modules.common');
  const tCommonForm = useTranslations('modules.common.form');
  const tValidation = useTranslations('modules.common.validation');
  const tLocale = useTranslations('modules.about.locale');
  const tStatus = useTranslations('modules.about.status');
  const router = useRouter();

  const titleId = useId();
  const iconKeyId = useId();
  const imageInputId = useId();
  const externalImageId = useId();
  const sortOrderId = useId();
  const statusId = useId();
  const localeId = useId();

  const [values, setValues] = useState<GapActivityFormValues>(() =>
    initialActivity
      ? activityToFormValues(initialActivity)
      : { ...defaultValues, locale: defaultLocale },
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof GapActivityFormValues | 'imageUrl', string>>
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [externalImageUrl, setExternalImageUrl] = useState('');

  const updateField = useCallback(
    <K extends keyof GapActivityFormValues>(key: K, value: GapActivityFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined, imageUrl: undefined }));
    },
    [],
  );

  const addImageUrl = useCallback(
    (url: string) => {
      const trimmed = url.trim();
      if (!trimmed) return;
      setValues((prev) => {
        if (prev.imageUrls.includes(trimmed) || prev.imageUrls.length >= MAX_ACTIVITY_IMAGES) {
          return prev;
        }
        return { ...prev, imageUrls: [...prev.imageUrls, trimmed] };
      });
      setFieldErrors((prev) => ({ ...prev, imageUrl: undefined }));
    },
    [],
  );

  const removeImageUrl = useCallback((url: string) => {
    setValues((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((item) => item !== url),
    }));
  }, []);

  async function handleImagePick(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const remaining = MAX_ACTIVITY_IMAGES - values.imageUrls.length;
    if (remaining <= 0) {
      setFieldErrors((prev) => ({ ...prev, imageUrl: t('validation.maxImages') }));
      event.target.value = '';
      return;
    }

    const session = getSession();
    if (!session?.accessToken) {
      setFieldErrors((prev) => ({ ...prev, imageUrl: tValidation('sessionExpiredRetry') }));
      event.target.value = '';
      return;
    }

    setUploadingImage(true);
    try {
      for (const file of files.slice(0, remaining)) {
        if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
          setFieldErrors((prev) => ({ ...prev, imageUrl: tValidation('imageFormat') }));
          continue;
        }
        if (file.size > IMAGE_MAX_BYTES) {
          setFieldErrors((prev) => ({ ...prev, imageUrl: tValidation('imageTooLarge') }));
          continue;
        }
        const body = new FormData();
        body.append('file', file);
        const response = await fetch(`${resolveApiBaseUrl()}/gap-activities/upload-image`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.accessToken}` },
          body,
        });
        if (!response.ok) throw new Error('Upload failed');
        const payload = (await response.json()) as { url?: string };
        if (!payload.url) throw new Error('Invalid upload response');
        addImageUrl(payload.url);
      }
    } catch {
      setFieldErrors((prev) => ({ ...prev, imageUrl: tValidation('uploadFailed') }));
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  }

  function handleAddExternalImage() {
    const url = externalImageUrl.trim();
    if (!url) return;
    if (!isValidMediaUrl(url)) {
      setFieldErrors((prev) => ({ ...prev, imageUrl: t('validation.imageUrlInvalid') }));
      return;
    }
    if (values.imageUrls.length >= MAX_ACTIVITY_IMAGES) {
      setFieldErrors((prev) => ({ ...prev, imageUrl: t('validation.maxImages') }));
      return;
    }
    addImageUrl(url);
    setExternalImageUrl('');
  }

  const validate = (): boolean => {
    const errors: Partial<Record<keyof GapActivityFormValues | 'imageUrl', string>> = {};
    if (!values.title.trim()) errors.title = t('validation.titleRequired');
    if (isRichTextEmpty(values.description)) {
      errors.description = t('validation.descriptionRequired');
    }
    if (values.imageUrls.length > MAX_ACTIVITY_IMAGES) {
      errors.imageUrl = t('validation.maxImages');
    }
    for (const url of values.imageUrls) {
      if (!isValidMediaUrl(url)) {
        errors.imageUrl = t('validation.imageUrlInvalid');
        break;
      }
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
        const created = await client.createGapActivity(payload);
        router.push(`/gap/activites/${created.id}`);
      } else if (activityId) {
        await client.updateGapActivity(activityId, payload);
        router.push('/gap/activites');
      }
    } catch (error) {
      setSubmitError(getGapErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const canAddMore = values.imageUrls.length < MAX_ACTIVITY_IMAGES;

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}

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

      {canWrite ? (
        <div>
          <RichTextEditor
            label={t('fields.description')}
            value={values.description}
            onChange={(html) => updateField('description', html)}
            placeholder={t('fields.descriptionPlaceholder')}
            contentClassName="min-h-[180px]"
          />
          {fieldErrors.description ? (
            <p className="mt-1 text-sm text-destructive">{fieldErrors.description}</p>
          ) : null}
        </div>
      ) : values.description.trim() && !isRichTextEmpty(values.description) ? (
        <div>
          <p className="mb-1 text-sm font-medium">{t('fields.description')}</p>
          <div
            className="rounded-md border border-atg-border bg-atg-surface px-3 py-2 text-sm text-atg-muted"
            dangerouslySetInnerHTML={{ __html: values.description }}
          />
        </div>
      ) : null}

      <div>
        <label htmlFor={iconKeyId} className="mb-1 block text-sm font-medium">
          {t('fields.iconKey')}
        </label>
        <select
          id={iconKeyId}
          value={values.iconKey}
          onChange={(e) => updateField('iconKey', e.target.value as GapActivityIconKey)}
          disabled={!canWrite}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {GAP_ACTIVITY_ICON_KEYS.map((key) => (
            <option key={key} value={key}>
              {tIcons(key)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-medium">{t('fields.images')}</p>
          <p className="text-xs text-atg-muted">
            {t('fields.imagesCount', {
              count: values.imageUrls.length,
              max: MAX_ACTIVITY_IMAGES,
            })}
          </p>
        </div>

        {canWrite && canAddMore ? (
          <div className="flex flex-wrap items-center gap-3">
            <label
              htmlFor={imageInputId}
              className="inline-flex cursor-pointer items-center rounded-md border border-atg-border px-3 py-2 text-xs font-medium text-atg-fg hover:bg-atg-muted/10"
            >
              {uploadingImage ? tCommonForm('uploading') : tCommonForm('chooseFile')}
              <input
                id={imageInputId}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => void handleImagePick(e)}
                disabled={uploadingImage || saving}
              />
            </label>
            <span className="text-xs text-atg-muted">{tCommonForm('imageFormatHint')}</span>
          </div>
        ) : null}

        {values.imageUrls.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {values.imageUrls.map((url, index) => (
              <li
                key={`${url}-${index}`}
                className="overflow-hidden rounded-lg border border-atg-border bg-atg-elevated"
              >
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={resolveMediaUrl(url)}
                    alt={t('fields.imagePreviewAlt')}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 200px"
                  />
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-atg-border px-2 py-1.5">
                  <span className="text-[11px] text-atg-muted">
                    {index === 0 ? t('fields.coverBadge') : `#${index + 1}`}
                  </span>
                  {canWrite ? (
                    <button
                      type="button"
                      onClick={() => removeImageUrl(url)}
                      className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                    >
                      {t('fields.removeImage')}
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-atg-muted">{t('fields.imagesEmpty')}</p>
        )}

        {canWrite && canAddMore ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <Input
                id={externalImageId}
                label={tCommonForm('externalUrlOptional')}
                type="url"
                value={externalImageUrl}
                onChange={(e) => setExternalImageUrl(e.target.value)}
                placeholder={tCommonForm('urlPlaceholder')}
                disabled={uploadingImage || saving}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddExternalImage}
              disabled={uploadingImage || saving || !externalImageUrl.trim()}
            >
              {t('fields.addImageUrl')}
            </Button>
          </div>
        ) : null}

        {fieldErrors.imageUrl ? (
          <p className="text-sm text-destructive">{fieldErrors.imageUrl}</p>
        ) : null}
      </div>

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
          <Button type="submit" disabled={saving || uploadingImage}>
            {saving ? t('saving') : mode === 'create' ? t('createButton') : t('saveButton')}
          </Button>
          <Button type="button" variant="outline" href="/gap/activites">
            {t('cancelButton')}
          </Button>
        </div>
      ) : null}
    </form>
  );
}
