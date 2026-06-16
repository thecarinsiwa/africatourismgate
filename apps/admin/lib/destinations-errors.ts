import { resolveUnknownApiError } from './common-api-errors';
import type { DestinationsErrorMessages } from './i18n/admin-error-messages';

export type { DestinationsErrorMessages };

export function getDestinationsErrorMessage(
  error: unknown,
  messages: DestinationsErrorMessages,
): string {
  return resolveUnknownApiError(error, messages, {
    conflict: () => messages.slugConflict,
  });
}
