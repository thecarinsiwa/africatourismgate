import { resolveUnknownApiError } from './common-api-errors';
import type { CommonErrorMessages } from './common-api-errors';

export function getDepartmentsErrorMessage(
  error: unknown,
  messages: CommonErrorMessages,
): string {
  return resolveUnknownApiError(error, messages);
}
