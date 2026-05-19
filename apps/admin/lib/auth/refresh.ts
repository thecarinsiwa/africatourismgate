import type { AuthTokens } from '@africatourismgate/types';

export async function refreshAccessToken(
  refreshToken: string,
  apiUrl = process.env.NEXT_PUBLIC_API_URL,
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
