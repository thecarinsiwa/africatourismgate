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
