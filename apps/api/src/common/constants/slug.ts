/** Lowercase alphanumeric segments separated by single hyphens. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const SLUG_VALIDATION_MESSAGE =
  'Le slug doit être en minuscules, sans espaces (lettres, chiffres et tirets uniquement).';
