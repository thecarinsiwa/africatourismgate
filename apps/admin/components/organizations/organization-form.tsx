'use client';

import { Button, Card, Input, Select, useToast } from '@africatourismgate/ui';
import type {
  CreateOrganizationRequest,
  Organization,
  UpdateOrganizationRequest,
} from '@africatourismgate/types';
import { useRouter } from 'next/navigation';
import { useCallback, useId, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { organizationLegalFormOptions } from '../../lib/organization-display';
import { getOrganizationsErrorMessage } from '../../lib/organizations-errors';
import { isValidSlug, slugifyName } from '../../lib/slug';

export type OrganizationFormValues = {
  name: string;
  slug: string;
  description: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
  legalForm: string;
  rccm: string;
  idNat: string;
  nif: string;
  cnss: string;
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
  legalForm: '',
  rccm: '',
  idNat: '',
  nif: '',
  cnss: '',
  currency: 'USD',
  status: 'active',
};

const textareaClass =
  'w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg placeholder:text-atg-muted/70 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary';

function organizationToFormValues(org: Organization): OrganizationFormValues {
  return {
    name: org.name,
    slug: org.slug,
    description: org.description ?? '',
    website: org.website ?? '',
    contactEmail: org.contactEmail ?? '',
    contactPhone: org.contactPhone ?? '',
    legalForm: org.legalForm ?? '',
    rccm: org.rccm ?? '',
    idNat: org.idNat ?? '',
    nif: org.nif ?? '',
    cnss: org.cnss ?? '',
    currency: org.currency,
    status: org.status === 'suspended' ? 'suspended' : 'active',
  };
}

function optionalText(
  value: string,
  mode: 'create' | 'edit',
): string | null | undefined {
  const trimmed = value.trim();
  if (trimmed) return trimmed;
  return mode === 'edit' ? null : undefined;
}

function toPayload(
  values: OrganizationFormValues,
  mode: 'create' | 'edit',
): CreateOrganizationRequest | UpdateOrganizationRequest {
  const base = {
    name: values.name.trim(),
    slug: values.slug.trim().toLowerCase(),
    currency: values.currency.trim().toUpperCase(),
    status: values.status,
    description: optionalText(values.description, mode),
    website: optionalText(values.website, mode),
    contactEmail: optionalText(values.contactEmail, mode),
    contactPhone: optionalText(values.contactPhone, mode),
    legalForm: optionalText(values.legalForm, mode),
    rccm: optionalText(values.rccm, mode),
    idNat: optionalText(values.idNat, mode),
    nif: optionalText(values.nif, mode),
    cnss: optionalText(values.cnss, mode),
  };

  if (mode === 'create') {
    const payload: CreateOrganizationRequest = {
      name: base.name,
      slug: base.slug,
      currency: base.currency,
      status: base.status,
    };
    if (base.description) payload.description = base.description;
    if (base.website) payload.website = base.website;
    if (base.contactEmail) payload.contactEmail = base.contactEmail;
    if (base.contactPhone) payload.contactPhone = base.contactPhone;
    if (base.legalForm) payload.legalForm = base.legalForm;
    if (base.rccm) payload.rccm = base.rccm;
    if (base.idNat) payload.idNat = base.idNat;
    if (base.nif) payload.nif = base.nif;
    if (base.cnss) payload.cnss = base.cnss;
    return payload;
  }

  return base as UpdateOrganizationRequest;
}

type OrganizationFormProps = {
  mode: 'create' | 'edit';
  organizationId?: string;
  initialOrganization?: Organization;
  onUpdated?: (organization: Organization) => void;
};

export function OrganizationForm({
  mode,
  organizationId,
  initialOrganization,
  onUpdated,
}: OrganizationFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const statusId = useId();
  const legalFormId = useId();
  const descriptionId = useId();
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
      const payload = toPayload(values, mode);
      if (mode === 'create') {
        const created = await client.createOrganization(payload as CreateOrganizationRequest);
        router.push(`/organisations/${created.id}`);
        router.refresh();
      } else if (organizationId) {
        const updated = await client.updateOrganization(
          organizationId,
          payload as UpdateOrganizationRequest,
        );
        setValues(organizationToFormValues(updated));
        onUpdated?.(updated);
        router.refresh();
        toast({
          title: 'Organisation enregistrée',
          message: updated.name,
          variant: 'success',
        });
      }
    } catch (error) {
      const message = getOrganizationsErrorMessage(error);
      setFormError(message);
      if (mode === 'edit') {
        toast({
          title: 'Erreur d’enregistrement',
          message,
          variant: 'error',
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  const statusOptions = [
    { value: 'active', label: 'Actif' },
    { value: 'suspended', label: 'Suspendu' },
  ];

  const legalFormSelectOptions = organizationLegalFormOptions.map((option) => ({
    value: option.value,
    label: option.label,
  }));

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

      <Card variant="dashboard" className="space-y-4">
        <h3 className="text-sm font-semibold text-atg-fg">Identité</h3>
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
          <label htmlFor={descriptionId} className="mb-2 block text-sm font-medium text-atg-fg">
            Description
          </label>
          <textarea
            id={descriptionId}
            name="description"
            rows={3}
            value={values.description}
            onChange={(e) => updateField('description', e.target.value)}
            className={textareaClass}
          />
        </div>
      </Card>

      <Card variant="dashboard" className="space-y-4">
        <h3 className="text-sm font-semibold text-atg-fg">Contact</h3>
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
      </Card>

      <Card variant="dashboard" className="space-y-4">
        <h3 className="text-sm font-semibold text-atg-fg">Juridique</h3>
        <Select
          id={legalFormId}
          label="Forme juridique"
          value={values.legalForm}
          onChange={(e) => updateField('legalForm', e.target.value)}
          options={legalFormSelectOptions}
        />
        <Input
          label="RCCM"
          name="rccm"
          value={values.rccm}
          onChange={(e) => updateField('rccm', e.target.value)}
          hint="Registre du Commerce et du Crédit Mobilier"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="ID. Nat."
            name="idNat"
            value={values.idNat}
            onChange={(e) => updateField('idNat', e.target.value)}
            hint="Identification Nationale"
          />
          <Input
            label="NIF"
            name="nif"
            value={values.nif}
            onChange={(e) => updateField('nif', e.target.value)}
            hint="Numéro d’Identification Fiscale"
          />
        </div>
        <Input
          label="CNSS"
          name="cnss"
          value={values.cnss}
          onChange={(e) => updateField('cnss', e.target.value)}
          hint="Caisse Nationale de Sécurité Sociale"
        />
      </Card>

      <Card variant="dashboard" className="space-y-4">
        <h3 className="text-sm font-semibold text-atg-fg">Configuration</h3>
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
          <Select
            id={statusId}
            label="Statut"
            value={values.status}
            onChange={(e) =>
              updateField('status', e.target.value as OrganizationFormValues['status'])
            }
            options={statusOptions}
          />
        </div>
      </Card>

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
