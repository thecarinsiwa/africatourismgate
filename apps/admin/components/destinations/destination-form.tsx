'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Card, Checkbox, Input } from '@africatourismgate/ui';
import type { CreateDestinationRequest, Destination } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useId, useState } from 'react';
import { hasValidDestinationCoords, parseDestinationCoord } from '../../lib/destination-coords';
import { getApiClient } from '../../lib/auth/api';
import { isValidSlug, slugifyName } from '../../lib/slug';
import { DestinationHeroBanner } from './destination-hero-banner';
import { DestinationStaticMap } from './destination-static-map';

export type DestinationFormValues = {
  name: string;
  slug: string;
  countryCode: string;
  description: string;
  imageUrl: string;
  latitude: string;
  longitude: string;
  isFeatured: boolean;
};

const defaultValues: DestinationFormValues = {
  name: '',
  slug: '',
  countryCode: 'CD',
  description: '',
  imageUrl: '',
  latitude: '',
  longitude: '',
  isFeatured: false,
};

function formatCoordInput(value: string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  const num = Number(value);
  return Number.isFinite(num) ? String(num) : '';
}

function destinationToFormValues(destination: Destination): DestinationFormValues {
  return {
    name: destination.name,
    slug: destination.slug,
    countryCode: destination.countryCode,
    description: destination.description ?? '',
    imageUrl: destination.imageUrl ?? '',
    latitude: formatCoordInput(destination.latitude),
    longitude: formatCoordInput(destination.longitude),
    isFeatured: destination.isFeatured ?? false,
  };
}

function toPayload(
  values: DestinationFormValues,
  mode: 'create' | 'edit',
): CreateDestinationRequest {
  const payload: CreateDestinationRequest = {
    name: values.name.trim(),
    slug: values.slug.trim().toLowerCase(),
    countryCode: values.countryCode.trim().toUpperCase(),
    isFeatured: values.isFeatured,
  };

  if (values.description.trim()) {
    payload.description = values.description.trim();
  } else if (mode === 'edit') {
    payload.description = undefined;
  }

  const imageUrl = values.imageUrl.trim();
  if (imageUrl) {
    payload.imageUrl = imageUrl;
  } else if (mode === 'edit') {
    payload.imageUrl = null;
  }

  const latTrimmed = values.latitude.trim();
  const lngTrimmed = values.longitude.trim();
  if (latTrimmed && lngTrimmed) {
    payload.latitude = Number(latTrimmed);
    payload.longitude = Number(lngTrimmed);
  } else if (mode === 'edit') {
    payload.latitude = null;
    payload.longitude = null;
  }

  return payload;
}

type DestinationFormProps = {
  mode: 'create' | 'edit';
  destinationId?: string;
  initialDestination?: Destination;
  showHeroPreview?: boolean;
  onUpdated?: (destination: Destination) => void;
};

