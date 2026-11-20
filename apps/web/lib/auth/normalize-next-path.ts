/** Fallback after login / OAuth / verify when `next` is missing or unsafe. */
export const DEFAULT_NEXT_PATH = '/booking/cart';

/**
 * Allowlisted path prefixes for post-auth redirects.
 * Exact `/` (home) is also allowed.
 */
export const NEXT_PATH_PREFIXES = [
  '/booking',
  '/account',
  '/hotels',
  '/flights',
  '/cars',
  '/cruises',
  '/activities',
  '/packages',
  '/partners',
  '/blog',
  '/donate',
  '/search',
  '/legal',
  '/support',
] as const;

const PATHNAME_SEGMENT = /^\/(?:[a-z0-9][a-z0-9_-]*(?:\/[a-z0-9][a-z0-9_-]*)*)?$/i;

function matchesAllowedPrefix(pathname: string): boolean {
  if (pathname === '/') return true;
  return NEXT_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Normalize a post-login `next` query value to a same-origin relative path.
 * Rejects open redirects (`//`, absolute URLs, `..`, `\`, non-allowlisted paths).
 * Preserves safe query + hash (e.g. cart draft params, `#configure`).
 */
export function normalizeNextPath(nextPath?: string | null): string {
  if (!nextPath) return DEFAULT_NEXT_PATH;

  const trimmed = nextPath.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return DEFAULT_NEXT_PATH;
  }
  if (
    trimmed.includes('\\') ||
    trimmed.includes('://') ||
    trimmed.includes('..')
  ) {
    return DEFAULT_NEXT_PATH;
  }

  let url: URL;
  try {
    url = new URL(trimmed, 'http://atg.local');
  } catch {
    return DEFAULT_NEXT_PATH;
  }

  if (url.username || url.password) return DEFAULT_NEXT_PATH;

  let pathname = url.pathname;
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  if (
    !pathname.startsWith('/') ||
    pathname.startsWith('//') ||
    pathname.includes('\\') ||
    pathname.includes('..')
  ) {
    return DEFAULT_NEXT_PATH;
  }

  if (!PATHNAME_SEGMENT.test(pathname)) {
    return DEFAULT_NEXT_PATH;
  }

  if (!matchesAllowedPrefix(pathname)) {
    return DEFAULT_NEXT_PATH;
  }

  if (/javascript:/i.test(url.hash)) {
    return DEFAULT_NEXT_PATH;
  }

  return `${pathname}${url.search}${url.hash}` || DEFAULT_NEXT_PATH;
}
