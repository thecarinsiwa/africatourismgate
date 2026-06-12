'use client';

import { Button, Input } from '@africatourismgate/ui';
import type {
  BrandingPlatformValue,
  EmailBrandingValue,
  OrganizationSetting,
} from '@africatourismgate/types';
import { normalizeBrandingAssetUrl } from '@africatourismgate/utils';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { getApiClient, resolveApiBaseUrl } from '../../lib/auth/api';
import { getSession } from '../../lib/auth/session';
import { PLATFORM_ORG_ID } from '../../lib/org-settings-constants';
import { getOrganizationSettingsErrorMessage } from '../../lib/organization-settings-errors';
import { BrandColorPaletteField } from './brand-color-palette-field';

export type EmailBrandingFormValues = {
  displayName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  footerText: string;
  welcomeSubject: string;
  bookingSubject: string;
};

const defaultValues: EmailBrandingFormValues = {
  displayName: 'Africa Tourism Gate',
  logoUrl: '',
  primaryColor: '#0d9488',
  secondaryColor: '#199a45',
  footerText: '© Africa Tourism Gate',
  welcomeSubject: '',
  bookingSubject: '',
};

type EmailBrandingFormProps = {
  canWrite: boolean;
};

function settingValue(
  settings: OrganizationSetting[],
  group: string,
  key: string,
): Record<string, unknown> | undefined {
  return settings.find(
    (s) => s.settingGroup === group && s.settingKey === key,
  )?.settingValue;
}

function toFormValues(settings: OrganizationSetting[]): EmailBrandingFormValues {
  const email = settingValue(settings, 'email', 'email_branding') as
    | EmailBrandingValue
    | undefined;
  const platform = settingValue(settings, 'branding', 'platform') as
    | BrandingPlatformValue
    | undefined;

  return {
    displayName: email?.displayName?.trim() || platform?.displayName || defaultValues.displayName,
    logoUrl: email?.logoUrl || platform?.logoUrl || '',
    primaryColor:
      email?.primaryColor || platform?.primaryColor || defaultValues.primaryColor,
    secondaryColor:
      email?.secondaryColor || platform?.secondaryColor || defaultValues.secondaryColor,
    footerText: email?.footerText ?? '',
    welcomeSubject: email?.welcomeSubject ?? '',
    bookingSubject: email?.bookingSubject ?? '',
  };
}

function toBrandingPayload(values: EmailBrandingFormValues): EmailBrandingValue {
  const payload: EmailBrandingValue = {
    displayName: values.displayName.trim(),
  };
  const logoUrl = values.logoUrl.trim();
  const primaryColor = values.primaryColor.trim();
  const secondaryColor = values.secondaryColor.trim();
  const footerText = values.footerText.trim();
  const welcomeSubject = values.welcomeSubject.trim();
  const bookingSubject = values.bookingSubject.trim();
  if (logoUrl) payload.logoUrl = logoUrl;
  if (primaryColor) payload.primaryColor = primaryColor;
  if (secondaryColor) payload.secondaryColor = secondaryColor;
  if (footerText) payload.footerText = footerText;
  if (welcomeSubject) payload.welcomeSubject = welcomeSubject;
  if (bookingSubject) payload.bookingSubject = bookingSubject;
  return payload;
}

