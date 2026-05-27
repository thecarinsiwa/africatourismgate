'use client';

import { LOCALES } from '../lib/i18n/types';
import { useLocale } from '../lib/i18n/locale-provider';
import { useEffect, useMemo, useRef, useState } from 'react';

type LanguageSwitcherProps = {
  variant?: 'topbar' | 'navbar';
};

export function LanguageSwitcher({ variant = 'topbar' }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const current = useMemo(
    () => LOCALES.find((l) => l.code === locale) ?? LOCALES[0],
    [locale],
  );

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

  const buttonClass =
    variant === 'topbar'
      ? 'inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-white/5 px-2 py-1 text-xs font-semibold text-white transition-colors hover:bg-white/10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
      : 'inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-atg-border dark:bg-atg-surface dark:text-white/75 dark:hover:bg-white/5';

  const menuClass =
    variant === 'topbar'
      ? 'absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-lg border border-white/15 bg-[#101827] shadow-xl'
      : 'absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl dark:border-atg-border dark:bg-atg-elevated';

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      <span className="sr-only">{t.language.select}</span>
      <svg
        className={`h-3.5 w-3.5 shrink-0 ${
          variant === 'topbar' ? 'text-white/70' : 'text-gray-400 dark:text-atg-muted'
        }`}
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
      <button
        type="button"
        className={buttonClass}
        onClick={() => setOpen((v) => !v)}
        aria-label={t.language.select}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span>{current.label}</span>
        <svg
          className={`h-3.5 w-3.5 ${
            variant === 'topbar' ? 'text-white/70' : 'text-gray-400 dark:text-atg-muted'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className={menuClass} role="menu" aria-label={t.language.select}>
          {LOCALES.map((l) => {
            const selected = l.code === locale;
            return (
              <button
                key={l.code}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold transition-colors ${
                  variant === 'topbar'
                    ? selected
                      ? 'bg-white/10 text-white'
                      : 'text-white/85 hover:bg-white/10'
                    : selected
                      ? 'bg-gray-50 text-gray-900 dark:bg-white/5 dark:text-white'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-white/75 dark:hover:bg-white/5'
                }`}
                onClick={() => {
                  setLocale(l.code);
                  setOpen(false);
                }}
              >
                <span className="flex items-center gap-2">
                  <span className="inline-flex min-w-7 justify-center rounded bg-black/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wide dark:bg-white/10">
                    {l.label}
                  </span>
                  <span className={variant === 'topbar' ? 'text-white/80' : 'text-gray-500 dark:text-atg-muted'}>
                    {l.name}
                  </span>
                </span>
                {selected ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
