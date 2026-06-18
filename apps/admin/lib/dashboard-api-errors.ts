import { ApiHttpError } from '@africatourismgate/api-client';
import type { DashboardKpiErrorMessages } from './i18n/admin-error-messages';

export type { DashboardKpiErrorMessages };

export function getDashboardKpiErrorMessage(
  error: unknown,
  messages: DashboardKpiErrorMessages,
): string {
  if (error instanceof TypeError) {
    return messages.network;
  }

  if (error instanceof ApiHttpError) {
    if (error.status === 403) {
      return messages.forbiddenDetail;
    }
    if (error.message && !error.message.startsWith('HTTP ')) {
      return error.message;
    }
    return messages.loadFailed;
  }

  return messages.loadFailed;
}
