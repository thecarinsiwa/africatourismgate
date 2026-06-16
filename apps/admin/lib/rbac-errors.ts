import { ApiHttpError } from '@africatourismgate/api-client';
import { resolveUnknownApiError } from './common-api-errors';
import type { RbacErrorMessages } from './i18n/admin-error-messages';

export type { RbacErrorMessages };

export function getRbacErrorMessage(error: unknown, messages: RbacErrorMessages): string {
  if (error instanceof ApiHttpError && error.status === 403) {
    if (error.message?.includes('système') || error.message?.includes('system')) {
      return error.message;
    }
    return messages.forbiddenDetail;
  }

  return resolveUnknownApiError(error, messages, {
    forbidden: messages.forbiddenDetail,
    conflict: () => messages.assignmentConflict,
  });
}
