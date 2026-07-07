const defaultServerApiUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://app-africatourismgate.org/api'
    : 'http://localhost:3000/api';

/** API base for public fetches — browser uses same-origin `/api` to avoid CORS. */
export function getPublicApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return '/api';
  }
  return (process.env.NEXT_PUBLIC_API_URL ?? defaultServerApiUrl).replace(/\/$/, '');
}

/** Origin for resolving `/api/uploads/…` and relative media paths. */
export function getPublicApiOrigin(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return getPublicApiBaseUrl().replace(/\/api$/, '') || 'http://localhost:3000';
}
