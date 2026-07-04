'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Input } from '@africatourismgate/ui';
import type {
  AuthVisualDecorIcon,
  AuthVisualSettingValue,
  BookingDefaultsValue,
  BookingMode,
  BrandingPlatformValue,
  ContactWebSettingValue,
  LocaleSettingValue,
  LoyaltyOneKeySettingValue,
  Organization,
  OrganizationSetting,
  ResolvedBookingItemTypeModes,
} from '@africatourismgate/types';
import {
  BOOKING_ITEM_TYPE_KEYS,
  DEFAULT_BOOKING_ITEM_TYPE_MODES,
  normalizeBookingItemTypeModes,
} from '@africatourismgate/types/tour-guide';
import { DEFAULT_LOYALTY_ONEKEY_SETTING } from '@africatourismgate/types/organization-settings';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient, resolveApiBaseUrl } from '../../lib/auth/api';
import { getSession } from '../../lib/auth/session';
import {
  PLATFORM_ORG_ID,
  isValidContactEmail,
  isValidCurrency,
} from '../../lib/org-settings-constants';
import {
  applyFaviconToDocument,
  applyOrganizationBrandingToDocument,
  type OrganizationBranding,
  brandingFromSettingsForm,
} from '../../lib/organization-theme';
import { useOrganizationThemeOptional } from '../organization-theme-provider';
import { BrandColorPaletteField } from './brand-color-palette-field';
import { AuthVisualIconsField } from './auth-visual-icons-field';
import { authVisualFromSetting } from '../../lib/auth-visual';
import { OrganizationOrgSelector } from '../organizations/organization-org-selector';

const BRANDING_IMAGE_MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_BRANDING_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/x-icon',
  'image/vnd.microsoft.icon',
]);
const ALLOWED_BRANDING_IMAGE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.svg',
  '.ico',
]);
const BRANDING_LOGO_ACCEPT =
  'image/jpeg,image/png,image/webp,image/gif,image/svg+xml,.jpg,.jpeg,.png,.webp,.gif,.svg';
const BRANDING_FAVICON_ACCEPT =
  'image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/x-icon,image/vnd.microsoft.icon,.jpg,.jpeg,.png,.webp,.gif,.svg,.ico';

function isAllowedBrandingImage(file: File): boolean {
  const extension = file.name.includes('.')
    ? file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
    : '';
  if (!ALLOWED_BRANDING_IMAGE_EXTENSIONS.has(extension)) {
    return false;
  }
  if (ALLOWED_BRANDING_IMAGE_TYPES.has(file.type)) {
    return true;
  }
  return file.type === 'application/octet-stream';
}

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
  itemTypeModes: ResolvedBookingItemTypeModes;
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
  itemTypeModes: { ...DEFAULT_BOOKING_ITEM_TYPE_MODES },
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
  const itemTypeModes = normalizeBookingItemTypeModes(
    settingByKey(settings, 'item_type_modes') as Partial<ResolvedBookingItemTypeModes> | undefined,
  );

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
    itemTypeModes,
  };
}

type OrganizationSettingsFormProps = {
  organizationId: string;
  isSuperAdmin: boolean;
  onOrganizationIdChange?: (id: string) => void;
  organizations?: Pick<Organization, 'id' | 'name'>[];
  onDirtyChange?: (isDirty: boolean) => void;
};

