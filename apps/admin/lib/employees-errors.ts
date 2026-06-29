import { resolveUnknownApiError } from './common-api-errors';
import type { EmployeesErrorMessages } from './i18n/admin-error-messages';

export type { EmployeesErrorMessages };

export function getEmployeesErrorMessage(error: unknown, messages: EmployeesErrorMessages): string {
  return resolveUnknownApiError(error, messages, {
    conflict: () => messages.profileConflict,
  });
}
