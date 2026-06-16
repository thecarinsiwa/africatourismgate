import { resolveUnknownApiError } from './common-api-errors';
import type { CommonErrorMessages } from './common-api-errors';

export function getOrganizationSettingsErrorMessage(
  error: unknown,
  messages: CommonErrorMessages,
): string {
  return resolveUnknownApiError(error, messages);
}
