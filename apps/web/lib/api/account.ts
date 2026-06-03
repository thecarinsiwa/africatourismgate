import { createApiClient } from '@africatourismgate/api-client';
import { ensureClientAccessToken } from '../auth/client-session';

function getApiBaseUrl(): string {
  const defaultApiUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://app-africatourismgate.org/api'
      : 'http://localhost:3000/api';
  return (process.env.NEXT_PUBLIC_API_URL ?? defaultApiUrl).replace(/\/$/, '');
}

export async function getAccountApiClient() {
  const accessToken = await ensureClientAccessToken();
  if (!accessToken) {
    throw new Error('Not authenticated');
  }
  return createApiClient({
    baseUrl: getApiBaseUrl(),
    accessToken,
  });
}
