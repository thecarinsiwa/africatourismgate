'use client';

import { Button, Input } from '@africatourismgate/ui';
import type {
  AuthVisualDecorIcon,
  AuthVisualSettingValue,
  BookingDefaultsValue,
  BrandingPlatformValue,
  ContactWebSettingValue,
  LocaleSettingValue,
  LoyaltyOneKeySettingValue,
  Organization,
  OrganizationSetting,
} from '@africatourismgate/types';
import { DEFAULT_LOYALTY_ONEKEY_SETTING } from '@africatourismgate/types/organization-settings';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient, resolveApiBaseUrl } from '../../lib/auth/api';
import { getSession } from '../../lib/auth/session';
import {
  PLATFORM_ORG_ID,
  isValidContactEmail,
  isValidCurrency,
} from '../../lib/org-settings-constants';
import { getOrganizationSettingsErrorMessage } from '../../lib/organization-settings-errors';
import {
  applyOrganizationBrandingToDocument,
  brandingFromSettingsForm,
} from '../../lib/organization-theme';
import { useOrganizationThemeOptional } from '../organization-theme-provider';
import { BrandColorPaletteField } from './brand-color-palette-field';
import { AuthVisualIconsField } from './auth-visual-icons-field';
import { authVisualFromSetting } from '../../lib/auth-visual';
import { OrganizationOrgSelector } from '../organizations/organization-org-selector';

type SettingsFormValues = {
  contactEmail: string;
  contactPhone: string;
  location: string;
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  currency: string;
  language: string;
  timezone: string;
  holdMinutes: string;
  allowGuestCheckout: boolean;
  displayName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  faviconUrl: string;
  loyaltyEnabled: boolean;
  loyaltyPointsPerMajorUnit: string;
  loyaltyProgramCode: string;
  authVisualIcons: AuthVisualDecorIcon[];
};

const defaultValues: SettingsFormValues = {
  contactEmail: '',
  contactPhone: '',
  location: 'Kinshasa, RD Congo',
  facebookUrl: 'https://www.facebook.com/africatourismgate/',
  twitterUrl: 'https://x.com/Congotourismga1',
  instagramUrl: 'https://www.instagram.com/africatourismgate/',
  currency: 'USD',
  language: 'fr',
  timezone: 'Africa/Kinshasa',
  holdMinutes: '15',
  allowGuestCheckout: true,
  displayName: 'Africa Tourism Gate',
  primaryColor: '#0B6E4F',
  secondaryColor: '#199a45',
  logoUrl: '',
  faviconUrl: '',
  loyaltyEnabled: DEFAULT_LOYALTY_ONEKEY_SETTING.enabled,
  loyaltyPointsPerMajorUnit: String(DEFAULT_LOYALTY_ONEKEY_SETTING.pointsPerMajorUnit),
  loyaltyProgramCode: DEFAULT_LOYALTY_ONEKEY_SETTING.programCode,
  authVisualIcons: [],
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
  const contactWeb = settings.find(
    (s) => s.settingGroup === 'contact' && s.settingKey === 'web',
  )?.settingValue as ContactWebSettingValue | undefined;
  const onekey = settingByKey(settings, 'onekey') as LoyaltyOneKeySettingValue | undefined;
  const authVisual = settingByKey(settings, 'auth_visual') as AuthVisualSettingValue | undefined;

  return {
    contactEmail: org.contactEmail ?? '',
    contactPhone: org.contactPhone ?? '',
    location: contactWeb?.location ?? 'Kinshasa, RD Congo',
    facebookUrl: contactWeb?.facebookUrl ?? '',
    twitterUrl: contactWeb?.twitterUrl ?? '',
    instagramUrl: contactWeb?.instagramUrl ?? '',
    currency: org.currency ?? locale?.currency ?? 'USD',
    language: locale?.language ?? 'fr',
    timezone: locale?.timezone ?? 'Africa/Kinshasa',
    holdMinutes: String(defaults?.holdMinutes ?? 15),
    allowGuestCheckout: defaults?.allowGuestCheckout ?? true,
    displayName: platform?.displayName ?? org.name,
    primaryColor: platform?.primaryColor ?? '#0B6E4F',
    secondaryColor: platform?.secondaryColor ?? '#199a45',
    logoUrl: platform?.logoUrl ?? '',
    faviconUrl: platform?.faviconUrl ?? '',
    loyaltyEnabled: onekey?.enabled ?? DEFAULT_LOYALTY_ONEKEY_SETTING.enabled,
    loyaltyPointsPerMajorUnit: String(
      onekey?.pointsPerMajorUnit ?? DEFAULT_LOYALTY_ONEKEY_SETTING.pointsPerMajorUnit,
    ),
    loyaltyProgramCode:
      onekey?.programCode ?? DEFAULT_LOYALTY_ONEKEY_SETTING.programCode,
    authVisualIcons: authVisualFromSetting(authVisual).map((icon) => ({ ...icon })),
  };
}

