import type { AuthTokens } from '@africatourismgate/types';

function resolveRefreshApiUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === 'production') {
    return 'https://app-africatourismgate.org/api';
  }
  return 'http://localhost:3000/api';
}

export async function refreshAccessToken(
  refreshToken: string,
  apiUrl = resolveRefreshApiUrl(),
): Promise<AuthTokens | null> {
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
      return null;
    }

    return (await res.json()) as AuthTokens;
  } catch {
    return null;
  }
}
