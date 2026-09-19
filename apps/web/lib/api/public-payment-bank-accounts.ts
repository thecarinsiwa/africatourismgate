import { createApiClient } from '@africatourismgate/api-client';
import type { PublicPaymentBankAccount } from '@africatourismgate/types';

function getApiBaseUrl(): string {
  const defaultApiUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://app-africatourismgate.org/api'
      : 'http://localhost:3000/api';
  return (process.env.NEXT_PUBLIC_API_URL ?? defaultApiUrl).replace(/\/$/, '');
}

/** Public bank accounts for bank_transfer checkout instructions (no auth). */
export function listPublicPaymentBankAccounts(
  organizationSlug?: string,
): Promise<PublicPaymentBankAccount[]> {
  return createApiClient({ baseUrl: getApiBaseUrl() }).listPublicPaymentBankAccounts(
    organizationSlug ? { organizationSlug } : undefined,
  );
}