type OrganizationSettingsFormProps = {
  organizationId: string;
  isSuperAdmin: boolean;
  onOrganizationIdChange?: (id: string) => void;
  organizations?: Pick<Organization, 'id' | 'name'>[];
};

export function OrganizationSettingsForm({
  organizationId,
  isSuperAdmin,
  onOrganizationIdChange,
  organizations = [],
}: OrganizationSettingsFormProps) {
  const router = useRouter();
  const orgTheme = useOrganizationThemeOptional();
  const [values, setValues] = useState<SettingsFormValues>(defaultValues);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof SettingsFormValues, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingField, setUploadingField] = useState<'logoUrl' | 'faviconUrl' | null>(null);
  const [uploadingAuthIconIndex, setUploadingAuthIconIndex] = useState<number | null>(null);

  const updateField = useCallback(
    <K extends keyof SettingsFormValues>(key: K, value: SettingsFormValues[K]) => {
      setValues((prev) => {
        const next = { ...prev, [key]: value };
        if (key === 'primaryColor' || key === 'secondaryColor') {
          applyOrganizationBrandingToDocument(brandingFromSettingsForm(next));
        }
        return next;
      });
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  const {
    displayName,
    primaryColor,
    secondaryColor,
    logoUrl,
    faviconUrl,
  } = values;

  const brandingPreview = useMemo(
    () =>
      brandingFromSettingsForm({
        displayName,
        primaryColor,
        secondaryColor,
        logoUrl,
        faviconUrl,
      }),
    [displayName, primaryColor, secondaryColor, logoUrl, faviconUrl],
  );

  useEffect(() => {
    applyOrganizationBrandingToDocument(brandingPreview);
  }, [brandingPreview]);

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
    const loyaltyRate = Number(values.loyaltyPointsPerMajorUnit);
    if (!Number.isInteger(loyaltyRate) || loyaltyRate < 0) {
      errors.loyaltyPointsPerMajorUnit =
        'Le taux de points doit être un entier positif ou nul.';
    }
    const programCode = values.loyaltyProgramCode.trim();
    if (!programCode || programCode.length > 32) {
      errors.loyaltyProgramCode =
        'Le code programme est obligatoire (32 caractères max).';
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
      const contactPhone = values.contactPhone.trim();

      await client.updateOrganization(organizationId, {
        ...(contactEmail ? { contactEmail } : { contactEmail: undefined }),
        ...(contactPhone ? { contactPhone } : { contactPhone: undefined }),
        currency,
      });

      await client.bulkUpsertOrganizationSettings({
        ...(isSuperAdmin ? { organizationId } : {}),
        settings: [
          {
            settingGroup: 'contact',
            settingKey: 'web',
            settingValue: {
              location: values.location.trim() || undefined,
              facebookUrl: values.facebookUrl.trim() || undefined,
              twitterUrl: values.twitterUrl.trim() || undefined,
              instagramUrl: values.instagramUrl.trim() || undefined,
            },
          },
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
              logoUrl: values.logoUrl.trim() || undefined,
              faviconUrl: values.faviconUrl.trim() || undefined,
            },
          },
          {
            settingGroup: 'branding',
            settingKey: 'auth_visual',
            settingValue: {
              icons: values.authVisualIcons,
            },
          },
          {
            settingGroup: 'loyalty',
            settingKey: 'onekey',
            settingValue: {
              enabled: values.loyaltyEnabled,
              pointsPerMajorUnit: Number(values.loyaltyPointsPerMajorUnit),
              programCode: values.loyaltyProgramCode.trim().toUpperCase(),
            },
          },
        ],
      });

      applyOrganizationBrandingToDocument(brandingFromSettingsForm(values));
      await orgTheme?.refreshTheme();

      router.refresh();
    } catch (error) {
      setFormError(getOrganizationSettingsErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function uploadBrandingImage(file: File): Promise<string> {
    if (!file.type.startsWith('image/')) {
      throw new Error('Invalid image type');
    }
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('Image too large');
    }
    const session = getSession();
    if (!session?.accessToken) {
      throw new Error('Missing session');
    }
    const body = new FormData();
    body.append('file', file);
    const response = await fetch(`${resolveApiBaseUrl()}/organization-settings/upload-branding`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      body,
    });
    if (!response.ok) {
      throw new Error('Upload branding failed');
    }
    const payload = (await response.json()) as { url?: string };
    if (!payload.url) {
      throw new Error('Invalid upload response');
    }
    return payload.url;
  }

  async function handleLocalImagePick(
    event: React.ChangeEvent<HTMLInputElement>,
    field: 'logoUrl' | 'faviconUrl',
  ) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (!file.type.startsWith('image/')) {
        setFormError('Veuillez sélectionner une image valide.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setFormError('Image trop lourde (max 2 MB).');
        return;
      }
      const session = getSession();
      if (!session?.accessToken) {
        setFormError('Session expirée. Reconnectez-vous puis réessayez.');
        return;
      }
      setUploadingField(field);
      const url = await uploadBrandingImage(file);
      updateField(field, url);
      setFormError(null);
    } catch {
      setFormError("Impossible d'uploader l'image locale.");
    } finally {
      setUploadingField(null);
      event.target.value = '';
    }
  }

  async function handleAuthVisualImageUpload(index: number, file: File): Promise<string> {
    try {
      setUploadingAuthIconIndex(index);
      const url = await uploadBrandingImage(file);
      setFormError(null);
      return url;
    } catch {
      setFormError("Impossible d'uploader l'image locale.");
      throw new Error('Upload failed');
    } finally {
      setUploadingAuthIconIndex(null);
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

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-8">
      {isSuperAdmin && organizations.length > 0 && onOrganizationIdChange ? (
        <OrganizationOrgSelector
          id="org-select"
          organizations={organizations}
          value={organizationId}
          onChange={onOrganizationIdChange}
        />
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
        <p className="text-sm text-atg-muted">
          Affichées dans le bandeau et le pied de page du site public.
        </p>
        <Input
          label="Téléphone"
          type="tel"
          value={values.contactPhone}
          onChange={(e) => updateField('contactPhone', e.target.value)}
          placeholder="+243 815 000 000"
        />
        <Input
          label="E-mail de contact"
          type="email"
          value={values.contactEmail}
          onChange={(e) => updateField('contactEmail', e.target.value)}
          error={fieldErrors.contactEmail}
        />
        <Input
          label="Adresse / localisation"
          value={values.location}
          onChange={(e) => updateField('location', e.target.value)}
          placeholder="Kinshasa, RD Congo"
        />
        <Input
          label="URL Facebook"
          type="url"
          value={values.facebookUrl}
          onChange={(e) => updateField('facebookUrl', e.target.value)}
          placeholder="https://www.facebook.com/..."
        />
        <Input
          label="URL X / Twitter"
          type="url"
          value={values.twitterUrl}
          onChange={(e) => updateField('twitterUrl', e.target.value)}
          placeholder="https://x.com/..."
        />
        <Input
          label="URL Instagram"
          type="url"
          value={values.instagramUrl}
          onChange={(e) => updateField('instagramUrl', e.target.value)}
          placeholder="https://www.instagram.com/..."
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
        <h2 className="text-lg font-semibold text-atg-fg">Fidélité OneKey</h2>
        <p className="text-sm text-atg-muted">
          Points crédités après paiement confirmé : floor(montant en centimes / 100) ×
          taux ci-dessous.
        </p>
        <label className="flex items-center gap-2 text-sm text-atg-fg">
          <input
            type="checkbox"
            checked={values.loyaltyEnabled}
            onChange={(e) => updateField('loyaltyEnabled', e.target.checked)}
            className="rounded border-atg-border"
          />
          Activer le crédit de points OneKey
        </label>
        <Input
          label="Points par unité majeure de devise"
          type="number"
          min={0}
          value={values.loyaltyPointsPerMajorUnit}
          onChange={(e) => updateField('loyaltyPointsPerMajorUnit', e.target.value)}
          error={fieldErrors.loyaltyPointsPerMajorUnit}
        />
        <Input
          label="Code programme"
          value={values.loyaltyProgramCode}
          onChange={(e) =>
            updateField('loyaltyProgramCode', e.target.value.toUpperCase())
          }
          error={fieldErrors.loyaltyProgramCode}
          maxLength={32}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-atg-fg">Branding</h2>
        <Input
          label="Nom affiché"
          value={values.displayName}
          onChange={(e) => updateField('displayName', e.target.value)}
          error={fieldErrors.displayName}
        />
        <BrandColorPaletteField
          label="Couleur primaire"
          hint="Couleur dominante de l’interface (boutons, liens, accents)."
          value={values.primaryColor}
          onChange={(hex) => updateField('primaryColor', hex)}
        />
        <BrandColorPaletteField
          label="Couleur secondaire"
          hint="Couleur d’accompagnement (badges, éléments secondaires)."
          value={values.secondaryColor}
          onChange={(hex) => updateField('secondaryColor', hex)}
        />
        <Input
          label="URL du logo"
          value={values.logoUrl}
          onChange={(e) => updateField('logoUrl', e.target.value)}
          placeholder="https://..."
        />
        <div className="flex items-center gap-3">
          <label className="inline-flex cursor-pointer items-center rounded-md border border-atg-border px-3 py-2 text-xs font-medium text-atg-fg hover:bg-atg-muted/10">
            {uploadingField === 'logoUrl' ? 'Upload en cours…' : 'Choisir un logo local'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void handleLocalImagePick(e, 'logoUrl')}
              disabled={uploadingField !== null}
            />
          </label>
          <span className="text-xs text-atg-muted">PNG/JPG/SVG/WebP, max 2 MB</span>
        </div>
        <Input
          label="URL de l'icône (favicon)"
          value={values.faviconUrl}
          onChange={(e) => updateField('faviconUrl', e.target.value)}
          placeholder="https://..."
        />
        <div className="flex items-center gap-3">
          <label className="inline-flex cursor-pointer items-center rounded-md border border-atg-border px-3 py-2 text-xs font-medium text-atg-fg hover:bg-atg-muted/10">
            {uploadingField === 'faviconUrl' ? 'Upload en cours…' : 'Choisir une icône locale'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void handleLocalImagePick(e, 'faviconUrl')}
              disabled={uploadingField !== null}
            />
          </label>
          <span className="text-xs text-atg-muted">PNG/ICO/SVG, max 2 MB</span>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-atg-fg">Panneau connexion</h2>
        <AuthVisualIconsField
          icons={values.authVisualIcons}
          onChange={(authVisualIcons) => updateField('authVisualIcons', authVisualIcons)}
          onUploadImage={handleAuthVisualImageUpload}
          uploadingIndex={uploadingAuthIconIndex}
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
