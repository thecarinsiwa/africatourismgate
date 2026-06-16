import { resolveUnknownApiError } from './common-api-errors';
import type { UsersErrorMessages } from './i18n/admin-error-messages';

export type { UsersErrorMessages };

export function getUsersErrorMessage(error: unknown, messages: UsersErrorMessages): string {
  return resolveUnknownApiError(error, messages, {
    conflict: () => messages.emailConflict,
  });
}
