import { getAdminContextualHelpRules } from './contextual-help';
import { ADMIN_HELP_BASE_PATH } from './routes';

/**
 * Extra admin path prefixes allowed in help-article inline links
 * (beyond contextual-help mapping prefixes).
 */
const EXTRA_ADMIN_HELP_LINK_PREFIXES = [ADMIN_HELP_BASE_PATH] as const;

function uniqueSortedPrefixes(prefixes: readonly string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const prefix of prefixes) {
    if (!prefix.startsWith('/') || seen.has(prefix)) {
      continue;
    }
    seen.add(prefix);
    result.push(prefix);
  }

  // Longest first so `/utilisateurs/employes` wins over `/utilisateurs`.
  result.sort((a, b) => b.length - a.length);
  return result;
}

/**
 * Allowlisted pathname prefixes for clickable links inside help article bodies.
 * Derived from contextual-help rules + hub `/aide`.
 */
export function getAdminHelpLinkPathPrefixes(): readonly string[] {
  const fromContextual = getAdminContextualHelpRules().map(
    (rule) => rule.prefix,
  );
  return uniqueSortedPrefixes([
    ...EXTRA_ADMIN_HELP_LINK_PREFIXES,
    ...fromContextual,
  ]);
}

function matchesAllowedPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/**
 * Normalize a candidate href from help body text.
 * Returns a clean pathname or `null` if unsafe / non-relative.
 */
export function normalizeAdminHelpLinkHref(href: string): string | null {
  const trimmed = href.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return null;
  }

  // Reject schemes, query strings, and hashes for article deep-links.
  if (
    trimmed.includes('://') ||
    trimmed.includes('?') ||
    trimmed.includes('#') ||
    trimmed.includes('\\')
  ) {
    return null;
  }

  // Disallow path tricks.
  if (trimmed.includes('..')) {
    return null;
  }

  let pathname = trimmed.split('?')[0]?.split('#')[0] ?? trimmed;
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  // Only simple admin path segments: /foo, /foo/bar-baz, etc.
  if (!/^\/[a-z0-9]+(?:[/-][a-z0-9]+)*$/i.test(pathname)) {
    return null;
  }

  return pathname;
}

/** True when `href` is a relative admin path under the help link allowlist. */
export function isAllowedAdminHelpHref(href: string): boolean {
  const pathname = normalizeAdminHelpLinkHref(href);
  if (!pathname) {
    return false;
  }

  return getAdminHelpLinkPathPrefixes().some((prefix) =>
    matchesAllowedPrefix(pathname, prefix),
  );
}
