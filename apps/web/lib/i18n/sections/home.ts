import type { Locale } from '../types';
import type { Translations } from '../schema';
import { fr } from '../locales/fr';
import { en } from '../locales/en';
import { es } from '../locales/es';

type HomeSection = Pick<
  Translations,
  'hero' | 'whyUs' | 'promo' | 'destinations' | 'customers' | 'footer'
>;

export const homeTranslations: Record<Locale, HomeSection> = {
  fr: {
    hero: fr.hero,
    whyUs: fr.whyUs,
    promo: fr.promo,
    destinations: fr.destinations,
    customers: fr.customers,
    footer: fr.footer,
  },
  en: {
    hero: en.hero,
    whyUs: en.whyUs,
    promo: en.promo,
    destinations: en.destinations,
    customers: en.customers,
    footer: en.footer,
  },
  es: {
    hero: es.hero,
    whyUs: es.whyUs,
    promo: es.promo,
    destinations: es.destinations,
    customers: es.customers,
    footer: es.footer,
  },
};
