import type { Locale } from '../types';
import type { Translations } from '../schema';
import { fr } from '../locales/fr';
import { en } from '../locales/en';
import { es } from '../locales/es';

type CommonSection = Pick<Translations, 'meta' | 'nav' | 'theme' | 'language'>;

export const commonTranslations: Record<Locale, CommonSection> = {
  fr: { meta: fr.meta, nav: fr.nav, theme: fr.theme, language: fr.language },
  en: { meta: en.meta, nav: en.nav, theme: en.theme, language: en.language },
  es: { meta: es.meta, nav: es.nav, theme: es.theme, language: es.language },
};
