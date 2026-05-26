'use client';

import { LOCALES } from '../lib/i18n/types';
import { useLocale } from '../lib/i18n/locale-provider';

type LanguageSwitcherProps = {
  variant?: 'topbar' | 'navbar';
};

export function LanguageSwitcher({ variant = 'topbar' }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useLocale();

  const baseClass =
    variant === 'topbar'
      ? 'rounded-md border border-white/20 bg-white/5 px-2 py-1 text-xs font-semibold text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
      : 'rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs font-semibold text-gray-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-atg-border dark:bg-atg-surface dark:text-white/75';

  return (
    <label className="inline-flex items-center gap-1.5">
      <span className="sr-only">{t.language.select}</span>
      <svg
        className={`h-3.5 w-3.5 shrink-0 ${variant === 'topbar' ? 'text-white/70' : 'text-gray-400 dark:text-atg-muted'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
        />
      </svg>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as typeof locale)}
        className={baseClass}
        aria-label={t.language.select}
      >
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}
