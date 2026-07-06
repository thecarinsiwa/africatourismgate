import { resolveUnknownApiError } from './common-api-errors';
import type { AboutErrorMessages } from './i18n/admin-error-messages';

export type { AboutErrorMessages };

export function getAboutErrorMessage(error: unknown, messages: AboutErrorMessages): string {
  return resolveUnknownApiError(error, messages, {
    conflict: () => messages.sectionLocaleConflict,
    forbidden: messages.forbiddenDetail,
    useParseApiMessage: true,
  });
}
