import {
  createApiClient,
  type AuthMe,
  type AuthResponse,
  type AuthTokens,
} from '@africatourismgate/api-client';
import type { LoginRequest, RegisterRequest, VerifyOperationRequest } from '@africatourismgate/types';
import { appendDevOriginToNextPath, isLocalDevOrigin } from '../auth/dev-oauth-return';
import { getOAuthApiBaseUrl } from './oauth-api-url';

import { getWebApiUrl } from './get-api-url';

function getApiBaseUrl(): string {
  return getWebApiUrl();
}

export function loginWithPassword(body: LoginRequest): Promise<AuthResponse> {
  return createApiClient({ baseUrl: getApiBaseUrl() }).login(body);
}

export function verifyOperation(body: VerifyOperationRequest): Promise<AuthResponse> {
  return createApiClient({ baseUrl: getApiBaseUrl() }).verifyOperation(body);
}

export function registerCustomer(body: RegisterRequest): Promise<AuthResponse> {
  return createApiClient({ baseUrl: getApiBaseUrl() }).registerCustomer(body);
}

export function buildGoogleOAuthStartUrl(
  nextPath: string,
  webOrigin?: string,
): string {
  const origin = webOrigin?.trim();
  const next =
    origin && isLocalDevOrigin(origin)
      ? appendDevOriginToNextPath(nextPath, origin)
      : nextPath;
  const params = new URLSearchParams({ next });
  if (origin) {
    params.set('web_origin', origin);
  }
  return `${getOAuthApiBaseUrl()}/auth/google?${params.toString()}`;
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
