'use client';

import { Button, Card } from '@africatourismgate/ui';
import {
  DEFAULT_FOOTER_MESSAGES,
  FOOTER_FALLBACK_LOCALE,
  FOOTER_LOCALES,
  FOOTER_NEWSLETTER_DESC_MAX_LENGTH,
  FOOTER_SETTING_KEY,
  FOOTER_TAGLINE_MAX_LENGTH,
  normalizeFooter,
  type FooterLocale,
  type FooterMessage,
  type FooterSettingValue,
} from '@africatourismgate/types/organization-settings';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { useContentLocaleOptions } from '../../lib/content/use-content-locale-options';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { ContentLocaleSelect } from '../content/content-locale-select';

const SETTING_GROUP = 'site';
const SETTING_KEY = FOOTER_SETTING_KEY;

type LocaleDraft = FooterMessage;

type FooterFormValues = {
  messages: Record<FooterLocale, LocaleDraft>;
};

type FieldErrors = Partial<Record<string, string>>;

function emptyMessages(): FooterFormValues['messages'] {
  return {
    fr: { tagline: '', newsletterDesc: '' },
    en: { tagline: '', newsletterDesc: '' },
    es: { tagline: '', newsletterDesc: '' },
  };
}

function toFormValues(value: FooterSettingValue): FooterFormValues {
  const messages = emptyMessages();
  for (const locale of FOOTER_LOCALES) {
    const message = value.messages[locale];
    if (message) {
      messages[locale] = {
        tagline: message.tagline,
        newsletterDesc: message.newsletterDesc,
      };
    }
  }
  return { messages };
}

function toSettingValue(values: FooterFormValues): FooterSettingValue {
  const messages: FooterSettingValue['messages'] = {};
  for (const locale of FOOTER_LOCALES) {
    const tagline = values.messages[locale].tagline.trim();
    const newsletterDesc = values.messages[locale].newsletterDesc.trim();
    if (!tagline && !newsletterDesc) continue;
    messages[locale] = { tagline, newsletterDesc };
  }
  return { messages };
}

function localeHasContent(message: LocaleDraft): boolean {
  return Boolean(message.tagline.trim() || message.newsletterDesc.trim());
}

