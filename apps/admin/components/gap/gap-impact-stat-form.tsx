'use client';

import { Button, Checkbox, Input, Select } from '@africatourismgate/ui';
import type {
  CreateGapImpactStatRequest,
  GapImpactStat,
  GapImpactStatColorKey,
  GapStatus,
} from '@africatourismgate/types';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useId, useMemo, useState } from 'react';
import { isValidMediaUrl } from '../../lib/about/form-utils';
import { getApiClient, resolveApiBaseUrl } from '../../lib/auth/api';
import { getSession } from '../../lib/auth/session';
import { GAP_COLOR_KEYS } from '../../lib/gap/constants';
import { useGapPermissions } from '../../lib/gap/use-gap-permissions';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { isRichTextEmpty } from '../../lib/rich-text';
import { resolveMediaUrl } from '../../lib/resolve-media-url';
import { RichTextEditor } from '../rich-text-editor';

const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const CONTENT_LOCALES = ['fr', 'en', 'es'] as const;
type ContentLocale = (typeof CONTENT_LOCALES)[number];

export type GapImpactStatFormValues = {
  label: string;
  valueDisplay: string;
  description: string;
  imageUrl: string;
  colorKey: GapImpactStatColorKey;
  sortOrder: string;
  status: GapStatus;
  locale: string;
};

const defaultValues: GapImpactStatFormValues = {
  label: '',
  valueDisplay: '',
  description: '',
  imageUrl: '',
  colorKey: 'primary',
  sortOrder: '0',
  status: 'draft',
  locale: 'fr',
};

function isContentLocale(value: string): value is ContentLocale {
  return (CONTENT_LOCALES as readonly string[]).includes(value);
}

function statToFormValues(stat: GapImpactStat): GapImpactStatFormValues {
  return {
    label: stat.label,
    valueDisplay: stat.valueDisplay,
    description: stat.description ?? '',
    imageUrl: stat.imageUrl ?? '',
    colorKey: stat.colorKey,
    sortOrder: String(stat.sortOrder),
    status: stat.status,
    locale: stat.locale,
  };
}

function toPayload(
  values: GapImpactStatFormValues,
  locale: string,
): CreateGapImpactStatRequest {
  const description = values.description.trim();
  const imageUrl = values.imageUrl.trim();
  return {
    label: values.label.trim(),
    valueDisplay: values.valueDisplay.trim(),
    description: description && !isRichTextEmpty(description) ? description : null,
    imageUrl: imageUrl || null,
    colorKey: values.colorKey,
    sortOrder: Number.parseInt(values.sortOrder, 10) || 0,
    status: values.status,
    locale,
  };
}

type GapImpactStatFormProps = {
  mode: 'create' | 'edit';
  statId?: string;
  initialStat?: GapImpactStat;
  defaultLocale?: string;
};

