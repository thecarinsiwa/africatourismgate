import type { AuthTokens } from '@africatourismgate/types';
import { getApiBaseUrl } from './api';

export type RefreshAccessTokenResult = AuthTokens | 'locked' | null;

export async function refreshAccessToken(
  refreshToken: string,
  apiUrl = getApiBaseUrl(),
): Promise<RefreshAccessTokenResult> {
  if (!apiUrl) {
    return null;
  }

  const url = `${apiUrl.replace(/\/$/, '')}/auth/refresh`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      if (res.status === 401) {
        try {
          const body = (await res.json()) as { code?: string };
          if (body?.code === 'SESSION_LOCKED') {
            return 'locked';
          }
        } catch {
          // ignore parse errors
        }
      }
      return null;
    }

    return (await res.json()) as AuthTokens;
  } catch {
    return null;
  }
}
