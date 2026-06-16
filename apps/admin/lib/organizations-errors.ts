import { resolveUnknownApiError } from './common-api-errors';
import type { OrganizationsErrorMessages } from './i18n/admin-error-messages';

export type { OrganizationsErrorMessages };

export function getOrganizationsErrorMessage(
  error: unknown,
  messages: OrganizationsErrorMessages,
): string {
  return resolveUnknownApiError(error, messages, {
    conflict: () => messages.slugConflict,
  });
}