export function EmailBrandingForm({ canWrite }: EmailBrandingFormProps) {
  const [values, setValues] = useState<EmailBrandingFormValues>(defaultValues);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof EmailBrandingFormValues, string>>
  >({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<'welcome' | 'booking'>(
    'welcome',
  );
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSubject, setPreviewSubject] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');

  const updateField = useCallback(
    <K extends keyof EmailBrandingFormValues>(
      key: K,
      value: EmailBrandingFormValues[K],
    ) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
      setSuccessMessage(null);
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    async function load() {
      try {
        const settingsPage = await getApiClient().listOrganizationSettings({
          organizationId: PLATFORM_ORG_ID,
          page: 1,
          limit: 100,
        });
        if (!cancelled) {
          setValues(toFormValues(settingsPage.data));
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
  }, []);

  function validate(): boolean {
    const errors: Partial<Record<keyof EmailBrandingFormValues, string>> = {};
    if (!values.displayName.trim()) {
      errors.displayName = 'Le nom affiché est obligatoire.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    if (!canWrite) return;
    if (!validate()) return;

    setSubmitting(true);
    try {
      await getApiClient().bulkUpsertOrganizationSettings({
        organizationId: PLATFORM_ORG_ID,
        settings: [
          {
            settingGroup: 'email',
            settingKey: 'email_branding',
            settingValue: { ...toBrandingPayload(values) },
          },
        ],
      });
      setSuccessMessage('Paramètres e-mail enregistrés.');
    } catch (error) {
      setFormError(getOrganizationSettingsErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePreview() {
    setFormError(null);
    setSuccessMessage(null);
    if (!validate()) return;

    setPreviewing(true);
    try {
      const result = await getApiClient().previewEmail({
        template: previewTemplate,
        branding: toBrandingPayload(values),
      });
      setPreviewSubject(result.subject);
      setPreviewHtml(result.html);
      setPreviewOpen(true);
    } catch (error) {
      setFormError(getOrganizationSettingsErrorMessage(error));
    } finally {
      setPreviewing(false);
    }
  }

  async function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
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
      setUploadingLogo(true);
      const body = new FormData();
      body.append('file', file);
      const response = await fetch(
        `${resolveApiBaseUrl()}/organization-settings/upload-branding`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${session.accessToken}` },
          body,
        },
      );
      if (!response.ok) {
        throw new Error('Upload branding failed');
      }
      const payload = (await response.json()) as { url?: string };
      if (!payload.url) {
        throw new Error('Invalid upload response');
      }
      updateField('logoUrl', payload.url);
    } catch {
      setFormError('Échec de l’upload du logo. Réessayez.');
    } finally {
      setUploadingLogo(false);
      event.target.value = '';
    }
  }

  const logoPreviewUrl = normalizeBrandingAssetUrl(values.logoUrl.trim() || null);

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
    <>
      <form onSubmit={(e) => void handleSubmit(e)} className="max-w-2xl space-y-6">
        {formError ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {formError}
          </p>
        ) : null}
        {successMessage ? (
          <p role="status" className="text-sm text-primary">
            {successMessage}
          </p>
        ) : null}

        <section className="space-y-4">
          <Input
            label="Nom affiché"
            value={values.displayName}
            onChange={(e) => updateField('displayName', e.target.value)}
            error={fieldErrors.displayName}
            disabled={!canWrite}
          />

          <Input
            label="URL du logo"
            value={values.logoUrl}
            onChange={(e) => updateField('logoUrl', e.target.value)}
            placeholder="https://..."
            disabled={!canWrite}
          />
          {canWrite ? (
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center rounded-md border border-atg-border px-3 py-2 text-xs font-medium text-atg-fg hover:bg-atg-muted/10">
                {uploadingLogo ? 'Upload en cours…' : 'Choisir un logo local'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => void handleLogoUpload(e)}
                  disabled={uploadingLogo}
                />
              </label>
              <span className="text-xs text-atg-muted">PNG/JPG/SVG/WebP, max 2 MB</span>
            </div>
          ) : null}
          {logoPreviewUrl ? (
            <div className="flex items-center gap-3 rounded-lg border border-atg-border bg-atg-elevated p-3">
              <Image
                src={logoPreviewUrl}
                alt=""
                width={48}
                height={48}
                unoptimized
                className="h-12 w-12 rounded-full object-cover"
              />
              <span className="text-xs text-atg-muted">Aperçu du logo</span>
            </div>
          ) : null}

          <BrandColorPaletteField
            label="Couleur primaire"
            hint="Couleur dominante des e-mails (en-têtes, boutons)."
            value={values.primaryColor}
            onChange={(hex) => updateField('primaryColor', hex)}
          />

          <BrandColorPaletteField
            label="Couleur secondaire"
            hint="Couleur d’accompagnement (optionnel)."
            value={values.secondaryColor}
            onChange={(hex) => updateField('secondaryColor', hex)}
          />

          <Input
            label="Texte de pied de page"
            value={values.footerText}
            onChange={(e) => updateField('footerText', e.target.value)}
            placeholder="© Africa Tourism Gate — Tous droits réservés"
            disabled={!canWrite}
          />

          <Input
            label="Sujet — e-mail de bienvenue"
            value={values.welcomeSubject}
            onChange={(e) => updateField('welcomeSubject', e.target.value)}
            placeholder="Bienvenue chez {displayName}"
            hint="Variables : {displayName}"
            disabled={!canWrite}
          />

          <Input
            label="Sujet — confirmation de réservation"
            value={values.bookingSubject}
            onChange={(e) => updateField('bookingSubject', e.target.value)}
            placeholder="Confirmation de réservation — {ref}"
            hint="Variables : {ref}, {displayName}"
            disabled={!canWrite}
          />
        </section>

        <section className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <label
              htmlFor="preview-template"
              className="mb-1 block text-sm font-medium text-atg-fg"
            >
              Modèle à prévisualiser
            </label>
            <select
              id="preview-template"
              value={previewTemplate}
              onChange={(e) =>
                setPreviewTemplate(e.target.value as 'welcome' | 'booking')
              }
              className="w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm text-atg-fg"
            >
              <option value="welcome">Bienvenue (création de compte)</option>
              <option value="booking">Confirmation de réservation</option>
            </select>
          </div>
          <Button
            type="button"
            variant="secondary"
            loading={previewing}
            loadingText="Prévisualisation…"
            onClick={() => void handlePreview()}
          >
            Prévisualiser
          </Button>
          <Button
            type="submit"
            loading={submitting}
            loadingText="Enregistrement…"
            disabled={!canWrite}
          >
            Enregistrer
          </Button>
        </section>

        {!canWrite ? (
          <p className="text-xs text-atg-muted">
            Vous pouvez consulter ces paramètres mais pas les modifier (permission
            organization_settings.write requise).
          </p>
        ) : null}
      </form>

      {previewOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Fermer la prévisualisation"
            onClick={() => setPreviewOpen(false)}
          />
          <div
            className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-atg-border bg-atg-surface shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="email-preview-title"
          >
            <div className="flex items-center justify-between border-b border-atg-border px-4 py-3">
              <div>
                <h2 id="email-preview-title" className="text-lg font-semibold text-atg-fg">
                  Prévisualisation
                </h2>
                <p className="mt-1 text-sm text-atg-muted">
                  Sujet : <span className="font-medium text-atg-fg">{previewSubject}</span>
                </p>
              </div>
              <Button type="button" variant="secondary" onClick={() => setPreviewOpen(false)}>
                Fermer
              </Button>
            </div>
            <iframe
              title="Aperçu e-mail"
              srcDoc={previewHtml}
              className="min-h-[480px] w-full flex-1 border-0 bg-white"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
