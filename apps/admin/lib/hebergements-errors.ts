import { ApiHttpError } from '@africatourismgate/api-client';
import { resolveUnknownApiError } from './common-api-errors';
import type { HebergementsErrorMessages } from './i18n/admin-error-messages';

export type { HebergementsErrorMessages };

export function getHebergementsErrorMessage(
  error: unknown,
  messages: HebergementsErrorMessages,
): string {
  return resolveUnknownApiError(error, messages, {
    conflict: (apiError: ApiHttpError) => {
      if (apiError.message?.includes('slug')) {
        return messages.slugConflict;
      }
      if (apiError.message?.includes('code')) {
        return messages.codeConflict;
      }
      if (
        apiError.message?.includes('disponibilité') ||
        apiError.message?.includes('date') ||
        apiError.message?.includes('availability')
      ) {
        return apiError.message || messages.availabilityConflict;
      }
      return messages.resourceConflict;
    },
  });
}
