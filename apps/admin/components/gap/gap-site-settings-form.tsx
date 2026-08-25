'use client';

import { Button, Card, Input, Select, Textarea } from '@africatourismgate/ui';
import type {
  CreateGapSiteSettingsRequest,
  GapSiteLink,
  GapSiteSettings,
  GapStatus,
} from '@africatourismgate/types';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { isValidMediaUrl } from '../../lib/about/form-utils';
import { getApiClient, resolveApiBaseUrl } from '../../lib/auth/api';
import { getSession } from '../../lib/auth/session';
import { useGapPermissions } from '../../lib/gap/use-gap-permissions';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { resolveMediaUrl } from '../../lib/resolve-media-url';

const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_SITE_LINKS = 10;

type SiteLinkDraft = {
  label: string;
  url: string;
};

type SiteSettingsFormValues = {
  title: string;
  subtitle: string;
  heroImageUrl: string;
  heroImageAlt: string;
  links: SiteLinkDraft[];
  status: GapStatus;
};

const emptyValues: SiteSettingsFormValues = {
  title: '',
  subtitle: '',
  heroImageUrl: '',
  heroImageAlt: '',
  links: [],
  status: 'draft',
};

function resolveSettingsLinks(settings: GapSiteSettings): SiteLinkDraft[] {
  const fromArray = Array.isArray(settings.links) ? settings.links : [];
  if (fromArray.length > 0) {
    return fromArray
      .map((item) => ({
        label: item.label?.trim() ?? '',
        url: item.url?.trim() ?? '',
      }))
      .filter((item) => item.label)
      .slice(0, MAX_SITE_LINKS);
  }
  if (settings.unescoLabel?.trim()) {
    return [
      {
        label: settings.unescoLabel.trim(),
        url: settings.unescoUrl?.trim() ?? '',
      },
    ];
  }
  return [];
}

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
    Partial<Record<'title' | 'subtitle' | 'heroImageUrl' | 'heroImageAlt' | 'links', string>>
  >({});

  const titleId = useId();
  const subtitleId = useId();
  const heroInputId = useId();
  const heroImageUrlId = useId();
  const heroImageAltId = useId();

  const statusOptions = useMemo(
    () => [
      { value: 'draft', label: tStatus('draft') },
      { value: 'published', label: tStatus('published') },
    ],
    [tStatus],
  );

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
          links: resolveSettingsLinks(settings),
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

  const updateLink = useCallback((index: number, patch: Partial<SiteLinkDraft>) => {
    setValues((prev) => ({
      ...prev,
      links: prev.links.map((link, i) => (i === index ? { ...link, ...patch } : link)),
    }));
    setFieldErrors((prev) => ({ ...prev, links: undefined }));
  }, []);

  const addLink = useCallback(() => {
    setValues((prev) => {
      if (prev.links.length >= MAX_SITE_LINKS) return prev;
      return { ...prev, links: [...prev.links, { label: '', url: '' }] };
    });
    setFieldErrors((prev) => ({ ...prev, links: undefined }));
  }, []);

  const removeLink = useCallback((index: number) => {
    setValues((prev) => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }));
  }, []);

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

    const errors: Partial<
      Record<'title' | 'subtitle' | 'heroImageUrl' | 'heroImageAlt' | 'links', string>
    > = {};
    if (!values.title.trim()) errors.title = t('validation.titleRequired');
    if (!values.subtitle.trim()) errors.subtitle = t('validation.subtitleRequired');
    if (!values.heroImageUrl.trim()) {
      errors.heroImageUrl = t('validation.heroImageUrlRequired');
    } else if (!isValidMediaUrl(values.heroImageUrl.trim())) {
      errors.heroImageUrl = t('validation.heroImageUrlInvalid');
    }
    if (!values.heroImageAlt.trim()) errors.heroImageAlt = t('validation.heroImageAltRequired');

    const normalizedLinks: GapSiteLink[] = [];
    for (const link of values.links) {
      const label = link.label.trim();
      const url = link.url.trim();
      if (!label && !url) continue;
      if (!label) {
        errors.links = t('validation.linkLabelRequired');
        break;
      }
      if (url && !isValidMediaUrl(url)) {
        errors.links = t('validation.linkUrlInvalid');
        break;
      }
      normalizedLinks.push({ label, url: url || null });
    }
    if (normalizedLinks.length > MAX_SITE_LINKS) {
      errors.links = t('validation.maxLinks');
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
      links: normalizedLinks,
      unescoLabel: normalizedLinks[0]?.label ?? null,
      unescoUrl: normalizedLinks[0]?.url ?? null,
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
      setValues((prev) => ({
        ...prev,
        links: normalizedLinks.map((link) => ({
          label: link.label,
          url: link.url ?? '',
        })),
      }));
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
  const canAddLink = values.links.length < MAX_SITE_LINKS;

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
          <Select
            label={tCommon('columns.status')}
            value={values.status}
            options={statusOptions}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, status: e.target.value as GapStatus }))
            }
            disabled={!canWrite}
          />
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

        <div className="space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <p className="text-sm font-medium">{t('fields.links')}</p>
              <p className="mt-0.5 text-xs text-atg-muted">{t('fields.linksHint')}</p>
            </div>
            <p className="text-xs text-atg-muted">
              {t('fields.linksCount', {
                count: values.links.length,
                max: MAX_SITE_LINKS,
              })}
            </p>
          </div>

          {values.links.length > 0 ? (
            <ul className="space-y-3">
              {values.links.map((link, index) => (
                <li
                  key={`link-${index}`}
                  className="grid gap-3 rounded-lg border border-atg-border p-3 sm:grid-cols-[1fr_1fr_auto]"
                >
                  <Input
                    label={t('fields.linkLabel')}
                    value={link.label}
                    onChange={(e) => updateLink(index, { label: e.target.value })}
                    placeholder={t('fields.linkLabelPlaceholder')}
                    disabled={!canWrite}
                  />
                  <Input
                    label={t('fields.linkUrl')}
                    type="url"
                    value={link.url}
                    onChange={(e) => updateLink(index, { url: e.target.value })}
                    placeholder={tCommonForm('urlPlaceholder')}
                    disabled={!canWrite}
                  />
                  {canWrite ? (
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeLink(index)}
                        className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                      >
                        {t('fields.removeLink')}
                      </button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-atg-muted">{t('fields.linksEmpty')}</p>
          )}

          {canWrite && canAddLink ? (
            <Button type="button" variant="outline" onClick={addLink} disabled={busy}>
              {t('fields.addLink')}
            </Button>
          ) : null}

          {fieldErrors.links ? (
            <p className="text-sm text-destructive">{fieldErrors.links}</p>
          ) : null}
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
