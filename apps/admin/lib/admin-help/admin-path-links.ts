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

export type AdminHelpRichTextSegment =
  | { type: 'text'; text: string }
  | { type: 'link'; text: string; href: string };

const MARKDOWN_LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;
/** Bare admin paths, optionally wrapped in parentheses: `/foo` or `(/foo/bar)`. */
const BARE_PATH_RE = /(\()?(\/[a-z0-9]+(?:[/-][a-z0-9]+)*)(\))?/gi;

/**
 * Remove markdown link syntax for search indexing.
 * Keeps label + href so both remain searchable.
 */
export function stripAdminHelpMarkdownLinks(text: string): string {
  if (!text) {
    return '';
  }
  return text.replace(MARKDOWN_LINK_RE, (_match, label: string, href: string) => {
    const normalized = normalizeAdminHelpLinkHref(href);
    if (normalized) {
      return `${label} ${normalized}`;
    }
    return `${label} ${href}`.trim();
  });
}

function pushText(segments: AdminHelpRichTextSegment[], text: string) {
  if (!text) {
    return;
  }
  const last = segments[segments.length - 1];
  if (last?.type === 'text') {
    last.text += text;
    return;
  }
  segments.push({ type: 'text', text });
}

function pushLink(
  segments: AdminHelpRichTextSegment[],
  text: string,
  href: string,
) {
  if (!text) {
    return;
  }
  segments.push({ type: 'link', text, href });
}

/** Auto-link allowlisted bare paths inside a plain-text chunk. */
function parseBarePaths(text: string): AdminHelpRichTextSegment[] {
  const segments: AdminHelpRichTextSegment[] = [];
  let lastIndex = 0;
  BARE_PATH_RE.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = BARE_PATH_RE.exec(text)) !== null) {
    const [full, openParen, rawPath, closeParen] = match;
    const pathname = normalizeAdminHelpLinkHref(rawPath ?? '');

    if (!pathname || !isAllowedAdminHelpHref(pathname)) {
      continue;
    }

    // Avoid linking mid-token (e.g. email-like noise); require path boundary.
    const index = match.index;
    const prev = index > 0 ? text[index - 1] : '';
    if (prev && /[a-z0-9]/i.test(prev)) {
      continue;
    }

    pushText(segments, text.slice(lastIndex, index));

    const hasParens = Boolean(openParen && closeParen);
    if (hasParens) {
      pushText(segments, '(');
      pushLink(segments, pathname, pathname);
      pushText(segments, ')');
    } else if (openParen && !closeParen) {
      // Unbalanced — keep as text.
      pushText(segments, full);
    } else {
      pushLink(segments, pathname, pathname);
    }

    lastIndex = index + full.length;
  }

  pushText(segments, text.slice(lastIndex));
  return segments;
}

/**
 * Parse help body text into text/link segments.
 * Supports `[label](/path)` and auto-links allowlisted `/path` / `(/path)`.
 */
export function parseAdminHelpRichText(text: string): AdminHelpRichTextSegment[] {
  if (!text) {
    return [];
  }

  const segments: AdminHelpRichTextSegment[] = [];
  let lastIndex = 0;
  MARKDOWN_LINK_RE.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = MARKDOWN_LINK_RE.exec(text)) !== null) {
    const [full, label, rawHref] = match;
    const index = match.index;

    if (index > lastIndex) {
      segments.push(...parseBarePaths(text.slice(lastIndex, index)));
    }

    const href = normalizeAdminHelpLinkHref(rawHref ?? '');
    if (href && isAllowedAdminHelpHref(href) && label) {
      pushLink(segments, label, href);
    } else {
      // Unsafe / unknown — keep readable label + path as plain text.
      pushText(
        segments,
        label && rawHref ? `${label} (${rawHref})` : full,
      );
    }

    lastIndex = index + full.length;
  }

  if (lastIndex < text.length) {
    segments.push(...parseBarePaths(text.slice(lastIndex)));
  }

  return segments.length > 0 ? segments : [{ type: 'text', text }];
}
