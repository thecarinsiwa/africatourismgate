import type { Locale } from '../types';
import type { Translations } from '../schema';
import { fr } from '../locales/fr';
import { en } from '../locales/en';
import { es } from '../locales/es';

type HotelsSection = Pick<Translations, 'hotels'>;

export const hotelsTranslations: Record<Locale, HotelsSection> = {
  fr: { hotels: fr.hotels },
  en: { hotels: en.hotels },
  es: { hotels: es.hotels },
};
