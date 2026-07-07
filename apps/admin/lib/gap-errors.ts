import { resolveUnknownApiError } from './common-api-errors';
import type { GapErrorMessages } from './i18n/admin-error-messages';

export type { GapErrorMessages };

export function getGapErrorMessage(error: unknown, messages: GapErrorMessages): string {
  return resolveUnknownApiError(error, messages, {
    conflict: () => messages.sectionLocaleConflict,
    forbidden: messages.forbiddenDetail,
    useParseApiMessage: true,
  });
}
