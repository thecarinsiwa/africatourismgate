import { SUPPORT_BASE_PATH } from './routes';

/**
 * Préfixes de chemins publics autorisés dans les liens des articles d’aide.
 */
export const WEB_HELP_LINK_PATH_PREFIXES = [
  SUPPORT_BASE_PATH,
  '/booking',
  '/account',
  '/hotels',
  '/flights',
  '/cars',
  '/cruises',
  '/activities',
  '/packages',
  '/donate',
  '/legal',
  '/search',
  '/blog',
] as const;

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

  // Plus long d’abord pour que `/account/reservations` gagne sur `/account`.
  result.sort((a, b) => b.length - a.length);
  return result;
}

/**
 * Préfixes allowlistés pour les liens cliquables dans le corps des articles.
 */
export function getWebHelpLinkPathPrefixes(): readonly string[] {
  return uniqueSortedPrefixes(WEB_HELP_LINK_PATH_PREFIXES);
}

function matchesAllowedPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/**
 * Normalise un href candidat depuis le corps d’un article.
 * Retourne un pathname propre ou `null` si non relatif / dangereux.
 */
export function normalizeWebHelpLinkHref(href: string): string | null {
  const trimmed = href.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return null;
  }

  if (
    trimmed.includes('://') ||
    trimmed.includes('?') ||
    trimmed.includes('#') ||
    trimmed.includes('\\')
  ) {
    return null;
  }

  if (trimmed.includes('..')) {
    return null;
  }

  let pathname = trimmed.split('?')[0]?.split('#')[0] ?? trimmed;
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  if (!/^\/[a-z0-9]+(?:[/-][a-z0-9]+)*$/i.test(pathname)) {
    return null;
  }

  return pathname;
}

/** True si `href` est un chemin relatif sous l’allowlist d’aide web. */
export function isAllowedWebHelpHref(href: string): boolean {
  const pathname = normalizeWebHelpLinkHref(href);
  if (!pathname) {
    return false;
  }

  return getWebHelpLinkPathPrefixes().some((prefix) =>
    matchesAllowedPrefix(pathname, prefix),
  );
}

export type WebHelpRichTextSegment =
  | { type: 'text'; text: string }
  | { type: 'link'; text: string; href: string };

const MARKDOWN_LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;
/** Chemins nus, éventuellement entre parenthèses : `/foo` ou `(/foo/bar)`. */
const BARE_PATH_RE = /(\()?(\/[a-z0-9]+(?:[/-][a-z0-9]+)*)(\))?/gi;

/**
 * Retire la syntaxe markdown des liens pour l’indexation recherche.
 * Conserve label + href pour que les deux restent recherchables.
 */
export function stripWebHelpMarkdownLinks(text: string): string {
  if (!text) {
    return '';
  }
  return text.replace(
    MARKDOWN_LINK_RE,
    (_match, label: string, href: string) => {
      const normalized = normalizeWebHelpLinkHref(href);
      if (normalized) {
        return `${label} ${normalized}`;
      }
      return `${label} ${href}`.trim();
    },
  );
}

function pushText(segments: WebHelpRichTextSegment[], text: string) {
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
  segments: WebHelpRichTextSegment[],
  text: string,
  href: string,
) {
  if (!text) {
    return;
  }
  segments.push({ type: 'link', text, href });
}

/**
 * Auto-lie les chemins allowlistés dans un chunk de texte brut.
 * Alias plan : `linkifyWebHelpPlainPaths`.
 */
export function linkifyWebHelpPlainPaths(
  text: string,
): WebHelpRichTextSegment[] {
  const segments: WebHelpRichTextSegment[] = [];
  let lastIndex = 0;
  BARE_PATH_RE.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = BARE_PATH_RE.exec(text)) !== null) {
    const [full, openParen, rawPath, closeParen] = match;
    const pathname = normalizeWebHelpLinkHref(rawPath ?? '');

    if (!pathname || !isAllowedWebHelpHref(pathname)) {
      continue;
    }

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
 * Parse le corps d’un article en segments texte / lien.
 * Supporte `[label](/path)` et auto-lie `/path` / `(/path)` allowlistés.
 */
export function parseWebHelpRichText(text: string): WebHelpRichTextSegment[] {
  if (!text) {
    return [];
  }

  const segments: WebHelpRichTextSegment[] = [];
  let lastIndex = 0;
  MARKDOWN_LINK_RE.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = MARKDOWN_LINK_RE.exec(text)) !== null) {
    const [full, label, rawHref] = match;
    const index = match.index;

    if (index > lastIndex) {
      segments.push(...linkifyWebHelpPlainPaths(text.slice(lastIndex, index)));
    }

    const href = normalizeWebHelpLinkHref(rawHref ?? '');
    if (href && isAllowedWebHelpHref(href) && label) {
      pushLink(segments, label, href);
    } else {
      pushText(
        segments,
        label && rawHref ? `${label} (${rawHref})` : full,
      );
    }

    lastIndex = index + full.length;
  }

  if (lastIndex < text.length) {
    segments.push(...linkifyWebHelpPlainPaths(text.slice(lastIndex)));
  }

  return segments.length > 0 ? segments : [{ type: 'text', text }];
}
