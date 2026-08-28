'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Card, Input, Select, Textarea } from '@africatourismgate/ui';
import type { CreateHeroSlideRequest, HeroSlide, HeroSlideStatus } from '@africatourismgate/types';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useId, useMemo, useState } from 'react';
import { isValidMediaUrl } from '../../lib/about/form-utils';
import { getApiClient, resolveApiBaseUrl } from '../../lib/auth/api';
import { getSession } from '../../lib/auth/session';
import { useContentLocaleOptions } from '../../lib/content/use-content-locale-options';
import { usePermissions } from '../../lib/auth/use-permissions';
import { resolveMediaUrl } from '../../lib/resolve-media-url';

export const HERO_SLIDES_HUB_HREF = '/contenu/site?tab=hero';

const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export type HeroSlideFormValues = {
  subtitle: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  href: string;
  sortOrder: string;
  status: HeroSlideStatus;
  locale: string;
};

const defaultValues: HeroSlideFormValues = {
  subtitle: '',
  title: '',
  description: '',
  imageUrl: '',
  imageAlt: '',
  href: '',
  sortOrder: '0',
  status: 'draft',
  locale: 'fr',
};

function slideToFormValues(slide: HeroSlide): HeroSlideFormValues {
  return {
    subtitle: slide.subtitle,
    title: slide.title,
    description: slide.description,
    imageUrl: slide.imageUrl,
    imageAlt: slide.imageAlt,
    href: slide.href ?? '',
    sortOrder: String(slide.sortOrder),
    status: slide.status,
    locale: slide.locale,
  };
}

function toPayload(values: HeroSlideFormValues): CreateHeroSlideRequest {
  const href = values.href.trim();
  return {
    subtitle: values.subtitle.trim(),
    title: values.title.trim(),
    description: values.description.trim(),
    imageUrl: values.imageUrl.trim(),
    imageAlt: values.imageAlt.trim(),
    href: href || null,
    sortOrder: Number.parseInt(values.sortOrder, 10) || 0,
    status: values.status,
    locale: values.locale,
  };
}

type HeroSlideFormProps = {
  mode: 'create' | 'edit';
  slideId?: string;
  initialSlide?: HeroSlide;
  defaultLocale?: string;
  cancelHref?: string;
};