export function OrganizationSettingsForm({
  organizationId,
  isSuperAdmin,
  onOrganizationIdChange,
  organizations = [],
  onDirtyChange,
}: OrganizationSettingsFormProps) {
  const { organizationSettings: getOrganizationSettingsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.settings.form');
  const tValidation = useTranslations('modules.common.validation');
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
  const [initialValues, setInitialValues] = useState<SettingsFormValues>(defaultValues);

  const updateField = useCallback(
    <K extends keyof SettingsFormValues>(key: K, value: SettingsFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
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

  const applyPreviewBranding = useCallback(
    (branding: OrganizationBranding) => {
      if (orgTheme) {
        orgTheme.applyBranding(branding);
        return;
      }
      applyOrganizationBrandingToDocument(branding);
      applyFaviconToDocument(branding.faviconUrl);
    },
    [orgTheme],
  );

  useEffect(() => {
    applyPreviewBranding(brandingPreview);
  }, [applyPreviewBranding, brandingPreview]);

  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(initialValues),
    [values, initialValues],
  );

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

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
          const nextValues = toFormValues(org, settingsPage.data);
          setValues(nextValues);
          setInitialValues(nextValues);
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
      errors.contactEmail = t('validation.contactEmailInvalid');
    }
    if (!isValidCurrency(values.currency)) {
      errors.currency = t('validation.currencyInvalid');
    }
    const hold = Number(values.holdMinutes);
    if (!Number.isInteger(hold) || hold < 0) {
      errors.holdMinutes = t('validation.holdMinutesInvalid');
    }
    if (!values.displayName.trim()) {
      errors.displayName = t('validation.displayNameRequired');
    }
    const loyaltyRate = Number(values.loyaltyPointsPerMajorUnit);
    if (!Number.isInteger(loyaltyRate) || loyaltyRate < 0) {
      errors.loyaltyPointsPerMajorUnit = t('validation.loyaltyRateInvalid');
    }
    const programCode = values.loyaltyProgramCode.trim();
    if (!programCode || programCode.length > 32) {
      errors.loyaltyProgramCode = t('validation.programCodeInvalid');
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
            settingGroup: 'booking',
            settingKey: 'item_type_modes',
            settingValue: values.itemTypeModes,
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

      applyPreviewBranding(brandingFromSettingsForm(values));
      setInitialValues(values);
      await orgTheme?.refreshTheme();

      router.refresh();
    } catch (error) {
      setFormError(getOrganizationSettingsErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function uploadBrandingImage(file: File): Promise<string> {
    if (!isAllowedBrandingImage(file)) {
      throw new Error('Invalid image type');
    }
    if (file.size > BRANDING_IMAGE_MAX_BYTES) {
      throw new Error('Image too large');
    }
    const session = getSession();
    if (!session?.accessToken) {
      throw new Error('Missing session');
    }
    const body = new FormData();
    body.append('file', file);
    const response = await fetch(`${resolveApiBaseUrl()}/organization-settings/upload-branding`, {
      method: 'POST',
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
      if (!isAllowedBrandingImage(file)) {
        setFormError(t('upload.invalidImage'));
        return;
      }
      if (file.size > BRANDING_IMAGE_MAX_BYTES) {
        setFormError(t('upload.tooLarge'));
        return;
      }
      const session = getSession();
      if (!session?.accessToken) {
        setFormError(tValidation('sessionExpiredRetry'));
        return;
      }
      setUploadingField(field);
      const url = await uploadBrandingImage(file);
      updateField(field, url);
      setFormError(null);
    } catch {
      setFormError(tValidation('uploadFailed'));
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
      setFormError(tValidation('uploadFailed'));
      throw new Error('Upload failed');
    } finally {
      setUploadingAuthIconIndex(null);
    }
  }

  function handleCancel(): void {
    setValues(initialValues);
    applyPreviewBranding(brandingFromSettingsForm(initialValues));
    setFieldErrors({});
    setFormError(null);
  }

  if (loading) {
    return <p className="text-sm text-atg-muted">{t('loading')}</p>;
  }

  if (loadError) {
    return (
      <p role="alert" className="text-sm text-red-600 dark:text-red-400">
        {loadError}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="space-y-8">
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
        <h2 className="text-lg font-semibold text-atg-fg">{t('sections.contact.title')}</h2>
        <p className="text-sm text-atg-muted">{t('sections.contact.description')}</p>
        <Input
          label={t('sections.contact.phone')}
          type="tel"
          value={values.contactPhone}
          onChange={(e) => updateField('contactPhone', e.target.value)}
          placeholder="+243 815 000 000"
        />
        <Input
          label={t('sections.contact.email')}
          type="email"
          value={values.contactEmail}
          onChange={(e) => updateField('contactEmail', e.target.value)}
          error={fieldErrors.contactEmail}
        />
        <Input
          label={t('sections.contact.location')}
          value={values.location}
          onChange={(e) => updateField('location', e.target.value)}
          placeholder={t('sections.contact.locationPlaceholder')}
        />
        <Input
          label={t('sections.contact.facebookUrl')}
          type="url"
          value={values.facebookUrl}
          onChange={(e) => updateField('facebookUrl', e.target.value)}
          placeholder="https://www.facebook.com/..."
        />
        <Input
          label={t('sections.contact.twitterUrl')}
          type="url"
          value={values.twitterUrl}
          onChange={(e) => updateField('twitterUrl', e.target.value)}
          placeholder="https://x.com/..."
        />
        <Input
          label={t('sections.contact.instagramUrl')}
          type="url"
          value={values.instagramUrl}
          onChange={(e) => updateField('instagramUrl', e.target.value)}
          placeholder="https://www.instagram.com/..."
        />
        <Input
          label={t('sections.contact.currency')}
          value={values.currency}
          onChange={(e) => updateField('currency', e.target.value.toUpperCase())}
          error={fieldErrors.currency}
          maxLength={3}
        />
          </section>

          <section className="space-y-4">
        <h2 className="text-lg font-semibold text-atg-fg">{t('sections.locale.title')}</h2>
        <Input
          label={t('sections.locale.language')}
          value={values.language}
          onChange={(e) => updateField('language', e.target.value)}
        />
        <Input
          label={t('sections.locale.timezone')}
          value={values.timezone}
          onChange={(e) => updateField('timezone', e.target.value)}
        />
          </section>

          <section className="space-y-4">
        <h2 className="text-lg font-semibold text-atg-fg">{t('sections.booking.title')}</h2>
        <Input
          label={t('sections.booking.holdMinutes')}
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
          {t('sections.booking.allowGuestCheckout')}
        </label>
        <div className="space-y-3 border-t border-atg-border pt-4">
          <p className="text-sm font-medium text-atg-fg">{t('sections.booking.modesTitle')}</p>
          <p className="text-xs text-atg-muted">{t('sections.booking.modesDescription')}</p>
          <div className="space-y-2">
            {BOOKING_ITEM_TYPE_KEYS.map((itemType) => (
              <label
                key={itemType}
                className="flex flex-col gap-1 text-sm text-atg-fg sm:flex-row sm:items-center sm:justify-between"
              >
                <span>{t(`sections.booking.itemTypes.${itemType}`)}</span>
                <select
                  value={values.itemTypeModes[itemType]}
                  onChange={(e) =>
                    updateField('itemTypeModes', {
                      ...values.itemTypeModes,
                      [itemType]: e.target.value as BookingMode,
                    })
                  }
                  className="w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm sm:w-48"
                >
                  <option value="immediate">{t('sections.booking.modeImmediate')}</option>
                  <option value="assisted">{t('sections.booking.modeAssisted')}</option>
                </select>
              </label>
            ))}
          </div>
        </div>
          </section>

          <section className="space-y-4">
        <h2 className="text-lg font-semibold text-atg-fg">{t('sections.loyalty.title')}</h2>
        <p className="text-sm text-atg-muted">{t('sections.loyalty.description')}</p>
        <label className="flex items-center gap-2 text-sm text-atg-fg">
          <input
            type="checkbox"
            checked={values.loyaltyEnabled}
            onChange={(e) => updateField('loyaltyEnabled', e.target.checked)}
            className="rounded border-atg-border"
          />
          {t('sections.loyalty.enabled')}
        </label>
        <Input
          label={t('sections.loyalty.pointsPerMajorUnit')}
          type="number"
          min={0}
          value={values.loyaltyPointsPerMajorUnit}
          onChange={(e) => updateField('loyaltyPointsPerMajorUnit', e.target.value)}
          error={fieldErrors.loyaltyPointsPerMajorUnit}
        />
        <Input
          label={t('sections.loyalty.programCode')}
          value={values.loyaltyProgramCode}
          onChange={(e) =>
            updateField('loyaltyProgramCode', e.target.value.toUpperCase())
          }
          error={fieldErrors.loyaltyProgramCode}
          maxLength={32}
        />
          </section>

          <section className="space-y-4">
        <h2 className="text-lg font-semibold text-atg-fg">{t('sections.branding.title')}</h2>
        <Input
          label={t('sections.branding.displayName')}
          value={values.displayName}
          onChange={(e) => updateField('displayName', e.target.value)}
          error={fieldErrors.displayName}
        />
        <BrandColorPaletteField
          label={t('sections.branding.primaryColor')}
          hint={t('sections.branding.primaryColorHint')}
          value={values.primaryColor}
          onChange={(hex) => updateField('primaryColor', hex)}
        />
        <BrandColorPaletteField
          label={t('sections.branding.secondaryColor')}
          hint={t('sections.branding.secondaryColorHint')}
          value={values.secondaryColor}
          onChange={(hex) => updateField('secondaryColor', hex)}
        />
        <Input
          label={t('sections.branding.logoUrl')}
          value={values.logoUrl}
          onChange={(e) => updateField('logoUrl', e.target.value)}
          placeholder="https://..."
        />
        <div className="flex items-center gap-3">
          <label className="inline-flex cursor-pointer items-center rounded-md border border-atg-border px-3 py-2 text-xs font-medium text-atg-fg hover:bg-atg-muted/10">
            {uploadingField === 'logoUrl' ? t('sections.branding.uploading') : t('sections.branding.chooseLogo')}
            <input
              type="file"
              accept={BRANDING_LOGO_ACCEPT}
              className="hidden"
              onChange={(e) => void handleLocalImagePick(e, 'logoUrl')}
              disabled={uploadingField !== null}
            />
          </label>
          <span className="text-xs text-atg-muted">{t('sections.branding.logoFormatHint')}</span>
        </div>
        <Input
          label={t('sections.branding.faviconUrl')}
          value={values.faviconUrl}
          onChange={(e) => updateField('faviconUrl', e.target.value)}
          placeholder="https://..."
        />
        <div className="flex items-center gap-3">
          <label className="inline-flex cursor-pointer items-center rounded-md border border-atg-border px-3 py-2 text-xs font-medium text-atg-fg hover:bg-atg-muted/10">
            {uploadingField === 'faviconUrl' ? t('sections.branding.uploading') : t('sections.branding.chooseFavicon')}
            <input
              type="file"
              accept={BRANDING_FAVICON_ACCEPT}
              className="hidden"
              onChange={(e) => void handleLocalImagePick(e, 'faviconUrl')}
              disabled={uploadingField !== null}
            />
          </label>
          <span className="text-xs text-atg-muted">{t('sections.branding.faviconFormatHint')}</span>
        </div>
          </section>

          <section className="space-y-4">
        <h2 className="text-lg font-semibold text-atg-fg">{t('sections.authVisual.title')}</h2>
        <AuthVisualIconsField
          icons={values.authVisualIcons}
          onChange={(authVisualIcons) => updateField('authVisualIcons', authVisualIcons)}
          onUploadImage={handleAuthVisualImageUpload}
          uploadingIndex={uploadingAuthIconIndex}
        />
          </section>
        </div>

        <aside className="lg:sticky lg:top-6">
          <div className="rounded-xl border border-atg-border bg-atg-bg p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-atg-muted">
              {t('preview.title')}
            </p>
            <p className="mt-1 text-sm text-atg-muted">{t('preview.description')}</p>

            <div className="mt-4 overflow-hidden rounded-lg border border-atg-border bg-atg-surface">
              <div
                className="flex items-center justify-between px-3 py-2 text-white"
                style={{ backgroundColor: brandingPreview.primaryColor }}
              >
                <div className="flex items-center gap-2">
                  {brandingPreview.logoUrl ? (
                    <img
                      src={brandingPreview.logoUrl}
                      alt={t('preview.logoAlt')}
                      className="h-6 w-6 rounded object-contain bg-white/15 p-0.5"
                    />
                  ) : (
                    <div className="h-6 w-6 rounded bg-white/25" />
                  )}
                  <span className="text-sm font-semibold">{brandingPreview.displayName}</span>
                </div>
                <span className="text-xs opacity-90">{t('preview.adminBadge')}</span>
              </div>

              <div className="grid grid-cols-[72px_minmax(0,1fr)]">
                <div
                  className="space-y-2 px-2 py-3"
                  style={{ backgroundColor: brandingPreview.secondaryColor }}
                >
                  <div className="h-2 rounded bg-white/60" />
                  <div className="h-2 rounded bg-white/40" />
                  <div className="h-2 rounded bg-white/30" />
                </div>
                <div className="space-y-3 p-3">
                  <div className="h-2 w-2/3 rounded bg-atg-border" />
                  <div className="h-2 w-1/2 rounded bg-atg-border" />
                  <button
                    type="button"
                    className="rounded-md px-3 py-1.5 text-xs font-medium text-white"
                    style={{ backgroundColor: brandingPreview.primaryColor }}
                  >
                    {t('preview.primaryButton')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="sticky bottom-0 z-20 border-t border-atg-border bg-atg-bg/95 px-4 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-atg-fg">
            {isDirty ? t('dirty') : t('clean')}
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={!isDirty}>
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              loading={submitting}
              loadingText={t('saving')}
              disabled={!isDirty}
            >
              {t('save')}
            </Button>
          </div>
        </div>
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
