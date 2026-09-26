import { ApiHttpError, getApiErrorCode } from '@africatourismgate/api-client';
import { resolveUnknownApiError } from './common-api-errors';
import type { DestinationsErrorMessages } from './i18n/admin-error-messages';

export type { DestinationsErrorMessages };

export type SoftDeletedDestinationInfo = {
  id: string;
  name: string;
  slug: string;
};

const DESTINATION_SLUG_SOFT_DELETED = 'DESTINATION_SLUG_SOFT_DELETED';

export function isDestinationSoftDeletedSlugConflict(
  error: unknown,
): error is ApiHttpError {
  return (
    error instanceof ApiHttpError &&
    error.status === 409 &&
    getApiErrorCode(error.body) === DESTINATION_SLUG_SOFT_DELETED
  );
}

export function getSoftDeletedDestinationFromError(
  error: unknown,
): SoftDeletedDestinationInfo | null {
  if (!isDestinationSoftDeletedSlugConflict(error)) {
    return null;
  }

  const body = error.body as { deletedDestination?: unknown } | null;
  const deleted = body?.deletedDestination;
  if (!deleted || typeof deleted !== 'object') {
    return null;
  }

  const { id, name, slug } = deleted as Record<string, unknown>;
  if (
    typeof id !== 'string' ||
    typeof name !== 'string' ||
    typeof slug !== 'string'
  ) {
    return null;
  }

  return { id, name, slug };
}

export function getDestinationsErrorMessage(
  error: unknown,
  messages: DestinationsErrorMessages,
): string {
  return resolveUnknownApiError(error, messages, {
    conflict: () => messages.slugConflict,
  });
}
