const DEV_ORIGIN_PARAM = 'atg_dev_origin';

const LOCAL_DEV_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d{1,5})?$/i;

export function isLocalDevOrigin(origin: string): boolean {
  try {
    return LOCAL_DEV_ORIGIN.test(new URL(origin.trim()).origin);
  } catch {
    return false;
  }
}

/** Embed localhost return hint in `next` — survives production API without web_origin support. */
export function appendDevOriginToNextPath(
  nextPath: string,
  webOrigin: string,
): string {
  const base = nextPath.startsWith('/') ? nextPath : `/${nextPath}`;
  const url = new URL(base, 'http://atg.local');
  url.searchParams.set(DEV_ORIGIN_PARAM, webOrigin.trim());
  return `${url.pathname}${url.search}`;
}

export function stripDevOriginFromNextPath(nextPath: string): {
  next: string;
  devOrigin?: string;
} {
  const base = nextPath.startsWith('/') ? nextPath : `/${nextPath}`;
  const url = new URL(base, 'http://atg.local');
  const devOrigin = url.searchParams.get(DEV_ORIGIN_PARAM) ?? undefined;
  url.searchParams.delete(DEV_ORIGIN_PARAM);
  const next = `${url.pathname}${url.search}` || '/booking/cart';
  return { next, devOrigin: devOrigin?.trim() || undefined };
}

/**
 * When Google OAuth finishes on production, bounce back to localhost dev
 * (verify / oauth callback) if `atg_dev_origin` was embedded in `next`.
 */
export function buildDevOAuthReturnUrl(
  devOrigin: string,
  pathname: string,
  currentSearch: URLSearchParams,
): string {
  const target = new URL(pathname, devOrigin.replace(/\/$/, ''));
  currentSearch.forEach((value, key) => {
    if (key === 'next') {
      const { next } = stripDevOriginFromNextPath(value);
      target.searchParams.set('next', next);
      return;
    }
    target.searchParams.set(key, value);
  });
  return target.toString();
}

export function readDevOriginFromOAuthNext(
  nextPath: string | null | undefined,
): string | undefined {
  if (!nextPath) return undefined;
  const { devOrigin } = stripDevOriginFromNextPath(nextPath);
  return devOrigin && isLocalDevOrigin(devOrigin) ? devOrigin : undefined;
}
