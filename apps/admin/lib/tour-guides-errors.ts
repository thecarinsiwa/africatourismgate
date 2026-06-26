import { resolveUnknownApiError } from './common-api-errors';
import type { TourGuidesErrorMessages } from './i18n/admin-error-messages';

export type { TourGuidesErrorMessages };

export function getTourGuidesErrorMessage(
  error: unknown,
  messages: TourGuidesErrorMessages,
): string {
  return resolveUnknownApiError(error, messages, {
    conflict: () => messages.userConflict,
  });
}
