'use client';

import { Button, Input } from '@africatourismgate/ui';
import type { CreateDestinationRequest, Destination } from '@africatourismgate/types';
import { useRouter } from 'next/navigation';
import { useCallback, useId, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getDestinationsErrorMessage } from '../../lib/destinations-errors';
import { isValidSlug, slugifyName } from '../../lib/slug';

export type DestinationFormValues = {
  name: string;
  slug: string;
  countryCode: string;
  description: string;
};

const defaultValues: DestinationFormValues = {
  name: '',
  slug: '',
  countryCode: 'CD',
  description: '',
};

function destinationToFormValues(destination: Destination): DestinationFormValues {
  return {
    name: destination.name,
    slug: destination.slug,
    countryCode: destination.countryCode,
    description: destination.description ?? '',
  };
}

function toPayload(values: DestinationFormValues): CreateDestinationRequest {
  return {
    name: values.name.trim(),
    slug: values.slug.trim().toLowerCase(),
    countryCode: values.countryCode.trim().toUpperCase(),
    ...(values.description.trim() ? { description: values.description.trim() } : {}),
  };
}

type DestinationFormProps = {
  mode: 'create' | 'edit';
  destinationId?: string;
  initialDestination?: Destination;
};

export function DestinationForm({
  mode,
  destinationId,
  initialDestination,
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
        const created = await client.createDestination(payload);
        router.push(`/produits/destinations/${created.id}`);
        router.refresh();
      } else if (destinationId) {
        await client.updateDestination(destinationId, payload);
        router.push('/produits/destinations');
        router.refresh();
      }
    } catch (error) {
      setFormError(getDestinationsErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

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

      <div>
        <label htmlFor="description" className="mb-2 block text-sm font-medium text-atg-fg">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={values.description}
          onChange={(e) => updateField('description', e.target.value)}
          className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg placeholder:text-atg-muted/70 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
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
