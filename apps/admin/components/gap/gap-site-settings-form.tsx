'use client';

import {
  Button,
  Card,
  Input,
  Switch,
  Textarea,
  useToast,
} from '@africatourismgate/ui';
import type {
  CreateGapSiteSettingsRequest,
  GapSiteLink,
  GapSiteSettings,
  GapStatus,
} from '@africatourismgate/types';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { isValidMediaUrl } from '../../lib/about/form-utils';
import { getApiClient, resolveApiBaseUrl } from '../../lib/auth/api';
import { getSession } from '../../lib/auth/session';
import { useGapPermissions } from '../../lib/gap/use-gap-permissions';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { resolveMediaUrl } from '../../lib/resolve-media-url';
import { GapSiteSettingsPreview } from './gap-site-settings-preview';

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

function serializeValues(values: SiteSettingsFormValues): string {
  return JSON.stringify({
    title: values.title,
    subtitle: values.subtitle,
    heroImageUrl: values.heroImageUrl,
    heroImageAlt: values.heroImageAlt,
    links: values.links,
    status: values.status,
  });
}

type GapSiteSettingsFormProps = {
  locale: string;
  onDirtyChange?: (dirty: boolean) => void;
  onSaved?: () => void;
};

export function GapSiteSettingsForm({
  locale,
  onDirtyChange,
  onSaved,
}: GapSiteSettingsFormProps) {
  const { gap: getGapErrorMessage } = useAdminErrorMessages();
  const { toast } = useToast();
  const { canWrite } = useGapPermissions();
  const t = useTranslations('modules.gap.siteSettings');
  const tStatus = useTranslations('modules.about.status');
  const tCommon = useTranslations('modules.common');
  const tCommonForm = useTranslations('modules.common.form');
  const tValidation = useTranslations('modules.common.validation');
  const tToast = useTranslations('modules.common.toast');

  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [values, setValues] = useState<SiteSettingsFormValues>(emptyValues);
  const [baseline, setBaseline] = useState(() => serializeValues(emptyValues));
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
  const publishedId = useId();
  const skipDirtyNotify = useRef(false);

  const isDirty = useMemo(() => serializeValues(values) !== baseline, [baseline, values]);

  useEffect(() => {
    if (skipDirtyNotify.current) {
      skipDirtyNotify.current = false;
      return;
    }
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const applyLoadedValues = useCallback((next: SiteSettingsFormValues, id: string | null) => {
    skipDirtyNotify.current = true;
    setSettingsId(id);
    setValues(next);
    setBaseline(serializeValues(next));
    onDirtyChange?.(false);
  }, [onDirtyChange]);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    setFieldErrors({});
    try {
      const result = await getApiClient().listGapSiteSettings({ locale, limit: 1 });
      const settings = result.data[0] as GapSiteSettings | undefined;
      if (settings) {
        applyLoadedValues(
          {
            title: settings.title,
            subtitle: settings.subtitle,
            heroImageUrl: settings.heroImageUrl,
            heroImageAlt: settings.heroImageAlt,
            links: resolveSettingsLinks(settings),
            status: settings.status,
          },
          settings.id,
        );
      } else {
        applyLoadedValues(emptyValues, null);
      }
    } catch (err) {
      setError(getGapErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [applyLoadedValues, getGapErrorMessage, locale]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const updateField = useCallback(
    <K extends keyof SiteSettingsFormValues>(key: K, value: SiteSettingsFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      if (key === 'title' || key === 'subtitle' || key === 'heroImageUrl' || key === 'heroImageAlt') {
        setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
      }
    },
    [],
  );

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

  const handleReset = useCallback(() => {
    const parsed = JSON.parse(baseline) as SiteSettingsFormValues;
    skipDirtyNotify.current = true;
    setValues(parsed);
    setFieldErrors({});
    setError(null);
    onDirtyChange?.(false);
  }, [baseline, onDirtyChange]);

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
      let nextId = settingsId;
      if (nextId) {
        await client.updateGapSiteSettings(nextId, payload);
      } else {
        const created = await client.createGapSiteSettings(payload);
        nextId = created.id;
      }
      const saved: SiteSettingsFormValues = {
        title: payload.title,
        subtitle: payload.subtitle,
        heroImageUrl: payload.heroImageUrl,
        heroImageAlt: payload.heroImageAlt,
        links: normalizedLinks.map((link) => ({
          label: link.label,
          url: link.url ?? '',
        })),
        status: values.status,
      };
      applyLoadedValues(saved, nextId);
      toast({ variant: 'success', message: tToast('saved') });
      onSaved?.();
    } catch (err) {
      const message = getGapErrorMessage(err);
      setError(message);
      toast({ variant: 'error', message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-atg-muted">{tCommon('loading')}</p>;
  }

  const busy = saving || uploadingHero;
  const canAddLink = values.links.length < MAX_SITE_LINKS;
  const isPublished = values.status === 'published';

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
        >
          {error}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:items-start">
        <div className="min-w-0 space-y-6">
          <Card variant="dashboard" padding="md" className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-atg-muted">
                  {t('sections.content')}
                </h2>
                <p className="mt-1 text-xs text-atg-muted">{t('sections.contentHint')}</p>
              </div>
              <div className="flex items-center gap-3">
                <label htmlFor={publishedId} className="text-sm font-medium text-atg-fg">
                  {isPublished ? tStatus('published') : tStatus('draft')}
                </label>
                <Switch
                  id={publishedId}
                  name="published"
                  checked={isPublished}
                  onChange={(e) =>
                    updateField('status', (e.target.checked ? 'published' : 'draft') as GapStatus)
                  }
                  disabled={!canWrite}
                  aria-label={t('fields.publishedToggle')}
                />
              </div>
            </div>

            <div>
              <label htmlFor={titleId} className="mb-1 block text-sm font-medium">
                {t('fields.title')}
              </label>
              <Input
                id={titleId}
                value={values.title}
                onChange={(e) => updateField('title', e.target.value)}
                disabled={!canWrite}
                required
                error={fieldErrors.title}
              />
            </div>

            <Textarea
              id={subtitleId}
              label={t('fields.subtitle')}
              rows={3}
              value={values.subtitle}
              onChange={(e) => updateField('subtitle', e.target.value)}
              disabled={!canWrite}
              required
              error={fieldErrors.subtitle}
            />
          </Card>

          <Card variant="dashboard" padding="md" className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-atg-muted">
                {t('sections.hero')}
              </h2>
              <p className="mt-1 text-xs text-atg-muted">{t('sections.heroHint')}</p>
            </div>

            {values.heroImageUrl.trim() ? (
              <div className="space-y-2">
                <Image
                  src={resolveMediaUrl(values.heroImageUrl.trim())}
                  alt={values.heroImageAlt.trim() || t('fields.heroPreviewAlt')}
                  width={960}
                  height={540}
                  unoptimized
                  className="aspect-[16/9] h-auto w-full max-w-2xl rounded-lg border border-atg-border object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                {canWrite ? (
                  <button
                    type="button"
                    onClick={() => updateField('heroImageUrl', '')}
                    className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                  >
                    {t('fields.removeHero')}
                  </button>
                ) : null}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-atg-border bg-atg-surface/40 px-3 py-6 text-center text-sm text-atg-muted">
                {t('fields.heroEmpty')}
              </p>
            )}

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
                    className="sr-only"
                    onChange={(e) => void handleHeroPick(e)}
                    disabled={busy}
                  />
                </label>
                <span className="text-xs text-atg-muted">{t('fields.heroUploadHint')}</span>
              </div>
            ) : null}

            <Input
              id={heroImageUrlId}
              label={t('fields.heroImageUrl')}
              type="url"
              value={values.heroImageUrl}
              onChange={(e) => updateField('heroImageUrl', e.target.value)}
              placeholder={tCommonForm('urlPlaceholder')}
              disabled={!canWrite || uploadingHero}
              required
              error={fieldErrors.heroImageUrl}
              hint={t('fields.heroPriorityHint')}
            />

            <Input
              id={heroImageAltId}
              label={t('fields.heroImageAlt')}
              value={values.heroImageAlt}
              onChange={(e) => updateField('heroImageAlt', e.target.value)}
              disabled={!canWrite}
              required
              error={fieldErrors.heroImageAlt}
              hint={t('fields.heroAltHint')}
            />
          </Card>

          <Card variant="dashboard" padding="md" className="space-y-4">
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-atg-muted">
                  {t('fields.links')}
                </h2>
                <p className="mt-1 text-xs text-atg-muted">{t('fields.linksHint')}</p>
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
          </Card>
        </div>

        <aside className="min-w-0 space-y-3 lg:sticky lg:top-6 lg:self-start">
          <p className="text-xs font-semibold uppercase tracking-wide text-atg-muted">
            {t('sections.preview')}
          </p>
          <GapSiteSettingsPreview
            title={values.title}
            subtitle={values.subtitle}
            heroImageUrl={values.heroImageUrl}
            heroImageAlt={values.heroImageAlt}
            status={values.status}
          />
          <p className="text-xs leading-relaxed text-atg-muted">{t('sections.previewHint')}</p>
        </aside>
      </div>

      {canWrite ? (
        <div className="sticky bottom-0 z-20 -mx-1 flex flex-wrap items-center gap-3 border-t border-atg-border bg-atg-bg/95 px-1 py-3 backdrop-blur">
          <Button type="submit" loading={saving} loadingText={t('saving')} disabled={busy}>
            {t('saveButton')}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!isDirty || busy}
            onClick={handleReset}
          >
            {t('cancelButton')}
          </Button>
          {isDirty ? (
            <span className="text-xs text-atg-muted">{t('dirty')}</span>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
