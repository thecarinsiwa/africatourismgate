'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Input, Textarea } from '@africatourismgate/ui';
import type { CreateHeroSlideRequest, HeroSlide, HeroSlideStatus } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useId, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';

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
};

export function HeroSlideForm({
  mode,
  slideId,
  initialSlide,
  defaultLocale = 'fr',
}: HeroSlideFormProps) {
  const { about: getAboutErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.heroSlides.form');
  const tCommon = useTranslations('modules.common');
  const tLocale = useTranslations('modules.heroSlides.locale');
  const tStatus = useTranslations('modules.heroSlides.status');
  const router = useRouter();

  const subtitleId = useId();
  const titleId = useId();
  const descriptionId = useId();
  const imageUrlId = useId();
  const imageAltId = useId();
  const hrefId = useId();
  const sortOrderId = useId();
  const statusId = useId();
  const localeId = useId();

  const [values, setValues] = useState<HeroSlideFormValues>(() =>
    initialSlide ? slideToFormValues(initialSlide) : { ...defaultValues, locale: defaultLocale },
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof HeroSlideFormValues, string>>
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const updateField = useCallback(
    <K extends keyof HeroSlideFormValues>(key: K, value: HeroSlideFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  const validate = (): boolean => {
    const errors: Partial<Record<keyof HeroSlideFormValues, string>> = {};
    if (!values.subtitle.trim()) errors.subtitle = t('validation.subtitleRequired');
    if (!values.title.trim()) errors.title = t('validation.titleRequired');
    if (!values.description.trim()) errors.description = t('validation.descriptionRequired');
    if (!values.imageUrl.trim()) errors.imageUrl = t('validation.imageUrlRequired');
    if (!values.imageAlt.trim()) errors.imageAlt = t('validation.imageAltRequired');
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setSubmitError(null);

    const payload = toPayload(values);
    const client = getApiClient();

    try {
      if (mode === 'create') {
        const created = await client.createHeroSlide(payload);
        router.push(`/contenu/hero/${created.id}`);
      } else if (slideId) {
        await client.updateHeroSlide(slideId, payload);
        router.push('/contenu/hero');
      }
    } catch (error) {
      setSubmitError(getAboutErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <div>
        <label htmlFor={subtitleId} className="mb-1 block text-sm font-medium">
          {t('fields.subtitle')}
        </label>
        <Input
          id={subtitleId}
          value={values.subtitle}
          onChange={(e) => updateField('subtitle', e.target.value)}
          aria-invalid={Boolean(fieldErrors.subtitle)}
        />
        {fieldErrors.subtitle ? (
          <p className="mt-1 text-sm text-destructive">{fieldErrors.subtitle}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor={titleId} className="mb-1 block text-sm font-medium">
          {t('fields.title')}
        </label>
        <Input
          id={titleId}
          value={values.title}
          onChange={(e) => updateField('title', e.target.value)}
          aria-invalid={Boolean(fieldErrors.title)}
        />
        {fieldErrors.title ? (
          <p className="mt-1 text-sm text-destructive">{fieldErrors.title}</p>
        ) : null}
      </div>

      <Textarea
        id={descriptionId}
        label={t('fields.description')}
        rows={4}
        value={values.description}
        onChange={(e) => updateField('description', e.target.value)}
        error={fieldErrors.description}
      />

      <div>
        <label htmlFor={imageUrlId} className="mb-1 block text-sm font-medium">
          {t('fields.imageUrl')}
        </label>
        <Input
          id={imageUrlId}
          value={values.imageUrl}
          onChange={(e) => updateField('imageUrl', e.target.value)}
          placeholder="https://..."
          aria-invalid={Boolean(fieldErrors.imageUrl)}
        />
        {fieldErrors.imageUrl ? (
          <p className="mt-1 text-sm text-destructive">{fieldErrors.imageUrl}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor={imageAltId} className="mb-1 block text-sm font-medium">
          {t('fields.imageAlt')}
        </label>
        <Input
          id={imageAltId}
          value={values.imageAlt}
          onChange={(e) => updateField('imageAlt', e.target.value)}
          aria-invalid={Boolean(fieldErrors.imageAlt)}
        />
        {fieldErrors.imageAlt ? (
          <p className="mt-1 text-sm text-destructive">{fieldErrors.imageAlt}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor={hrefId} className="mb-1 block text-sm font-medium">
          {t('fields.href')}
        </label>
        <Input
          id={hrefId}
          value={values.href}
          onChange={(e) => updateField('href', e.target.value)}
          placeholder="/hotels?destination=Marrakech"
        />
        <p className="mt-1 text-sm text-atg-muted">{t('fields.hrefHint')}</p>
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
          />
        </div>

        <div>
          <label htmlFor={statusId} className="mb-1 block text-sm font-medium">
            {tCommon('columns.status')}
          </label>
          <select
            id={statusId}
            value={values.status}
            onChange={(e) => updateField('status', e.target.value as HeroSlideStatus)}
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
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="fr">{tLocale('fr')}</option>
            <option value="en">{tLocale('en')}</option>
            <option value="es">{tLocale('es')}</option>
          </select>
        </div>
      </div>

      {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? t('saving') : mode === 'create' ? t('createButton') : t('saveButton')}
        </Button>
        <Button type="button" variant="outline" href="/contenu/hero">
          {t('cancelButton')}
        </Button>
      </div>
    </form>
  );
}
