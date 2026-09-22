/** Matching nav / aliases pour la source locale `pages` (sans deps UI). */

export type AdminSearchNavMatchItem = {
  href: string;
  label: string;
};

export const ADMIN_HELP_SEARCH_ALIASES = [
  'aide',
  'help',
  'ayuda',
  'docs',
  'documentation',
] as const;

export const ADMIN_HELP_NAV_HREF = '/aide';

export function matchesAdminNavSearchItem(
  item: AdminSearchNavMatchItem,
  normalizedQuery: string,
): boolean {
  if (!normalizedQuery) {
    return true;
  }

  if (
    item.label.toLowerCase().includes(normalizedQuery) ||
    item.href.toLowerCase().includes(normalizedQuery)
  ) {
    return true;
  }

  if (item.href !== ADMIN_HELP_NAV_HREF || normalizedQuery.length < 2) {
    return false;
  }

  return ADMIN_HELP_SEARCH_ALIASES.some(
    (alias) =>
      alias.includes(normalizedQuery) || normalizedQuery.includes(alias),
  );
}
