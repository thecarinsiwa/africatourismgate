import { resolveUnknownApiError } from './common-api-errors';
import type { SupportTicketsErrorMessages } from './i18n/admin-error-messages';

export type { SupportTicketsErrorMessages };

export function getSupportTicketsErrorMessage(
  error: unknown,
  messages: SupportTicketsErrorMessages,
): string {
  return resolveUnknownApiError(error, messages, {
    forbidden: messages.forbiddenDetail,
    notFound: messages.notFound,
    useParseApiMessage: true,
  });
}
