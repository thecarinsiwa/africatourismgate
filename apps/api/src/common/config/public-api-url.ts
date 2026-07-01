/** Public API base URL (includes /api prefix), used for OAuth callback defaults. */
export function resolvePublicApiBaseUrl(): string {
  const callback = process.env.GOOGLE_CALLBACK_URL?.trim();
  if (callback) {
    return callback.replace(/\/auth\/google\/callback\/?$/, '');
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (apiUrl) {
    return apiUrl.replace(/\/$/, '');
  }

  const port = process.env.API_PORT?.trim();
  const safePort = port && /^\d+$/.test(port) ? port : '3000';
  return `http://localhost:${safePort}/api`;
}

export function resolveGoogleCallbackUrl(): string {
  const explicit = process.env.GOOGLE_CALLBACK_URL?.trim();
  if (explicit) {
    return explicit;
  }
  return `${resolvePublicApiBaseUrl()}/auth/google/callback`;
}
