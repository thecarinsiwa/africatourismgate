/** Lowercase alphanumeric segments separated by single hyphens. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const SLUG_VALIDATION_MESSAGE =
  'Le slug doit être en minuscules, sans espaces (lettres, chiffres et tirets uniquement).';

/** URL-safe slug from free text (accents stripped); may return an empty string. */
export function slugify(value: string, maxLength = 180): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, maxLength)
    .replace(/^-+|-+$/g, '');
}
