'use client';

import { Button, Card, Input, Textarea } from '@africatourismgate/ui';
import type {
  CreateGapSiteSettingsRequest,
  GapSiteSettings,
  GapStatus,
} from '@africatourismgate/types';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useState } from 'react';
import { isValidMediaUrl } from '../../lib/about/form-utils';
import { getApiClient, resolveApiBaseUrl } from '../../lib/auth/api';
import { getSession } from '../../lib/auth/session';
import { useGapPermissions } from '../../lib/gap/use-gap-permissions';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { resolveMediaUrl } from '../../lib/resolve-media-url';

const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

type SiteSettingsFormValues = {
  title: string;
  subtitle: string;
  heroImageUrl: string;
  heroImageAlt: string;
  unescoLabel: string;
  unescoUrl: string;
  status: GapStatus;
};

const emptyValues: SiteSettingsFormValues = {
  title: '',
  subtitle: '',
  heroImageUrl: '',
  heroImageAlt: '',
  unescoLabel: '',
  unescoUrl: '',
  status: 'draft',
};

type GapSiteSettingsFormProps = {
  locale: string;
};

export function GapSiteSettingsForm({ locale }: GapSiteSettingsFormProps) {
  const { gap: getGapErrorMessage } = useAdminErrorMessages();
  const { canWrite } = useGapPermissions();
  const t = useTranslations('modules.gap.siteSettings');
  const tStatus = useTranslations('modules.about.status');
  const tCommon = useTranslations('modules.common');
  const tCommonForm = useTranslations('modules.common.form');
  const tValidation = useTranslations('modules.common.validation');

  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [values, setValues] = useState<SiteSettingsFormValues>(emptyValues);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof SiteSettingsFormValues, string>>
  >({});

  const titleId = useId();
  const subtitleId = useId();
  const heroInputId = useId();
  const heroImageUrlId = useId();
  const heroImageAltId = useId();
  const unescoLabelId = useId();
  const unescoUrlId = useId();
  const statusId = useId();

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getApiClient().listGapSiteSettings({ locale, limit: 1 });
      const settings = result.data[0] as GapSiteSettings | undefined;
      if (settings) {
        setSettingsId(settings.id);
        setValues({
          title: settings.title,
          subtitle: settings.subtitle,
          heroImageUrl: settings.heroImageUrl,
          heroImageAlt: settings.heroImageAlt,
          unescoLabel: settings.unescoLabel ?? '',
          unescoUrl: settings.unescoUrl ?? '',
          status: settings.status,
        });
      } else {
        setSettingsId(null);
        setValues(emptyValues);
      }
    } catch (err) {
      setError(getGapErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [getGapErrorMessage, locale]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  async function handleHeroPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setFieldErrors((prev) => ({ ...prev, heroImageUrl: tValidation('imageFormat') }));
      event.target.value = '';
      return;
    }
    if (file.size > IMAGE_MAX_BYTES) {
      setFieldErrors((prev) => ({ ...prev, heroImageUrl: tValidation('imageTooLarge') }));
      event.target.value = '';
      return;
    }

    const session = getSession();
    if (!session?.accessToken) {
      setFieldErrors((prev) => ({
        ...prev,
        heroImageUrl: tValidation('sessionExpiredRetry'),
      }));
      event.target.value = '';
      return;
    }

    setUploadingHero(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const response = await fetch(`${resolveApiBaseUrl()}/gap-site-settings/upload-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.accessToken}` },
        body,
      });
      if (!response.ok) throw new Error('Upload failed');
      const payload = (await response.json()) as { url?: string };
      if (!payload.url) throw new Error('Invalid upload response');
      setValues((prev) => ({ ...prev, heroImageUrl: payload.url! }));
      setFieldErrors((prev) => ({ ...prev, heroImageUrl: undefined }));
    } catch {
      setFieldErrors((prev) => ({ ...prev, heroImageUrl: tValidation('uploadFailed') }));
    } finally {
      setUploadingHero(false);
      event.target.value = '';
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canWrite) return;

    const errors: Partial<Record<keyof SiteSettingsFormValues, string>> = {};
    if (!values.title.trim()) errors.title = t('validation.titleRequired');
    if (!values.subtitle.trim()) errors.subtitle = t('validation.subtitleRequired');
    if (!values.heroImageUrl.trim()) {
      errors.heroImageUrl = t('validation.heroImageUrlRequired');
    } else if (!isValidMediaUrl(values.heroImageUrl.trim())) {
      errors.heroImageUrl = t('validation.heroImageUrlInvalid');
    }
    if (!values.heroImageAlt.trim()) errors.heroImageAlt = t('validation.heroImageAltRequired');
    const unescoUrl = values.unescoUrl.trim();
    if (unescoUrl && !isValidMediaUrl(unescoUrl)) {
      errors.unescoUrl = t('validation.unescoUrlInvalid');
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    setError(null);

    const payload: CreateGapSiteSettingsRequest = {
      title: values.title.trim(),
      subtitle: values.subtitle.trim(),
      heroImageUrl: values.heroImageUrl.trim(),
      heroImageAlt: values.heroImageAlt.trim(),
      unescoLabel: values.unescoLabel.trim() || null,
      unescoUrl: unescoUrl || null,
      status: values.status,
      locale,
    };

    try {
      const client = getApiClient();
      if (settingsId) {
        await client.updateGapSiteSettings(settingsId, payload);
      } else {
        const created = await client.createGapSiteSettings(payload);
        setSettingsId(created.id);
      }
    } catch (err) {
      setError(getGapErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-atg-muted">{tCommon('loading')}</p>;
  }

  const busy = saving || uploadingHero;

  return (
    <Card className="p-6">
      <h2 className="mb-4 text-lg font-semibold">{t('heading')}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={titleId} className="mb-1 block text-sm font-medium">
              {t('fields.title')}
            </label>
            <Input
              id={titleId}
              value={values.title}
              onChange={(e) => setValues((prev) => ({ ...prev, title: e.target.value }))}
              disabled={!canWrite}
              required
              aria-invalid={Boolean(fieldErrors.title)}
            />
            {fieldErrors.title ? (
              <p className="mt-1 text-sm text-destructive">{fieldErrors.title}</p>
            ) : null}
          </div>
          <div>
            <label htmlFor={statusId} className="mb-1 block text-sm font-medium">
              {tCommon('columns.status')}
            </label>
            <select
              id={statusId}
              value={values.status}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, status: e.target.value as GapStatus }))
              }
              disabled={!canWrite}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="draft">{tStatus('draft')}</option>
              <option value="published">{tStatus('published')}</option>
            </select>
          </div>
        </div>

        <Textarea
          id={subtitleId}
          label={t('fields.subtitle')}
          rows={2}
          value={values.subtitle}
          onChange={(e) => setValues((prev) => ({ ...prev, subtitle: e.target.value }))}
          disabled={!canWrite}
          required
          error={fieldErrors.subtitle}
        />

        <div className="space-y-3">
          <p className="text-sm font-medium">{t('fields.heroImage')}</p>
          {values.heroImageUrl.trim() ? (
            <div className="space-y-2">
              <Image
                src={resolveMediaUrl(values.heroImageUrl.trim())}
                alt={values.heroImageAlt.trim() || t('fields.heroPreviewAlt')}
                width={960}
                height={540}
                unoptimized
                className="h-44 w-full max-w-xl rounded-lg border border-atg-border object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              {canWrite ? (
                <button
                  type="button"
                  onClick={() => setValues((prev) => ({ ...prev, heroImageUrl: '' }))}
                  className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                >
                  {t('fields.removeHero')}
                </button>
              ) : null}
            </div>
          ) : null}
          {canWrite ? (
            <div className="flex flex-wrap items-center gap-3">
              <label
                htmlFor={heroInputId}
                className="inline-flex cursor-pointer items-center rounded-md border border-atg-border px-3 py-2 text-xs font-medium text-atg-fg hover:bg-atg-muted/10"
              >
                {uploadingHero ? tCommonForm('uploading') : tCommonForm('chooseFile')}
                <input
                  id={heroInputId}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => void handleHeroPick(e)}
                  disabled={busy}
                />
              </label>
              <span className="text-xs text-atg-muted">{tCommonForm('imageFormatHint')}</span>
            </div>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Input
                id={heroImageUrlId}
                label={tCommonForm('externalUrlOptional')}
                type="url"
                value={values.heroImageUrl}
                onChange={(e) => {
                  setValues((prev) => ({ ...prev, heroImageUrl: e.target.value }));
                  setFieldErrors((prev) => ({ ...prev, heroImageUrl: undefined }));
                }}
                placeholder={tCommonForm('urlPlaceholder')}
                disabled={!canWrite || uploadingHero}
                required
                error={fieldErrors.heroImageUrl}
              />
            </div>
            <div>
              <label htmlFor={heroImageAltId} className="mb-1 block text-sm font-medium">
                {t('fields.heroImageAlt')}
              </label>
              <Input
                id={heroImageAltId}
                value={values.heroImageAlt}
                onChange={(e) => setValues((prev) => ({ ...prev, heroImageAlt: e.target.value }))}
                disabled={!canWrite}
                required
                aria-invalid={Boolean(fieldErrors.heroImageAlt)}
              />
              {fieldErrors.heroImageAlt ? (
                <p className="mt-1 text-sm text-destructive">{fieldErrors.heroImageAlt}</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={unescoLabelId} className="mb-1 block text-sm font-medium">
              {t('fields.unescoLabel')}
            </label>
            <Input
              id={unescoLabelId}
              value={values.unescoLabel}
              onChange={(e) => setValues((prev) => ({ ...prev, unescoLabel: e.target.value }))}
              disabled={!canWrite}
            />
          </div>
          <div>
            <label htmlFor={unescoUrlId} className="mb-1 block text-sm font-medium">
              {t('fields.unescoUrl')}
            </label>
            <Input
              id={unescoUrlId}
              type="url"
              value={values.unescoUrl}
              onChange={(e) => setValues((prev) => ({ ...prev, unescoUrl: e.target.value }))}
              disabled={!canWrite}
              aria-invalid={Boolean(fieldErrors.unescoUrl)}
            />
            {fieldErrors.unescoUrl ? (
              <p className="mt-1 text-sm text-destructive">{fieldErrors.unescoUrl}</p>
            ) : null}
          </div>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {canWrite ? (
          <Button type="submit" disabled={busy}>
            {saving ? t('saving') : t('saveButton')}
          </Button>
        ) : null}
      </form>
    </Card>
  );
}
