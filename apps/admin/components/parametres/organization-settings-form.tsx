'use client';

import { Button, Input } from '@africatourismgate/ui';
import type {
  BookingDefaultsValue,
  BrandingPlatformValue,
  LocaleSettingValue,
  Organization,
  OrganizationSetting,
} from '@africatourismgate/types';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import {
  PLATFORM_ORG_ID,
  isValidContactEmail,
  isValidCurrency,
} from '../../lib/org-settings-constants';
import { getOrganizationSettingsErrorMessage } from '../../lib/organization-settings-errors';

type SettingsFormValues = {
  contactEmail: string;
  currency: string;
  language: string;
  timezone: string;
  holdMinutes: string;
  allowGuestCheckout: boolean;
  displayName: string;
  primaryColor: string;
  secondaryColor: string;
};

const defaultValues: SettingsFormValues = {
  contactEmail: '',
  currency: 'USD',
  language: 'fr',
  timezone: 'Africa/Kinshasa',
  holdMinutes: '15',
  allowGuestCheckout: true,
  displayName: 'Africa Tourism Gate',
  primaryColor: '#0B6E4F',
  secondaryColor: '#199a45',
};

function settingByKey(
  settings: OrganizationSetting[],
  key: string,
): Record<string, unknown> | undefined {
  return settings.find((s) => s.settingKey === key)?.settingValue;
}

function toFormValues(
  org: Organization,
  settings: OrganizationSetting[],
): SettingsFormValues {
  const locale = settingByKey(settings, 'locale') as LocaleSettingValue | undefined;
  const defaults = settingByKey(settings, 'defaults') as BookingDefaultsValue | undefined;
  const platform = settingByKey(settings, 'platform') as BrandingPlatformValue | undefined;

  return {
    contactEmail: org.contactEmail ?? '',
    currency: org.currency ?? locale?.currency ?? 'USD',
    language: locale?.language ?? 'fr',
    timezone: locale?.timezone ?? 'Africa/Kinshasa',
    holdMinutes: String(defaults?.holdMinutes ?? 15),
    allowGuestCheckout: defaults?.allowGuestCheckout ?? true,
    displayName: platform?.displayName ?? org.name,
    primaryColor: platform?.primaryColor ?? '#0B6E4F',
    secondaryColor: platform?.secondaryColor ?? '#199a45',
  };
}

type OrganizationSettingsFormProps = {
  organizationId: string;
  isSuperAdmin: boolean;
  onOrganizationIdChange?: (id: string) => void;
  organizations?: Organization[];
};

