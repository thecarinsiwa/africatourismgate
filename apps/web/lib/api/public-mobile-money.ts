import { createApiClient } from '@africatourismgate/api-client';
import type { PublicMobileMoneyCountry } from '@africatourismgate/types';

function getApiBaseUrl(): string {
  const defaultApiUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://app-africatourismgate.org/api'
      : 'http://localhost:3000/api';
  return (process.env.NEXT_PUBLIC_API_URL ?? defaultApiUrl).replace(/\/$/, '');
}

/** Public Mobile Money config for checkout instructions (no auth). */
export function listPublicMobileMoneyConfig(
  organizationSlug?: string,
): Promise<PublicMobileMoneyCountry[]> {
  return createApiClient({ baseUrl: getApiBaseUrl() }).listPublicMobileMoneyConfig(
    organizationSlug ? { organizationSlug } : undefined,
  );
}
