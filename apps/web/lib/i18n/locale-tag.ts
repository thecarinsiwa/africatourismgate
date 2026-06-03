import type { Locale } from './types';

/** BCP 47 tag for date/number formatting. */
export function localeToBcp47(locale: Locale): string {
  if (locale === 'en') return 'en-US';
  if (locale === 'es') return 'es-ES';
  return 'fr-FR';
}
