export type Locale = 'fr' | 'en' | 'es';

export const LOCALES: { code: Locale; label: string; name: string }[] = [
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'es', label: 'ES', name: 'Español' },
];

export const DEFAULT_LOCALE: Locale = 'fr';

export const LOCALE_STORAGE_KEY = 'atg-locale';

export function isLocale(value: string): value is Locale {
  return value === 'fr' || value === 'en' || value === 'es';
}
