'use client';

import { Button, Input } from '@africatourismgate/ui';
import type { CreateOrganizationRequest, Organization } from '@africatourismgate/types';
import { useRouter } from 'next/navigation';
import { useCallback, useId, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getOrganizationsErrorMessage } from '../../lib/organizations-errors';
import { isValidSlug, slugifyName } from '../../lib/slug';

export type OrganizationFormValues = {
  name: string;
  slug: string;
  description: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
  currency: string;
  status: 'active' | 'suspended';
};

const defaultValues: OrganizationFormValues = {
  name: '',
  slug: '',
  description: '',
  website: '',
  contactEmail: '',
  contactPhone: '',
  currency: 'USD',
  status: 'active',
};

function organizationToFormValues(org: Organization): OrganizationFormValues {
  return {
    name: org.name,
    slug: org.slug,
    description: org.description ?? '',
    website: org.website ?? '',
    contactEmail: org.contactEmail ?? '',
    contactPhone: org.contactPhone ?? '',
    currency: org.currency,
    status: org.status === 'suspended' ? 'suspended' : 'active',
  };
}

function toPayload(values: OrganizationFormValues): CreateOrganizationRequest {
  return {
    name: values.name.trim(),
    slug: values.slug.trim().toLowerCase(),
    currency: values.currency.trim().toUpperCase(),
    status: values.status,
    ...(values.description.trim() ? { description: values.description.trim() } : {}),
    ...(values.website.trim() ? { website: values.website.trim() } : {}),
    ...(values.contactEmail.trim() ? { contactEmail: values.contactEmail.trim() } : {}),
    ...(values.contactPhone.trim() ? { contactPhone: values.contactPhone.trim() } : {}),
  };
}

type OrganizationFormProps = {
  mode: 'create' | 'edit';
  organizationId?: string;
  initialOrganization?: Organization;
};

export function OrganizationForm({
  mode,
  organizationId,
  initialOrganization,
}: OrganizationFormProps) {
  const router = useRouter();
  const statusId = useId();
  const [values, setValues] = useState<OrganizationFormValues>(() =>
    initialOrganization ? organizationToFormValues(initialOrganization) : defaultValues,
  );
  const [slugTouched, setSlugTouched] = useState(Boolean(initialOrganization));
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof OrganizationFormValues, string>>>(
    {},
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const updateField = useCallback(
    <K extends keyof OrganizationFormValues>(key: K, value: OrganizationFormValues[K]) => {
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
    const errors: Partial<Record<keyof OrganizationFormValues, string>> = {};
    if (!values.name.trim()) {
      errors.name = 'Le nom est obligatoire.';
    }
    if (!values.slug.trim()) {
      errors.slug = 'Le slug est obligatoire.';
    } else if (!isValidSlug(values.slug.trim().toLowerCase())) {
      errors.slug =
        'Slug invalide : minuscules, chiffres et tirets uniquement (ex. mon-organisation).';
    }
    if (values.currency.trim().length !== 3) {
      errors.currency = 'La devise doit comporter 3 lettres (ex. USD, CDF).';
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
        const created = await client.createOrganization(payload);
        router.push(`/organisations/${created.id}`);
        router.refresh();
      } else if (organizationId) {
        await client.updateOrganization(organizationId, payload);
        router.push('/organisations');
        router.refresh();
      }
    } catch (error) {
      setFormError(getOrganizationsErrorMessage(error));
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
        autoComplete="organization"
      />

      <Input
        label="Slug"
        name="slug"
        value={values.slug}
        onChange={(e) => {
          setSlugTouched(true);
          updateField('slug', e.target.value.toLowerCase());
        }}
        hint="Identifiant unique dans l’URL (ex. africa-tourism-gate)."
        error={fieldErrors.slug}
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

      <Input
        label="Site web"
        name="website"
        type="url"
        value={values.website}
        onChange={(e) => updateField('website', e.target.value)}
        placeholder="https://"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="E-mail de contact"
          name="contactEmail"
          type="email"
          value={values.contactEmail}
          onChange={(e) => updateField('contactEmail', e.target.value)}
        />
        <Input
          label="Téléphone"
          name="contactPhone"
          value={values.contactPhone}
          onChange={(e) => updateField('contactPhone', e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Devise"
          name="currency"
          value={values.currency}
          onChange={(e) => updateField('currency', e.target.value.toUpperCase())}
          maxLength={3}
          error={fieldErrors.currency}
          required
        />

        <div>
          <label htmlFor={statusId} className="mb-2 block text-sm font-medium text-atg-fg">
            Statut
          </label>
          <select
            id={statusId}
            name="status"
            value={values.status}
            onChange={(e) =>
              updateField('status', e.target.value as OrganizationFormValues['status'])
            }
            className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="active">Actif</option>
            <option value="suspended">Suspendu</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" loading={submitting} loadingText="Enregistrement…">
          {mode === 'create' ? 'Créer l’organisation' : 'Enregistrer'}
        </Button>
        <Button type="button" variant="outline" href="/organisations">
          Annuler
        </Button>
      </div>
    </form>
  );
}
