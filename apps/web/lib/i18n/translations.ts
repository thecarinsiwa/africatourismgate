import type { Locale } from './types';
import type { Translations } from './schema';
import { commonTranslations } from './sections/common';
import { homeTranslations } from './sections/home';
import { searchTranslations } from './sections/search';
import { hotelsTranslations } from './sections/hotels';

export type { Translations } from './schema';

function buildLocaleTranslations(locale: Locale): Translations {
  return {
    ...commonTranslations[locale],
    ...homeTranslations[locale],
    ...searchTranslations[locale],
    ...hotelsTranslations[locale],
  };
}

export const translations: Record<Locale, Translations> = {
  fr: buildLocaleTranslations('fr'),
  en: buildLocaleTranslations('en'),
  es: buildLocaleTranslations('es'),
};