export function HeroSlideForm({
  mode,
  slideId,
  initialSlide,
  defaultLocale = 'fr',
  cancelHref = HERO_SLIDES_HUB_HREF,
}: HeroSlideFormProps) {
  const { about: getAboutErrorMessage } = useAdminErrorMessages();
  const { hasPermission, isSuperAdmin } = usePermissions();
  const canWrite = isSuperAdmin || hasPermission('content.write');
  const t = useTranslations('modules.heroSlides.form');
  const tCommon = useTranslations('modules.common');
  const tCommonForm = useTranslations('modules.common.form');
  const tValidation = useTranslations('modules.common.validation');
  const tStatus = useTranslations('modules.heroSlides.status');
  const localeOptions = useContentLocaleOptions('modules.heroSlides.locale');
  const router = useRouter();

  const imageInputId = useId();

  const [values, setValues] = useState<HeroSlideFormValues>(() =>
    initialSlide ? slideToFormValues(initialSlide) : { ...defaultValues, locale: defaultLocale },
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof HeroSlideFormValues, string>>
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const statusOptions = useMemo(
    () =>
      (['draft', 'published'] as const).map((status) => ({
        value: status,
        label: tStatus(status),
      })),
    [tStatus],
  );

  const updateField = useCallback(
    <K extends keyof HeroSlideFormValues>(key: K, value: HeroSlideFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        setFieldErrors((prev) => ({ ...prev, imageUrl: tValidation('imageFormat') }));
        return;
      }
      if (file.size > IMAGE_MAX_BYTES) {
        setFieldErrors((prev) => ({ ...prev, imageUrl: tValidation('imageTooLarge') }));
        return;
      }
      const session = getSession();
      if (!session?.accessToken) {
        setFieldErrors((prev) => ({
          ...prev,
          imageUrl: tValidation('sessionExpiredRetry'),
        }));
        return;
      }

      setUploadingImage(true);
      setFieldErrors((prev) => ({ ...prev, imageUrl: undefined }));
      const body = new FormData();
      body.append('file', file);
      const response = await fetch(`${resolveApiBaseUrl()}/hero-slides/upload-image`, {
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

  const validate = (): boolean => {
    const errors: Partial<Record<keyof HeroSlideFormValues, string>> = {};
    if (!values.subtitle.trim()) errors.subtitle = t('validation.subtitleRequired');
    if (!values.title.trim()) errors.title = t('validation.titleRequired');
    if (!values.description.trim()) errors.description = t('validation.descriptionRequired');
    const imageUrl = values.imageUrl.trim();
    if (!imageUrl) {
      errors.imageUrl = t('validation.imageUrlRequired');
    } else if (!isValidMediaUrl(imageUrl)) {
      errors.imageUrl = t('validation.imageUrlInvalid');
    }
    if (!values.imageAlt.trim()) errors.imageAlt = t('validation.imageAltRequired');
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canWrite) return;
    if (!validate()) return;

    setSaving(true);
    setSubmitError(null);

    const payload = toPayload(values);
    const client = getApiClient();

    try {
      if (mode === 'create') {
        const created = await client.createHeroSlide(payload);
        router.push(`/contenu/hero/${created.id}`);
        router.refresh();
      } else if (slideId) {
        await client.updateHeroSlide(slideId, payload);
        router.push(cancelHref);
        router.refresh();
      }
    } catch (error) {
      setSubmitError(getAboutErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const busy = saving || uploadingImage;

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-lg border border-atg-border bg-atg-elevated/50 px-4 py-3 text-sm text-atg-muted">
          <p>{t('info.carouselHint')}</p>
        </div>

        {submitError ? (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
          >
            {submitError}
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label={t('fields.locale')}
            value={values.locale}
            options={localeOptions}
            onChange={(e) => updateField('locale', e.target.value)}
            disabled={!canWrite}
          />
          <Select
            label={tCommon('columns.status')}
            value={values.status}
            options={statusOptions}
            onChange={(e) => updateField('status', e.target.value as HeroSlideStatus)}
            disabled={!canWrite}
          />
        </div>

        <Input
          label={t('fields.subtitle')}
          value={values.subtitle}
          onChange={(e) => updateField('subtitle', e.target.value)}
          error={fieldErrors.subtitle}
          required
          disabled={!canWrite}
        />

        <Input
          label={t('fields.title')}
          value={values.title}
          onChange={(e) => updateField('title', e.target.value)}
          error={fieldErrors.title}
          required
          disabled={!canWrite}
        />

        <Textarea
          label={t('fields.description')}
          rows={4}
          value={values.description}
          onChange={(e) => updateField('description', e.target.value)}
          error={fieldErrors.description}
          required
          disabled={!canWrite}
        />

        <div className="space-y-3">
          <p className="text-sm font-medium text-atg-fg">{t('fields.image')}</p>
          {values.imageUrl.trim() ? (
            <div className="space-y-2">
              <Image
                src={resolveMediaUrl(values.imageUrl.trim())}
                alt={values.imageAlt.trim() || t('fields.imagePreviewAlt')}
                width={960}
                height={400}
                unoptimized
                className="h-44 w-full max-w-xl rounded-lg border border-atg-border object-cover"
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
                  className="sr-only"
                  disabled={busy}
                  onChange={handleImageUpload}
                />
              </label>
              <span className="text-xs text-atg-muted">{t('fields.imageUploadHint')}</span>
            </div>
          ) : null}
          <Input
            label={t('fields.imageUrl')}
            value={values.imageUrl}
            onChange={(e) => updateField('imageUrl', e.target.value)}
            placeholder="https://..."
            error={fieldErrors.imageUrl}
            disabled={!canWrite}
          />
        </div>

        <Input
          label={t('fields.imageAlt')}
          value={values.imageAlt}
          onChange={(e) => updateField('imageAlt', e.target.value)}
          error={fieldErrors.imageAlt}
          required
          disabled={!canWrite}
        />

        <Input
          label={t('fields.href')}
          value={values.href}
          onChange={(e) => updateField('href', e.target.value)}
          placeholder="/hotels?destination=Marrakech"
          hint={t('fields.hrefHint')}
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

        <div className="flex flex-wrap gap-3">
          {canWrite ? (
            <Button
              type="submit"
              loading={saving}
              loadingText={t('saving')}
              disabled={busy}
            >
              {mode === 'create' ? t('createButton') : t('saveButton')}
            </Button>
          ) : null}
          <Button type="button" variant="outline" href={cancelHref} disabled={busy}>
            {t('cancelButton')}
          </Button>
        </div>
      </form>
    </Card>
  );
}
