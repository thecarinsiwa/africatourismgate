'use client';

import { Button, Card, Checkbox, Input, Switch } from '@africatourismgate/ui';
import {
  ANNOUNCEMENT_BANNER_COLORS,
  ANNOUNCEMENT_BANNER_CTA_LABEL_MAX_LENGTH,
  ANNOUNCEMENT_BANNER_CTA_URL_MAX_LENGTH,
  ANNOUNCEMENT_BANNER_FALLBACK_LOCALE,
  ANNOUNCEMENT_BANNER_INTENSITIES,
  ANNOUNCEMENT_BANNER_LOCALES,
  ANNOUNCEMENT_BANNER_TEXT_MAX_LENGTH,
  isValidAnnouncementBannerCtaUrl,
  normalizeAnnouncementBanner,
  type AnnouncementBannerColor,
  type AnnouncementBannerIntensity,
  type AnnouncementBannerLocale,
  type AnnouncementBannerSettingValue,
} from '@africatourismgate/types/organization-settings';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { useContentLocaleOptions } from '../../lib/content/use-content-locale-options';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import {
  ANNOUNCEMENT_BANNER_SWATCH_CLASSES,
  AnnouncementBannerPreview,
} from '../content/announcement-banner-preview';
import { ContentLocaleSelect } from '../content/content-locale-select';

const SETTING_GROUP = 'site';
const SETTING_KEY = 'announcement_banner';

type LocaleDraft = { text: string; ctaLabel: string };

type BannerFormValues = {
  enabled: boolean;
  color: AnnouncementBannerColor;
  intensity: AnnouncementBannerIntensity;
  messages: Record<AnnouncementBannerLocale, LocaleDraft>;
  ctaUrl: string;
  ctaNewTab: boolean;
};

type FieldErrors = Partial<Record<string, string>>;

function emptyMessages(): BannerFormValues['messages'] {
  return { fr: { text: '', ctaLabel: '' }, en: { text: '', ctaLabel: '' }, es: { text: '', ctaLabel: '' } };
}

function toFormValues(value: AnnouncementBannerSettingValue): BannerFormValues {
  const messages = emptyMessages();
  for (const locale of ANNOUNCEMENT_BANNER_LOCALES) {
    const message = value.messages[locale];
    if (message) {
      messages[locale] = { text: message.text, ctaLabel: message.ctaLabel ?? '' };
    }
  }
  return {
    enabled: value.enabled,
    color: value.color,
    intensity: value.intensity,
    messages,
    ctaUrl: value.ctaUrl ?? '',
    ctaNewTab: value.ctaNewTab === true,
  };
}

function toSettingValue(values: BannerFormValues): AnnouncementBannerSettingValue {
  const messages: AnnouncementBannerSettingValue['messages'] = {};
  for (const locale of ANNOUNCEMENT_BANNER_LOCALES) {
    const text = values.messages[locale].text.trim();
    if (!text) continue;
    const ctaLabel = values.messages[locale].ctaLabel.trim();
    messages[locale] = ctaLabel ? { text, ctaLabel } : { text };
  }
  const ctaUrl = values.ctaUrl.trim();
  return {
    enabled: values.enabled,
    color: values.color,
    intensity: values.intensity,
    messages,
    ...(ctaUrl ? { ctaUrl, ctaNewTab: values.ctaNewTab } : {}),
  };
}

