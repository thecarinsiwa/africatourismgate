import { resolveUnknownApiError } from './common-api-errors';
import type { CroisieresErrorMessages } from './i18n/admin-error-messages';

export type { CroisieresErrorMessages };

export function getCroisieresErrorMessage(
  error: unknown,
  messages: CroisieresErrorMessages,
): string {
  return resolveUnknownApiError(error, messages, {
    sessionExpired: messages.sessionExpiredContinue,
    conflict: () => messages.resourceConflict,
  });
}
