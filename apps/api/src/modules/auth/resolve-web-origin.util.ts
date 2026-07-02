const DEV_ORIGIN_PARAM = 'atg_dev_origin';

const LOCAL_DEV_ORIGIN =
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d{1,5})?$/i;

const PRODUCTION_WEB_ORIGINS = new Set([
  'https://africatourismgate.org',
  'https://www.africatourismgate.org',
]);

export function stripDevOriginFromNextPath(nextPath: string | undefined): {
  next: string;
  devOrigin?: string;
} {
  if (!nextPath?.trim()) {
    return { next: '/booking/cart' };
  }

  const base = nextPath.startsWith('/') ? nextPath : `/${nextPath}`;
  const queryIndex = base.indexOf('?');
  if (queryIndex === -1) {
    return { next: base };
  }

  const pathname = base.slice(0, queryIndex);
  const params = new URLSearchParams(base.slice(queryIndex + 1));
  const devOrigin = params.get(DEV_ORIGIN_PARAM) ?? undefined;
  params.delete(DEV_ORIGIN_PARAM);
  const search = params.toString();
  const next = search ? `${pathname}?${search}` : pathname;
  return { next, devOrigin: devOrigin?.trim() || undefined };
}

export function resolveOAuthWebUrlFromNext(
  next: string | undefined,
  explicitWebOrigin?: string,
): { webUrl: string; safeNext: string } {
  const { next: strippedNext, devOrigin } = stripDevOriginFromNextPath(next);
  const webOrigin = explicitWebOrigin?.trim() || devOrigin;
  return {
    webUrl: resolveOAuthWebUrl(webOrigin),
    safeNext: normalizeNextPath(strippedNext),
  };
}

function normalizeNextPath(next: string | undefined): string {
  if (!next?.trim()) return '/booking/cart';
  if (!next.startsWith('/')) return '/booking/cart';
  if (next.startsWith('//')) return '/booking/cart';
  return next;
}

function defaultWebUrl(): string {
  if (process.env.NODE_ENV === 'production') {
    return 'https://africatourismgate.org';
  }
  return 'http://localhost:3002';
}

/** Resolve redirect base URL after Google OAuth (allows localhost when developing against prod API). */
export function resolveOAuthWebUrl(webOrigin?: string): string {
  const fromEnv = process.env.NEXT_PUBLIC_WEB_URL?.replace(/\/$/, '');
  const fallback = fromEnv || defaultWebUrl();
  if (!webOrigin?.trim()) {
    return fallback;
  }

  try {
    const origin = new URL(webOrigin.trim()).origin.replace(/\/$/, '');
    if (LOCAL_DEV_ORIGIN.test(origin)) {
      return origin;
    }
    if (PRODUCTION_WEB_ORIGINS.has(origin)) {
      return origin;
    }
  } catch {
    // Invalid URL — use fallback.
  }

  return fallback;
}