export function OrganizationSettingsForm({
  organizationId,
  isSuperAdmin,
  onOrganizationIdChange,
  organizations = [],
}: OrganizationSettingsFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<SettingsFormValues>(defaultValues);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof SettingsFormValues, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const updateField = useCallback(
    <K extends keyof SettingsFormValues>(key: K, value: SettingsFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    async function load() {
      try {
        const client = getApiClient();
        const [org, settingsPage] = await Promise.all([
          client.getOrganization(organizationId),
          client.listOrganizationSettings({
            organizationId,
            page: 1,
            limit: 100,
          }),
        ]);
        if (!cancelled) {
          setValues(toFormValues(org, settingsPage.data));
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(getOrganizationSettingsErrorMessage(error));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  function validate(): boolean {
    const errors: Partial<Record<keyof SettingsFormValues, string>> = {};
    const email = values.contactEmail.trim();
    if (email && !isValidContactEmail(email)) {
      errors.contactEmail = "L'e-mail de contact doit être valide.";
    }
    if (!isValidCurrency(values.currency)) {
      errors.currency = 'La devise doit comporter 3 lettres (ex. USD, CDF).';
    }
    const hold = Number(values.holdMinutes);
    if (!Number.isInteger(hold) || hold < 0) {
      errors.holdMinutes = 'Durée de retenue invalide (entier positif).';
    }
    if (!values.displayName.trim()) {
      errors.displayName = 'Le nom affiché est obligatoire.';
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
      const currency = values.currency.trim().toUpperCase();
      const contactEmail = values.contactEmail.trim();

      await client.updateOrganization(organizationId, {
        ...(contactEmail ? { contactEmail } : { contactEmail: undefined }),
        currency,
      });

      await client.bulkUpsertOrganizationSettings({
        ...(isSuperAdmin ? { organizationId } : {}),
        settings: [
          {
            settingGroup: 'general',
            settingKey: 'locale',
            settingValue: {
              language: values.language.trim() || 'fr',
              currency,
              timezone: values.timezone.trim() || 'Africa/Kinshasa',
            },
          },
          {
            settingGroup: 'booking',
            settingKey: 'defaults',
            settingValue: {
              holdMinutes: Number(values.holdMinutes),
              allowGuestCheckout: values.allowGuestCheckout,
            },
          },
          {
            settingGroup: 'branding',
            settingKey: 'platform',
            settingValue: {
              displayName: values.displayName.trim(),
              primaryColor: values.primaryColor.trim() || undefined,
              secondaryColor: values.secondaryColor.trim() || undefined,
            },
          },
        ],
      });

      router.refresh();
    } catch (error) {
      setFormError(getOrganizationSettingsErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-atg-muted">Chargement…</p>;
  }

  if (loadError) {
    return (
      <p role="alert" className="text-sm text-red-600 dark:text-red-400">
        {loadError}
      </p>
    );
  }

  const selectClass =
    'w-full rounded-lg border border-atg-border bg-atg-bg px-3 py-2 text-sm text-atg-fg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-8">
      {isSuperAdmin && organizations.length > 0 && onOrganizationIdChange ? (
        <div>
          <label htmlFor="org-select" className="mb-1 block text-sm font-medium text-atg-fg">
            Organisation
          </label>
          <select
            id="org-select"
            className={selectClass}
            value={organizationId}
            onChange={(e) => onOrganizationIdChange(e.target.value)}
          >
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {formError ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
        >
          {formError}
        </p>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-atg-fg">Coordonnées</h2>
        <Input
          label="E-mail de contact"
          type="email"
          value={values.contactEmail}
          onChange={(e) => updateField('contactEmail', e.target.value)}
          error={fieldErrors.contactEmail}
        />
        <Input
          label="Devise"
          value={values.currency}
          onChange={(e) => updateField('currency', e.target.value.toUpperCase())}
          error={fieldErrors.currency}
          maxLength={3}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-atg-fg">Locale</h2>
        <Input
          label="Langue"
          value={values.language}
          onChange={(e) => updateField('language', e.target.value)}
        />
        <Input
          label="Fuseau horaire"
          value={values.timezone}
          onChange={(e) => updateField('timezone', e.target.value)}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-atg-fg">Réservation</h2>
        <Input
          label="Durée de retenue (minutes)"
          type="number"
          min={0}
          value={values.holdMinutes}
          onChange={(e) => updateField('holdMinutes', e.target.value)}
          error={fieldErrors.holdMinutes}
        />
        <label className="flex items-center gap-2 text-sm text-atg-fg">
          <input
            type="checkbox"
            checked={values.allowGuestCheckout}
            onChange={(e) => updateField('allowGuestCheckout', e.target.checked)}
            className="rounded border-atg-border"
          />
          Autoriser la commande invité
        </label>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-atg-fg">Branding</h2>
        <Input
          label="Nom affiché"
          value={values.displayName}
          onChange={(e) => updateField('displayName', e.target.value)}
          error={fieldErrors.displayName}
        />
        <Input
          label="Couleur primaire"
          value={values.primaryColor}
          onChange={(e) => updateField('primaryColor', e.target.value)}
        />
        <Input
          label="Couleur secondaire"
          value={values.secondaryColor}
          onChange={(e) => updateField('secondaryColor', e.target.value)}
        />
      </section>

      <div className="flex gap-3">
        <Button type="submit" loading={submitting} loadingText="Enregistrement…">
          Enregistrer
        </Button>
      </div>
    </form>
  );
}

export function resolveInitialOrganizationId(
  isSuperAdmin: boolean,
  userOrganizationId: string | null | undefined,
  queryOrganizationId: string | null,
): string {
  if (isSuperAdmin) {
    return queryOrganizationId || PLATFORM_ORG_ID;
  }
  return userOrganizationId ?? PLATFORM_ORG_ID;
}
