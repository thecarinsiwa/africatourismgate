/** Matching nav / aliases pour la source locale `pages` (sans deps UI). */

export type SiteSearchNavMatchItem = {
  href: string;
  label: string;
};

/** Aliases de recherche indexés par href canonique. */
export const SITE_SEARCH_PAGE_ALIASES: Readonly<
  Record<string, readonly string[]>
> = {
  '/support': [
    'aide',
    'help',
    'ayuda',
    'docs',
    'documentation',
    'faq',
    'support',
  ],
  '/donate': ['don', 'donation', 'donate', 'donacion'],
  '/partners': [
    'partenaires',
    'partners',
    'socios',
    'operateurs',
    'operators',
  ],
  '/legal/terms': ['cgu', 'terms', 'conditions', 'tos'],
  '/legal/privacy': [
    'privacy',
    'confidentialite',
    'rgpd',
    'gdpr',
    'donnees',
  ],
};

/**
 * Normalise une chaîne pour le matching : trim, minuscules, sans accents.
 */
export function normalizeSiteSearchText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function matchesSiteNavSearchItem(
  item: SiteSearchNavMatchItem,
  normalizedQuery: string,
): boolean {
  if (!normalizedQuery) {
    return true;
  }

  const label = normalizeSiteSearchText(item.label);
  const href = normalizeSiteSearchText(item.href);

  if (label.includes(normalizedQuery) || href.includes(normalizedQuery)) {
    return true;
  }

  if (normalizedQuery.length < 2) {
    return false;
  }

  const aliases = SITE_SEARCH_PAGE_ALIASES[item.href];
  if (!aliases) {
    return false;
  }

  return aliases.some((alias) => {
    const normalizedAlias = normalizeSiteSearchText(alias);
    return (
      normalizedAlias.includes(normalizedQuery) ||
      normalizedQuery.includes(normalizedAlias)
    );
  });
}
