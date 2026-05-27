import { createApiClient, type AuthMe, type AuthTokens } from '@africatourismgate/api-client';

function getApiBaseUrl(): string {
  const defaultApiUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://app-africatourismgate.org/api'
      : 'http://localhost:3000/api';
  return (process.env.NEXT_PUBLIC_API_URL ?? defaultApiUrl).replace(/\/$/, '');
}

export function buildGoogleOAuthStartUrl(nextPath: string): string {
  const params = new URLSearchParams({ next: nextPath });
  return `${getApiBaseUrl()}/auth/google?${params.toString()}`;
}

export function getAuthMe(accessToken: string): Promise<AuthMe> {
  return createApiClient({
    baseUrl: getApiBaseUrl(),
    accessToken,
  }).getAuthMe();
}

export function refreshAuthTokens(refreshToken: string): Promise<AuthTokens> {
  return createApiClient({
    baseUrl: getApiBaseUrl(),
  }).refresh(refreshToken);
}

export function logoutAuth(refreshToken: string): Promise<{ success: boolean }> {
  return createApiClient({
    baseUrl: getApiBaseUrl(),
  }).logout(refreshToken);
}
