import { ApiClient } from '@africatourismgate/api-client';
import { getSession } from './session';

export function getApiClient(): ApiClient {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not set');
  }
  const session = getSession();
  return new ApiClient(baseUrl, session?.accessToken ?? null);
}
