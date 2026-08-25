import { ApiHttpError } from '@africatourismgate/api-client';
import type { GuideScheduleConflict } from '@africatourismgate/types';

type GuideScheduleErrorBody = {
  message?: string | string[];
  conflicts?: GuideScheduleConflict[];
};

export type ParsedGuideScheduleConflictError = {
  message: string;
  conflicts: GuideScheduleConflict[];
};

export function parseGuideScheduleConflictError(
  error: unknown,
): ParsedGuideScheduleConflictError | null {
  if (!(error instanceof ApiHttpError) || error.status !== 409) {
    return null;
  }

  const body = error.body as GuideScheduleErrorBody | undefined;
  const conflicts = Array.isArray(body?.conflicts) ? body.conflicts : [];

  let message = '';
  if (typeof body?.message === 'string') {
    message = body.message;
  } else if (Array.isArray(body?.message)) {
    message = body.message.filter((part) => typeof part === 'string').join(' ');
  } else if (error.message && !error.message.startsWith('HTTP ')) {
    message = error.message;
  }

  if (!message && conflicts.length > 0) {
    message = 'Conflit de planning';
  }

  if (!message) {
    return null;
  }

  return { message, conflicts };
}
