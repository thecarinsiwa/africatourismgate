import { resolveApiBaseUrl } from './auth/api';

/** Resolves relative upload paths and absolute URLs for admin image display. */
export function resolveMediaUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const base = resolveApiBaseUrl();
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
}