export function ContenuAnnouncementBannerTabPanel() {
  const t = useTranslations('modules.announcementBanner');
  const tCommon = useTranslations('modules.common');
  const { organizationSettings: getErrorMessage } = useAdminErrorMessages();
  const localeOptions = useContentLocaleOptions('modules.about.locale');
  const localeSelectId = useId();
  const textId = useId();
  const ctaLabelId = useId();
  const ctaUrlId = useId();

  const [access, setAccess] = useState<'loading' | 'denied' | 'read' | 'write'>('loading');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [values, setValues] = useState<BannerFormValues>(() =>
    toFormValues(normalizeAnnouncementBanner(null)),
  );
  const [initialValues, setInitialValues] = useState<BannerFormValues>(values);
  const [editingLocale, setEditingLocale] = useState<AnnouncementBannerLocale>(
    ANNOUNCEMENT_BANNER_FALLBACK_LOCALE,
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const canWrite = access === 'write';
  const isDirty = useMemo(
    () => JSON.stringify(toSettingValue(values)) !== JSON.stringify(toSettingValue(initialValues)),
    [initialValues, values],
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const client = getApiClient();
        const me = await client.getAuthMe();
        if (cancelled) return;
        const canRead =
          me.isSuperAdmin || me.permissions.includes('organization_settings.read');
        if (!canRead) {
          setAccess('denied');
          return;
        }
        setAccess(
          me.isSuperAdmin || me.permissions.includes('organization_settings.write')
            ? 'write'
            : 'read',
        );

        const page = await client.listOrganizationSettings({ page: 1, limit: 100 });
        if (cancelled) return;
        const setting = page.data.find(
          (item) => item.settingGroup === SETTING_GROUP && item.settingKey === SETTING_KEY,
        );
        const next = toFormValues(normalizeAnnouncementBanner(setting?.settingValue ?? null));
        setValues(next);
        setInitialValues(next);
      } catch (error) {
        if (!cancelled) setLoadError(getErrorMessage(error));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [getErrorMessage]);

  function update(patch: Partial<BannerFormValues>) {
    setValues((prev) => ({ ...prev, ...patch }));
    setSaved(false);
  }

  function updateMessage(locale: AnnouncementBannerLocale, patch: Partial<LocaleDraft>) {
    setValues((prev) => ({
      ...prev,
      messages: { ...prev.messages, [locale]: { ...prev.messages[locale], ...patch } },
    }));
    setFieldErrors((prev) => ({
      ...prev,
      [`${locale}.text`]: undefined,
      [`${locale}.ctaLabel`]: undefined,
    }));
    setSaved(false);
  }

  function validate(): { errors: FieldErrors; firstLocale: AnnouncementBannerLocale | null } {
    const errors: FieldErrors = {};
    let firstLocale: AnnouncementBannerLocale | null = null;
    const flag = (locale: AnnouncementBannerLocale, field: 'text' | 'ctaLabel', message: string) => {
      errors[`${locale}.${field}`] = message;
      firstLocale ??= locale;
    };

    for (const locale of ANNOUNCEMENT_BANNER_LOCALES) {
      const text = values.messages[locale].text.trim();
      const ctaLabel = values.messages[locale].ctaLabel.trim();
      if (text.length > ANNOUNCEMENT_BANNER_TEXT_MAX_LENGTH) {
        flag(locale, 'text', t('validation.textTooLong', { max: ANNOUNCEMENT_BANNER_TEXT_MAX_LENGTH }));
      }
      if (ctaLabel.length > ANNOUNCEMENT_BANNER_CTA_LABEL_MAX_LENGTH) {
        flag(
          locale,
          'ctaLabel',
          t('validation.ctaLabelTooLong', { max: ANNOUNCEMENT_BANNER_CTA_LABEL_MAX_LENGTH }),
        );
      }
      if (ctaLabel && !text) {
        flag(locale, 'text', t('validation.textRequiredForCta'));
      }
    }

    if (values.enabled && !values.messages[ANNOUNCEMENT_BANNER_FALLBACK_LOCALE].text.trim()) {
      flag(ANNOUNCEMENT_BANNER_FALLBACK_LOCALE, 'text', t('validation.frenchTextRequired'));
    }

    const ctaUrl = values.ctaUrl.trim();
    const hasAnyCtaLabel = ANNOUNCEMENT_BANNER_LOCALES.some(
      (locale) => values.messages[locale].ctaLabel.trim() !== '',
    );
    if (ctaUrl && !isValidAnnouncementBannerCtaUrl(ctaUrl)) {
      errors.ctaUrl = t('validation.ctaUrlInvalid');
    } else if (ctaUrl.length > ANNOUNCEMENT_BANNER_CTA_URL_MAX_LENGTH) {
      errors.ctaUrl = t('validation.ctaUrlTooLong', { max: ANNOUNCEMENT_BANNER_CTA_URL_MAX_LENGTH });
    } else if (!ctaUrl && hasAnyCtaLabel) {
      errors.ctaUrl = t('validation.ctaUrlRequired');
    }

    return { errors, firstLocale };
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canWrite) return;
    setSaveError(null);
    setSaved(false);

    const { errors, firstLocale } = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      if (firstLocale) setEditingLocale(firstLocale);
      return;
    }

    setSaving(true);
    try {
      const settingValue = toSettingValue(values);
      await getApiClient().bulkUpsertOrganizationSettings({
        settings: [
          {
            settingGroup: SETTING_GROUP,
            settingKey: SETTING_KEY,
            settingValue: settingValue as unknown as Record<string, unknown>,
          },
        ],
      });
      const next = toFormValues(settingValue);
      setValues(next);
      setInitialValues(next);
      setSaved(true);
    } catch (error) {
      setSaveError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  if (access === 'loading' || (loading && access !== 'denied')) {
    return <p className="text-sm text-atg-muted">{tCommon('loading')}</p>;
  }
  if (access === 'denied') {
    return <p className="text-sm text-destructive">{t('denied')}</p>;
  }
  if (loadError) {
    return <p className="text-sm text-destructive">{loadError}</p>;
  }

  const current = values.messages[editingLocale];
  const fallback = values.messages[ANNOUNCEMENT_BANNER_FALLBACK_LOCALE];
  const usesFallback = editingLocale !== ANNOUNCEMENT_BANNER_FALLBACK_LOCALE && !current.text.trim();
  const previewMessage = usesFallback ? fallback : current;
  const showPreviewCta = Boolean(values.ctaUrl.trim() && previewMessage.ctaLabel.trim());
  const filledLocales = ANNOUNCEMENT_BANNER_LOCALES.filter(
    (locale) => values.messages[locale].text.trim() !== '',
  );

  return (
    <Card className="p-6">
      <div className="mb-6 space-y-1">
        <h2 className="text-lg font-semibold">{t('heading')}</h2>
        <p className="text-sm text-atg-muted">{t('description')}</p>
        {!canWrite ? <p className="text-sm text-atg-muted">{t('readOnlyHint')}</p> : null}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <Switch
          id="announcement-banner-enabled"
          label={values.enabled ? t('fields.enabledOn') : t('fields.enabledOff')}
          checked={values.enabled}
          onChange={(event) => {
            update({ enabled: event.target.checked });
            setFieldErrors((prev) => ({ ...prev, 'fr.text': undefined }));
          }}
          disabled={!canWrite}
        />

        <section className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <ContentLocaleSelect
              id={localeSelectId}
              label={t('fields.locale')}
              value={editingLocale}
              options={localeOptions}
              onChange={(locale) => setEditingLocale(locale as AnnouncementBannerLocale)}
            />
            <p className="text-xs text-atg-muted">
              {t('fields.localesFilled', {
                list:
                  filledLocales.length > 0
                    ? filledLocales.map((locale) => locale.toUpperCase()).join(', ')
                    : '—',
              })}
            </p>
          </div>
          <p className="text-xs text-atg-muted">{t('fields.localeHint')}</p>

          <div>
            <label htmlFor={textId} className="mb-1 block text-sm font-medium">
              {t('fields.text')}
              {editingLocale === ANNOUNCEMENT_BANNER_FALLBACK_LOCALE && values.enabled ? ' *' : ''}
            </label>
            <textarea
              id={textId}
              rows={2}
              value={current.text}
              maxLength={ANNOUNCEMENT_BANNER_TEXT_MAX_LENGTH}
              onChange={(event) => updateMessage(editingLocale, { text: event.target.value })}
              placeholder={t('fields.textPlaceholder')}
              disabled={!canWrite}
              aria-invalid={Boolean(fieldErrors[`${editingLocale}.text`])}
              className="w-full rounded-md border border-atg-border bg-atg-elevated px-3 py-2 text-sm text-atg-fg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
            />
            <div className="mt-1 flex justify-between gap-3 text-xs">
              <span className="text-destructive">{fieldErrors[`${editingLocale}.text`] ?? ''}</span>
              <span className="text-atg-muted">
                {current.text.length}/{ANNOUNCEMENT_BANNER_TEXT_MAX_LENGTH}
              </span>
            </div>
          </div>

          <Input
            id={ctaLabelId}
            label={t('fields.ctaLabel')}
            value={current.ctaLabel}
            maxLength={ANNOUNCEMENT_BANNER_CTA_LABEL_MAX_LENGTH}
            onChange={(event) => updateMessage(editingLocale, { ctaLabel: event.target.value })}
            placeholder={t('fields.ctaLabelPlaceholder')}
            disabled={!canWrite}
            error={fieldErrors[`${editingLocale}.ctaLabel`]}
          />
        </section>

        <fieldset className="space-y-2" disabled={!canWrite}>
          <legend className="mb-1 text-sm font-medium">{t('fields.color')}</legend>
          <div className="flex flex-wrap gap-2">
            {ANNOUNCEMENT_BANNER_COLORS.map((color) => {
              const selected = values.color === color;
              return (
                <label
                  key={color}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary ${
                    selected
                      ? 'border-primary bg-primary/10 font-medium text-atg-fg'
                      : 'border-atg-border text-atg-muted hover:border-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="announcement-banner-color"
                    value={color}
                    checked={selected}
                    onChange={() => update({ color })}
                    className="sr-only"
                  />
                  <span
                    aria-hidden
                    className={`h-4 w-4 rounded-full ring-1 ring-black/10 ${ANNOUNCEMENT_BANNER_SWATCH_CLASSES[color]}`}
                  />
                  {t(`colors.${color}`)}
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="space-y-2" disabled={!canWrite}>
          <legend className="mb-1 text-sm font-medium">{t('fields.intensity')}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {ANNOUNCEMENT_BANNER_INTENSITIES.map((intensity) => {
              const selected = values.intensity === intensity;
              return (
                <label
                  key={intensity}
                  className={`flex cursor-pointer flex-col rounded-lg border p-3 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary ${
                    selected ? 'border-primary bg-primary/5' : 'border-atg-border hover:border-primary/50'
                  }`}
                >
                  <span className="flex items-center gap-2 font-medium text-atg-fg">
                    <input
                      type="radio"
                      name="announcement-banner-intensity"
                      value={intensity}
                      checked={selected}
                      onChange={() => update({ intensity })}
                      className="h-4 w-4 text-primary focus:ring-primary"
                    />
                    {t(`intensities.${intensity}.label`)}
                  </span>
                  <span className="mt-1 pl-6 text-xs text-atg-muted">
                    {t(`intensities.${intensity}.hint`)}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <section className="space-y-3">
          <Input
            id={ctaUrlId}
            label={t('fields.ctaUrl')}
            value={values.ctaUrl}
            maxLength={ANNOUNCEMENT_BANNER_CTA_URL_MAX_LENGTH}
            onChange={(event) => {
              update({ ctaUrl: event.target.value });
              setFieldErrors((prev) => ({ ...prev, ctaUrl: undefined }));
            }}
            placeholder={t('fields.ctaUrlPlaceholder')}
            disabled={!canWrite}
            error={fieldErrors.ctaUrl}
          />
          <p className="text-xs text-atg-muted">{t('fields.ctaHint')}</p>
          <Checkbox
            id="announcement-banner-cta-new-tab"
            label={t('fields.ctaNewTab')}
            checked={values.ctaNewTab}
            onChange={(event) => update({ ctaNewTab: event.target.checked })}
            disabled={!canWrite || !values.ctaUrl.trim()}
          />
        </section>

        <section className="space-y-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-medium">{t('preview.title')}</p>
            <p className="text-xs text-atg-muted">
              {!values.enabled
                ? t('preview.disabled')
                : usesFallback
                  ? t('preview.fallback')
                  : t('preview.locale', { locale: editingLocale.toUpperCase() })}
            </p>
          </div>
          <div className={values.enabled ? '' : 'opacity-50'}>
            <AnnouncementBannerPreview
              text={previewMessage.text}
              color={values.color}
              intensity={values.intensity}
              ctaLabel={showPreviewCta ? previewMessage.ctaLabel : undefined}
              emptyText={t('preview.empty')}
              ariaLabel={t('preview.title')}
            />
          </div>
        </section>

        {saveError ? <p className="text-sm text-destructive">{saveError}</p> : null}
        {saved && !isDirty ? (
          <p className="text-sm text-green-700 dark:text-green-400" role="status">
            {t('saved')}
          </p>
        ) : null}

        {canWrite ? (
          <Button type="submit" loading={saving} loadingText={t('saving')} disabled={saving || !isDirty}>
            {t('saveButton')}
          </Button>
        ) : null}
      </form>
    </Card>
  );
}
