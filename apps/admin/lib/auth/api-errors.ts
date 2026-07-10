import { ApiHttpError } from '@africatourismgate/api-client';

export type AuthErrorMessages = {
  network: string;
  generic: string;
  envMissing?: string;
  conflict?: string;
  unauthorized?: string;
  accountPendingApproval?: string;
  server?: string;
};

export function getAuthErrorMessage(
  error: unknown,
  messages: AuthErrorMessages,
): string {
  if (error instanceof TypeError) {
    return messages.network;
  }

  if (
    error instanceof Error &&
    error.message.includes('NEXT_PUBLIC_API_URL is not set')
  ) {
    return messages.envMissing ?? messages.generic;
  }

  if (error instanceof ApiHttpError) {
    if (error.status === 409 && messages.conflict) {
      return messages.conflict;
    }
    if (error.status === 401) {
      const detail =
        typeof error.message === 'string' ? error.message.toLowerCase() : '';
      if (
        detail.includes('not active') &&
        messages.accountPendingApproval
      ) {
        return messages.accountPendingApproval;
      }
      if (messages.unauthorized) {
        return messages.unauthorized;
      }
    }
    if (error.status === 500 && messages.server) {
      const detail = typeof error.message === 'string' ? error.message : '';
      if (detail.includes('Default organization') || detail.includes('seeds')) {
        return messages.server;
      }
      return messages.server;
    }
    if (error.status === 400 && error.message && !error.message.startsWith('HTTP ')) {
      return error.message;
    }
  }

  return messages.generic;
}
