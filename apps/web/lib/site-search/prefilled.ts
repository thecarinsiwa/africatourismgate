/** Sous-titre par défaut pour les résultats pré-remplis (remplacé par i18n en t12). */
export const SITE_SEARCH_PREFILLED_HINT = 'Recherche pré-remplie';

export function formatSiteSearchPrefilledSubtitle(
  detail: string,
  hint: string = SITE_SEARCH_PREFILLED_HINT,
): string {
  const trimmed = detail.trim();
  return trimmed ? `${trimmed} · ${hint}` : hint;
}
