import {
  ApiHttpError,
  createApiClient,
  type AuthMe,
  type AuthResponse,
  type AuthTokens,
} from '@africatourismgate/api-client';
import type { LoginRequest, RegisterRequest, VerifyOperationRequest } from '@africatourismgate/types';
import { getOrCreateClientInstanceId, withClientInstanceId } from '@africatourismgate/utils';
import { appendDevOriginToNextPath, isLocalDevOrigin } from '../auth/dev-oauth-return';
import { getOAuthApiBaseUrl } from './oauth-api-url';

export function getApiBaseUrl(): string {
  const defaultApiUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://app-africatourismgate.org/api'
      : 'http://localhost:3000/api';
  return (process.env.NEXT_PUBLIC_API_URL ?? defaultApiUrl).replace(/\/$/, '');
}

export function loginWithPassword(body: LoginRequest): Promise<AuthResponse> {
  return createApiClient({ baseUrl: getApiBaseUrl() }).login(
    withClientInstanceId(body),
  );
}

export function verifyOperation(body: VerifyOperationRequest): Promise<AuthResponse> {
  return createApiClient({ baseUrl: getApiBaseUrl() }).verifyOperation(
    withClientInstanceId(body),
  );
}

export function registerCustomer(body: RegisterRequest): Promise<AuthResponse> {
  return createApiClient({ baseUrl: getApiBaseUrl() }).registerCustomer(
    withClientInstanceId(body),
  );
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
  const clientInstanceId = getOrCreateClientInstanceId();
  if (clientInstanceId) {
    params.set('client_instance', clientInstanceId);
  }
  return `${getOAuthApiBaseUrl()}/auth/google?${params.toString()}`;
}

export function getAuthMe(accessToken: string): Promise<AuthMe> {
  return createApiClient({
    baseUrl: getApiBaseUrl(),
    accessToken,
  }).getAuthMe();
}

export type RefreshAuthTokensResult = AuthTokens | 'locked';

export async function refreshAuthTokens(
  refreshToken: string,
): Promise<RefreshAuthTokensResult> {
  try {
    return await createApiClient({
      baseUrl: getApiBaseUrl(),
    }).refresh(refreshToken);
  } catch (error) {
    if (error instanceof ApiHttpError && error.status === 401) {
      const body = error.body as { code?: string } | undefined;
      if (body?.code === 'SESSION_LOCKED') {
        return 'locked';
      }
    }
    throw error;
  }
}

export function touchSession(refreshToken: string): Promise<{ success: boolean }> {
  return createApiClient({ baseUrl: getApiBaseUrl() }).touchSession(refreshToken);
}

export function unlockSession(body: {
  password: string;
  refreshToken: string;
}): Promise<AuthTokens> {
  return createApiClient({ baseUrl: getApiBaseUrl() }).unlockSession(body);
}

export function logoutAuth(refreshToken: string): Promise<{ success: boolean }> {
  return createApiClient({
    baseUrl: getApiBaseUrl(),
  }).logout(refreshToken);
}
