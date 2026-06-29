import { resolveUnknownApiError } from './common-api-errors';
import type { PromotionsErrorMessages } from './i18n/admin-error-messages';

export type { PromotionsErrorMessages };

export function getPromotionsErrorMessage(
  error: unknown,
  messages: PromotionsErrorMessages,
): string {
  return resolveUnknownApiError(error, messages, {
    forbidden: messages.forbiddenDetail,
    useParseApiMessage: true,
  });
}
