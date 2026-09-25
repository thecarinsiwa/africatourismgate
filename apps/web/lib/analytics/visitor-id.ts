const VISITOR_COOKIE = 'atg-vid';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

/** UUID v4 shape expected by the public analytics API. */
const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }
  const prefix = `${name}=`;
  const parts = document.cookie.split(';');
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      return decodeURIComponent(trimmed.slice(prefix.length));
    }
  }
  return null;
}

function writeVisitorCookie(id: string): void {
  document.cookie = `${VISITOR_COOKIE}=${encodeURIComponent(id)};path=/;max-age=${MAX_AGE_SECONDS};SameSite=Lax`;
}

/**
 * Returns a stable anonymous visitor id (cookie `atg-vid`, 1 year).
 * Creates one when missing or invalid. Empty string when not in a browser.
 */
export function getOrCreateVisitorId(): string {
  if (typeof document === 'undefined' || typeof crypto === 'undefined') {
    return '';
  }

  const existing = readCookie(VISITOR_COOKIE);
  if (existing && UUID_V4_PATTERN.test(existing)) {
    return existing;
  }

  const id = crypto.randomUUID();
  writeVisitorCookie(id);
  return id;
}

export { VISITOR_COOKIE };