export function GapImpactStatForm({
  mode,
  statId,
  initialStat,
  defaultLocale = 'fr',
}: GapImpactStatFormProps) {
  const { gap: getGapErrorMessage } = useAdminErrorMessages();
  const { canWrite } = useGapPermissions();
  const t = useTranslations('modules.gap.impact.form');
  const tColors = useTranslations('modules.gap.colors');
  const tCommon = useTranslations('modules.common');
  const tCommonForm = useTranslations('modules.common.form');
  const tValidation = useTranslations('modules.common.validation');
  const tLocale = useTranslations('modules.about.locale');
  const tStatus = useTranslations('modules.about.status');
  const router = useRouter();

  const imageInputId = useId();
  const imageUrlId = useId();

  const [values, setValues] = useState<GapImpactStatFormValues>(() =>
    initialStat ? statToFormValues(initialStat) : { ...defaultValues, locale: defaultLocale },
  );
  const [selectedLocales, setSelectedLocales] = useState<ContentLocale[]>(() => {
    if (initialStat && isContentLocale(initialStat.locale)) return [initialStat.locale];
    return isContentLocale(defaultLocale) ? [...CONTENT_LOCALES] : ['fr', 'en', 'es'];
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof GapImpactStatFormValues | 'locales', string>>
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const colorOptions = useMemo(
    () => GAP_COLOR_KEYS.map((key) => ({ value: key, label: tColors(key) })),
    [tColors],
  );
  const statusOptions = useMemo(
    () => [
      { value: 'draft', label: tStatus('draft') },
      { value: 'published', label: tStatus('published') },
    ],
    [tStatus],
  );
  const localeOptions = useMemo(
    () => [
      { value: 'fr', label: tLocale('fr') },
      { value: 'en', label: tLocale('en') },
      { value: 'es', label: tLocale('es') },
    ],
    [tLocale],
  );

  const updateField = useCallback(
    <K extends keyof GapImpactStatFormValues>(key: K, value: GapImpactStatFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  const toggleLocale = useCallback((locale: ContentLocale) => {
    setSelectedLocales((prev) => {
      if (prev.includes(locale)) {
        return prev.filter((item) => item !== locale);
      }
      return [...CONTENT_LOCALES].filter((item) => prev.includes(item) || item === locale);
    });
    setFieldErrors((prev) => ({ ...prev, locales: undefined }));
  }, []);

  const validate = (): boolean => {
    const errors: Partial<Record<keyof GapImpactStatFormValues | 'locales', string>> = {};
    if (!values.label.trim()) errors.label = t('validation.labelRequired');
    if (!values.valueDisplay.trim()) errors.valueDisplay = t('validation.valueRequired');
    if (values.imageUrl.trim() && !isValidMediaUrl(values.imageUrl.trim())) {
      errors.imageUrl = t('validation.imageUrlInvalid');
    }
    if (mode === 'create' && selectedLocales.length === 0) {
      errors.locales = t('validation.localesRequired');
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  async function handleImagePick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setFieldErrors((prev) => ({ ...prev, imageUrl: tValidation('imageFormat') }));
      event.target.value = '';
      return;
    }
    if (file.size > IMAGE_MAX_BYTES) {
      setFieldErrors((prev) => ({ ...prev, imageUrl: tValidation('imageTooLarge') }));
      event.target.value = '';
      return;
    }

    const session = getSession();
    if (!session?.accessToken) {
      setFieldErrors((prev) => ({
        ...prev,
        imageUrl: tValidation('sessionExpiredRetry'),
      }));
      event.target.value = '';
      return;
    }

    setUploadingImage(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const response = await fetch(`${resolveApiBaseUrl()}/gap-impact-stats/upload-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.accessToken}` },
        body,
      });
      if (!response.ok) throw new Error('Upload failed');
      const payload = (await response.json()) as { url?: string };
      if (!payload.url) throw new Error('Invalid upload response');
      updateField('imageUrl', payload.url);
    } catch {
      setFieldErrors((prev) => ({ ...prev, imageUrl: tValidation('uploadFailed') }));
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canWrite || !validate()) return;

    setSaving(true);
    setSubmitError(null);

    const client = getApiClient();

    try {
      if (mode === 'create') {
        const results = await Promise.allSettled(
          selectedLocales.map((locale) =>
            client.createGapImpactStat(toPayload(values, locale)),
          ),
        );
        const failed = results
          .map((result, index) =>
            result.status === 'rejected'
              ? { locale: selectedLocales[index], error: result.reason }
              : null,
          )
          .filter((item): item is { locale: ContentLocale; error: unknown } => item != null);

        if (failed.length === selectedLocales.length) {
          setSubmitError(getGapErrorMessage(failed[0]?.error));
          return;
        }

        if (failed.length > 0) {
          const labels = failed.map((item) => tLocale(item.locale)).join(', ');
          setSubmitError(t('validation.partialCreateFailed', { locales: labels }));
          return;
        }

        const created = results.find(
          (result): result is PromiseFulfilledResult<GapImpactStat> =>
            result.status === 'fulfilled',
        );
        if (selectedLocales.length === 1 && created) {
          router.push(`/gap/impact/${created.value.id}`);
        } else {
          router.push('/gap/impact');
        }
        router.refresh();
      } else if (statId) {
        await client.updateGapImpactStat(statId, toPayload(values, values.locale));
        router.push('/gap/impact');
        router.refresh();
      }
    } catch (error) {
      setSubmitError(getGapErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const busy = saving || uploadingImage;

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}

      <Input
        label={t('fields.label')}
        value={values.label}
        onChange={(e) => updateField('label', e.target.value)}
        disabled={!canWrite}
        error={fieldErrors.label}
        required
      />

      <Input
        label={t('fields.valueDisplay')}
        value={values.valueDisplay}
        onChange={(e) => updateField('valueDisplay', e.target.value)}
        disabled={!canWrite}
        placeholder={t('fields.valueDisplayPlaceholder')}
        error={fieldErrors.valueDisplay}
        required
      />

      {canWrite ? (
        <RichTextEditor
          label={t('fields.description')}
          value={values.description}
          onChange={(html) => updateField('description', html)}
          placeholder={t('fields.descriptionPlaceholder')}
          contentClassName="min-h-[160px]"
        />
      ) : values.description.trim() && !isRichTextEmpty(values.description) ? (
        <div>
          <p className="mb-1 text-sm font-medium">{t('fields.description')}</p>
          <div
            className="rounded-md border border-atg-border bg-atg-surface px-3 py-2 text-sm text-atg-muted"
            dangerouslySetInnerHTML={{ __html: values.description }}
          />
        </div>
      ) : null}

      <div className="space-y-3">
        <p className="text-sm font-medium">{t('fields.image')}</p>
        {values.imageUrl.trim() ? (
          <div className="space-y-2">
            <Image
              src={resolveMediaUrl(values.imageUrl.trim())}
              alt={t('fields.imagePreviewAlt')}
              width={640}
              height={360}
              unoptimized
              className="h-40 w-full max-w-md rounded-lg border border-atg-border object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            {canWrite ? (
              <button
                type="button"
                onClick={() => updateField('imageUrl', '')}
                className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
              >
                {t('fields.removeImage')}
              </button>
            ) : null}
          </div>
        ) : null}
        {canWrite ? (
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
                className="hidden"
                onChange={(e) => void handleImagePick(e)}
                disabled={busy}
              />
            </label>
            <span className="text-xs text-atg-muted">{tCommonForm('imageFormatHint')}</span>
          </div>
        ) : null}
        <Input
          id={imageUrlId}
          label={tCommonForm('externalUrlOptional')}
          type="url"
          value={values.imageUrl}
          onChange={(e) => updateField('imageUrl', e.target.value)}
          placeholder={tCommonForm('urlPlaceholder')}
          disabled={!canWrite || uploadingImage}
          error={fieldErrors.imageUrl}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label={t('fields.colorKey')}
          value={values.colorKey}
          options={colorOptions}
          onChange={(e) => updateField('colorKey', e.target.value as GapImpactStatColorKey)}
          disabled={!canWrite}
        />
        <Input
          label={t('fields.sortOrder')}
          type="number"
          min={0}
          value={values.sortOrder}
          onChange={(e) => updateField('sortOrder', e.target.value)}
          disabled={!canWrite}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label={tCommon('columns.status')}
          value={values.status}
          options={statusOptions}
          onChange={(e) => updateField('status', e.target.value as GapStatus)}
          disabled={!canWrite}
        />
        {mode === 'edit' ? (
          <Select
            label={t('fields.locale')}
            value={values.locale}
            options={localeOptions}
            onChange={(e) => updateField('locale', e.target.value)}
            disabled={!canWrite}
          />
        ) : (
          <div>
            <p className="mb-2 text-sm font-medium text-atg-fg">{t('fields.locales')}</p>
            <p className="mb-3 text-xs text-atg-muted">{t('fields.localesHint')}</p>
            <div className="flex flex-wrap gap-4">
              {CONTENT_LOCALES.map((locale) => (
                <Checkbox
                  key={locale}
                  id={`impact-locale-${locale}`}
                  name={`locale-${locale}`}
                  label={tLocale(locale)}
                  checked={selectedLocales.includes(locale)}
                  onChange={() => toggleLocale(locale)}
                  disabled={!canWrite}
                />
              ))}
            </div>
            {fieldErrors.locales ? (
              <p className="mt-2 text-sm text-destructive">{fieldErrors.locales}</p>
            ) : null}
          </div>
        )}
      </div>

      {canWrite ? (
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={busy} loading={saving}>
            {mode === 'create'
              ? selectedLocales.length > 1
                ? t('createBulkButton', { count: selectedLocales.length })
                : t('createButton')
              : t('saveButton')}
          </Button>
          {mode === 'create' ? (
            <Button type="button" variant="outline" href="/gap/impact">
              {t('cancelButton')}
            </Button>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
