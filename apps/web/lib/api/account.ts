import { createApiClient } from '@africatourismgate/api-client';
import { ensureClientAccessToken } from '../auth/client-session';

import { getWebApiUrl } from './get-api-url';

function getApiBaseUrl(): string {
  return getWebApiUrl();
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
