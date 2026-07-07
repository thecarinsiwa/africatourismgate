'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { LOCALE_COOKIE, locales, type AppLocale } from '@/i18n/routing';

export function LanguageSwitcher() {
  const locale = useLocale() as AppLocale;
  const t = useTranslations('language');
  const router = useRouter();

  function onChange(next: AppLocale) {
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;samesite=lax`;
    router.refresh();
  }

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="sr-only">{t('label')}</span>
      <select
        value={locale}
        onChange={(e) => onChange(e.target.value as AppLocale)}
        className="rounded-md border border-atg-border bg-atg-elevated px-2 py-1 text-xs font-medium text-atg-fg"
        aria-label={t('label')}
      >
        {locales.map((code) => (
          <option key={code} value={code}>
            {t(code)}
          </option>
        ))}
      </select>
    </label>
  );
}
