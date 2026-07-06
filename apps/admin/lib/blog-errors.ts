import { resolveUnknownApiError } from './common-api-errors';
import type { BlogErrorMessages } from './i18n/admin-error-messages';

export type { BlogErrorMessages };

export function getBlogErrorMessage(error: unknown, messages: BlogErrorMessages): string {
  return resolveUnknownApiError(error, messages, {
    conflict: () => messages.slugConflict,
    forbidden: messages.forbiddenDetail,
    useParseApiMessage: true,
  });
}
