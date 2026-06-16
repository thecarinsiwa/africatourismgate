import { resolveUnknownApiError } from './common-api-errors';
import type { VolsErrorMessages } from './i18n/admin-error-messages';

export type { VolsErrorMessages };

export function getVolsErrorMessage(error: unknown, messages: VolsErrorMessages): string {
  return resolveUnknownApiError(error, messages, {
    conflict: () => messages.resourceConflict,
  });
}
