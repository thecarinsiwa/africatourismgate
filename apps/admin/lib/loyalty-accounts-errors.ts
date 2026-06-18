import { resolveUnknownApiError } from './common-api-errors';
import type { LoyaltyAccountsErrorMessages } from './i18n/admin-error-messages';

export type { LoyaltyAccountsErrorMessages };

export function getLoyaltyAccountsErrorMessage(
  error: unknown,
  messages: LoyaltyAccountsErrorMessages,
): string {
  return resolveUnknownApiError(error, messages, {
    forbidden: messages.forbiddenDetail,
    notFound: messages.notFound,
    useParseApiMessage: true,
  });
}