export function ContenuFooterTabPanel() {
  const t = useTranslations('modules.footer');
  const tCommon = useTranslations('modules.common');
  const { organizationSettings: getErrorMessage } = useAdminErrorMessages();
  const localeOptions = useContentLocaleOptions('modules.about.locale');
  const localeSelectId = useId();
  const taglineId = useId();
  const newsletterDescId = useId();

  const [access, setAccess] = useState<'loading' | 'denied' | 'read' | 'write'>('loading');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [values, setValues] = useState<FooterFormValues>(() =>
    toFormValues(normalizeFooter(null)),
  );
  const [initialValues, setInitialValues] = useState<FooterFormValues>(values);
  const [editingLocale, setEditingLocale] = useState<FooterLocale>(FOOTER_FALLBACK_LOCALE);
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
        const next = toFormValues(normalizeFooter(setting?.settingValue ?? null));
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

  function updateMessage(locale: FooterLocale, patch: Partial<LocaleDraft>) {
    setValues((prev) => ({
      ...prev,
      messages: { ...prev.messages, [locale]: { ...prev.messages[locale], ...patch } },
    }));
    setFieldErrors((prev) => ({
      ...prev,
      [`${locale}.tagline`]: undefined,
      [`${locale}.newsletterDesc`]: undefined,
      'fr.any': undefined,
    }));
    setSaved(false);
  }

  function validate(): { errors: FieldErrors; firstLocale: FooterLocale | null } {
    const errors: FieldErrors = {};
    let firstLocale: FooterLocale | null = null;
    const flag = (
      locale: FooterLocale,
      field: keyof LocaleDraft | 'any',
      message: string,
    ) => {
      errors[`${locale}.${field}`] = message;
      firstLocale ??= locale;
    };

    for (const locale of FOOTER_LOCALES) {
      const message = values.messages[locale];
      if (message.tagline.trim().length > FOOTER_TAGLINE_MAX_LENGTH) {
        flag(
          locale,
          'tagline',
          t('validation.taglineTooLong', { max: FOOTER_TAGLINE_MAX_LENGTH }),
        );
      }
      if (message.newsletterDesc.trim().length > FOOTER_NEWSLETTER_DESC_MAX_LENGTH) {
        flag(
          locale,
          'newsletterDesc',
          t('validation.newsletterDescTooLong', {
            max: FOOTER_NEWSLETTER_DESC_MAX_LENGTH,
          }),
        );
      }
    }

    const anyFilled = FOOTER_LOCALES.some((locale) =>
      localeHasContent(values.messages[locale]),
    );
    if (anyFilled && !localeHasContent(values.messages[FOOTER_FALLBACK_LOCALE])) {
      flag(FOOTER_FALLBACK_LOCALE, 'any', t('validation.frenchRequired'));
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

  function handleResetDefaults() {
    if (!canWrite) return;
    setValues({
      messages: {
        fr: { ...DEFAULT_FOOTER_MESSAGES.fr },
        en: { ...DEFAULT_FOOTER_MESSAGES.en },
        es: { ...DEFAULT_FOOTER_MESSAGES.es },
      },
    });
    setFieldErrors({});
    setSaved(false);
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
  const filledLocales = FOOTER_LOCALES.filter((locale) =>
    localeHasContent(values.messages[locale]),
  );

  return (
    <Card className="p-6">
      <div className="mb-6 space-y-1">
        <h2 className="text-lg font-semibold">{t('heading')}</h2>
        <p className="text-sm text-atg-muted">{t('description')}</p>
        <p className="text-sm text-atg-muted">
          {t.rich('contactHint', {
            parametres: (chunks) => (
              <Link href="/parametres" className="font-medium text-primary underline-offset-2 hover:underline">
                {chunks}
              </Link>
            ),
          })}
        </p>
        {!canWrite ? <p className="text-sm text-atg-muted">{t('readOnlyHint')}</p> : null}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <section className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <ContentLocaleSelect
              id={localeSelectId}
              label={t('fields.locale')}
              value={editingLocale}
              options={localeOptions}
              onChange={(locale) => setEditingLocale(locale as FooterLocale)}
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
          {fieldErrors['fr.any'] ? (
            <p className="text-sm text-destructive">{fieldErrors['fr.any']}</p>
          ) : null}

          <div>
            <label htmlFor={taglineId} className="mb-1 block text-sm font-medium">
              {t('fields.tagline')}
              {editingLocale === FOOTER_FALLBACK_LOCALE ? ' *' : ''}
            </label>
            <textarea
              id={taglineId}
              rows={3}
              value={current.tagline}
              maxLength={FOOTER_TAGLINE_MAX_LENGTH}
              onChange={(event) =>
                updateMessage(editingLocale, { tagline: event.target.value })
              }
              placeholder={t('fields.taglinePlaceholder')}
              disabled={!canWrite}
              aria-invalid={Boolean(fieldErrors[`${editingLocale}.tagline`])}
              className="w-full rounded-md border border-atg-border bg-atg-elevated px-3 py-2 text-sm text-atg-fg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
            />
            <div className="mt-1 flex justify-between gap-3 text-xs">
              <span className="text-destructive">
                {fieldErrors[`${editingLocale}.tagline`] ?? ''}
              </span>
              <span className="text-atg-muted">
                {current.tagline.length}/{FOOTER_TAGLINE_MAX_LENGTH}
              </span>
            </div>
          </div>

          <div>
            <label htmlFor={newsletterDescId} className="mb-1 block text-sm font-medium">
              {t('fields.newsletterDesc')}
            </label>
            <textarea
              id={newsletterDescId}
              rows={2}
              value={current.newsletterDesc}
              maxLength={FOOTER_NEWSLETTER_DESC_MAX_LENGTH}
              onChange={(event) =>
                updateMessage(editingLocale, { newsletterDesc: event.target.value })
              }
              placeholder={t('fields.newsletterDescPlaceholder')}
              disabled={!canWrite}
              aria-invalid={Boolean(fieldErrors[`${editingLocale}.newsletterDesc`])}
              className="w-full rounded-md border border-atg-border bg-atg-elevated px-3 py-2 text-sm text-atg-fg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
            />
            <div className="mt-1 flex justify-between gap-3 text-xs">
              <span className="text-destructive">
                {fieldErrors[`${editingLocale}.newsletterDesc`] ?? ''}
              </span>
              <span className="text-atg-muted">
                {current.newsletterDesc.length}/{FOOTER_NEWSLETTER_DESC_MAX_LENGTH}
              </span>
            </div>
          </div>
        </section>

        {saveError ? <p className="text-sm text-destructive">{saveError}</p> : null}
        {saved && !isDirty ? (
          <p className="text-sm text-green-700 dark:text-green-400" role="status">
            {t('saved')}
          </p>
        ) : null}

        {canWrite ? (
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" loading={saving} loadingText={t('saving')} disabled={saving || !isDirty}>
              {t('saveButton')}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={handleResetDefaults}
            >
              {t('resetDefaults')}
            </Button>
          </div>
        ) : null}
      </form>
    </Card>
  );
}
