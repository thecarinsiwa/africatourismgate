'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { usePropertyTypeOptions } from '../../lib/i18n/use-module-labels';

import { Button, Card, Input, Select, StarRatingInput, useToast } from '@africatourismgate/ui';
import type {
  CreatePropertyRequest,
  Destination,
  Property,
  PropertyType,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { isRichTextEmpty } from '../../lib/rich-text';
import { isValidSlug, slugifyName } from '../../lib/slug';
import { RichTextEditor } from '../rich-text-editor';

export type PropertyFormValues = {
  destinationId: string;
  name: string;
  slug: string;
  propertyType: PropertyType;
  starRating: string;
  description: string;
  addressLine: string;
};

const defaultValues: PropertyFormValues = {
  destinationId: '',
  name: '',
  slug: '',
  propertyType: 'hotel',
  starRating: '',
  description: '',
  addressLine: '',
};

function propertyToFormValues(property: Property): PropertyFormValues {
  return {
    destinationId: property.destinationId,
    name: property.name,
    slug: property.slug,
    propertyType: property.propertyType,
    starRating: property.starRating != null ? String(property.starRating) : '',
    description: property.description ?? '',
    addressLine: property.addressLine ?? '',
  };
}

function toPayload(values: PropertyFormValues): CreatePropertyRequest {
  const star =
    values.starRating.trim() !== '' ? Number(values.starRating) : undefined;
  return {
    destinationId: values.destinationId,
    name: values.name.trim(),
    slug: values.slug.trim().toLowerCase(),
    propertyType: values.propertyType,
    ...(star !== undefined && Number.isFinite(star) ? { starRating: star } : {}),
    ...(values.description.trim() && !isRichTextEmpty(values.description)
      ? { description: values.description.trim() }
      : {}),
    ...(values.addressLine.trim() ? { addressLine: values.addressLine.trim() } : {}),
  };
}

type PropertyFormProps = {
  mode: 'create' | 'edit';
  propertyId?: string;
  initialProperty?: Property;
  /** Affiché à droite de la carte Identité (ex. photos en édition). */
  identityAside?: ReactNode;
};

export function PropertyForm({
  mode,
  propertyId,
  initialProperty,
  identityAside,
}: PropertyFormProps) {
  const { hebergements: getHebergementsErrorMessage } = useAdminErrorMessages();
  const tForm = useTranslations('modules.properties.form');
  const tValidation = useTranslations('modules.common.validation');
  const tToast = useTranslations('modules.common.toast');
  const tActions = useTranslations('common.actions');
  const tLoading = useTranslations('common.loading');
  const tSelect = useTranslations('modules.common.select');
  const tCommonForm = useTranslations('modules.common.form');
  const propertyTypeOptions = usePropertyTypeOptions();
  const router = useRouter();
  const { toast } = useToast();
  const typeId = useId();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [values, setValues] = useState<PropertyFormValues>(() =>
    initialProperty ? propertyToFormValues(initialProperty) : defaultValues,
  );
  const [slugTouched, setSlugTouched] = useState(Boolean(initialProperty));
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof PropertyFormValues, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void getApiClient()
      .listDestinations({ page: 1, limit: 100 })
      .then((r) => setDestinations(r.data))
      .catch(() => setDestinations([]));
  }, []);

  const updateField = useCallback(
    <K extends keyof PropertyFormValues>(key: K, value: PropertyFormValues[K]) => {
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
    const errors: Partial<Record<keyof PropertyFormValues, string>> = {};
    if (!values.destinationId) errors.destinationId = tForm('validation.destinationRequired');
    if (!values.name.trim()) errors.name = tValidation('nameRequired');
    if (!values.slug.trim()) errors.slug = tValidation('slugRequired');
    else if (!isValidSlug(values.slug.trim().toLowerCase())) {
      errors.slug = tValidation('slugInvalid');
    }
    if (values.starRating.trim()) {
      const n = Number(values.starRating);
      if (!Number.isFinite(n) || n < 0 || n > 5) {
        errors.starRating = tValidation('starRatingRange');
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
      const payload = toPayload(values);
      if (mode === 'create') {
        const created = await client.createProperty(payload);
        router.push(`/hebergements/${created.id}`);
        router.refresh();
      } else if (propertyId) {
        await client.updateProperty(propertyId, payload);
        toast({
          title: tToast('propertySavedTitle'),
          message: values.name.trim(),
          variant: 'success',
        });
      }
    } catch (error) {
      const message = getHebergementsErrorMessage(error);
      setFormError(message);
      if (mode === 'edit') {
        toast({
          title: tToast('saveError'),
          message,
          variant: 'error',
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  const destinationOptions = useMemo(
    () => [
      { value: '', label: tSelect('choose') },
      ...destinations.map((d) => ({ value: d.id, label: d.name })),
    ],
    [destinations, tSelect],
  );

  const starValue = values.starRating.trim() !== '' ? Number(values.starRating) : 0;

  return (
    <form
      onSubmit={handleSubmit}
      className={identityAside ? 'w-full space-y-4' : 'w-full max-w-3xl space-y-4'}
    >
      {formError ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
        >
          {formError}
        </p>
      ) : null}

      <div
        className={
          identityAside
            ? 'grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-start xl:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]'
            : undefined
        }
      >
        <Card variant="dashboard" padding="sm">
          <h3 className="text-sm font-semibold text-atg-fg">{tForm('sections.identity')}</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Input
              label={tForm('name')}
              value={values.name}
              onChange={(e) => updateField('name', e.target.value)}
              error={fieldErrors.name}
              required
            />
            <Input
              label={tForm('slug')}
              value={values.slug}
              onChange={(e) => {
                setSlugTouched(true);
                updateField('slug', e.target.value.toLowerCase());
              }}
              error={fieldErrors.slug}
              required
            />
            <Select
              id={typeId}
              label={tForm('type')}
              value={values.propertyType}
              onChange={(e) => updateField('propertyType', e.target.value as PropertyType)}
              options={propertyTypeOptions}
            />
            <Select
              label={tForm('destination')}
              value={values.destinationId}
              onChange={(e) => updateField('destinationId', e.target.value)}
              options={destinationOptions}
              error={fieldErrors.destinationId}
              required
            />
            <div className="sm:col-span-2">
              <Input
                label={tForm('address')}
                value={values.addressLine}
                onChange={(e) => updateField('addressLine', e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <StarRatingInput
                label={tForm('starRating')}
                value={Number.isFinite(starValue) ? starValue : 0}
                onChange={(v) => updateField('starRating', v > 0 ? String(v) : '')}
                step={0.5}
                hint={tForm('starRatingHint')}
                error={fieldErrors.starRating}
              />
            </div>
            <div className="sm:col-span-2">
              <RichTextEditor
                label={tCommonForm('description')}
                value={values.description}
                onChange={(html) => updateField('description', html)}
                contentClassName="min-h-[140px]"
              />
            </div>
          </div>
        </Card>

        {identityAside ? <div className="min-w-0">{identityAside}</div> : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={submitting} loadingText={tLoading('submit')}>
          {mode === 'create' ? tForm('submitCreate') : tActions('save')}
        </Button>
        <Button type="button" variant="outline" href="/hebergements">
          {tActions('cancel')}
        </Button>
      </div>
    </form>
  );
}
