'use client';

import { Button, Card, Input } from '@africatourismgate/ui';
import type {
  CreateGapSiteSettingsRequest,
  GapSiteSettings,
  GapStatus,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useState } from 'react';
import { isValidMediaUrl } from '../../lib/about/form-utils';
import { getApiClient } from '../../lib/auth/api';
import { useGapPermissions } from '../../lib/gap/use-gap-permissions';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

type SiteSettingsFormValues = {
  title: string;
  subtitle: string;
  heroImageUrl: string;
  heroImageAlt: string;
  unescoLabel: string;
  unescoUrl: string;
  donateLabel: string;
  donateUrl: string;
  status: GapStatus;
};

const emptyValues: SiteSettingsFormValues = {
  title: '',
  subtitle: '',
  heroImageUrl: '',
  heroImageAlt: '',
  unescoLabel: '',
  unescoUrl: '',
  donateLabel: '',
  donateUrl: '',
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

  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [values, setValues] = useState<SiteSettingsFormValues>(emptyValues);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof SiteSettingsFormValues, string>>>({});

  const titleId = useId();
  const subtitleId = useId();
  const heroImageUrlId = useId();
  const heroImageAltId = useId();
  const unescoLabelId = useId();
  const unescoUrlId = useId();
  const donateLabelId = useId();
  const donateUrlId = useId();
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
          donateLabel: settings.donateLabel ?? '',
          donateUrl: settings.donateUrl ?? '',
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
    const donateUrl = values.donateUrl.trim();
    if (donateUrl && !isValidMediaUrl(donateUrl)) {
      errors.donateUrl = t('validation.donateUrlInvalid');
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
      donateLabel: values.donateLabel.trim() || null,
      donateUrl: donateUrl || null,
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
    return <p className="text-sm text-muted-foreground">{tCommonForm('loading')}</p>;
  }

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

        <div>
          <label htmlFor={subtitleId} className="mb-1 block text-sm font-medium">
            {t('fields.subtitle')}
          </label>
          <textarea
            id={subtitleId}
            value={values.subtitle}
            onChange={(e) => setValues((prev) => ({ ...prev, subtitle: e.target.value }))}
            disabled={!canWrite}
            required
            rows={2}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          {fieldErrors.subtitle ? (
            <p className="mt-1 text-sm text-destructive">{fieldErrors.subtitle}</p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={heroImageUrlId} className="mb-1 block text-sm font-medium">
              {t('fields.heroImageUrl')}
            </label>
            <Input
              id={heroImageUrlId}
              type="url"
              value={values.heroImageUrl}
              onChange={(e) => setValues((prev) => ({ ...prev, heroImageUrl: e.target.value }))}
              disabled={!canWrite}
              required
              aria-invalid={Boolean(fieldErrors.heroImageUrl)}
            />
            {fieldErrors.heroImageUrl ? (
              <p className="mt-1 text-sm text-destructive">{fieldErrors.heroImageUrl}</p>
            ) : null}
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={donateLabelId} className="mb-1 block text-sm font-medium">
              {t('fields.donateLabel')}
            </label>
            <Input
              id={donateLabelId}
              value={values.donateLabel}
              onChange={(e) => setValues((prev) => ({ ...prev, donateLabel: e.target.value }))}
              disabled={!canWrite}
            />
          </div>
          <div>
            <label htmlFor={donateUrlId} className="mb-1 block text-sm font-medium">
              {t('fields.donateUrl')}
            </label>
            <Input
              id={donateUrlId}
              type="url"
              value={values.donateUrl}
              onChange={(e) => setValues((prev) => ({ ...prev, donateUrl: e.target.value }))}
              disabled={!canWrite}
              aria-invalid={Boolean(fieldErrors.donateUrl)}
            />
            {fieldErrors.donateUrl ? (
              <p className="mt-1 text-sm text-destructive">{fieldErrors.donateUrl}</p>
            ) : null}
          </div>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {canWrite ? (
          <Button type="submit" disabled={saving}>
            {saving ? t('saving') : t('saveButton')}
          </Button>
        ) : null}
      </form>
    </Card>
  );
}
