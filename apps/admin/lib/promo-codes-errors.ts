import { ApiHttpError, parseApiErrorMessage } from '@africatourismgate/api-client';
import { resolveUnknownApiError } from './common-api-errors';
import type { PromoCodesErrorMessages } from './i18n/admin-error-messages';

export type { PromoCodesErrorMessages };

export function getPromoCodesErrorMessage(
  error: unknown,
  messages: PromoCodesErrorMessages,
): string {
  if (error instanceof ApiHttpError) {
    return resolveUnknownApiError(error, messages, {
      forbidden: messages.forbiddenDetail,
      conflict: (apiError) =>
        parseApiErrorMessage(apiError) ?? messages.codeConflict,
      useParseApiMessage: true,
    });
  }

  return resolveUnknownApiError(error, messages, {
    forbidden: messages.forbiddenDetail,
    useParseApiMessage: true,
  });
}
