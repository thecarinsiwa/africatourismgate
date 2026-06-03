'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { locales, type AppLocale } from '../i18n/routing';
import { setLocaleCookie } from '../lib/i18n/set-locale-cookie';

const LOCALE_LABELS: Record<AppLocale, 'fr' | 'en'> = {
  fr: 'fr',
  en: 'en',
};

export function LanguageSwitcher() {
  const locale = useLocale() as AppLocale;
  const t = useTranslations('language');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const options = useMemo(
    () =>
      locales.map((code) => ({
        code,
        label: LOCALE_LABELS[code].toUpperCase(),
        name: t(code),
      })),
    [t],
  );

  const current = options.find((o) => o.code === locale) ?? options[0];

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      const target = e.target as Node | null;
      if (!target) return;
      if (!containerRef.current?.contains(target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, []);

  function selectLocale(next: AppLocale) {
    if (next === locale) {
      setOpen(false);
      return;
    }
    setLocaleCookie(next);
    document.documentElement.lang = next;
    setOpen(false);
    router.refresh();
  }

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      <span className="sr-only">{t('select')}</span>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 rounded-md border border-atg-border bg-atg-surface px-2 py-1.5 text-xs font-semibold text-atg-fg transition-colors hover:bg-atg-elevated focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('select')}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span>{current.label}</span>
        <svg className="h-3.5 w-3.5 text-atg-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open ? (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-lg border border-atg-border bg-atg-elevated shadow-xl"
          role="menu"
          aria-label={t('select')}
        >
          {options.map((option) => {
            const selected = option.code === locale;
            return (
              <button
                key={option.code}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold transition-colors ${
                  selected
                    ? 'bg-atg-surface text-atg-fg'
                    : 'text-atg-muted hover:bg-atg-surface hover:text-atg-fg'
                }`}
                onClick={() => selectLocale(option.code)}
              >
                <span className="flex items-center gap-2">
                  <span className="inline-flex min-w-7 justify-center rounded bg-black/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wide dark:bg-white/10">
                    {option.label}
                  </span>
                  <span>{option.name}</span>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
