'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { persistPreferredLanguage, resolveInitialLocale } from './preferred-language';
import { translations, type Translations } from './translations';
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, type Locale } from './types';

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
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocaleState(resolveInitialLocale());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = locale;
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      /* ignore */
    }
  }, [locale, mounted]);

  const setLocale = useCallback((next: Locale, options?: SetLocaleOptions) => {
    setLocaleState(next);
    if (options?.persist !== false) {
      void persistPreferredLanguage(next);
    }
  }, []);

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

export function useTranslations() {
  return useLocale().t;
}
