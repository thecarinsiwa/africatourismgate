export const WEB_ACCESS_TOKEN_STORAGE_KEY = 'atg.web.accessToken';
const ADMIN_SESSION_STORAGE_KEY = 'atg.admin.session';

function readStorageToken(storage: Storage, key: string): string | null {
  const raw = storage.getItem(key);
  if (!raw) return null;
  return raw.trim() || null;
}

function readAdminSessionToken(storage: Storage): string | null {
  const raw = storage.getItem(ADMIN_SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { accessToken?: unknown };
    return typeof parsed.accessToken === 'string' && parsed.accessToken.length > 0
      ? parsed.accessToken
      : null;
  } catch {
    return null;
  }
}

export function getClientAccessToken(): string | null {
  if (typeof window === 'undefined') return null;

  for (const storage of [localStorage, sessionStorage]) {
    const webToken = readStorageToken(storage, WEB_ACCESS_TOKEN_STORAGE_KEY);
    if (webToken) return webToken;
  }

  for (const storage of [localStorage, sessionStorage]) {
    const adminToken = readAdminSessionToken(storage);
    if (adminToken) return adminToken;
  }

  return null;
}
