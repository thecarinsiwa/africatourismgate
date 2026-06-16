import { resolveUnknownApiError } from './common-api-errors';
import type { BookingsErrorMessages } from './i18n/admin-error-messages';

export type { BookingsErrorMessages };

export function getBookingsErrorMessage(error: unknown, messages: BookingsErrorMessages): string {
  return resolveUnknownApiError(error, messages, {
    forbidden: messages.forbiddenRead,
  });
}
