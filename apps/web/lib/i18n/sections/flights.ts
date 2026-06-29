import type { Locale } from '../types';
import type { Translations } from '../schema';
import { fr } from '../locales/fr';
import { en } from '../locales/en';
import { es } from '../locales/es';

type FlightsSection = Pick<Translations, 'flights'>;

export const flightsTranslations: Record<Locale, FlightsSection> = {
  fr: { flights: fr.flights },
  en: { flights: en.flights },
  es: { flights: es.flights },
};
