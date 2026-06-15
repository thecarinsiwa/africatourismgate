'use client';

import { Button, Card, Input } from '@africatourismgate/ui';
import type { CreateDestinationRequest, Destination } from '@africatourismgate/types';
import { useRouter } from 'next/navigation';
import { useCallback, useId, useState } from 'react';
import { hasValidDestinationCoords, parseDestinationCoord } from '../../lib/destination-coords';
import { getApiClient } from '../../lib/auth/api';
import { getDestinationsErrorMessage } from '../../lib/destinations-errors';
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
};

const defaultValues: DestinationFormValues = {
  name: '',
  slug: '',
  countryCode: 'CD',
  description: '',
  imageUrl: '',
  latitude: '',
  longitude: '',
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
      errors.name = 'Le nom est obligatoire.';
    }
    if (!values.slug.trim()) {
      errors.slug = 'Le slug est obligatoire.';
    } else if (!isValidSlug(values.slug.trim().toLowerCase())) {
      errors.slug =
        'Slug invalide : minuscules, chiffres et tirets uniquement (ex. kinshasa).';
    }
    if (values.countryCode.trim().length !== 2) {
      errors.countryCode = 'Le code pays doit comporter 2 lettres (ex. CD, KE).';
    }

    const hasLat = values.latitude.trim().length > 0;
    const hasLng = values.longitude.trim().length > 0;
    if (hasLat !== hasLng) {
      errors.latitude = 'Renseignez latitude et longitude ensemble.';
      errors.longitude = 'Renseignez latitude et longitude ensemble.';
    } else if (hasLat && hasLng) {
      const lat = parseDestinationCoord(values.latitude);
      const lng = parseDestinationCoord(values.longitude);
      if (lat === null || lat < -90 || lat > 90) {
        errors.latitude = 'Latitude invalide (−90 à 90).';
      }
      if (lng === null || lng < -180 || lng > 180) {
        errors.longitude = 'Longitude invalide (−180 à 180).';
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

  const previewName = values.name.trim() || 'Nouvelle destination';

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
        <h3 className="text-sm font-semibold text-atg-fg">Identité</h3>
        <Input
          label="Nom"
          name="name"
          value={values.name}
          onChange={(e) => updateField('name', e.target.value)}
          error={fieldErrors.name}
          required
        />
        <Input
          label="Slug"
          name="slug"
          value={values.slug}
          onChange={(e) => {
            setSlugTouched(true);
            updateField('slug', e.target.value.toLowerCase());
          }}
          hint="Identifiant unique (ex. kinshasa)."
          error={fieldErrors.slug}
          required
        />
        <Input
          label="Code pays (ISO)"
          name="countryCode"
          id={countryId}
          value={values.countryCode}
          onChange={(e) => updateField('countryCode', e.target.value.toUpperCase())}
          maxLength={2}
          hint="2 lettres, ex. CD, KE, ZA."
          error={fieldErrors.countryCode}
          required
        />
      </Card>

      <Card variant="dashboard" className="space-y-4">
        <h3 className="text-sm font-semibold text-atg-fg">Présentation</h3>
        <Input
          label="URL image hero"
          type="url"
          value={values.imageUrl}
          onChange={(e) => updateField('imageUrl', e.target.value)}
          placeholder="https://…"
          hint="Affichée dans le bandeau. Laissez vide pour un dégradé."
        />
        <div>
          <label htmlFor="description" className="mb-2 block text-sm font-medium text-atg-fg">
            Description
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
      </Card>

      <Card variant="dashboard" className="space-y-4">
        <h3 className="text-sm font-semibold text-atg-fg">Géographie</h3>
        <p className="text-sm text-atg-muted">
          Coordonnées du centre de la destination pour la carte statique.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Latitude"
            type="text"
            inputMode="decimal"
            value={values.latitude}
            onChange={(e) => updateField('latitude', e.target.value)}
            placeholder="-4.3058"
            error={fieldErrors.latitude}
          />
          <Input
            label="Longitude"
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
            title="Aperçu carte"
          />
        ) : null}
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={submitting} loadingText="Enregistrement…">
          {mode === 'create' ? 'Créer la destination' : 'Enregistrer'}
        </Button>
        <Button type="button" variant="outline" href="/produits/destinations">
          Annuler
        </Button>
      </div>
    </form>
  );
}
