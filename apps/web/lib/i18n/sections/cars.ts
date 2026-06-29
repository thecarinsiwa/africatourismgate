import type { Locale } from '../types';
import type { Translations } from '../schema';
import { fr } from '../locales/fr';
import { en } from '../locales/en';
import { es } from '../locales/es';

type CarsSection = Pick<Translations, 'cars'>;

export const carsTranslations: Record<Locale, CarsSection> = {
  fr: { cars: fr.cars },
  en: { cars: en.cars },
  es: { cars: es.cars },
};
