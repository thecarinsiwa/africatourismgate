import type { Locale } from '../types';
import type { Translations } from '../schema';
import { fr } from '../locales/fr';
import { en } from '../locales/en';
import { es } from '../locales/es';

type SearchSection = Pick<Translations, 'search'>;

export const searchTranslations: Record<Locale, SearchSection> = {
  fr: { search: fr.search },
  en: { search: en.search },
  es: { search: es.search },
};
