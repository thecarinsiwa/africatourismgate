import { ApiHttpError, parseApiErrorMessage } from '@africatourismgate/api-client';

export type CommonErrorMessages = {
  network: string;
  forbidden: string;
  generic: string;
  apiStatus: (status: number) => string;
  sessionExpired?: string;
  sessionExpiredContinue?: string;
  accessDenied?: string;
};

export type ApiErrorHandlerOptions = {
  forbidden?: string;
  sessionExpired?: string;
  notFound?: string;
  conflict?: string | ((error: ApiHttpError) => string | undefined);
  useParseApiMessage?: boolean;
};

function resolveConflictMessage(
  error: ApiHttpError,
  conflict: ApiErrorHandlerOptions['conflict'],
): string | undefined {
  if (!conflict) {
    return undefined;
  }
  if (typeof conflict === 'function') {
    return conflict(error);
  }
  return conflict;
}

export function resolveApiHttpError(
  error: ApiHttpError,
  messages: CommonErrorMessages,
  options: ApiErrorHandlerOptions = {},
): string {
  if (error.status === 401 && (options.sessionExpired ?? messages.sessionExpired)) {
    return options.sessionExpired ?? messages.sessionExpired!;
  }

  if (error.status === 403) {
    return options.forbidden ?? messages.forbidden;
  }

  if (error.status === 404 && options.notFound) {
    return options.notFound;
  }

  if (error.status === 409) {
    const conflictMessage = resolveConflictMessage(error, options.conflict);
    if (conflictMessage) {
      return conflictMessage;
    }
  }

  if (options.useParseApiMessage) {
    const parsed = parseApiErrorMessage(error);
    if (parsed) {
      return parsed;
    }
  }

  if (error.message && !error.message.startsWith('HTTP ')) {
    return error.message;
  }

  return messages.apiStatus(error.status);
}

export function resolveUnknownApiError(
  error: unknown,
  messages: CommonErrorMessages,
  options: ApiErrorHandlerOptions = {},
): string {
  if (error instanceof TypeError) {
    return messages.network;
  }

  if (error instanceof ApiHttpError) {
    return resolveApiHttpError(error, messages, options);
  }

  if (error instanceof Error) {
    return error.message;
  }

  return messages.generic;
}