export function DestinationForm({
  mode,
  destinationId,
  initialDestination,
  showHeroPreview = mode === 'create',
  onUpdated,
}: DestinationFormProps) {
  const { destinations: getDestinationsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.destinations.form');
  const tCommonForm = useTranslations('modules.common.form');
  const tCommonColumns = useTranslations('modules.common.columns');
  const tValidation = useTranslations('modules.common.validation');
  const tActions = useTranslations('common.actions');
  const tLoading = useTranslations('common.loading');
  const router = useRouter();
  const countryId = useId();
  const [values, setValues] = useState<DestinationFormValues>(() =>
    initialDestination ? destinationToFormValues(initialDestination) : defaultValues,
  );
  const [slugTouched, setSlugTouched] = useState(Boolean(initialDestination));
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof DestinationFormValues, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const updateField = useCallback(
    <K extends keyof DestinationFormValues>(key: K, value: DestinationFormValues[K]) => {
      setValues((prev) => {
        const next = { ...prev, [key]: value };
        if (key === 'name' && !slugTouched) {
          next.slug = slugifyName(String(value));
        }
        return next;
      });
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [slugTouched],
  );

  function validate(): boolean {
    const errors: Partial<Record<keyof DestinationFormValues, string>> = {};
    if (!values.name.trim()) {
      errors.name = tValidation('nameRequired');
    }
    if (!values.slug.trim()) {
      errors.slug = tValidation('slugRequired');
    } else if (!isValidSlug(values.slug.trim().toLowerCase())) {
      errors.slug = tValidation('slugInvalidLong');
    }
    if (values.countryCode.trim().length !== 2) {
      errors.countryCode = tValidation('countryCodeTwoLetters');
    }

    const hasLat = values.latitude.trim().length > 0;
    const hasLng = values.longitude.trim().length > 0;
    if (hasLat !== hasLng) {
      errors.latitude = tValidation('coordsBothRequired');
      errors.longitude = tValidation('coordsBothRequired');
    } else if (hasLat && hasLng) {
      const lat = parseDestinationCoord(values.latitude);
      const lng = parseDestinationCoord(values.longitude);
      if (lat === null || lat < -90 || lat > 90) {
        errors.latitude = tValidation('latitudeInvalid');
      }
      if (lng === null || lng < -180 || lng > 180) {
        errors.longitude = tValidation('longitudeInvalid');
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const client = getApiClient();
      const payload = toPayload(values, mode);
      if (mode === 'create') {
        const created = await client.createDestination(payload);
        router.push(`/produits/destinations/${created.id}`);
        router.refresh();
      } else if (destinationId) {
        const updated = await client.updateDestination(destinationId, payload);
        onUpdated?.(updated);
        router.refresh();
      }
    } catch (error) {
      setFormError(getDestinationsErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const textareaClass =
    'w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg placeholder:text-atg-muted/70 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary';

  const previewName = values.name.trim() || t('previewName');

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      {formError ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
        >
          {formError}
        </p>
      ) : null}

      {showHeroPreview ? (
        <DestinationHeroBanner
          name={previewName}
          slug={values.slug.trim() || undefined}
          countryCode={values.countryCode.trim() || '—'}
          imageUrl={values.imageUrl.trim() || null}
        />
      ) : null}

      <Card variant="dashboard" className="space-y-4">
        <h3 className="text-sm font-semibold text-atg-fg">{t('sections.identity')}</h3>
        <Input
          label={tCommonColumns('name')}
          name="name"
          value={values.name}
          onChange={(e) => updateField('name', e.target.value)}
          error={fieldErrors.name}
          required
        />
        <Input
          label={tCommonColumns('slug')}
          name="slug"
          value={values.slug}
          onChange={(e) => {
            setSlugTouched(true);
            updateField('slug', e.target.value.toLowerCase());
          }}
          hint={t('slugHint')}
          error={fieldErrors.slug}
          required
        />
        <Input
          label={t('countryCode')}
          name="countryCode"
          id={countryId}
          value={values.countryCode}
          onChange={(e) => updateField('countryCode', e.target.value.toUpperCase())}
          maxLength={2}
          hint={t('countryCodeHint')}
          error={fieldErrors.countryCode}
          required
        />
      </Card>

      <Card variant="dashboard" className="space-y-4">
        <h3 className="text-sm font-semibold text-atg-fg">{t('sections.presentation')}</h3>
        <Input
          label={t('heroImageUrl')}
          type="url"
          value={values.imageUrl}
          onChange={(e) => updateField('imageUrl', e.target.value)}
          placeholder={tCommonForm('urlPlaceholder')}
          hint={t('heroImageHint')}
        />
        <div>
          <label htmlFor="description" className="mb-2 block text-sm font-medium text-atg-fg">
            {tCommonForm('description')}
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={values.description}
            onChange={(e) => updateField('description', e.target.value)}
            className={textareaClass}
          />
        </div>
        <Checkbox
          id="isFeatured"
          name="isFeatured"
          checked={values.isFeatured}
          onChange={(e) => updateField('isFeatured', e.target.checked)}
          label={t('isFeatured')}
        />
        <p className="text-sm text-atg-muted">{t('isFeaturedHint')}</p>
      </Card>

      <Card variant="dashboard" className="space-y-4">
        <h3 className="text-sm font-semibold text-atg-fg">{t('sections.geography')}</h3>
        <p className="text-sm text-atg-muted">{t('geographyIntro')}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={tCommonForm('latitude')}
            type="text"
            inputMode="decimal"
            value={values.latitude}
            onChange={(e) => updateField('latitude', e.target.value)}
            placeholder="-4.3058"
            error={fieldErrors.latitude}
          />
          <Input
            label={tCommonForm('longitude')}
            type="text"
            inputMode="decimal"
            value={values.longitude}
            onChange={(e) => updateField('longitude', e.target.value)}
            placeholder="15.3000"
            error={fieldErrors.longitude}
          />
        </div>
        {hasValidDestinationCoords(values.latitude, values.longitude) ? (
          <DestinationStaticMap
            latitude={values.latitude}
            longitude={values.longitude}
            title={t('mapPreview')}
          />
        ) : null}
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={submitting} loadingText={tLoading('submit')}>
          {mode === 'create' ? t('submitCreate') : tActions('save')}
        </Button>
        <Button type="button" variant="outline" href="/produits/destinations">
          {tActions('cancel')}
        </Button>
      </div>
    </form>
  );
}
