import { defineRouting } from 'next-intl/routing';

export const locales = ['fr', 'en', 'es'] as const;
export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = 'fr';

export const LOCALE_COOKIE = 'atg-locale';

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'never',
  localeCookie: {
    name: LOCALE_COOKIE,
  },
});
