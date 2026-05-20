'use client';

import { Button, Input } from '@africatourismgate/ui';
import type {
  CreatePropertyRequest,
  Destination,
  Property,
  PropertyType,
} from '@africatourismgate/types';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useId, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getHebergementsErrorMessage } from '../../lib/hebergements-errors';
import { isValidSlug, slugifyName } from '../../lib/slug';

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'hotel', label: 'Hôtel' },
  { value: 'resort', label: 'Resort' },
  { value: 'apartment', label: 'Appartement' },
  { value: 'villa', label: 'Villa' },
  { value: 'hostel', label: 'Auberge' },
  { value: 'other', label: 'Autre' },
];

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
    starRating: property.starRating ?? '',
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
    ...(values.description.trim() ? { description: values.description.trim() } : {}),
    ...(values.addressLine.trim() ? { addressLine: values.addressLine.trim() } : {}),
  };
}

type PropertyFormProps = {
  mode: 'create' | 'edit';
  propertyId?: string;
  initialProperty?: Property;
};

export function PropertyForm({ mode, propertyId, initialProperty }: PropertyFormProps) {
  const router = useRouter();
  const destId = useId();
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
    if (!values.destinationId) errors.destinationId = 'La destination est obligatoire.';
    if (!values.name.trim()) errors.name = 'Le nom est obligatoire.';
    if (!values.slug.trim()) errors.slug = 'Le slug est obligatoire.';
    else if (!isValidSlug(values.slug.trim().toLowerCase())) {
      errors.slug = 'Slug invalide (minuscules, chiffres, tirets).';
    }
    if (values.starRating.trim()) {
      const n = Number(values.starRating);
      if (!Number.isFinite(n) || n < 0 || n > 5) {
        errors.starRating = 'Note entre 0 et 5.';
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
        router.push('/hebergements');
        router.refresh();
      }
    } catch (error) {
      setFormError(getHebergementsErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      {formError ? (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {formError}
        </p>
      ) : null}

      <div>
        <label htmlFor={destId} className="mb-2 block text-sm font-medium text-atg-fg">
          Destination
        </label>
        <select
          id={destId}
          value={values.destinationId}
          onChange={(e) => updateField('destinationId', e.target.value)}
          className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm"
          required
        >
          <option value="">Choisir…</option>
          {destinations.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        {fieldErrors.destinationId ? (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.destinationId}</p>
        ) : null}
      </div>

      <Input
        label="Nom"
        value={values.name}
        onChange={(e) => updateField('name', e.target.value)}
        error={fieldErrors.name}
        required
      />

      <Input
        label="Slug"
        value={values.slug}
        onChange={(e) => {
          setSlugTouched(true);
          updateField('slug', e.target.value.toLowerCase());
        }}
        error={fieldErrors.slug}
        required
      />

      <div>
        <label htmlFor={typeId} className="mb-2 block text-sm font-medium text-atg-fg">
          Type
        </label>
        <select
          id={typeId}
          value={values.propertyType}
          onChange={(e) => updateField('propertyType', e.target.value as PropertyType)}
          className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm"
        >
          {PROPERTY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Classement (étoiles)"
        type="number"
        step="0.5"
        min={0}
        max={5}
        value={values.starRating}
        onChange={(e) => updateField('starRating', e.target.value)}
        error={fieldErrors.starRating}
        hint="Optionnel, 0 à 5"
      />

      <Input
        label="Adresse"
        value={values.addressLine}
        onChange={(e) => updateField('addressLine', e.target.value)}
      />

      <div>
        <label className="mb-2 block text-sm font-medium text-atg-fg">Description</label>
        <textarea
          rows={3}
          value={values.description}
          onChange={(e) => updateField('description', e.target.value)}
          className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={submitting} loadingText="Enregistrement…">
          {mode === 'create' ? 'Créer l’hébergement' : 'Enregistrer'}
        </Button>
        <Button type="button" variant="outline" href="/hebergements">
          Annuler
        </Button>
      </div>
    </form>
  );
}
