'use client';

import { useLocale as useNextIntlLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  applyLocaleToDocument,
  persistPreferredLanguage,
  resolveInitialLocale,
} from './preferred-language';
import { translations, type Translations } from './translations';
import { DEFAULT_LOCALE, type Locale } from './types';

type SetLocaleOptions = {
  /** When false, only updates UI/storage (e.g. profile form already PATCHed the API). */
  persist?: boolean;
};

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale, options?: SetLocaleOptions) => void;
  t: Translations;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const nextLocale = useNextIntlLocale() as Locale;
  const [locale, setLocaleState] = useState<Locale>(nextLocale ?? DEFAULT_LOCALE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = resolveInitialLocale();
    setLocaleState(initial);
    if (initial !== nextLocale) {
      applyLocaleToDocument(initial);
      router.refresh();
    }
    setMounted(true);
  }, [nextLocale, router]);

  useEffect(() => {
    if (!mounted) return;
    setLocaleState(nextLocale);
    document.documentElement.lang = nextLocale;
  }, [nextLocale, mounted]);

  const setLocale = useCallback(
    (next: Locale, options?: SetLocaleOptions) => {
      applyLocaleToDocument(next);
      setLocaleState(next);
      if (options?.persist !== false) {
        void persistPreferredLanguage(next);
      }
      router.refresh();
    },
    [router],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: translations[locale],
    }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return ctx;
}

/** Current UI locale code (`fr` | `en` | `es`). */
export function useAppLocale(): Locale {
  return useLocale().locale;
}

/** Legacy translations for pages not yet on next-intl message files. */
export function useLegacyTranslations() {
  return useLocale().t;
}

/** @deprecated Prefer next-intl `useTranslations` for nav/auth; this serves legacy page copy. */
export function useTranslations() {
  return useLegacyTranslations();
}
