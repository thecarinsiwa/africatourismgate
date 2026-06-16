import { resolveUnknownApiError } from './common-api-errors';
import type { ReviewsErrorMessages } from './i18n/admin-error-messages';

export type { ReviewsErrorMessages };

export function getReviewsErrorMessage(error: unknown, messages: ReviewsErrorMessages): string {
  return resolveUnknownApiError(error, messages, {
    forbidden: messages.forbiddenDetail,
    notFound: messages.notFound,
    useParseApiMessage: true,
  });
}
